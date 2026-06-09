import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { canAccessPrivate, hasRole } from "@/lib/permissions";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const hasPrivateAccess = canAccessPrivate(session);
    const id = (await params).id;

    if (!id) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { name: true, email: true, id: true },
        },
        media: {
          include: {
            uploader: { select: { id: true, name: true, email: true } },
            tags: { include: { tag: true } },
            userTags: { include: { taggedUser: { select: { id: true, name: true, email: true, referenceImageUrl: true } } } },
            comments: {
              include: { user: { select: { name: true, email: true } } },
              orderBy: { createdAt: 'desc' }
            },
            _count: { select: { likes: true, comments: true } },
            ...(session?.user?.id && {
              likes: {
                where: { userId: session.user.id },
                select: { userId: true }
              },
              favorites: {
                where: { userId: session.user.id },
                select: { userId: true }
              }
            })
          },
          orderBy: { uploadDate: "desc" }
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.isPrivate && !hasPrivateAccess) {
      return NextResponse.json({ error: "Forbidden: Event is private" }, { status: 403 });
    }

    const isOwner = session?.user?.id ? event.createdById === session.user.id : false;
    const isAdmin = session?.user?.role === "ADMIN";

    return NextResponse.json({ ...event, isOwner: isOwner || isAdmin }, { status: 200 });
  } catch (error) {
    console.error("Error fetching event details:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = (await params).id;
    let name, description, date, isPrivate, category, location;
    let coverImageFile: File | null = null;
    let coverImageUrl = undefined;

    try {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        name = formData.get("name") as string;
        description = formData.get("description") as string;
        date = formData.get("date") as string;
        isPrivate = formData.get("isPrivate") === "true";
        category = formData.get("category") as string;
        location = formData.get("location") as string;
        coverImageFile = formData.get("coverImage") as File | null;
      } else {
        const json = await request.json();
        name = json.name;
        description = json.description;
        date = json.date;
        isPrivate = json.isPrivate;
        category = json.category;
        location = json.location;
      }
    } catch (e) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const isAdmin = hasRole(session.user.role, "ADMIN");
    if (event.createdById !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: Not your event" }, { status: 403 });
    }

    if (coverImageFile && coverImageFile.size > 0) {
      const crypto = await import("crypto");

      const arrayBuffer = await coverImageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const fileExt = coverImageFile.name.split('.').pop() || "jpg";
      const uniqueFilename = `${crypto.randomBytes(16).toString("hex")}.${fileExt}`;

      coverImageUrl = await uploadToCloudinary(buffer, "covers", uniqueFilename);
    }

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) }),
        ...(isPrivate !== undefined && { isPrivate }),
        ...(category && { category }),
        ...(location !== undefined && { location }),
        ...(coverImageUrl && { coverImage: coverImageUrl }),
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = (await params).id;

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const isAdmin = hasRole(session.user.role, "ADMIN");
    if (event.createdById !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: Not your event" }, { status: 403 });
    }

    await prisma.media.deleteMany({ where: { eventId: id } });
    await prisma.folder.deleteMany({ where: { eventId: id } });
    await prisma.event.delete({ where: { id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
