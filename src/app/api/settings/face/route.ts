import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { faceDescriptor } = await req.json();

    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return NextResponse.json({ error: "Invalid face descriptor" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { faceEncodingId: JSON.stringify(faceDescriptor) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save Face ID:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
