import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const type = req.nextUrl.searchParams.get("type");
    let isAiGeneratedFilter = undefined;
    if (type === "ai") isAiGeneratedFilter = true;
    if (type === "manual") isAiGeneratedFilter = false;

    const tags = await prisma.userTag.findMany({
      where: {
        taggedUserId: userId,
        ...(isAiGeneratedFilter !== undefined ? { isAiGenerated: isAiGeneratedFilter } : {})
      },
      include: {
        tagger: { select: { id: true, name: true, email: true } },
        media: {
          include: {
            event: { select: { id: true, name: true } },
            _count: { select: { likes: true, comments: true } }
          }
        }
      },
      orderBy: { media: { uploadDate: "desc" } }
    });

    return NextResponse.json(tags, { status: 200 });
  } catch (error) {
    console.error("Error fetching tagged photos:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
