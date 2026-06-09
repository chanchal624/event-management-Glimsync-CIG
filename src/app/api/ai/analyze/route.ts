import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { analyzeMedia } from "@/lib/ai/vision";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
       return NextResponse.json({ error: "Only images can be analyzed by AI" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const visionResult = await analyzeMedia(buffer, file.type);

    return NextResponse.json(visionResult, { status: 200 });

  } catch (error) {
    console.error("AI Analysis Endpoint Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
