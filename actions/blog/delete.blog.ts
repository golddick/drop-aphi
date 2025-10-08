'use server';

import { getServerAuth } from '@/lib/auth/getauth';
import { decrementBlogUsage } from '@/lib/checkAndUpdateUsage';
import { database } from '@/lib/database';
import { revalidatePath } from 'next/cache';

type DeleteBlogPostResult = {
  success: boolean;
  error: string | null;
};

export async function deleteBlogPost(postId: string): Promise<DeleteBlogPostResult> {
  const user = await getServerAuth();
  if (!user) {
    return { success: false, error: "You must be logged in to delete a blog post" };
  }

  try {
    // Find the post and verify ownership
    const post = await database.blogPost.findUnique({
      where: { id: postId },
      include: { user: true },
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    if (post.user?.userId !== user.userId) {
      return { success: false, error: "You are not authorized to delete this post" };
    }

    // Delete post
    await database.blogPost.delete({
      where: { id: postId },
    });

    // Decrement usage only if it was a published post
    if (post.status === "PUBLISHED") {
      await decrementBlogUsage(user.id, 1);
    }

    // Revalidate affected paths
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath(`/dashboard/blog/${post.slug}`);

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error deleting blog post:", error);
    return { success: false, error: error.message || "Error deleting blog post" };
  }
}
