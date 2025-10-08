// "use server";

// import { getServerAuth } from "@/lib/auth/getauth";
// import { database } from "@/lib/database";
// import { BlogComment, BlogPost, FlagStatus, PostStatus } from "@/lib/generated/prisma";
// import { requireSuperAdmin } from "@/lib/utils";
// import { CommentStatus } from "@/type";
// import { revalidatePath } from "next/cache";



// /**
//  * ✅ BlogPost type (simplified for frontend)
//  */
// type BlogPostDTO = {
//   id: string;
//   title: string;
//   content?: string | null;
//   author: string;
//   authorEmail: string;
//   status: PostStatus
//    category: {
//     id: string;
//     name: string;
//   } | null;
//   tags: string[];
//   publishedAt?: string;
//   views: number;
//   likes: number;
//   comments: number;
//   isFlagged: boolean;
//   flagReason?: string | null;
//   createdAt: string;
// };

// // ✅ Fetch all blog posts
// export async function fetchAllBlogPosts() {
//   const user = await getServerAuth();
//   if (!user) return { success: false, error: "You must be logged in" };

//   try {
//     await requireSuperAdmin(user.userId);

//     const blogPosts = await database.blogPost.findMany({
//         where: { status: PostStatus.PUBLISHED },
//       include: {
//         user: { select: { id: true, fullName: true, email: true } },
//         flaggedPosts: true,
//         comments: true,
//         tags: true,
//         category: { select: { id: true, name: true } }, 
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     const transformedPosts: BlogPostDTO[] = blogPosts.map((post) => ({
//       id: post.id,
//       title: post.title,
//       content: post.content,
//       author: post.user?.fullName ?? "Unknown",
//       authorEmail: post.user?.email ?? "N/A",
//       status: post.status as BlogPostDTO["status"],
//       category: post.category
//         ? { id: post.category.id, name: post.category.name }
//         : null,
//       tags: post.tags.map((t) => t.name),
//       publishedAt: post.publishedAt?.toISOString(),
//       views: post.views,
//       likes: post.likes,
//       comments: post.comments.filter((c) => c.status === "approved").length,
//       isFlagged: post.isFlagged,
//       flagReason: post.flagReason ?? post.flaggedPosts[0]?.reason ?? null,
//       createdAt: post.createdAt.toISOString(),
//     }));

//     return { success: true, data: transformedPosts };
//   } catch (err: any) {
//     console.error("Fetch blog posts error:", err);
//     return { success: false, error: err.message || "Failed to fetch blog posts" };
//   }
// }

// // ✅ Fetch a single blog post by ID



// export async function fetchBlogPostById(blogId: string) {
//   try {
//     const blog = await database.blogPost.findUnique({
//       where: { id: blogId, status: PostStatus.PUBLISHED },
//       include: {
//         category: true,
//         tags: true,
//         comments: {
//           include: {
//             user: {
//               select: {
//                 fullName: true,
//                 email: true,
//                 imageUrl: true,
//                 updatedAt: true,
//                 userId: true,
//                 id: true,
//                 userName: true,
//                 createdAt: true,
//               }
//             }
//           },
//         },
//         flaggedPosts: {
//           include: {
//             user: true,
//           },
//         },
//         user: {
//           select: {
//             fullName: true,
//             email: true,
//             imageUrl: true,
//             organization: true,
//             website: true,
//             SenderName: true,
//             role: true,
//           },
//         },
//       },
//     });

//     if (!blog) {
//       return { error: "Blog not found" };
//     }

//     // ✅ Use type assertion for quick fix
//     const normalizedBlog = blog as unknown as BlogPost;

//     return { blog: normalizedBlog };
//   } catch (error) {
//     console.error("Error fetching blog:", error);
//     return { error: "Failed to fetch blog" };
//   }
// }




// export async function updateBlogPostStatus(postId: string, status: BlogPostDTO["status"]) {
//   const user = await getServerAuth();
//   if (!user) return { success: false, error: "You must be logged in" };

//   try {
//     await requireSuperAdmin(user.userId);

//     const updatedPost = await database.blogPost.update({
//       where: { id: postId },
//       data: { status },
//     });

//     return { success: true, data: updatedPost };
//   } catch (err: any) {
//     console.error("Update post status error:", err);
//     return { success: false, error: err.message || "Failed to update post status" };
//   }
// }

// // ✅ Resolve blog post flag
// export async function resolveBlogPostFlag(postId: string) {
//   const user = await getServerAuth();
//   if (!user) return { success: false, error: "You must be logged in" };

//   try {
//     await requireSuperAdmin(user.id);

//     const resolvedPost = await database.blogPost.update({
//       where: { id: postId },
//       data: { isFlagged: false, flagReason: null },
//     });

//     return { success: true, data: resolvedPost };
//   } catch (err: any) {
//     console.error("Resolve flag error:", err);
//     return { success: false, error: err.message || "Failed to resolve flag" };
//   }
// }

// // ✅ Delete a blog post
// export async function deleteBlogPost(postId: string) {
//   const user = await getServerAuth();
//   if (!user) return { success: false, error: "You must be logged in" };

//   try {
//     await requireSuperAdmin(user.userId);
//     await database.blogPost.delete({ where: { id: postId } });

//     return { success: true };
//   } catch (err: any) {
//     console.error("Delete post error:", err);
//     return { success: false, error: err.message || "Failed to delete post" };
//   }
// }





// export async function flagBlogAction(blogId: string, reason: string, comment?: string) {
//   try {
//       const user = await getServerAuth();
//   if (!user) return { success: false, error: "You must be logged in" };

//   await requireSuperAdmin(user.userId);

//     await database.$transaction(async (tx) => {
//       // Update blog flag status
//       await tx.blogPost.update({
//         where: { id: blogId },
//         data: {
//           isFlagged: true,
//           flagReason: reason,
//           flaggedAt: new Date(),
//         //   flaggedBy: session.user.name,
//         },
//       });


//       // Add to flag history
//       await tx.flagedBlogPost.create({
//         data: {
//           postId: blogId,
//           comment:comment || "",
//           status:FlagStatus.FLAGGED,
//           flaggedBy:user.userName || "",
//           reason,
//           userId: user.id,
//           reviewedAt: new Date(),
//         },
//       });
//     });

//     revalidatePath("/xontrol/blog");
//     return { success: true };
//   } catch (error) {
//     console.error("Error flagging blog:", error);
//     return { error: "Internal server error" };
//   }
// }




// export async function unflagBlogAction(blogId: string, comment?: string) {
//   try {
//       const user = await getServerAuth();
//   if (!user) return { success: false, error: "You must be logged in" };

//  await requireSuperAdmin(user.userId);

//     await database.$transaction(async (tx) => {
//       // Reset flag fields on blog
//       await tx.blogPost.update({
//         where: { id: blogId },
//         data: {
//           isFlagged: false,
//           flagReason: null,
//         },
//       });


//       // Record in flag history
//       await tx.flagedBlogPost.create({
//         data: {
//           postId:blogId,
//           status: FlagStatus.RESOLVED,
//           reason: "Flag removed",
//           comment: comment || '',
//           flaggedBy:user.userName || " Drop-Aphi Team",
//           userId: user.userId,
//           reviewedAt: new Date(),
//         },
//       });
//     });

//     revalidatePath("/admin/blog");
//     return { success: true };
//   } catch (error) {
//     console.error("Error unflagging blog:", error);
//     return { error: "Internal server error" };
//   }
// }




"use server";

import { getServerAuth } from "@/lib/auth/getauth";
import { database } from "@/lib/database";
import { FlagStatus, PostStatus } from "@/lib/generated/prisma";
import { requireSuperAdmin } from "@/lib/utils";
import { revalidatePath } from "next/cache";

// Define proper types for the blog post with relations
export interface BlogComment {
  id: string;
  content: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  userId: {
    fullName: string;
    email: string;
    imageUrl: string | null;
    updatedAt: Date;
    userId: string;
    id: string;
    userName: string;
    createdAt: Date;
  };
}

export interface BlogTag {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogCategory {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  description: string | null;
}

export interface FlaggedPost {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  reason: string;
  status: string;
  comment?: string | null;
  flaggedBy?: string | null;
  userId: string;
  user?: {
    fullName: string;
    email: string;
    imageUrl: string | null;
  };
}

export interface BlogUser {
  fullName: string;
  email: string;
  imageUrl: string | null;
  organization: string | null;
  website: string | null;
  SenderName: string | null;
  role: string;
}

export interface ExtendedBlogPost {
  // Base fields
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  content: string;
  excerpt: string | null;
  format: any; // ContentFormat
  status: PostStatus;
  visibility: any; // PostVisibility
  publishedAt: Date | null;
  views: number;
  likes: number;
  isFlagged: boolean;
  flagReason: string | null;
  flaggedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  category: BlogCategory | null;
  tags: BlogTag[];
  comments: BlogComment[];
  flaggedPosts: FlaggedPost[];
  user: BlogUser | null;
}

// BlogPost DTO for list view
export type BlogPostDTO = {
  id: string;
  title: string;
  content?: string | null;
  author: string;
  authorEmail: string;
  status: PostStatus;
  category: {
    id: string;
    name: string;
  } | null;
  tags: string[];
  publishedAt?: string;
  views: number;
  likes: number;
  comments: number;
  isFlagged: boolean;
  flagReason?: string | null;
  createdAt: string;
};

// ✅ Fetch all blog posts
export async function fetchAllBlogPosts() {
  const user = await getServerAuth();
  if (!user) return { success: false, error: "You must be logged in" };

  try {
    await requireSuperAdmin(user.userId);

    const blogPosts = await database.blogPost.findMany({
      where: { status: PostStatus.PUBLISHED },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        flaggedPosts: true,
        comments: true,
        tags: true,
        category: { select: { id: true, name: true } }, 
      },
      orderBy: { createdAt: "desc" },
    });

    const transformedPosts: BlogPostDTO[] = blogPosts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      author: post.user?.fullName ?? "Unknown",
      authorEmail: post.user?.email ?? "N/A",
      status: post.status,
      category: post.category
        ? { id: post.category.id, name: post.category.name }
        : null,
      tags: post.tags.map((t) => t.name),
      publishedAt: post.publishedAt?.toISOString(),
      views: post.views,
      likes: post.likes,
      comments: post.comments.filter((c) => c.status === "approved").length,
      isFlagged: post.isFlagged,
      flagReason: post.flagReason ?? post.flaggedPosts[0]?.reason ?? null,
      createdAt: post.createdAt.toISOString(),
    }));

    return { success: true, data: transformedPosts };
  } catch (err: any) {
    console.error("Fetch blog posts error:", err);
    return { success: false, error: err.message || "Failed to fetch blog posts" };
  }
}

