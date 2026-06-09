import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mediaId } = await request.json();

    if (!mediaId) {
      return NextResponse.json({ error: "Missing mediaId" }, { status: 400 });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_mediaId: {
          userId: session.user.id,
          mediaId: mediaId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          userId_mediaId: {
            userId: session.user.id,
            mediaId: mediaId,
          },
        },
      });
      return NextResponse.json({ status: "unliked" }, { status: 200 });
    } else {
      await prisma.like.create({
        data: {
          userId: session.user.id,
          mediaId: mediaId,
        },
      });

      return NextResponse.json({ status: "liked" }, { status: 201 });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
