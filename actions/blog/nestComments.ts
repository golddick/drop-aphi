import { BlogComment, FormattedComment } from "@/type";
import { formatDistanceToNow } from "date-fns";



export function nestComments(
  flatComments: BlogComment[],
  currentAuthorId?: string
): FormattedComment[] {
  const commentMap = new Map<string, FormattedComment>();

  // Step 1: Create a map of all comments (without nesting)
  for (const comment of flatComments) {
    commentMap.set(comment.id, { 
      id: comment.id,
      author: comment.user,
      authorAvatar: comment.user.imageUrl ||"",
      date: formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }),
      content: comment.content,
      likes: comment.likes,
      isLiked: false,
      replies: [],
      isAuthor: comment.user.userId === currentAuthorId,
    });
  }

  const nested: FormattedComment[] = [];

  // Step 2: Assign replies to their parent
  for (const comment of flatComments) {
    const formatted = commentMap.get(comment.id)!;

    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        parent.replies.push(formatted);
      }
    } else {
      nested.push(formatted); // top-level
    }
  }

  return nested;
}