// ✅ Fetch a single blog post by ID
export async function fetchBlogPostById(blogId: string): Promise<{ blog?: ExtendedBlogPost; error?: string }> {
  try {
    const blog = await database.blogPost.findUnique({
      where: { id: blogId, status: PostStatus.PUBLISHED },
      include: {
        category: true,
        tags: true,
        comments: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                imageUrl: true,
                updatedAt: true,
                userId: true,
                id: true,
                userName: true,
                createdAt: true,
              }
            }
          },
        },
        flaggedPosts: {
          include: {
            user: true,
          },
        },
        user: {
          select: {
            fullName: true,
            email: true,
            imageUrl: true,
            organization: true,
            website: true,
            SenderName: true,
            role: true,
          },
        },
      },
    });

    if (!blog) {
      return { error: "Blog not found" };
    }

    // Properly normalize the data with correct typing
    const normalizedBlog: ExtendedBlogPost = {
      // Base fields
      id: blog.id,
      title: blog.title,
      subtitle: blog.subtitle,
      slug: blog.slug,
      content: blog.content,
      excerpt: blog.excerpt,
      format: blog.format,
      status: blog.status,
      visibility: blog.visibility,
      publishedAt: blog.publishedAt,
      views: blog.views,
      likes: blog.likes,
      isFlagged: blog.isFlagged,
      flagReason: blog.flagReason,
      flaggedAt: blog.flaggedAt,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      
      // Relations
      category: blog.category,
      tags: blog.tags,
      comments: blog.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        status: comment.status,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        userId: comment.user
      })),
      flaggedPosts: blog.flaggedPosts.map(flaggedPost => ({
        id: flaggedPost.id,
        createdAt: flaggedPost.createdAt,
        updatedAt: flaggedPost.createdAt,
        reason: flaggedPost.reason,
        status: flaggedPost.status,
        comment: flaggedPost.comment,
        flaggedBy: flaggedPost.flaggedBy,
        userId: flaggedPost.userId,
        user: flaggedPost.user ? {
          fullName: flaggedPost.user.fullName || '',
          email: flaggedPost.user.email || '',
          imageUrl: flaggedPost.user.imageUrl
        } : undefined
      })),
      user: blog.user
    };

    return { blog: normalizedBlog };
  } catch (error) {
    console.error("Error fetching blog:", error);
    return { error: "Failed to fetch blog" };
  }
}

