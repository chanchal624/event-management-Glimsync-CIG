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

    const existingFav = await prisma.favorite.findUnique({
      where: {
        userId_mediaId: { userId, mediaId },
      },
    });

    if (existingFav) {
      await prisma.favorite.delete({
        where: { userId_mediaId: { userId, mediaId } },
      });
      return NextResponse.json({ favorited: false }, { status: 200 });
    } else {
      await prisma.favorite.create({
        data: { userId, mediaId },
      });
      return NextResponse.json({ favorited: true }, { status: 200 });
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
