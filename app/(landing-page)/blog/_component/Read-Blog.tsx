




'use client'

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import Head from "next/head"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar,
  Clock,
  MessageSquare,
  Facebook,
  Twitter,
  Linkedin,
  ChevronLeft,
  ChevronRight,
  Send,
  Bookmark,
  BookmarkCheck,
  Eye,
  Heart,
  Copy,
  Check,
  Share2,
} from "lucide-react"


import { NewsletterSubscription } from "./BlogNewsletter-subscription"
import { MediaGallery } from "./MediaGallary"
import { addComment, deleteComment, editComment, likeComment, likePost, reportComment } from "@/actions/blog/blogActions"

import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { nestComments } from "@/actions/blog/nestComments"
import { CommentSection } from "./comment-section"
import Loader from "@/components/_component/Loader"
import { useAuthUser } from "@/lib/auth/getClientAuth"
import { generateBlogMetadata } from "@/lib/utils"
import { BlogPostReaderProps } from "@/type"
import { useShare } from "@/lib/hooks/use-Share"
import { toast } from "sonner"
import { parseMarkdown } from "@/lib/blog/markdown-parser"

export function BlogPostReader({ post, relatedPosts }: BlogPostReaderProps) {
  const [commentText, setCommentText] = useState("")
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const [copiedText, setCopiedText] = useState("")
  const [comments, setComments] = useState(post?.comments || [])
  const router = useRouter()
  
  const BlogPostReader = dynamic(
    () => import('@/app/(landing-page)/blog/_component/Read-Blog').then(mod => mod.BlogPostReader),
    { 
      ssr: false,
      loading: () => <Loader />
    }
  );

  const contentRef = useRef<HTMLDivElement>(null)
  const { user } = useAuthUser();

  // Generate metadata for the blog post
  const metadata = generateBlogMetadata({
    title: post?.title || "",
    description: post?.subtitle || "",
    url: typeof window !== 'undefined' ? window.location.href : "",
    imageUrl: post?.featuredImage || "",
    author: post?.author || "",
    publishedTime: post?.createdAt ? new Date(post.createdAt).toISOString() : "",
    tags: post?.tags?.map(tag => tag.name) || [],
  });

  // Share functionality
  const { links, open, webShare } = useShare({
    url: typeof window !== 'undefined' ? window.location.href : '',
    title: post?.title || '',
    description: post?.subtitle || '',
    hashtags: post?.tags?.map(tag => tag.name) || [],
    image: post?.featuredImage || '',
  });

  // Calculate reading progress
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100
        setReadingProgress(Math.min(progress, 100))
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const { scrollYProgress } = useScroll({
    target: contentRef,
    offset: ["start start", "end end"],
  })

  const headerY = useTransform(scrollYProgress, [0, 0.2], [0, -100])
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <p className="text-xl mb-6">The blog post you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    )
  }

  const {
    title,
    content,
    featuredImage,
    category,
    author,
    authorBio,
    authorTitle,
    createdAt,
    readTime,
    views,
    likes,
    tags,
    subtitle,
  } = post

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const handleLikePost = async () => {
    if (!post) return;
    
    try {
      const result = await likePost(post.id)
      if (result.success) {
        setIsLiked(true)
      }
    } catch (error) {
      console.error('Failed to like post:', error)
    }
  }

  const handleAddComment = async (content: string, parentId?: string) => {
    if (!post) return;
    if (!user) {
      toast.error("You must be logged in to comment")
      return
    }
  
    try {
      const result = await addComment(
        post.id,
        content,
        post.authorId,
        post.slug,
        parentId
      );

      if (result.success && result.comment) {
        const newComment = {
          id: result.comment.id,
          member: {
            userName: result.comment.member.userName,
            imageUrl: result.comment.member.imageUrl,
            id: result.comment.member.id,
            userId: result.comment.member.userId,
            createdAt: result.comment.member.createdAt,
            updatedAt: result.comment.member.updatedAt,
            fullName: result.comment.member.fullName,
            author: result.comment.member.userName,
            organization: result.comment.member.organization,
          },
          content: result.comment.content,
          createdAt: result.comment.createdAt,
          updatedAt: result.comment.updatedAt,
          status: result.comment.status,
          likes: 0,
          replies: [],
          parentId: result.comment.parentId || null,
        }

        setComments(prev => parentId
          ? prev.map(c => c.id === parentId
            ? { ...c, replies: [newComment, ...(c.replies || [])] }
            : c)
          : [newComment, ...prev]
        );
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };


   const handleLikeComment = async (commentId: string) => {
    try {
      const result = await likeComment(commentId)
      if (result.success) {
        setComments(
          comments.map(comment => 
            comment.id === commentId 
              ? { ...comment, likes: comment.likes + 1 } 
              : comment
          )
        )
      }
    } catch (error) {
      console.error("Failed to like comment:", error)
    }
  }

  // Edit Comment Handler
const handleEditComment = async (commentId: string, content: string) => {
  try {
    const result = await editComment(commentId, content);
    if (result.success) {
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, content } 
            : comment
        )
      );
      router.refresh();
    }
  } catch (error) {
    console.error("Failed to edit comment:", error);
  }
};

