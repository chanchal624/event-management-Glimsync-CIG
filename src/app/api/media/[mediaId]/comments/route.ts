import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const mediaId = (await params).mediaId;
    if (!mediaId) return NextResponse.json({ error: "Media ID required" }, { status: 400 });

    const comments = await prisma.comment.findMany({
      where: { mediaId },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(comments, { status: 200 });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

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
    const userId = session.user.id;
    const { content } = await request.json();

    if (!mediaId || !content || content.trim() === "") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        userId,
        mediaId,
        content: content.trim(),
      },
      include: { user: { select: { name: true } } }
    });

    const media = await prisma.media.findUnique({ where: { id: mediaId }, select: { uploaderId: true } });
    if (media && media.uploaderId !== userId) {
      await prisma.notification.create({
        data: {
          userId: media.uploaderId,
          actorId: userId,
          type: "COMMENT",
          mediaId: mediaId
        }
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error posting comment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
