import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mediaId = (await params).mediaId;
    const taggedById = session.user.id;
    const { taggedUserEmail } = await request.json();

    if (!mediaId || !taggedUserEmail) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const userToTag = await prisma.user.findUnique({
      where: { email: taggedUserEmail }
    });

    if (!userToTag) {
      return NextResponse.json({ error: "User not found. Please enter a valid registered Email address." }, { status: 404 });
    }

    const taggedUserId = userToTag.id;

    const existingTag = await prisma.userTag.findFirst({
      where: { mediaId, taggedUserId }
    });

    if (existingTag) {
      return NextResponse.json({ error: "User already tagged" }, { status: 400 });
    }

    const tag = await prisma.userTag.create({
      data: {
        mediaId,
        taggedUserId,
        taggedById
      }
    });

    if (taggedUserId !== taggedById) {
      await prisma.notification.create({
        data: {
          userId: taggedUserId,
          actorId: taggedById,
          type: "TAG",
          mediaId: mediaId
        }
      });
    }

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error("Error tagging user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