export async function updateBlogPostStatus(postId: string, status: PostStatus) {
  const user = await getServerAuth();
  if (!user) return { success: false, error: "You must be logged in" };

  try {
    await requireSuperAdmin(user.userId);

    const updatedPost = await database.blogPost.update({
      where: { id: postId },
      data: { status },
    });

    return { success: true, data: updatedPost };
  } catch (err: any) {
    console.error("Update post status error:", err);
    return { success: false, error: err.message || "Failed to update post status" };
  }
}

// ✅ Resolve blog post flag
export async function resolveBlogPostFlag(postId: string) {
  const user = await getServerAuth();
  if (!user) return { success: false, error: "You must be logged in" };

  try {
    await requireSuperAdmin(user.id);

    const resolvedPost = await database.blogPost.update({
      where: { id: postId },
      data: { isFlagged: false, flagReason: null },
    });

    return { success: true, data: resolvedPost };
  } catch (err: any) {
    console.error("Resolve flag error:", err);
    return { success: false, error: err.message || "Failed to resolve flag" };
  }
}

// ✅ Delete a blog post
export async function deleteBlogPost(postId: string) {
  const user = await getServerAuth();
  if (!user) return { success: false, error: "You must be logged in" };

  try {
    await requireSuperAdmin(user.userId);
    await database.blogPost.delete({ where: { id: postId } });

    return { success: true };
  } catch (err: any) {
    console.error("Delete post error:", err);
    return { success: false, error: err.message || "Failed to delete post" };
  }
}

