

















"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  MessageSquare,
  Reply,
  Send,
  MoreHorizontal,
  Flag,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatString } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Comment {
  id: string
  author: string
  authorAvatar: string
  date: string
  content: string
  likes: number
  isLiked: boolean
  replies: Comment[]
  isAuthor?: boolean
  isVerified?: boolean
}

interface CommentSectionProps {
  comments: Comment[]
  onAddComment: (content: string, parentId?: string) => void
  onLikeComment: (commentId: string) => void
  onEditComment?: (commentId: string, content: string) => void
  onDeleteComment?: (commentId: string) => void
  onReportComment?: (commentId: string) => void
}

interface CommentItemProps {
  comment: Comment
  onLike: (commentId: string) => void
  onReply: (content: string, parentId: string) => void
  onEdit?: (commentId: string, content: string) => void
  onDelete?: (commentId: string) => void
  onReport?: (commentId: string) => void
  depth?: number
  isReply?: boolean
}

const MAX_DEPTH = 2 // Replies deeper than this will collapse into "View Thread"

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onLike,
  onReply,
  onEdit,
  onDelete,
  onReport,
  depth = 0,
  isReply = false,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [showReplies, setShowReplies] = useState(false)
  const [showDeepThread, setShowDeepThread] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment.content)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    if (!replyText.trim()) return

    onReply(replyText, comment.id)
    setReplyText("")
    setShowReplyForm(false)
    setIsLoading(false)
    toast.success("Reply added successfully")
    router.refresh()
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    if (!editText.trim() || !onEdit) return

    onEdit(comment.id, editText)
    setIsEditing(false)
    setIsLoading(false)
    toast.success("Comment edited successfully")
    router.refresh()
  }

  const handleCancelEdit = () => {
    setEditText(comment.content)
    setIsEditing(false)
  }

  const shouldCollapse = depth >= MAX_DEPTH

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`${isReply ? "ml-8 border-l-2 border-blue-100 pl-6" : ""}`}
    >
      <div className="bg-white rounded-xl border-none border-neutral-200 p-2 md:p-4 hover:shadow-md transition-all duration-200">
        <div className="flex flex-col items-start">
          <div className="flex items-start gap-4">
            <Avatar className="h-6 w-6 lg:h-10 lg:w-10 ring-2 ring-gold-100">
              <AvatarImage src={comment.authorAvatar} alt={comment.author} />
              <AvatarFallback className="bg-gradient-to-br from-black to-gold-100 text-white font-semibold">
                {comment.author
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-neutral-900 truncate">{formatString(comment.author)}</h4>
                {comment.isVerified && (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                    Verified
                  </Badge>
                )}
                {comment.isAuthor && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                    Author
                  </Badge>
                )}
                <span className="text-sm text-neutral-500">{comment.date}</span>
              </div>

              {isEditing ? (
                <form onSubmit={handleEditSubmit} className="mb-4">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="mb-3 min-h-[80px] resize-none"
                    placeholder="Edit your comment..."
                  />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={!editText.trim()}>
                      {isLoading ? "Saving..." : <Send className="h-4 w-4 mr-1" />}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <p className="text-neutral-700 leading-relaxed mb-4 whitespace-pre-wrap">{comment.content}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLike(comment.id)}
                className={`${
                  comment.isLiked ? "text-red-500 bg-red-50" : "text-neutral-500 hover:text-red-500"
                } transition-colors`}
              >
                <Heart className={`h-4 w-4 mr-1 ${comment.isLiked ? "fill-current" : ""}`} />
                {comment.likes}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-neutral-500 hover:text-blue-500 transition-colors"
              >
                <Reply className="h-4 w-4 mr-1" />
                Reply
              </Button>

              {comment.replies.length > 0 && !shouldCollapse && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-neutral-500 hover:text-blue-500 transition-colors"
                >
                  {showReplies ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                  {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
                </Button>
              )}

              {comment.replies.length > 0 && shouldCollapse && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeepThread(!showDeepThread)}
                  className="text-neutral-500 hover:text-blue-500 transition-colors"
                >
                  {showDeepThread ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" /> Hide Thread
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" /> View Thread ({comment.replies.length})
                    </>
                  )}
                </Button>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-neutral-600">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {comment.isAuthor && onEdit && (
                  <DropdownMenuItem onClick={() => setIsEditing(true)} className="text-blue-600">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Comment
                  </DropdownMenuItem>
                )}
                {comment.isAuthor && onDelete && (
                  <DropdownMenuItem onClick={() => onDelete(comment.id)} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Comment
                  </DropdownMenuItem>
                )}
                {!comment.isAuthor && onReport && (
                  <DropdownMenuItem onClick={() => onReport(comment.id)} className="text-orange-600">
                    <Flag className="h-4 w-4 mr-2" />
                    Report Comment
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Reply Form */}
        <AnimatePresence>
          {showReplyForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 ml-16"
            >
              <form onSubmit={handleReplySubmit} className="space-y-3">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${formatString(comment.author)}...`}
                  className="min-h-[80px] resize-none"
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={!replyText.trim()}>
                    <Send className="h-4 w-4 mr-1" />
                    {isLoading ? "Replying..." : "Post Reply"}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowReplyForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Replies */}
      <AnimatePresence>
        {!shouldCollapse && showReplies && comment.replies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 space-y-4"
          >
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onLike={onLike}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onReport={onReport}
                depth={depth + 1}
                isReply={true}
              />
            ))}
          </motion.div>
        )}

        {shouldCollapse && showDeepThread && comment.replies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 space-y-4"
          >
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onLike={onLike}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onReport={onReport}
                depth={depth + 1}
                isReply={true}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  onAddComment,
  onLikeComment,
  onEditComment,
  onDeleteComment,
  onReportComment,
}) => {
  const [newCommentText, setNewCommentText] = useState("")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular">("newest")
  const [isLoading, setIsLoading] = useState(false)

  const handleNewCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCommentText.trim()) return

    onAddComment(newCommentText)
    setNewCommentText("")
  }

  const sortedComments = [...comments].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.likes - a.likes
      case "oldest":
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      case "newest":
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime()
    }
  })

  const totalComments = comments.length

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-8 border border-neutral-200">
      <div className="flex items-start justify-start">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-blue-500" />
          <h3 className=" text-[15px] lg:text-2xl font-bold text-neutral-900">Comments ({totalComments})</h3>
        </div>
      </div>

      {/* New Comment Form */}
      <div className="mb-8 p-2 bg-white rounded-xl border-none">
        <h4 className="text-lg font-semibold text-neutral-900 mb-4">Join the Discussion</h4>
        <form onSubmit={handleNewCommentSubmit} className="space-y-4">
          <Textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Share your thoughts on this article..."
            className="min-h-[100px] bg-white"
          />
          <div className="flex justify-between items-center">
            <Button type="submit" disabled={!newCommentText.trim()} className="bg-black text-white hover:bg-gold-700">
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? "Submitting..." : "Submit Comment"}
            </Button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        <AnimatePresence>
          {sortedComments.length > 0 && (
            sortedComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onLike={onLikeComment}
                onReply={(content, parentId) => onAddComment(content, parentId)}
                onEdit={onEditComment}
                onDelete={onDeleteComment}
                onReport={onReportComment}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Load More Comments (if needed) */}
      {comments.length > 10 && (
        <div className="text-center mt-8">
          <Button variant="outline" className="bg-white">
            Load More Comments
          </Button>
        </div>
      )}
    </div>
  )
}
