import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const folders = await prisma.folder.findMany({
      where: { eventId: id },
      orderBy: { createdAt: "asc" }
    });
    return NextResponse.json(folders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
    }

    const folder = await prisma.folder.create({
      data: {
        name: body.name,
        eventId: id
      }
    });

    return NextResponse.json(folder);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
