import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        media: {
          include: {
            event: { select: { name: true } },
            likes: { where: { userId }, select: { userId: true } },
            favorites: { where: { userId }, select: { userId: true } },
            _count: { select: { likes: true, comments: true } }
          }
        }
      },
      orderBy: { media: { uploadDate: "desc" } }
    });

    const media = favorites.map(f => f.media);

    return NextResponse.json(media, { status: 200 });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
