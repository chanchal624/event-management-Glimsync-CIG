import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const mediaId = (await params).mediaId;

    const currentMedia = await prisma.media.findUnique({
      where: { id: mediaId },
      include: { tags: true }
    });

    if (!currentMedia || currentMedia.tags.length === 0) {
      return NextResponse.json({ similar: [] });
    }

    const tagIds = currentMedia.tags.map(t => t.tagId);

    const candidates = await prisma.media.findMany({
      where: {
        id: { not: mediaId },
        tags: { some: { tagId: { in: tagIds } } }
      },
      include: { tags: true },
      take: 20
    });

    const scored = candidates.map(media => {
      const sharedCount = media.tags.filter(t => tagIds.includes(t.tagId)).length;
      return { ...media, sharedCount };
    });

    scored.sort((a, b) => b.sharedCount - a.sharedCount);

    return NextResponse.json({ similar: scored.slice(0, 4) });
  } catch (error) {
    console.error("Similar Photos Error:", error);
    return NextResponse.json({ error: "Failed to find similar photos" }, { status: 500 });
  }
}
