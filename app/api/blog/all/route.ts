




// app/api/blog/all/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { withCors, corsOptions } from "@/lib/cors";
import { verifyApiKey } from "@/lib/key/apiKey";
import { database } from "@/lib/database";
import { rateLimiter } from "@/lib/rateLimiter";

// Updated input validation schema to handle null values
const blogQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(10),
  page: z.coerce.number().min(1).default(1),
  category: z.string().optional().nullable().transform(val => val || undefined),
  tag: z.string().optional().nullable().transform(val => val || undefined),
  featured: z.coerce.boolean().optional().nullable().transform(val => val || undefined),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional().nullable().transform(val => val || "PUBLISHED"),
});

// Response interface matching the complete BlogPost model
interface BlogContent {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  content: string;
  excerpt: string | null;
  format: string;
  status: string;
  visibility: string;
  featuredImage: string;
  featuredVideo: string | null;
  galleryImages: string[];
  authorId: string;
  authorBio: string;
  authorTitle: string;
  author: string;
  categoryId: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[];
  seoScore: number;
  shares: number;
  readTime: number;
  wordCount: number;
  characterCount: number;
  likes: number;
  views: number;
  flagReason: string | null;
  isFlagged: boolean;
  isFeatured: boolean;
  isPinned: boolean;
  allowComments: boolean;
  publishedAt: string | null;
  flaggedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  generatedById: string | null;
  category: {
    name: string;
    id: string;
  } | null;
  tags: string[];
  authorAvatar: string;
  commentsCount: number;
  viewsCount: number;
  flaggedPostsCount: number;
}

// Helper function to map database model to complete API response
function mapToBlogContent(blog: any, membershipImage: string): BlogContent {
  return {
    id: blog.id,
    title: blog.title,
    subtitle: blog.subtitle,
    slug: blog.slug,
    content: blog.content,
    excerpt: blog.excerpt,
    format: blog.format,
    status: blog.status,
    visibility: blog.visibility,
    featuredImage: blog.featuredImage || "/no-img.jpg",
    featuredVideo: blog.featuredVideo,
    galleryImages: blog.galleryImages || [],
    authorId: blog.authorId,
    authorBio: blog.authorBio,
    authorTitle: blog.authorTitle,
    author: blog.author || "Unknown Author",
    categoryId: blog.categoryId,
    seoTitle: blog.seoTitle,
    seoDescription: blog.seoDescription,
    seoKeywords: blog.seoKeywords || [],
    seoScore: blog.seoScore || 0,
    shares: blog.shares || 0,
    readTime: blog.readTime || 0,
    wordCount: blog.wordCount || 0,
    characterCount: blog.characterCount || 0,
    likes: blog.likes || 0,
    views: blog.views || 0,
    flagReason: blog.flagReason,
    isFlagged: blog.isFlagged || false,
    isFeatured: blog.isFeatured || false,
    isPinned: blog.isPinned || false,
    allowComments: blog.allowComments !== false, // default to true
    publishedAt: blog.publishedAt?.toISOString() || null,
    flaggedAt: blog.flaggedAt?.toISOString() || null,
    scheduledAt: blog.scheduledAt?.toISOString() || null,
    createdAt: blog.createdAt.toISOString(),
    updatedAt: blog.updatedAt.toISOString(),
    generatedById: blog.generatedById,
    category: blog.category ? {
      name: blog.category.name,
      id: blog.category.id
    } : null,
    tags: blog.tags || [],
    authorAvatar: membershipImage || "/no-img.jpg",
    commentsCount: blog._count?.comments || 0,
    viewsCount: blog._count?.viewsCount || 0,
    flaggedPostsCount: blog._count?.flaggedPosts || 0
  };
}

export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}

// ✅ Get all blogs for the authenticated user
export async function GET(req: NextRequest) {
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

    const membershipImage = membership.imageUrl || "/no-image.gif";

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

    // Parse and validate query parameters
    const { searchParams } = new URL(req.url);
    
    // Create a clean object with proper handling of null values
    const queryParams = {
      limit: searchParams.get("limit"),
      page: searchParams.get("page"),
      category: searchParams.get("category"),
      tag: searchParams.get("tag"),
      featured: searchParams.get("featured"),
      status: searchParams.get("status"),
    };

    // Clean up null values before validation
    const cleanedParams = Object.fromEntries(
      Object.entries(queryParams).filter(([_, value]) => value !== null)
    );

    const validatedParams = blogQuerySchema.parse(cleanedParams);
    const skip = (validatedParams.page - 1) * validatedParams.limit;

    // Build where clause - ensure blogs belong to the authenticated user
    const where: any = {
      authorId: userId, // Only show blogs that belong to this user
    };

    // Add status filter if provided
    if (validatedParams.status) {
      where.status = validatedParams.status;
    }

    // For published blogs, add publishedAt filter
    if (validatedParams.status === "PUBLISHED") {
      where.visibility = "PUBLIC";
      where.isFlagged = false;
    }

    if (validatedParams.category) {
      where.category = {
        name: validatedParams.category,
      };
    }

    if (validatedParams.tag) {
      where.tags = {
        has: validatedParams.tag,
      };
    }

    if (validatedParams.featured) {
      where.isFeatured = true;
    }

    // Fetch blogs from database that belong to the user with all related data
    const blogs = await database.blogPost.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            viewsCount: true,
            flaggedPosts: true,
          },
        },
      },
      orderBy: [
        { isPinned: "desc" },
        { publishedAt: "desc" },
        { createdAt: "desc" },
      ],
      skip,
      take: validatedParams.limit,
    });

    // Get total count for pagination
    const total = await database.blogPost.count({ where });

    // Format the response using the membership image
    const formattedBlogs = blogs.map(blog => mapToBlogContent(blog, membershipImage));

    // Prepare response with rate limit headers
    const response = withCors({
      success: true,
      data: formattedBlogs,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total,
        totalPages: Math.ceil(total / validatedParams.limit),
      },
    }, req, 200);

    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", limit.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", reset.toString());

    return response;

  } catch (err) {
    console.error("[BLOG_API_ERROR]", err);
    
    if (err instanceof z.ZodError) {
      return withCors({ 
        error: "Invalid query parameters",
        details: err.message 
      }, req, 400);
    }
    
    return withCors({ error: "Internal server error" }, req, 500);
  }
}