'use server'


import { getServerAuth } from '@/lib/auth/getauth'
import { database } from '@/lib/database'
import { BlogCommentWithMember } from '@/type'
import { revalidatePath } from 'next/cache'


// Like a post
export async function likePost(postId: string) {
  try {
    const updatedPost = await database.blogPost.update({
      where: { id: postId },
      data: { likes: { increment: 1 } },
    })
    
    revalidatePath(`/blog/${postId}`)
    return { success: true, likes: updatedPost.likes }
  } catch (error) {
    console.error('Error liking post:', error)
    return { success: false, error: 'Failed to like post' }
  }
}

// Add a comment

export async function addComment(
  postId: string,
  content: string,
  authorId: string,
  slug: string,
  parentId?: string | null
): Promise<{
  success: boolean;
  comment?: BlogCommentWithMember;
  error?: string;
}> {
  try {
    const user = await getServerAuth();
    if (!user) {
      return { success: false, error: "You must be logged in to comment" };
    }

    if (!content.trim()) {
      return { success: false, error: "Comment cannot be empty" };
    }

    const newComment = await database.blogComment.create({
      data: {
        content,
        postId,
        userId: user.userId,
        authorId,
        status: "approved",
        ...(parentId && { parentId }),
      },
      include: {
        user: true,
        ...(parentId === undefined && {
          replies: {
            include: {
              user: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        }),
      },
    });

    revalidatePath(`/blog/${slug}`);
    return {
      success: true,
      comment: newComment as unknown as BlogCommentWithMember,
    };
  } catch (error) {
    console.error("Error adding comment:", error);
    return { success: false, error: "Failed to add comment" };
  }
}


export async function likeComment(commentId: string) {
  try {
    const updatedComment = await database.blogComment.update({
      where: { id: commentId },
      data: { likes: { increment: 1 } },
    })

    revalidatePath(`/blog/${updatedComment.postId}`)
    return { success: true, likes: updatedComment.likes }
  } catch (error) {
    console.error('Error liking comment:', error)
    return { success: false, error: 'Failed to like comment' }
  }
}



export const editComment = async (commentId: string, content: string) => {
  try {

  const user = await getServerAuth();
  if (!user) {
    return { success: false, error: "You must be logged in to create a blog post" };
  }
  const userId = user.userId;

    const updatedComment = await database.blogComment.update({
      where: { id: commentId , userId: userId },
      data: { content },
      include: { user: true }
    });

    return { 
      success: true,
      comment: updatedComment
    };
  } catch (error) {
    return { 
      success: false,
      error: "Failed to update comment"
    };
  }
};

export const deleteComment = async (commentId: string) => {
  try {

      const user = await getServerAuth();
  if (!user) {
    return { success: false, error: "You must be logged in to create a blog post" };
  }

  const userId = user.userId


    await database.blogComment.delete({
      where: { id: commentId, userId: userId },
    });

    return { success: true };
  } catch (error) {
    return { 
      success: false,
      error: "Failed to delete comment"
    };
  }
};

export const reportComment = async (commentId: string, blogSlug: string, blogOwner:string, parentCommentBy:string,  ) => {
  try {
     const user = await getServerAuth();
  if (!user) {
    return { success: false, error: "You must be logged in to create a blog post" };
  }
    const userId = user.userId;
    await database.reportedComment.create({
      data: {
        commentId,
        blogSlug,
        blogOwner,
        reason: "Inappropriate content", 
        parentCommentBy,
        reportedBy: userId,
        reportedAt: new Date()
      }
    });

    return { success: true };
  } catch (error) {
    return { 
      success: false,
      error: "Failed to report comment"
    };
  }
};