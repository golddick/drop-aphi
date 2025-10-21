// 'use server';

// import { checkUsageLimit, incrementUsage } from '@/lib/checkAndUpdateUsage';
// import { revalidatePath } from 'next/cache';
// import { notifySubscribersAboutNewPost } from './notify';
// import { ensurePublishingAllowed, handlePostPublishActions } from './blogPostPublishing';
// import { getServerAuth } from '@/lib/auth/getauth';
// import { database } from '@/lib/database';

// type CreateBlogPostResult = {
//   success: boolean;
//   post: any | null;
//   error: string | null;
// };

// // CREATE BLOG POST
// export async function createBlogPost(formData: {
//   title: string;
//   subtitle?: string;
//   authorBio: string;
//   authorTitle: string;
//   author: string;
//   content: string;
//   excerpt: string;
//   category: string;
//   tags: string[];
//   isDraft: boolean;
//   isFeatured: boolean;
//   isPublic: boolean;
//   featuredImage: string;
//   featuredVideo?: string;
//   galleryImages?: string[];
//   seoTitle?: string;
//   seoDescription?: string;
//   seoScore?: number;
//   seoKeywords?: string[];
//   allowComments?: boolean;
// }): Promise<CreateBlogPostResult> {
//   const user = await getServerAuth();
//   if (!user) {
//     return { success: false, error: "You must be logged in to create a blog post", post: null };
//   }

//   // Only check usage if publishing
//   if (!formData.isDraft) {
//     const limitCheck = await ensurePublishingAllowed(user.id);
//     if (!limitCheck.success) {
//       return { success: false, error: limitCheck.error ?? "Publishing limit reached", post: null };
//     }
//   }

//   try {
//     const wordCount = formData.content.trim().split(/\s+/).length;
//     const readTime = Math.ceil(wordCount / 200);

//     const baseSlug = formData.title.toLowerCase()
//       .replace(/[^\w\s]/g, "")
//       .replace(/\s+/g, "-")
//       .slice(0, 60);

//     const authorSlug = formData.author?.toLowerCase()
//       .replace(/[^\w\s]/g, "")
//       .replace(/\s+/g, "-"); 

//     const slug = `${baseSlug}-by-${authorSlug}`;

//     const existingPost = await database.blogPost.findUnique({ where: { slug } });
//     if (existingPost) {
//       return { success: false, error: "A post with this title already exists", post: null };
//     }

//     const post = await database.blogPost.create({
//       data: {
//         title: formData.title,
//         subtitle: formData.subtitle,
//         authorBio: formData.authorBio,
//         author: formData.author,
//         authorTitle: formData.authorTitle,
//         slug,
//         content: formData.content,
//         excerpt: formData.excerpt || formData.content.slice(0, 160) + "...",
//         format: "MARKDOWN",
//         status: formData.isDraft ? "DRAFT" : "PUBLISHED",
//         visibility: formData.isPublic ? "PUBLIC" : "PRIVATE",
//         featuredImage: formData.featuredImage,
//         featuredVideo: formData.featuredVideo || null,
//         galleryImages: formData.galleryImages || [],
//         isFeatured: formData.isFeatured,
//         isPinned: false,
//         allowComments: formData.allowComments ?? true,
//         wordCount,
//         characterCount: formData.content.length,
//         readTime,
//         seoTitle: formData.seoTitle,
//         seoDescription: formData.seoDescription,
//         seoScore: formData.seoScore || 0,
//         seoKeywords: formData.seoKeywords || [],
//         publishedAt: formData.isDraft ? null : new Date(),
//         user: { connect: { userId: user.userId } },
//         category: {
//           connectOrCreate: {
//             where: { name: formData.category },
//             create: {
//               name: formData.category,
//             },
//           },
//         },
//         tags: {
//           connectOrCreate: formData.tags.map((tag) => ({
//             where: { name: tag },
//             create: {
//               name: tag,
//               slug: tag.toLowerCase().replace(/\s+/g, "-"),
//             },
//           })),
//         },
//       },
//       include: { category: true, tags: true, user: true },
//     });

//     // Publish actions
//     if (!formData.isDraft) {
//       await handlePostPublishActions(post, user.userId, user.email);
//     }

//     revalidatePath("/blog");
//     revalidatePath(`/blog/${post.slug}`);

//     return {
//       success: true,
//       post: { ...post, url: `/dashboard/blog/${post.slug}` },
//       error: null
//     };
//   } catch (error: any) {
//     console.error("Error creating blog post:", error);
//     return { success: false, post: null, error: error.message || "Error creating blog post" };
//   }
// }