// Delete Comment Handler
const handleDeleteComment = async (commentId: string) => {
  try {
    const result = await deleteComment(commentId);
    if (result.success) {
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      router.refresh();
    }
  } catch (error) {
    console.error("Failed to delete comment:", error);
  }
};

// Report Comment Handler
const handleReportComment = async (commentId: string) => {
  try {
    const blogSlug = post?.slug ;
    const  blogOwner = post?.author ;
    const  parentCommentBy = comments.find(c => c.parentId === commentId)?.member.userName ; 
    if (!blogSlug || !blogOwner || !parentCommentBy) {
      console.error("Missing required data for reporting comment");
      return;
    } 
    const result = await reportComment(commentId, blogSlug, blogOwner, parentCommentBy);
    if (result.success) {
      // You might want to show a toast notification here
      alert("Comment reported successfully. Our team will review it.");
    }
  } catch (error) {
    console.error("Failed to report comment:", error);
  }
};

  const nestedComments = nestComments(comments, post?.authorId);

  const handleCopyText = async (text: string) => {
    try {
      if (typeof window === 'undefined') return;
      
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      
      setCopiedText(text);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopiedText(""), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <>
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={metadata.url} />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content={metadata.imageUrl} />
        <meta property="og:site_name" content="Your Blog Name" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content={metadata.imageUrl} />
        
        {/* Article specific */}
        <meta property="article:published_time" content={metadata.publishedTime} />
        <meta property="article:author" content={metadata.author} />
        {metadata.tags.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
        {/* Reading Progress Bar */}
        <div className="fixed top-0 left-0 w-full h-4 bg-neutral-200 z-50">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
            style={{ width: `${readingProgress}%` }}
          />
        </div>

        <div
          style={{ opacity: 2 }}
          className="relative bg-gradient-to-r from-black via-black to-gold-700 text-white overflow-hidden"
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          <div className="relative w-full px-4 py-10">
            <div className="w-full text-center">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30 capitalize">{category?.name}</Badge>
                <h1 className="text-2xl lg:text-4xl font-bold mb-4 leading-tight capitalize">{title}</h1>
                <p className="text-xl md:text-2xl text-blue-100 mb-2 md:mb-4 leading-relaxed capitalize">{subtitle}</p>
                <div className="flex flex-wrap items-center justify-center gap-6 text-blue-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>{readTime} min read</span>
                  </div>
                  {/* <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    <span>{views} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    <span>{likes} likes</span>
                  </div> */}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Author Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-4 md:p-8 mb-8 border border-neutral-200"
            >
              <div className="flex items-center gap-6">
                <Avatar className="h-10 w-10 ring-4 ring-gold-100">
                  <AvatarImage src={post.member?.imageUrl || '/2logo.jpeg'} alt={author} />
                  <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {post.member?.userName 
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-neutral-900 mb-1 capitalize">{author}</h3>
                  <p className="text-gold-700 font-medium mb-3 capitalize">{authorTitle}</p>
                </div>
              </div>
              <p className="text-neutral-600 leading-relaxed capitalize">{authorBio}</p>
            </motion.div>

            {/* Featured Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-12"
            >
              {featuredImage && (
                <div className="relative rounded-2xl overflow-hidden shadow-2xl w-full h-[500px] md:max-h-[500px]">
                  <Image
                    src={featuredImage}
                    alt={title}
                    fill
                    className="object-fill transition-transform duration-300 hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              )}
            </motion.div>

            {/* Article Content */}
            <motion.article
              ref={contentRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12 border border-neutral-200"
            >
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{
                  __html: parseMarkdown(content),
                }}
              />

              {/* Article Actions */}
              <div className="mt-12 pt-8 border-t border-neutral-200">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant={isLiked ? "default" : "outline"}
                      size="sm"
                      onClick={handleLikePost}
                      className={isLiked ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                      {isLiked ? likes + 1 : likes}
                    </Button>

                    <Button
                      variant={isBookmarked ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsBookmarked(!isBookmarked)}
                      className={isBookmarked ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}
                    >
                      {isBookmarked ? <BookmarkCheck className="h-4 w-4 mr-2" /> : <Bookmark className="h-4 w-4 mr-2" />}
                      {isBookmarked ? "Saved" : "Save"}
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        handleCopyText(window.location.href);
                        open('copy');
                      }}
                    >
                      {copiedText === window.location.href ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      {copiedText === window.location.href ? "Copied!" : "Copy Link"}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-500 mr-2">Share:</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => open('facebook')} 
                      className="text-blue-600 hover:bg-blue-50"
                      aria-label="Share on Facebook"
                    >
                      <Facebook className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => open('twitter')} 
                      className="text-blue-400 hover:bg-blue-50"
                      aria-label="Share on Twitter"
                    >
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => open('linkedin')} 
                      className="text-blue-700 hover:bg-blue-50"
                      aria-label="Share on LinkedIn"
                    >
                      <Linkedin className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => open('whatsapp')} 
                     className="text-blue-400 hover:bg-blue-50"
                      aria-label="Share on WhatsApp"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    
                  </div>
                </div>
              </div>
            </motion.article>

            {/* Newsletter Subscription */}
            <NewsletterSubscription 
              blogAuthor={ author || post.member?.userName || "Author Name"}
              blogTitle={title}
              ownerID={post.authorId}
              variant='inline'
              className="mb-12"
            />

            {/* video & Image Gallery */}
            {(post.galleryImages?.length > 0 || !!post.featuredVideo) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-12"
              >
                <MediaGallery 
                  images={post.galleryImages || []} 
                  video={post.featuredVideo || null}
                />
              </motion.div>
            )}

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mb-12"
            >
              <CommentSection
                comments={nestedComments}
                onAddComment={handleAddComment}
                onLikeComment={handleLikeComment}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
                onReportComment={handleReportComment}
              />
            </motion.div>

            {/* Tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-2xl p-8 mb-12 mt-12 border-none shadow-none"
            >
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <Badge 
                    key={tag.name} 
                    variant="secondary" 
                    className="px-4 py-2 text-sm hover:bg-blue-100 cursor-pointer capitalize"
                  >
                    #{tag.name}
                  </Badge>
                ))}
              </div>
            </motion.div>

            {/* Related Posts */}
            {relatedPosts && relatedPosts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="bg-white rounded-2xl shadow-lg p-8 border border-neutral-200"
              >
                <h3 className="text-2xl font-bold text-neutral-900 mb-8">Related Articles</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost, index) => (
                    <motion.div
                      key={relatedPost.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                    >
                      <Link href={`/blog/${relatedPost.slug}`}>
                        <div className="group cursor-pointer">
                          <div className="relative rounded-xl overflow-hidden mb-4 w-full  h-[200px] md:h-[300px]">
                            <Image
                              src={relatedPost.featuredImage || ""}
                              alt={relatedPost.title}
                              fill
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <h4 className="font-bold text-neutral-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {relatedPost.title}
                          </h4>
                          <p className="text-neutral-600 text-sm mb-3 line-clamp-3">{relatedPost.excerpt}</p>
                          <div className="flex items-center gap-4 text-xs text-neutral-500">
                            <span>{new Date(relatedPost.createdAt).toLocaleDateString()}</span>
                            <span>{relatedPost.readTime} min read</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex justify-between items-center mt-12"
            >
              <Link href="/blog">
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <ChevronLeft className="h-4 w-4" />
                  Back to Blog
                </Button>
              </Link>
              {relatedPosts && relatedPosts.length > 0 && (
                <Link href={`/blog/${relatedPosts[0].slug}`}>
                  <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                    Next Article
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}