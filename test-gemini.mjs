import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("No API key found in .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Hello, this is a test. Reply with 'OK'.");
    console.log("Success:", result.response.text());
  } catch (err) {
    console.error("Failed:", err);
  }
}

test();
