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
    const userId = session.user.id;

    if (!mediaId) {
      return NextResponse.json({ error: "Media ID is required" }, { status: 400 });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_mediaId: {
          userId,
          mediaId,
        },
      },
    });

    if (existingLike) {

      await prisma.like.delete({
        where: {
          userId_mediaId: {
            userId,
            mediaId,
          },
        },
      });
      return NextResponse.json({ liked: false }, { status: 200 });
    } else {

      await prisma.like.create({
        data: { userId, mediaId },
      });

      const media = await prisma.media.findUnique({ where: { id: mediaId }, select: { uploaderId: true } });
      if (media && media.uploaderId !== userId) {
        await prisma.notification.create({
          data: {
            userId: media.uploaderId,
            actorId: userId,
            type: "LIKE",
            mediaId: mediaId
          }
        });
      }

      return NextResponse.json({ liked: true }, { status: 200 });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
