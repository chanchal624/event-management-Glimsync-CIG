import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("No GEMINI_API_KEY set. Returning empty AI analysis.");
    return {
      tags: [],
      caption: "AI Analysis disabled (missing API key)",
      isHarmful: false,
    };
  }

  try {
    const imagePart = {
      inlineData: {
        data: buffer.toString("base64"),
        mimeType,
      },
    };

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Analyze this image and return a JSON object with the following fields:
    - "caption": A short, friendly description of what is happening in the image (max 15 words).
    - "tags": A JSON array of up to 5 lowercase relevant keyword tags describing objects, setting, or feelings.
    - "isHarmful": A boolean indicating if the image contains explicit violence, nudity, or hate speech.
    - "moderationReason": A string explaining why it is harmful, or empty string if not harmful.

    Respond ONLY with the JSON code block, e.g.
    {
      "caption": "A sunset over the mountains",
      "tags": ["sunset", "mountains", "nature", "scenic"],
      "isHarmful": false,
      "moderationReason": ""
    }
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = await result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        caption: parsed.caption || "",
        tags: parsed.tags || [],
        isHarmful: !!parsed.isHarmful,
        moderationReason: parsed.moderationReason || "",
      };
    }

    throw new Error("Failed to parse JSON response from Gemini");
  } catch (error: any) {
    console.error("Gemini Vision API error:", error);
    return {
      tags: [],
      caption: `Failed to generate caption: ${error?.message || error}`,
      isHarmful: false,
    };
  }
}

export async function matchFacesInImage(
  targetBuffer: Buffer,
  targetMimeType: string,
  referenceUsers: { id: string; referenceImageUrl: string }[]
): Promise<string[]> {
  return [];
}
