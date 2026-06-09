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

    const downloads = await prisma.download.findMany({
      where: { userId },
      include: {
        media: {
          include: {
            event: { select: { id: true, name: true } },
            uploader: { select: { id: true, name: true, email: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const uniqueMediaIds = new Set();
    const formattedDownloads = [];

    for (const d of downloads) {
      if (!uniqueMediaIds.has(d.media.id)) {
        uniqueMediaIds.add(d.media.id);
        formattedDownloads.push({
          id: d.id,
          downloadDate: d.createdAt,
          media: d.media
        });
      }
    }

    return NextResponse.json(formattedDownloads, { status: 200 });
  } catch (error) {
    console.error("Error fetching downloads:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
