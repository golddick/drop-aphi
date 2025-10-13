import { NextRequest } from "next/server";
import { rateLimiter } from "@/lib/rateLimiter";
import { withCors, corsOptions } from "@/lib/cors";
import { verifyApiKey } from "@/lib/key/apiKey";
import { database } from "@/lib/database";

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}

// ✅ Like blog post by slug
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    // API key verification
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
    // Membership check
    const membership = await database.user.findUnique({ where: { userId } });
     if (!membership ) {
      return withCors({ 
        error: "No User", 
        code: "USER_NOT_FOUND" 
      }, req, 403);
    }

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

    const { slug } = await context.params;

    // Find blog by slug
    const blog = await database.blogPost.findFirst({
      where: { slug, status: "PUBLISHED", visibility: "PUBLIC", isFlagged: false },
    });
    if (!blog) return withCors({ error: "Blog not found" }, req, 404);

    // Increment like count
    const updated = await database.blogPost.update({
      where: { id: blog.id },
      data: { likes: { increment: 1 } },
      select: { slug: true, likes: true },
    });

    const response = withCors(
      { success: true, message: "Blog liked successfully", data: updated },
      req,
      200
    );
    response.headers.set("X-RateLimit-Limit", limit.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", reset.toString());

    return response;
  } catch (err) {
    console.error("[BLOG_LIKE_API_ERROR]", err);
    return withCors({ error: "Internal server error" }, req, 500);
  }
}
