// /app/api/generate-excerpt/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { title, content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required." }, { status: 400 });
    }

    const prompt = `
Generate a short excerpt (max 160 characters) for the following blog content. 
Make it catchy, informative, and suitable for a blog summary.

Title: ${title}
Content: ${content}
`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 100,
    });

    const excerpt = completion.choices[0]?.message.content?.trim();

    return NextResponse.json({ excerpt });
  } catch (error) {
    console.error("Excerpt generation error:", error);
    return NextResponse.json({ error: "Failed to generate excerpt." }, { status: 500 });
  }
}
