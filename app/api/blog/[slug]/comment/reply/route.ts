
import { NextRequest } from "next/server";
import { withCors, corsOptions } from "@/lib/cors";
import { verifyApiKey } from "@/lib/key/apiKey";
import { database } from "@/lib/database";
import { rateLimiter } from "@/lib/rateLimiter";

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}


export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
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
    const body = await req.json();
    if (!body.commentId || !body.reply) {
      return withCors({ error: "commentId and reply are required" }, req, 400);
    }

    const post = await database.blogPost.findFirst({ where: { slug } });
    if (!post) return withCors({ error: "Blog post not found" }, req, 404);

    const parent = await database.blogComment.findUnique({ where: { id: body.commentId } });
    if (!parent) return withCors({ error: "Parent comment not found" }, req, 404);

    const reply = await database.blogComment.create({
      data: {
        content: body.reply,
        authorId: userId,
        userId: userId,
        postId: post.id,
        parentId: parent.id,
      },
    });

    const response = withCors(
      { success: true, message: "Reply added successfully", data: reply },
      req,
      201
    );
    response.headers.set("X-RateLimit-Limit", limit.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", reset.toString());
    return response;
  } catch (err) {
    console.error("[COMMENT_REPLY_API_ERROR]", err);
    return withCors({ error: "Internal server error" }, req, 500);
  }
}
