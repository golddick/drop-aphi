// app/api/generate-subtitle/route.ts
import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { title, content } = await req.json();

    if (!title && !content) {
      return NextResponse.json({ error: "Title or content is required." }, { status: 400 });
    }

    const prompt = `
You are a helpful assistant that writes engaging and concise blog subtitles.

Given the following blog title and content, generate a short subtitle (max 120 characters) that summarizes or teases the article content.

Title: "${title}"
Content: "${content}"

Subtitle:
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 60,
    });

    const subtitle = response.choices[0]?.message?.content?.trim();

    if (!subtitle) {
      return NextResponse.json({ error: "Failed to generate subtitle." }, { status: 500 });
    }

    return NextResponse.json({ subtitle });
  } catch (error) {
    console.error("[Subtitle API Error]", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
