import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mediaId } = body;

    if (!mediaId) {
      return NextResponse.json({ error: "Media ID is required" }, { status: 400 });
    }

    const media = await prisma.media.update({
      where: { id: mediaId },
      data: {
        sharesCount: { increment: 1 }
      }
    });

    return NextResponse.json({ success: true, sharesCount: media.sharesCount }, { status: 200 });
  } catch (error) {
    console.error("Error sharing media:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
