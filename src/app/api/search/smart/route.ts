import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query) {
      return NextResponse.json({ media: [] });
    }

    const cleanQuery = query.toLowerCase().trim();

    const matchedMedia = await prisma.media.findMany({
      where: {
        tags: {
          some: {
            tag: {
              name: { contains: cleanQuery }
            }
          }
        }
      },
      include: {
        tags: { include: { tag: true } },
        _count: { select: { likes: true, comments: true } }
      },
      orderBy: { uploadDate: "desc" },
      take: 50
    });

    return NextResponse.json({ media: matchedMedia });
  } catch (error) {
    console.error("Smart Search Error:", error);
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
  }
}
