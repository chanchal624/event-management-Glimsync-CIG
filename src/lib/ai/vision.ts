import fs from "fs/promises";
import path from "path";

export interface VisionResult {
  tags: string[];
  caption: string;
  isHarmful: boolean;
  moderationReason?: string;
  error?: string;
}

export async function analyzeMedia(
  buffer: Buffer,
  mimeType: string
): Promise<VisionResult> {
  return {
    tags: [],
    caption: "",
    isHarmful: false,
  };
}

export async function matchFacesInImage(
  targetBuffer: Buffer,
  targetMimeType: string,
  referenceUsers: { id: string; referenceImageUrl: string }[]
): Promise<string[]> {

  return [];
}
