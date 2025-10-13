import { NextRequest } from "next/server";
import { withCors, corsOptions } from "@/lib/cors";
import { rateLimiter } from "@/lib/rateLimiter";
import { verifyApiKey } from "@/lib/key/apiKey";
import { database } from "@/lib/database";

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}

// ✅ Get single blog by slug only
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    // API Key verification
    const apiKey = req.headers.get("drop-aphi-key");
    if (!apiKey) {
      return withCors({ error: "Missing API key" }, req, 401);
    }

    const verification = await verifyApiKey(apiKey);
         if (!verification.valid || !verification.user)
           return withCors(
             { error: verification.message || "Unauthorized", code: "INVALID_API_KEY" },
             req,
             403
           );
     
           const userId = (verification.user as any).userId ?? "unknown";

    const membership = await database.user.findUnique({ 
      where: { userId: userId } 
    });
    
    if (!membership ) {
      return withCors({ 
        error: "No User", 
        code: "USER_NOT_FOUND" 
      }, req, 403);
    }

    const img = membership.imageUrl;

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

    // Await the params promise
    const params = await context.params;
    const { slug } = params;

    // Find blog by slug only
    const blog = await database.blogPost.findFirst({
      where: {
        slug: slug,
        status: "PUBLISHED",
        visibility: "PUBLIC",
        publishedAt: {
          lte: new Date(),
        },
        isFlagged: false,
      },
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        slug:    true,
        featuredImage: true,
        featuredVideo: true, // Added
        galleryImages: true, // Added
        allowComments: true, // Added
        author: true,
        authorBio: true,
        publishedAt: true,
        readTime: true,
        views: true,
        likes: true,
        tags: true,
        createdAt: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!blog) {
      return withCors({ error: "Blog not found" }, req, 404);
    }

    // Increment view count
    await database.blogPost.update({
      where: { id: blog.id },
      data: { views: { increment: 1 } },
    });

    // Format the response
    const formattedBlog = {
      id: blog.id,
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt || blog.content.slice(0, 150) + '...',
      featuredImage: blog.featuredImage || "/no-img.jpg",
      featuredVideo: blog.featuredVideo || null, // Added
      galleryImages: blog.galleryImages || [], // Added
      allowComments: blog.allowComments !== false, // Added (default to true)
      author: {
        name: blog.author || "Unknown Author",
        avatar: img  || "/no-img.jpg",
        bio: blog.authorBio || "",
      },
      publishedAt: blog.publishedAt?.toISOString() || blog.createdAt.toISOString(),
      readTime: `${blog.readTime || 3} min read`,
      views: (blog.views || 0) + 1,
      likes: blog.likes || 0,
      category: blog.category?.name || "General",
      slug: blog.slug, 
      tags: blog.tags || [],
    };

    // Prepare response with rate limit headers
    const response = withCors({
      success: true,
      data: formattedBlog,
    }, req, 200);

    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", limit.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", reset.toString());

    return response;

  } catch (err) {
    console.error("[BLOG_API_ERROR]", err);
    return withCors({ error: "Internal server error" }, req, 500);
  }
}