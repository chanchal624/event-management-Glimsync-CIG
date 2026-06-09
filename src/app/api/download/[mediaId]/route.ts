import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const mediaId = (await params).mediaId;

    if (!mediaId) {
      return NextResponse.json({ error: "Media ID is required" }, { status: 400 });
    }

    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      include: { event: { select: { name: true, isPrivate: true } } },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    if (media.event.isPrivate && (!session || !session.user)) {
      return NextResponse.json({ error: "Unauthorized: Event is private" }, { status: 401 });
    }

    let originalBuffer: Buffer;
    try {
      if (media.s3Url.startsWith("http://") || media.s3Url.startsWith("https://")) {
        const response = await fetch(media.s3Url);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        originalBuffer = Buffer.from(arrayBuffer);
      } else {
        const filePath = path.join(process.cwd(), "public", media.s3Url);
        originalBuffer = await fs.readFile(filePath);
      }
    } catch (err) {
      console.error("Failed to load image file:", err);
      return NextResponse.json({ error: "File not found or unreachable" }, { status: 404 });
    }

    const imageInfo = await sharp(originalBuffer).metadata();
    const width = imageInfo.width || 1200;
    const height = imageInfo.height || 800;

    const clubName = "GlimSync";
    const eventName = media.event.name;
    const userRole = session?.user?.role || "GUEST";

    const bannerHeight = Math.max(55, Math.floor(height * 0.075));
    const brandSize = Math.max(16, Math.floor(height * 0.025));
    const infoSize = Math.max(12, Math.floor(height * 0.018));
    const textY = height - (bannerHeight / 2) + (infoSize / 3);

    const svgOverlay = `
      <svg width="${width}" height="${height}">
        <style>
          .brand-text {
            fill: #ffffff;
            font-size: ${brandSize}px;
            font-family: Arial, Helvetica, sans-serif;
            font-weight: 900;
            letter-spacing: 1.5px;
          }
          .info-text {
            fill: #cbd5e1;
            font-size: ${infoSize}px;
            font-family: Arial, Helvetica, sans-serif;
            font-weight: bold;
            letter-spacing: 0.5px;
          }
        </style>
        <rect x="0" y="${height - bannerHeight}" width="${width}" height="${bannerHeight}" fill="rgba(0,0,0,0.55)" />
        <text x="30" y="${textY}" class="info-text">EVENT: ${eventName.toUpperCase()}  •  ROLE: ${userRole.toUpperCase()}</text>
        <text x="${width - 30}" y="${textY}" text-anchor="end" class="brand-text">${clubName.toUpperCase()}</text>
      </svg>
    `;

    const watermarkedBuffer = await sharp(originalBuffer)
      .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])

      .toFormat(imageInfo.format === 'png' ? 'png' : 'jpeg', { quality: 90 })
      .toBuffer();

    const contentType = imageInfo.format === 'png' ? 'image/png' : 'image/jpeg';
    const ext = imageInfo.format === 'png' ? 'png' : 'jpg';
    const downloadFilename = `glimsync_${mediaId}.${ext}`;

    if (session?.user?.id) {

      prisma.download.create({
        data: {
          userId: session.user.id,
          mediaId: media.id
        }
      }).catch(err => console.error("Failed to log download:", err));
    }

    return new NextResponse(watermarkedBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${downloadFilename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Error processing download:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
