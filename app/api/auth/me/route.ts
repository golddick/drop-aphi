// app/api/auth/me/route.ts
import { getServerAuth } from "@/lib/auth/getauth";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getServerAuth();
  return NextResponse.json(user ?? null);
}
