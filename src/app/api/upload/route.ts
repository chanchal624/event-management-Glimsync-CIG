import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { canUpload } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";
import path from "path";
import crypto from "crypto";
import { analyzeMedia, matchFacesInImage } from "@/lib/ai/vision";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canUpload(session)) {
      return NextResponse.json({ error: "Forbidden: Insufficient privileges to upload media" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const eventId = formData.get("eventId") as string | null;
    const folderId = formData.get("folderId") as string | null;
    const customCaption = formData.get("customCaption") as string | null;
    const preGeneratedTagsRaw = formData.get("preGeneratedTags") as string | null;
    const matchedUserIdsRaw = formData.get("matchedUserIds") as string | null;

    if (!file || !eventId) {
      return NextResponse.json({ error: "Missing file or eventId" }, { status: 400 });
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.createdById !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: Only the event creator can upload media" }, { status: 403 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let aiMetadata = null;
    let aiTags: string[] = [];
    if (file.type.startsWith("image/")) {
      const visionResult = await analyzeMedia(buffer, file.type);

      if (visionResult.isHarmful) {
         return NextResponse.json({ error: `Upload rejected by Content Moderation. Reason: ${visionResult.moderationReason}` }, { status: 400 });
      }

      aiMetadata = {
         caption: customCaption !== null ? customCaption.trim() : visionResult.caption,
         generatedAt: new Date().toISOString()
      };

      if (preGeneratedTagsRaw) {
        try {
          aiTags = JSON.parse(preGeneratedTagsRaw);
        } catch(e) {
          aiTags = visionResult.tags;
        }
      } else {
        aiTags = visionResult.tags;
      }
    }

    const fileExt = file.name.split('.').pop();
    const uniqueFilename = `events/${eventId}/${crypto.randomBytes(16).toString("hex")}.${fileExt}`;

    const cloudinaryUrl = await uploadToCloudinary(buffer, `events/${eventId}`, uniqueFilename);

    const media = await prisma.media.create({
      data: {
        eventId,
        ...(folderId ? { folderId } : {}),
        uploaderId: session.user.id,
        s3Url: cloudinaryUrl,
        isPrivate: false,
        metadata: {
          ...(aiMetadata || {}),
          resourceType: file.type.startsWith("video/") ? "video" : "image"
        },
      }
    });

    if (aiTags.length > 0) {
      for (const tagName of aiTags) {
        const cleanTag = tagName.toLowerCase().trim();
        if (!cleanTag) continue;

        let tagRecord = await prisma.tag.findUnique({ where: { name: cleanTag } });
        if (!tagRecord) {
           try {
             tagRecord = await prisma.tag.create({ data: { name: cleanTag } });
           } catch (e) {
             tagRecord = await prisma.tag.findUnique({ where: { name: cleanTag } });
           }
        }

        if (tagRecord) {
           await prisma.mediaTag.create({
              data: {
                 mediaId: media.id,
                 tagId: tagRecord.id
              }
           });
        }
      }
    }

    try {
      let matchedUserIds: string[] = [];
      if (matchedUserIdsRaw) {
        try {
          matchedUserIds = JSON.parse(matchedUserIdsRaw);
        } catch(e) {}
      }

      if (matchedUserIds.length > 0) {

        for (const matchedId of matchedUserIds) {
          const existingTag = await prisma.userTag.findFirst({
            where: { mediaId: media.id, taggedUserId: matchedId }
          });

          if (!existingTag) {
             await prisma.userTag.create({
               data: {
                 mediaId: media.id,
                 taggedUserId: matchedId,
                 taggedById: session.user.id,
                 isAiGenerated: true
               }
             });

             if (matchedId !== session.user.id) {
               await prisma.notification.create({
                 data: {
                   userId: matchedId,
                   actorId: session.user.id,
                   type: "TAG",
                   mediaId: media.id
                 }
               });
             }
          }
        }
      }
    } catch (faceErr) {
      console.error("Face Recognition Pipeline failed:", faceErr);
    }

    return NextResponse.json(media, { status: 201 });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
