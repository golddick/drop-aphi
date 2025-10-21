"use client"

import { useState } from "react"
import { Heart, Reply, MessageCircle, Edit, Trash2, Flag, ChevronDown, ChevronUp } from "lucide-react"
import { useAuthUser } from "@/lib/auth/getClientAuth"
import { toast } from "sonner"
import { BlogComment, FormattedComment } from "@/type"
import { nestComments } from "@/actions/blog/nestComments"

interface CommentsSectionProps {
  comments: BlogComment[]
  onAddComment: (content: string, parentId?: string) => void
  onLikeComment: (commentId: string) => void
  onEditComment: (commentId: string, content: string) => void
  onDeleteComment: (commentId: string) => void
  onReportComment: (commentId: string) => void
  currentAuthorId?: string
}

function CommentItem({ 
  comment, 
  onReply, 
  onLike, 
  onEdit, 
  onDelete, 
  onReport,
  replyingTo,
  onSubmitReply,
  editingComment,
  onSubmitEdit,
  depth = 0,
  isReply = false
}: {
  comment: FormattedComment
  onReply: (commentId: string) => void
  onLike: (commentId: string) => void
  onEdit: (commentId: string) => void
  onDelete: (commentId: string) => void
  onReport: (commentId: string) => void
  replyingTo: string | null
  onSubmitReply: (commentId: string, content: string) => void
  editingComment: string | null
  onSubmitEdit: (commentId: string, content: string) => void
  depth?: number
  isReply?: boolean
}) {
  const [isLiked, setIsLiked] = useState(comment.isLiked)
  const [replyContent, setReplyContent] = useState("")
  const [editContent, setEditContent] = useState(comment.content)
  const [showReplies, setShowReplies] = useState(depth === 0)
  const [showAllReplies, setShowAllReplies] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false) // New state to control reply form visibility
  const { user } = useAuthUser()

  const isOwner = user?.userId === comment.author.userId
  const formattedDate = comment.date

  const replies = comment.replies || []
  const replyCount = replies.length

  const displayedReplies = showAllReplies 
    ? replies 
    : replies.slice(0, 5)

  const hasMoreReplies = replyCount > 5

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike(comment.id)
  }

  const handleReplyClick = () => {
    setShowReplyForm(true)
    onReply(comment.id)
  }

  const handleSubmitReply = () => {
    if (replyContent.trim()) {
      onSubmitReply(comment.id, replyContent)
      setReplyContent("")
      setShowReplyForm(false) // Hide form after submitting
      // Auto-show replies when a new reply is added
      if (!showReplies) {
        setShowReplies(true)
      }
    }
  }

  const handleCancelReply = () => {
    setShowReplyForm(false)
    setReplyContent("")
    onReply('')
  }

  const handleSubmitEdit = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onSubmitEdit(comment.id, editContent)
    }
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this comment?")) {
      onDelete(comment.id)
    }
  }

  const handleReport = () => {
    if (confirm("Report this comment for review?")) {
      onReport(comment.id)
    }
  }

  const toggleReplies = () => {
    setShowReplies(!showReplies)
  }

  const toggleShowAllReplies = () => {
    setShowAllReplies(!showAllReplies)
  }

  return (
    <div className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-6' : ''} ${depth > 0 ? 'mt-4' : ''}`}>
      <div className="flex gap-4 mb-4">
        <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
          {comment.authorAvatar ? (
            <img 
              src={comment.authorAvatar} 
              alt={comment.author.userName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            comment.author.userName.charAt(0).toUpperCase()
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-semibold text-black">{comment.author.userName}</p>
            {comment.isAuthor && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Author</span>
            )}
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>

          {editingComment === comment.id ? (
            <div className="mb-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-yellow-600 focus:outline-none resize-none"
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSubmitEdit}
                  className="px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => onEdit('')}
                  className="px-3 py-1 bg-gray-200 text-black rounded-lg hover:bg-gray-300 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 mb-3">{comment.content}</p>
          )}

          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-sm transition-all ${
                isLiked ? "text-red-600" : "text-gray-500 hover:text-red-600"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span>{comment.likes + (isLiked ? 1 : 0)}</span>
            </button>
            
            <button
              onClick={handleReplyClick}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-yellow-600 transition-all"
            >
              <Reply className="w-4 h-4" />
              Reply
            </button>

            {/* Show replies toggle for comments with replies */}
            {replyCount > 0 && (
              <button
                onClick={toggleReplies}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-all"
              >
                {showReplies ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
              </button>
            )}

            {isOwner && (
              <>
                <button
                  onClick={() => onEdit(comment.id)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-all"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}

            {!isOwner && (
              <button
                onClick={handleReport}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-600 transition-all"
              >
                <Flag className="w-4 h-4" />
                Report
              </button>
            )}
          </div>

          {/* Reply Form - Only shown when showReplyForm is true */}
          {showReplyForm && replyingTo === comment.id && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-yellow-600 focus:outline-none resize-none"
                rows={3}
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleSubmitReply}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold"
                >
                  Post Reply
                </button>
                <button
                  onClick={handleCancelReply}
                  className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested Replies - Show immediately for top-level comments */}
      {replyCount > 0 && showReplies && (
        <div className="space-y-4 mt-4">
          {displayedReplies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onLike={onLike}
              onEdit={onEdit}
              onDelete={onDelete}
              onReport={onReport}
              replyingTo={replyingTo}
              onSubmitReply={onSubmitReply}
              editingComment={editingComment}
              onSubmitEdit={onSubmitEdit}
              depth={depth + 1}
              isReply={true}
            />
          ))}
          
          {/* View More Replies Button */}
          {hasMoreReplies && (
            <div className="ml-12">
              <button
                onClick={toggleShowAllReplies}
                className="flex items-center gap-1 text-sm text-yellow-600 hover:text-yellow-700 font-medium"
              >
                {showAllReplies ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show fewer replies
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    View {replyCount - 5} more replies
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function CommentsSection({
  comments,
  onAddComment,
  onLikeComment,
  onEditComment,
  onDeleteComment,
  onReportComment,
  currentAuthorId
}: CommentsSectionProps) {
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const { user } = useAuthUser()

  // Use the nestComments function to format comments
  const nestedComments = nestComments(comments, currentAuthorId)

  const handleSubmitComment = () => {
    if (!user) {
      toast.error("Please log in to comment")
      return
    }

    if (newComment.trim()) {
      onAddComment(newComment)
      setNewComment("")
      toast.success("Comment added successfully")
    }
  }

  const handleSubmitReply = (commentId: string, content: string) => {
    if (!user) {
      toast.error("Please log in to reply")
      return
    }

    onAddComment(content, commentId)
    setReplyingTo(null)
    toast.success("Reply added successfully")
  }

  const handleSubmitEdit = (commentId: string, content: string) => {
    onEditComment(commentId, content)
    setEditingComment(null)
    toast.success("Comment updated successfully")
  }

  // Calculate total comments including replies
  const calculateTotalComments = (comments: FormattedComment[]): number => {
    return comments.reduce((total, comment) => {
      const repliesCount = comment.replies ? comment.replies.length : 0
      return total + 1 + repliesCount
    }, 0)
  }

  const totalComments = calculateTotalComments(nestedComments)

  return (
    <section className="mt-16 pt-12 border-t-2 border-gray-200">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-2 flex items-center gap-2">
          <MessageCircle className="w-8 h-8" />
          Comments ({totalComments})
        </h2>
        <p className="text-gray-600">Join the discussion and share your thoughts</p>
      </div>

      {/* New Comment Form */}
      {user && (
        <div className="mb-12 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
          <h3 className="font-semibold text-black mb-4">Leave a comment</h3>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-yellow-600 focus:outline-none resize-none mb-4"
            rows={4}
          />
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{newComment.length} characters</p>
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post Comment
            </button>
          </div>
        </div>
      )}

      {!user && (
        <div className="mb-12 p-6 bg-yellow-50 rounded-lg border-2 border-yellow-200 text-center">
          <p className="text-yellow-800">
            Please <button className="text-yellow-600 font-semibold underline">log in</button> to join the discussion.
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-8">
        {nestedComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          nestedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={setReplyingTo}
              onLike={onLikeComment}
              onEdit={setEditingComment}
              onDelete={onDeleteComment}
              onReport={onReportComment}
              replyingTo={replyingTo}
              onSubmitReply={handleSubmitReply}
              editingComment={editingComment}
              onSubmitEdit={handleSubmitEdit}
            />
          ))
        )}
      </div>
    </section>
  )
}