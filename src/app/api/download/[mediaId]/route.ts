import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const mediaId = (await params).mediaId;

    if (!mediaId) {
      return NextResponse.json({ error: "Media ID is required" }, { status: 400 });
    }

    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      include: { event: { select: { name: true, isPrivate: true } } },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    if (media.event.isPrivate && (!session || !session.user)) {
      return NextResponse.json({ error: "Unauthorized: Event is private" }, { status: 401 });
    }

    let originalBuffer: Buffer;
    try {
      if (media.s3Url.startsWith("http://") || media.s3Url.startsWith("https://")) {
        const response = await fetch(media.s3Url);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        originalBuffer = Buffer.from(arrayBuffer);
      } else {
        const filePath = path.join(process.cwd(), "public", media.s3Url);
        originalBuffer = await fs.readFile(filePath);
      }
    } catch (err) {
      console.error("Failed to load image file:", err);
      return NextResponse.json({ error: "File not found or unreachable" }, { status: 404 });
    }

    const imageInfo = await sharp(originalBuffer).metadata();
    const width = imageInfo.width || 1200;
    const height = imageInfo.height || 800;

    const clubName = "GlimSync";
    const eventName = media.event.name;
    const userRole = session?.user?.role || "GUEST";

    const gradientHeight = Math.max(80, Math.floor(height * 0.12));
    const brandSize = Math.max(20, Math.floor(height * 0.035));
    const infoSize = Math.max(13, Math.floor(height * 0.022));
    const textY = height - Math.max(25, Math.floor(height * 0.04));

    const svgOverlay = `
      <svg width="${width}" height="${height}">
        <defs>
          <filter id="text-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="#000000" flood-opacity="0.8"/>
          </filter>
          <linearGradient id="bottom-fade" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0.8"/>
          </linearGradient>
        </defs>
        <style>
          .brand-text {
            fill: #ffffff;
            font-size: ${brandSize}px;
            font-family: 'Outfit', 'Inter', sans-serif;
            font-weight: 800;
            letter-spacing: 1.5px;
          }
          .info-text {
            fill: #e2e8f0;
            font-size: ${infoSize}px;
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
        </style>
        <rect x="0" y="${height - gradientHeight}" width="${width}" height="${gradientHeight}" fill="url(#bottom-fade)" opacity="0.65" />
        <text x="40" y="${textY}" class="info-text" filter="url(#text-shadow)">EVENT: ${eventName.toUpperCase()}  •  ROLE: ${userRole.toUpperCase()}</text>
        <text x="${width - 40}" y="${textY}" text-anchor="end" class="brand-text" filter="url(#text-shadow)">${clubName.toUpperCase()}</text>
      </svg>
    `;

    const watermarkedBuffer = await sharp(originalBuffer)
      .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])

      .toFormat(imageInfo.format === 'png' ? 'png' : 'jpeg', { quality: 90 })
      .toBuffer();

    const contentType = imageInfo.format === 'png' ? 'image/png' : 'image/jpeg';
    const ext = imageInfo.format === 'png' ? 'png' : 'jpg';
    const downloadFilename = `glimsync_${mediaId}.${ext}`;

    if (session?.user?.id) {

      prisma.download.create({
        data: {
          userId: session.user.id,
          mediaId: media.id
        }
      }).catch(err => console.error("Failed to log download:", err));
    }

    return new NextResponse(watermarkedBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${downloadFilename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Error processing download:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