'use server';

import { checkUsageLimit, incrementUsage } from '@/lib/checkAndUpdateUsage';
import { revalidatePath } from 'next/cache';
import { notifySubscribersAboutNewPost } from './notify';
import { ensurePublishingAllowed, handlePostPublishActions } from './blogPostPublishing';
import { getServerAuth } from '@/lib/auth/getauth';
import { database } from '@/lib/database';
import { KYCStatus } from '@prisma/client';


type CreateBlogPostResult = {
  success: boolean;
  post: any | null;
  error: string | null;
  kycRequired?: boolean;
};

// CREATE BLOG POST
export async function createBlogPost(formData: {
  title: string;
  subtitle?: string;
  authorBio: string;
  authorTitle: string;
  author: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  isDraft: boolean;
  isFeatured: boolean;
  isPublic: boolean;
  featuredImage: string;
  featuredVideo?: string;
  galleryImages?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoScore?: number;
  seoKeywords?: string[];
  allowComments?: boolean;
}): Promise<CreateBlogPostResult> {
  const user = await getServerAuth();
  if (!user) {
    return { success: false, error: "You must be logged in to create a blog post", post: null };
  }

  // Check user's membership and KYC status
  const membership = await database.user.findUnique({
    where: { userId: user.userId },
    select: {
      kycStatus: true,
      approvedKYC: true,
      plan: true,
      subscriptionStatus: true
    }
  });

  if (!membership) {
    return { success: false, error: "Membership not found", post: null };
  }

  // Verify KYC is approved before allowing blog post creation
  if (membership.kycStatus !== KYCStatus.APPROVED && !membership.approvedKYC) {
    return { 
      success: false, 
      error: "KYC verification required before creating blog posts", 
      post: null,
      kycRequired: true 
    };
  }

  // Only check usage if publishing
  if (!formData.isDraft) {
    const limitCheck = await ensurePublishingAllowed(user.id);
    if (!limitCheck.success) {
      return { success: false, error: limitCheck.error ?? "Publishing limit reached", post: null };
    }
  }

  try {
    const wordCount = formData.content.trim().split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    const baseSlug = formData.title.toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 60);

    const authorSlug = formData.author?.toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "-"); 

    const slug = `${baseSlug}-by-${authorSlug}`;

    const existingPost = await database.blogPost.findUnique({ where: { slug } });
    if (existingPost) {
      return { success: false, error: "A post with this title already exists", post: null };
    }

    const post = await database.blogPost.create({
      data: {
        title: formData.title,
        subtitle: formData.subtitle,
        authorBio: formData.authorBio,
        author: formData.author,
        authorTitle: formData.authorTitle,
        slug,
        content: formData.content,
        excerpt: formData.excerpt || formData.content.slice(0, 160) + "...",
        format: "MARKDOWN",
        status: formData.isDraft ? "DRAFT" : "PUBLISHED",
        visibility: formData.isPublic ? "PUBLIC" : "PRIVATE",
        featuredImage: formData.featuredImage,
        featuredVideo: formData.featuredVideo || null,
        galleryImages: formData.galleryImages || [],
        isFeatured: formData.isFeatured,
        isPinned: false,
        allowComments: formData.allowComments ?? true,
        wordCount,
        characterCount: formData.content.length,
        readTime,
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        seoScore: formData.seoScore || 0,
        seoKeywords: formData.seoKeywords || [],
        publishedAt: formData.isDraft ? null : new Date(),
        user: { connect: { userId: user.userId } },
        category: {
          connectOrCreate: {
            where: { name: formData.category },
            create: {
              name: formData.category,
            },
          },
        },
        tags: {
          connectOrCreate: formData.tags.map((tag) => ({
            where: { name: tag },
            create: {
              name: tag,
              slug: tag.toLowerCase().replace(/\s+/g, "-"),
            },
          })),
        },
      },
      include: { category: true, tags: true, user: true },
    });

    // Publish actions
    if (!formData.isDraft) {
      await handlePostPublishActions(post, user.userId, user.email);
    }

    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);

    return {
      success: true,
      post: { ...post, url: `/dashboard/blog/${post.slug}` },
      error: null
    };
  } catch (error: any) {
    console.error("Error creating blog post:", error);
    return { success: false, post: null, error: error.message || "Error creating blog post" };
  }
}