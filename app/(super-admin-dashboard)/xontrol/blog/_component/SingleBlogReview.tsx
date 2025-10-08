"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Flag,
  FlagOff,
  Eye,
  ThumbsUp,
  MessageCircle,
  Calendar,
  User,
  Mail,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import Image from "next/image"
import { PostStatus } from "@/lib/generated/prisma"
import { fetchBlogPostById, flagBlogAction, unflagBlogAction, ExtendedBlogPost } from "@/actions/superadmin/Blog-Management"
import { toast } from "sonner"
import Loader from "@/components/_component/Loader"
import { parseMarkdown } from "@/lib/blog/markdown-parser"

interface BlogReviewProps {
  blogId: string
}

const flagReasons = [
  "Copyright infringement",
  "Inappropriate content",
  "Spam or misleading information",
  "Violation of community guidelines",
  "Plagiarism",
  "Offensive language",
  "Other",
]

export function BlogReview({ blogId }: BlogReviewProps) {
  const [flagReason, setFlagReason] = useState("")
  const [flagComment, setFlagComment] = useState("")
  const [unflagComment, setUnflagComment] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [blog, setBlog] = useState<ExtendedBlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true)
        const res = await fetchBlogPostById(blogId)
        console.log(res, 'res blog')
        if (res.error) {
          toast.error(res.error)
        } else {
          setBlog(res.blog ?? null)
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchBlog()
  }, [blogId])

  const handleFlag = async () => {
    if (!flagReason) {
      toast.error("Please select a reason for flagging this post.")
      return
    }

    setIsProcessing(true)

    try {
      const result = await flagBlogAction(blogId, flagReason, flagComment)
      
      if (result.success) {
        toast.success("Post flagged successfully")
        // Refresh the blog data
        const updatedBlog = await fetchBlogPostById(blogId)
        if (updatedBlog.blog) {
          setBlog(updatedBlog.blog)
        }
      } else {
        toast.error(result.error || "Failed to flag post")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUnflag = async () => {
    setIsProcessing(true)

    try {
      const result = await unflagBlogAction(blogId, unflagComment)
      
      if (result.success) {
        toast.success("Flag removed successfully")
        // Refresh the blog data
        const updatedBlog = await fetchBlogPostById(blogId)
        if (updatedBlog.blog) {
          setBlog(updatedBlog.blog)
        }
      } else {
        toast.error(result.error || "Failed to remove flag")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusBadge = (status: PostStatus) => {
    const statusConfig = {
      [PostStatus.PUBLISHED]: {
        label: "Published",
        variant: "default" as const,
        className: "bg-green-100 text-green-800 border-green-200",
      },
      [PostStatus.DRAFT]: { 
        label: "Draft", 
        variant: "secondary" as const, 
        className: "bg-gray-100 text-gray-800 border-gray-200" 
      },
      [PostStatus.SCHEDULED]: {
        label: "Scheduled",
        variant: "outline" as const,
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      [PostStatus.ARCHIVED]: {
        label: "Archived",
        variant: "outline" as const,
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
    }

    const config = statusConfig[status] || statusConfig[PostStatus.DRAFT]

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return <Loader/>
  }

  if (!blog) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold">Blog not found</h2>
        <p className="text-muted-foreground">The blog post with ID {blogId} could not be found.</p>
        <Link href="/xontrol/blog" className="mt-4">
          <Button variant="outline">← Back to Blog Management</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 mt-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Link href="/xontrol/blog">
              <Button variant="outline" size="sm">
                ← Back to Blog Management
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">{blog.title}</h1>
          <p className="text-muted-foreground">Blog ID: {blog.id}</p>
        </div>

        <div className="flex items-center space-x-2">
          {getStatusBadge(blog.status)}
          {blog.isFlagged && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <Flag className="w-3 h-3" />
              Flagged
            </Badge>
          )}
        </div>
      </div>

      {/* Post Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Post Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Performance</Label>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{blog.views.toLocaleString()} views</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ThumbsUp className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{blog.likes} likes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{blog.comments.length} comments</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Category & Tags</Label>
              <div className="space-y-2">
                <Badge variant="outline">{blog.category?.name || 'Uncategorized'}</Badge>
                <div className="flex flex-wrap gap-1">
                  {blog.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Published</Label>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">
                  {blog.publishedAt ? formatDate(blog.publishedAt) : "Not published"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
              <p className="font-medium">{formatDate(blog.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Author Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Author Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12">
                <Image
                  fill
                  unoptimized
                  src={blog.user?.imageUrl || '/2logo.jpg'}
                  alt={blog.user?.fullName || "author's image"}
                  className="rounded-full absolute object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{blog.user?.fullName || 'Unknown Author'}</p>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Mail className="w-3 h-3" />
                  <span>{blog.user?.email || 'No email'}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Organization</span>
                <span className="text-sm font-medium">{blog.user?.organization || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Website</span>
                <span className="text-sm font-medium">{blog.user?.website || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Role</span>
                <span className="text-sm font-medium">{blog.user?.role || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flag Management */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Content Moderation</span>
            </CardTitle>
            <CardDescription>Flag or unflag this post based on content policy violations.</CardDescription>
          </CardHeader>
          <CardContent>
            {blog.isFlagged ? (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Flag className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-red-800">This post is currently flagged</h3>
                      <p className="text-sm text-red-700 mt-1">
                        <strong>Reason:</strong> {blog.flagReason || 'No reason provided'}
                      </p>
                      <p className="text-xs text-red-600 mt-2">
                        {blog.flaggedPosts.length > 0
                          ? `Flagged on ${new Date(blog.flaggedPosts[0].createdAt).toLocaleString()} by ${blog.flaggedPosts[0].user?.fullName || blog.flaggedPosts[0].flaggedBy || 'TheNews Team'}`
                          : "Unknown date"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unflag-comment">Remove Flag (Optional Comment)</Label>
                  <Textarea
                    id="unflag-comment"
                    placeholder="Add a comment about why the flag is being removed..."
                    value={unflagComment}
                    onChange={(e) => setUnflagComment(e.target.value)}
                    rows={3}
                  />
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full bg-transparent">
                      <FlagOff className="w-4 h-4 mr-2" />
                      Remove Flag
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Remove Flag</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to remove the flag from this post? This will make it visible to all users
                        again.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline">Cancel</Button>
                      <Button onClick={handleUnflag} disabled={isProcessing}>
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Remove Flag"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">This post is not flagged</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="flag-reason">Flag Reason</Label>
                  <Select value={flagReason} onValueChange={setFlagReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reason for flagging" />
                    </SelectTrigger>
                    <SelectContent>
                      {flagReasons.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="flag-comment">Additional Comment</Label>
                  <Textarea
                    id="flag-comment"
                    placeholder="Provide additional details about the flag..."
                    value={flagComment}
                    onChange={(e) => setFlagComment(e.target.value)}
                    rows={3}
                  />
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Flag className="w-4 h-4 mr-2" />
                      Flag Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Flag Post</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to flag this post? This will hide it from public view and notify the
                        author.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline">Cancel</Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleFlag} 
                        disabled={isProcessing || !flagReason}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Flag Post"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Blog Content */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Content</CardTitle>
          <CardDescription>Full content of the blog post for review</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{
              __html: parseMarkdown(blog.content.substring(0, 1000) + "..."),
            }}
          />
          <Link href={`/blog/${blog.slug}`} target="_blank" className="mt-4 inline-block">
            <Button>
              Read Full Blog
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Flag History */}
      {blog.flaggedPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Flag History</CardTitle>
            <CardDescription>Complete history of flags and moderation actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {blog.flaggedPosts.map((entry, index) => (
                <div key={index} className="flex items-start space-x-3 pb-4 border-b last:border-b-0">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium capitalize text-red-800">{entry.status}</p>
                      <p className="text-sm text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">By: {entry.user?.fullName || entry.flaggedBy || 'Unknown'}</p>
                    <p className="text-sm mt-1 font-medium">{entry.reason}</p>
                    {entry.comment && (
                      <p className="text-sm mt-1 p-2 bg-red-50 rounded border border-red-200 capitalize">{entry.comment}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}