// app/api/subscriber/route.ts
import { NextRequest } from "next/server";
import { SubscriptionStatus } from "@prisma/client";
import { addSubscriber } from "@/actions/subscriber/add.subscriber";
import { z } from "zod";
import { withCors, corsOptions } from "@/lib/cors";
import { rateLimiter } from "@/lib/rateLimiter";
import { verifyApiKey } from "@/lib/key/apiKey";
import { database } from "@/lib/database";

const subscriberSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
  source: z.string().default("API"),
  pageUrl: z.string().url("Invalid URL").optional(),
});

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get("drop-aphi-key");
    if (!apiKey) return withCors({ error: "Missing API key", code: "NO_API_KEY" }, req, 401);

     const verification = await verifyApiKey(apiKey);
    if (!verification.valid || !verification.user)
      return withCors(
        { error: verification.message || "Unauthorized", code: "INVALID_API_KEY" },
        req,
        403
      );

      const userId = (verification.user as any).userId ?? "unknown";

      // 🚦 Apply rate limit (100 req/min per API key)
      const { success, limit, remaining, reset } = await rateLimiter(apiKey, 100, 60);
      if (!success) {
        const res = withCors(
          { error: "Rate limit exceeded", code: "RATE_LIMITED" },
          req,
          429
        );
        res.headers.set("X-RateLimit-Limit", limit.toString());
        res.headers.set("X-RateLimit-Remaining", remaining.toString());
        res.headers.set("X-RateLimit-Reset", reset.toString());
        return res;
      }

    // Check subscription
    const membership = await database.user.findUnique({ where: { userId } });
    if (!membership || membership.subscriptionStatus !== "ACTIVE") {
      return withCors({ error: "No active subscription", code: "SUBSCRIPTION_INVALID" }, req, 403);
    }

    // Validate request body
    const body = await req.json();
    const parsed = subscriberSchema.safeParse(body);
    if (!parsed.success) return withCors({ error: parsed.error.format(), code: "VALIDATION_ERROR" }, req, 400);

    const { email, name, source, pageUrl } = parsed.data;

    const result = await addSubscriber({
      email,
      name: name || email.split('@')[0],
      source,
      status: SubscriptionStatus.SUBSCRIBED,
      pageUrl,
    });

    if (result.error) return withCors({ error: result.error, code: "SUBSCRIBE_FAILED" }, req, 400);

    const res = withCors({ success: true, subscriber: result.subscriber }, req, 201);
    res.headers.set("X-RateLimit-Limit", limit.toString());
    res.headers.set("X-RateLimit-Remaining", remaining.toString());
    res.headers.set("X-RateLimit-Reset", reset.toString());
    return res;
  } catch (err: any) {
    console.error("[SUBSCRIBER_API_ERROR]", err);
    return withCors({ error: "Internal server error", code: "SERVER_ERROR" }, req, 500);
  }
}
