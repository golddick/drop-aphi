



// lib/updateBlogPost.ts
"use server";

import { revalidatePath } from "next/cache";
import { ensurePublishingAllowed, handlePostPublishActions } from "./blogPostPublishing";
import { database } from "@/lib/database";
import { PostStatus } from "@/lib/generated/prisma";
import { getServerAuth } from "@/lib/auth/getauth";

type UpdateBlogPostResult =
  | { success: true; post: Awaited<ReturnType<typeof database.blogPost.findUnique>> }
  | { success: false; error: string };

function generateSlug(title: string, author: string) {
  const baseSlug = title
    ?.toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);

  const authorSlug = author
    ?.toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-");

  return `${baseSlug}-by-${authorSlug}`;
}

export async function updateBlogPost(
  postId: string,
  authorId: string,
  {
    title,
    author,
    authorTitle,
    authorBio,
    subtitle,
    content,
    excerpt,
    category,
    tags,
    status,
    featuredImage,
    featuredVideo,
    galleryImages,
    seoTitle,
    seoDescription,
    seoKeywords,
    allowComments,
    isFeatured,
    isPublic,
  }: {
    title: string;
    author: string;
    authorTitle?: string;
    authorBio?: string;
    subtitle?: string;
    content?: string;
    excerpt?: string;
    category?: string;
    isFeatured: boolean;
    isPublic: boolean;
    tags?: string[];
    status: PostStatus;
    featuredImage: string;
    featuredVideo?: string;
    galleryImages?: string[];
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
    allowComments?: boolean;
  }
): Promise<UpdateBlogPostResult> {
  try {
    const user = await getServerAuth();
    if (!user) {
      return { success: false, error: "You must be logged in to update a blog post" };
    }

    const existingPost = await database.blogPost.findUnique({
      where: { id: postId, authorId },
      include: { category: true, tags: true, user: true },
    });

    if (!existingPost) {
      return { success: false, error: "Post not found" };
    }

    const isPublishingNow = existingPost.status !== "PUBLISHED" && status === "PUBLISHED";
    if (isPublishingNow) {
      const allowed = await ensurePublishingAllowed(user.id);
      if (!allowed.success) {
        return { success: false, error: allowed.error ?? "Publishing not allowed" };
      }
    }

    const wordCount = content
      ? content.trim().split(/\s+/).length
      : existingPost.wordCount;
    const readTime = Math.ceil(wordCount / 200);

    let slug = existingPost.slug;
    if (existingPost.title !== title) {
      const newSlug = generateSlug(title, author);
      const slugExists = await database.blogPost.findUnique({ where: { slug: newSlug } });
      if (slugExists && slugExists.id !== postId) {
        return { success: false, error: "A post with this slug already exists." };
      }
      slug = newSlug;
    }

    const updatedPost = await database.blogPost.update({
      where: { id: postId, authorId },
      data: {
        title,
        subtitle,
        slug,
        content,
        excerpt,
        wordCount,
        readTime,
        characterCount: content?.length || existingPost.characterCount,
        seoTitle,
        seoDescription,
        seoKeywords,
        featuredImage,
        featuredVideo,
        galleryImages,
        isFeatured,
        visibility: isPublic ? "PUBLIC" : "PRIVATE",
        author,
        authorTitle,
        authorBio,
        status,
        allowComments,
        ...(category && {
          category: {
            connectOrCreate: {
              where: { name: category },
              create: {
                name: category,
              },
            },
          },
        }),
        ...(tags && {
          tags: {
            set: [],
            connectOrCreate: tags.map((tag) => ({
              where: { name: tag },
              create: {
                name: tag,
              },
            })),
          },
        }),
        publishedAt: isPublishingNow ? new Date() : existingPost.publishedAt,
      },
      include: {
        category: true,
        tags: true,
        user: true,
      },
    });

    if (isPublishingNow) {
      await handlePostPublishActions(
        updatedPost,
        user.userId,
        user.email
      );
    }

    revalidatePath("/blog");
    revalidatePath(`/blog/${updatedPost.slug}`);
    revalidatePath(`/dashboard/blog`);

    return { success: true, post: updatedPost };
  } catch (error) {
    console.error("Error updating blog post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update blog post",
    };
  }
}

export async function updatePostStatus(postId: string, status: PostStatus) {
  const user = await getServerAuth();
  if (!user) {
    return { success: false, error: "You must be logged in to update a blog post" };
  }

  const post = await database.blogPost.findUnique({
    where: { id: postId, authorId: user.id },
  });

  if (!post) {
    return { success: false, error: "Post not found" };
  }

  const isPublishingNow = post.status !== "PUBLISHED" && status === "PUBLISHED";
  if (isPublishingNow) {
    const allowed = await ensurePublishingAllowed(user.id);
    if (!allowed.success) {
      return { success: false, error: allowed.error ?? "Publishing not allowed" };
    }
  }

  const updated = await database.blogPost.update({
    where: { id: postId, authorId: user.userId },
    data: { status, updatedAt: new Date(), publishedAt: isPublishingNow ? new Date() : post.publishedAt },
  });

  if (isPublishingNow) {
    await handlePostPublishActions(
      updated,
      user.userId,
      user.email
    );
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${updated.slug}`);
  revalidatePath(`/dashboard/blog`);

  return { success: true, post: updated };
}
