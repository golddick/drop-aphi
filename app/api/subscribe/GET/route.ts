// app/api/subscriber/route.ts
import { NextRequest } from "next/server";

import { withCors, corsOptions } from "@/lib/cors";
import { verifyApiKey } from "@/lib/key/apiKey";
import { database } from "@/lib/database";

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}

export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get("drop-aphi-key");
    if (!apiKey) return withCors({ error: "Missing API key" }, req, 401);

     const verification = await verifyApiKey(apiKey);
        if (!verification.valid || !verification.user)
          return withCors(
            { error: verification.message || "Unauthorized", code: "INVALID_API_KEY" },
            req,
            403
          );
    
          const userId = (verification.user as any).userId ?? "unknown";

    const membership = await database.user.findUnique({ where: { userId: userId } });
    if (!membership || membership.subscriptionStatus !== "ACTIVE") {
      return withCors({ error: "User does not have an active subscription", code: "SUBSCRIPTION_INVALID" },req, 403);
    }

    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 100);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const where: any = {
      newsLetterOwnerId: userId,
      ...(status && { status }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { source: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [total, subscribers] = await Promise.all([
      database.subscriber.count({ where }),
      database.subscriber.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, email: true, name: true, source: true, status: true, createdAt: true, pageUrl: true },
      }),
    ]);

    return withCors({
      success: true,
      data: subscribers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }, req, 200);
  } catch (err: any) {
    console.error("GET /subscribers error:", err);
    return withCors({ error: "Internal Server Error", code: "SERVER_ERROR" },req, 500);
  }
}
