import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessPrivate } from "@/lib/permissions";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get("mediaId");

    if (!mediaId) {
      return new Response("Missing mediaId", { status: 400 });
    }

    const media = await prisma.media.findUnique({
      where: { id: mediaId }
    });

    if (!media) {
      return new Response("Media not found", { status: 404 });
    }

    if (media.isPrivate) {
      if (!session || !session.user) {
        return new Response("Unauthorized: Login required for private media", { status: 401 });
      }
      if (!canAccessPrivate(session)) {
        return new Response("Forbidden: Insufficient privileges to access private media", { status: 403 });
      }
    }

    const mockImageBuffer = Buffer.from("mock image data");

    return new Response(mockImageBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="watermarked-${mediaId}.jpg"`,
      },
    });
  } catch (error) {
    console.error("Error generating watermark:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
