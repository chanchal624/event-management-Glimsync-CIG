import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { canAccessPrivate, canUpload } from "@/lib/permissions";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const hasPrivateAccess = canAccessPrivate(session);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const sortBy = searchParams.get("sort") || "date";

    const whereClause: any = {};
    if (category) {
      whereClause.category = category;
    }

    if (!hasPrivateAccess) {
      whereClause.isPrivate = false;
    }

    let orderByClause: any = { date: "desc" };

    if (sortBy === "name") {
      orderByClause = { name: "asc" };
    } else if (sortBy === "category") {
      orderByClause = { category: "asc" };
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      orderBy: orderByClause,
      include: {
        createdBy: {
          select: { name: true },
        },
        _count: {
          select: { media: true }
        }
      },
    });

    const eventsWithOwnership = events.map(event => ({
      ...event,
      isOwner: session?.user?.id ? event.createdById === session.user.id : false
    }));

    return NextResponse.json(eventsWithOwnership);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canUpload(session)) {
      return NextResponse.json({ error: "Forbidden: Insufficient privileges to create events" }, { status: 403 });
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const date = formData.get("date") as string;
    const category = formData.get("category") as string;
    const isPrivate = formData.get("isPrivate") === "true";
    const location = formData.get("location") as string | null;
    const coverImageFile = formData.get("coverImage") as File | null;

    if (!name || !date || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let coverImageUrl = null;
    if (coverImageFile && coverImageFile.size > 0) {
      const crypto = await import("crypto");

      const arrayBuffer = await coverImageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const fileExt = coverImageFile.name.split('.').pop() || "jpg";
      const uniqueFilename = `${crypto.randomBytes(16).toString("hex")}.${fileExt}`;

      coverImageUrl = await uploadToCloudinary(buffer, "covers", uniqueFilename);
    }

    const event = await prisma.event.create({
      data: {
        name,
        description,
        date: new Date(date),
        category,
        location,
        coverImage: coverImageUrl,
        isPrivate,
        createdById: session.user.id,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
