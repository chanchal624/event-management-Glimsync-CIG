import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mediaId = (await params).mediaId;
    if (!mediaId) {
      return NextResponse.json({ error: "Media ID is required" }, { status: 400 });
    }

    const media = await prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Verify if the requester is the uploader of this media
    if (media.uploaderId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: Only the uploader can delete this photo" }, { status: 403 });
    }

    // Delete the image from Cloudinary
    try {
      if (media.s3Url.includes("cloudinary.com")) {
        await deleteFromCloudinary(media.s3Url);
      }
    } catch (clError) {
      console.error("Failed to delete from Cloudinary, continuing database deletion:", clError);
    }

    // Delete from database using a transaction to handle foreign key constraints
    await prisma.$transaction([
      prisma.mediaTag.deleteMany({ where: { mediaId } }),
      prisma.like.deleteMany({ where: { mediaId } }),
      prisma.comment.deleteMany({ where: { mediaId } }),
      prisma.favorite.deleteMany({ where: { mediaId } }),
      prisma.userTag.deleteMany({ where: { mediaId } }),
      prisma.notification.deleteMany({ where: { mediaId } }),
      prisma.download.deleteMany({ where: { mediaId } }),
      prisma.media.delete({ where: { id: mediaId } }),
    ]);

    return NextResponse.json({ success: true, message: "Media deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting media:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
