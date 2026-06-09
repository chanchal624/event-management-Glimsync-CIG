import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetId = (await params).id;

    if (targetId === session.user.id) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
    }

    try {
      await prisma.user.delete({
        where: { id: targetId },
      });
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (err: any) {
      if (err.code === "P2003") {
        return NextResponse.json({ error: "Cannot delete user because they have associated events, photos, or comments." }, { status: 400 });
      }
      throw err;
    }

  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
