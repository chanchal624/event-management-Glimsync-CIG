import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileExt = file.name.split('.').pop() || "jpg";
    const uniqueFilename = `${session.user.id}-${crypto.randomBytes(8).toString("hex")}.${fileExt}`;

    const cloudinaryUrl = await uploadToCloudinary(buffer, "selfies", uniqueFilename);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { referenceImageUrl: cloudinaryUrl }
    });

    return NextResponse.json({ url: cloudinaryUrl }, { status: 200 });
  } catch (error) {
    console.error("Selfie Upload Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referenceImageUrl: true }
    });

    return NextResponse.json({ url: user?.referenceImageUrl || null }, { status: 200 });
  } catch (error) {
    console.error("Selfie Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