export async function flagBlogAction(blogId: string, reason: string, comment?: string) {
  try {
    const user = await getServerAuth();
    if (!user) return { success: false, error: "You must be logged in" };

    await requireSuperAdmin(user.userId);

    await database.$transaction(async (tx) => {
      // Update blog flag status
      await tx.blogPost.update({
        where: { id: blogId },
        data: {
          isFlagged: true,
          flagReason: reason,
          flaggedAt: new Date(),
        },
      });

      // Add to flag history
      await tx.flagedBlogPost.create({
        data: {
          postId: blogId,
          comment: comment || "",
          status: FlagStatus.FLAGGED,
          flaggedBy: user.userName || "",
          reason,
          userId: user.id,
          reviewedAt: new Date(),
        },
      });
    });

    revalidatePath("/xontrol/blog");
    return { success: true };
  } catch (error) {
    console.error("Error flagging blog:", error);
    return { error: "Internal server error" };
  }
}

export async function unflagBlogAction(blogId: string, comment?: string) {
  try {
    const user = await getServerAuth();
    if (!user) return { success: false, error: "You must be logged in" };

    await requireSuperAdmin(user.userId);

    await database.$transaction(async (tx) => {
      // Reset flag fields on blog
      await tx.blogPost.update({
        where: { id: blogId },
        data: {
          isFlagged: false,
          flagReason: null,
        },
      });

      // Record in flag history
      await tx.flagedBlogPost.create({
        data: {
          postId: blogId,
          status: FlagStatus.RESOLVED,
          reason: "Flag removed",
          comment: comment || '',
          flaggedBy: user.userName || " Drop-Aphi Team",
          userId: user.userId,
          reviewedAt: new Date(),
        },
      });
    });

    revalidatePath("/admin/blog");
    return { success: true };
  } catch (error) {
    console.error("Error unflagging blog:", error);
    return { error: "Internal server error" };
  }
}