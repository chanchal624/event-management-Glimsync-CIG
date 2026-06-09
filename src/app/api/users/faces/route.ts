import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {

    const users = await prisma.user.findMany({
      where: { faceEncodingId: { not: null } },
      select: { id: true, faceEncodingId: true, name: true, referenceImageUrl: true }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to fetch Face IDs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
