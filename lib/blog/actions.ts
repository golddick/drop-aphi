
"use server"

import { database } from "../database";
import { FlagStatus } from "../generated/prisma";


export async function getAllCategories() {
  return await database.blogCategory.findMany({ orderBy: { name: "asc" } })
}

export async function getFilteredPosts({
  authorId,
  category,
  search,
  sort,
  order
}: {
  authorId: string;
  category?: string;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}) {
  // Map frontend sort fields to database fields
  const sortFieldMap: Record<string, string> = {
    updated: "updatedAt",
    created: "createdAt",
    published: "publishedAt",
    views: "views",
    likes: "likes",
    title: "title"
  };

  const dbSortField = sortFieldMap[sort || "updated"] || "updatedAt";
  const dbOrder = order || "desc";

  const posts = await database.blogPost.findMany({
    where: {
      authorId,
      ...(category && { category: { name: category } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
          { tags: { some: { name: { contains: search, mode: "insensitive" } } }}
        ]
      })
    },
    include: {
      category: {
        select:{
          id: true,
          name: true,
          
        }
      },
      tags: true,
      flaggedPosts: {
        where: { status: FlagStatus.FLAGGED },
        select:{
          id: true,
          comment:true,
          status:true,
          reason: true,
          reviewedAt: true,
          flaggedBy: true,
          createdAt: true,
          postId: true,
          userId: true,
        },
        
      },
      user: {
        select: {
          fullName: true,
          userId: true,
          email: true,
          imageUrl: true,
        }
      },
      _count: {
        select: {
          comments: true
        }
      }
    },
    orderBy: {
      [dbSortField]: dbOrder
    }
  });

  // Rest of your transformation code remains the same...

  return posts.map(post => ({
  id: post.id,
  title: post.title,
  subtitle: post.subtitle || "",
  excerpt: post.excerpt || "",
  content: post.content,
  featuredImage: post.featuredImage,
  featuredVideo: post.featuredVideo || null,
  galleryImages: post.galleryImages || [],

  // Relations
  category: post.category?.name || "Uncategorized",
  tags: post.tags.map(tag => tag.name),
  author: post.author || post.user?.fullName || "Unknown Author",
  authorTitle: post.authorTitle || "",
  authorImg: post.user?.imageUrl || null,

  // Status/visibility
  status: post.status as "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SCHEDULED",
  visibility: post.visibility as "PUBLIC" | "PRIVATE" | "MEMBERS_ONLY",

  // Dates
  createdAt: post.createdAt.toISOString(),
  updatedAt: post.updatedAt.toISOString(),
  publishedAt: post.publishedAt?.toISOString() || null,
  scheduledAt: post.scheduledAt?.toISOString() || null,

  // Stats
  wordCount: post.wordCount || 0,
  readTime: post.readTime || 0,
  characterCount: post.characterCount || 0,   // ✅ Added
  views: post.views || 0,
  likes: post.likes || 0,
  comments: post._count?.comments || 0,
  shares: post.shares || 0,
  seoScore: post.seoScore || 0,

  // Flags / Features
  isFeatured: post.isFeatured || false,
  allowComments: post.allowComments ?? true,   // ✅ Added
  format: post.format || "MARKDOWN",           // ✅ Added
  slug: post.slug,
  flaggedAt: post.flaggedAt || null,
  flagReason: post.flagReason || null,
  isFlagged: post.isFlagged || false,

  // Flags relation
  flaggedPosts: post.flaggedPosts.map(flaggedPost => ({
    id: flaggedPost.id,
    reason: flaggedPost.reason,
    comment: flaggedPost.comment,
    createdAt: flaggedPost.createdAt,
    reviewedAt: flaggedPost.reviewedAt,
    flaggedBy: flaggedPost.flaggedBy,
    status: flaggedPost.status as FlagStatus,
    postId: flaggedPost.postId,
    userId: flaggedPost.userId,

  })),
  isPinned:post.isPinned || false,
  seoKeywords: post.seoKeywords || "",   
  seoTitle: post.seoTitle || "",
  seoDescription: post.seoDescription || "",
  authorId: post.authorId,
  authorBio: post.authorBio || "",
  categoryId: post.categoryId,
  members:post.user
}));




}
