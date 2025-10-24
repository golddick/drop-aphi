




// 'use client'

// import type React from "react"
// import { useState, useRef, useEffect } from "react"
// import { motion,  } from "framer-motion"
// import Image from "next/image"
// import Link from "next/link"
// import Head from "next/head"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import {
//   Calendar,
//   Clock,
//   MessageSquare,
//   Facebook,
//   Twitter,
//   Linkedin,
//   ChevronLeft,
//   ChevronRight,
//   Bookmark,
//   BookmarkCheck,
//   Heart,
//   Copy,
//   Check,
// } from "lucide-react"


// import { NewsletterSubscription } from "./BlogNewsletter-subscription"
// import { MediaGallery } from "./MediaGallary"
// import { addComment, deleteComment, editComment, likeComment, likePost, reportComment } from "@/actions/blog/blogActions"

// import { useRouter } from "next/navigation"
// import dynamic from "next/dynamic"
// import { nestComments } from "@/actions/blog/nestComments"
// import { CommentSection } from "./comment-section"
// import Loader from "@/components/_component/Loader"
// import { useAuthUser } from "@/lib/auth/getClientAuth"
// import { generateBlogMetadata } from "@/lib/utils"
// import { BlogPostReaderProps } from "@/type"
// import { useShare } from "@/lib/hooks/use-Share"
// import { toast } from "sonner"
// import { parseMarkdown } from "@/lib/blog/markdown-parser"

// export function BlogPostReader({ post, relatedPosts }: BlogPostReaderProps) {
//   const [isBookmarked, setIsBookmarked] = useState(false)
//   const [isLiked, setIsLiked] = useState(false)
//   const [readingProgress, setReadingProgress] = useState(0)
//   const [copiedText, setCopiedText] = useState("")
//   const [comments, setComments] = useState(post?.comments || [])
//   const router = useRouter()
  
//   const BlogPostReader = dynamic(
//     () => import('@/app/(landing-page)/blog/_component/Read-Blog').then(mod => mod.BlogPostReader),
//     { 
//       ssr: false,
//       loading: () => <Loader />
//     }
//   ); 

//   const contentRef = useRef<HTMLDivElement>(null)
//   const { user } = useAuthUser();

//   // Generate metadata for the blog post
//   const metadata = generateBlogMetadata({
//     title: post?.title || "",
//     description: post?.subtitle || "",
//     url: typeof window !== 'undefined' ? window.location.href : "",
//     imageUrl: post?.featuredImage || "",
//     author: post?.author || "",
//     publishedTime: post?.createdAt ? new Date(post.createdAt).toISOString() : "",
//     tags: post?.tags?.map(tag => tag.name) || [],
//   });

//   // Share functionality
//   const {  open } = useShare({
//     url: typeof window !== 'undefined' ? window.location.href : '',
//     title: post?.title || '',
//     description: post?.subtitle || '',
//     hashtags: post?.tags?.map(tag => tag.name) || [],
//     image: post?.featuredImage || '',
//   });

//   // Calculate reading progress
//   useEffect(() => {
//     const handleScroll = () => {
//       if (contentRef.current) {
//         const { scrollTop, scrollHeight, clientHeight } = document.documentElement
//         const progress = (scrollTop / (scrollHeight - clientHeight)) * 100
//         setReadingProgress(Math.min(progress, 100))
//       }
//     }

//     window.addEventListener("scroll", handleScroll)
//     return () => window.removeEventListener("scroll", handleScroll)
//   }, [])



//   if (!post) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
//         <div className="text-center">
//           <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
//           <p className="text-xl mb-6">The blog post you&apos;re looking for doesn&apos;t exist.</p>
//           <Link href="/blog">
//             <Button>Back to Blog</Button>
//           </Link>
//         </div>
//       </div>
//     )
//   }

//   const {
//     title,
//     content,
//     featuredImage,
//     category,
//     author,
//     authorBio,
//     authorTitle,
//     createdAt,
//     readTime,
//     likes,
//     tags,
//     subtitle,
//   } = post

//   const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric'
//   })

//   const handleLikePost = async () => {
//     if (!post) return;
    
//     try {
//       const result = await likePost(post.id)
//       if (result.success) {
//         setIsLiked(true)
//       }
//     } catch (error) {
//       console.error('Failed to like post:', error)
//     }
//   }

//   const handleAddComment = async (content: string, parentId?: string) => {
//     if (!post) return;
//     if (!user) {
//       toast.error("You must be logged in to comment")
//       return
//     }
  
//     try {
//       const result = await addComment(
//         post.id,
//         content,
//         post.authorId,
//         post.slug,
//         parentId
//       );

//       if (result.success && result.comment) {
//         const newComment = {
//           id: result.comment.id,
//           member: {
//             userName: result.comment.member.userName,
//             imageUrl: result.comment.member.imageUrl,
//             id: result.comment.member.id,
//             userId: result.comment.member.userId,
//             createdAt: result.comment.member.createdAt,
//             updatedAt: result.comment.member.updatedAt,
//             fullName: result.comment.member.fullName,
//             author: result.comment.member.userName,
//             organization: result.comment.member.organization,
//           },
//           content: result.comment.content,
//           createdAt: result.comment.createdAt,
//           updatedAt: result.comment.updatedAt,
//           status: result.comment.status,
//           likes: 0,
//           replies: [],
//           parentId: result.comment.parentId || null,
//         }

//         setComments(prev => parentId
//           ? prev.map(c => c.id === parentId
//             ? { ...c, replies: [newComment, ...(c.replies || [])] }
//             : c)
//           : [newComment, ...prev]
//         );
//         router.refresh();
//       }
//     } catch (error) {
//       console.error("Failed to add comment:", error);
//     }
//   };


//    const handleLikeComment = async (commentId: string) => {
//     try {
//       const result = await likeComment(commentId)
//       if (result.success) {
//         setComments(
//           comments.map(comment => 
//             comment.id === commentId 
//               ? { ...comment, likes: comment.likes + 1 } 
//               : comment
//           )
//         )
//       }
//     } catch (error) {
//       console.error("Failed to like comment:", error)
//     }
//   }

//   // Edit Comment Handler
// const handleEditComment = async (commentId: string, content: string) => {
//   try {
//     const result = await editComment(commentId, content);
//     if (result.success) {
//       setComments(prev => 
//         prev.map(comment => 
//           comment.id === commentId 
//             ? { ...comment, content } 
//             : comment
//         )
//       );
//       router.refresh();
//     }
//   } catch (error) {
//     console.error("Failed to edit comment:", error);
//   }
// };

// // Delete Comment Handler
// const handleDeleteComment = async (commentId: string) => {
//   try {
//     const result = await deleteComment(commentId);
//     if (result.success) {
//       setComments(prev => prev.filter(comment => comment.id !== commentId));
//       router.refresh();
//     }
//   } catch (error) {
//     console.error("Failed to delete comment:", error);
//   }
// };

// // Report Comment Handler
// const handleReportComment = async (commentId: string) => {
//   try {
//     const blogSlug = post?.slug ;
//     const  blogOwner = post?.author ;
//     const  parentCommentBy = comments.find(c => c.parentId === commentId)?.member.userName ; 
//     if (!blogSlug || !blogOwner || !parentCommentBy) {
//       console.error("Missing required data for reporting comment");
//       return;
//     } 
//     const result = await reportComment(commentId, blogSlug, blogOwner, parentCommentBy);
//     if (result.success) {
//       // You might want to show a toast notification here
//       alert("Comment reported successfully. Our team will review it.");
//     }
//   } catch (error) {
//     console.error("Failed to report comment:", error);
//   }
// };

//   const nestedComments = nestComments(comments, post?.authorId);

//   const handleCopyText = async (text: string) => {
//     try {
//       if (typeof window === 'undefined') return;
      
//       if (navigator.clipboard) {
//         await navigator.clipboard.writeText(text);
//       } else {
//         const textarea = document.createElement('textarea');
//         textarea.value = text;
//         document.body.appendChild(textarea);
//         textarea.select();
//         document.execCommand('copy');
//         document.body.removeChild(textarea);
//       }
      
//       setCopiedText(text);
//       toast.success("Link copied to clipboard!");
//       setTimeout(() => setCopiedText(""), 2000);
//     } catch (err) {
//       toast.error("Failed to copy link");
//       console.error("Failed to copy text: ", err);
//     }
//   };

//   return (
//     <>
//       <Head>
//         <title>{metadata.title}</title>
//         <meta name="description" content={metadata.description} />
        
//         {/* Open Graph / Facebook */}
//         <meta property="og:type" content="article" />
//         <meta property="og:url" content={metadata.url} />
//         <meta property="og:title" content={metadata.title} />
//         <meta property="og:description" content={metadata.description} />
//         <meta property="og:image" content={metadata.imageUrl} />
//         <meta property="og:site_name" content="Your Blog Name" />
        
//         {/* Twitter */}
//         <meta name="twitter:card" content="summary_large_image" />
//         <meta name="twitter:title" content={metadata.title} />
//         <meta name="twitter:description" content={metadata.description} />
//         <meta name="twitter:image" content={metadata.imageUrl} />
        
//         {/* Article specific */}
//         <meta property="article:published_time" content={metadata.publishedTime} />
//         <meta property="article:author" content={metadata.author} />
//         {metadata.tags.map(tag => (
//           <meta key={tag} property="article:tag" content={tag} />
//         ))}
//       </Head>

//       <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
//         {/* Reading Progress Bar */}
//         <div className="fixed top-0 left-0 w-full h-4 bg-neutral-200 z-50">
//           <div
//             className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
//             style={{ width: `${readingProgress}%` }}
//           />
//         </div>

//         <div
//           style={{ opacity: 2 }}
//           className="relative bg-gradient-to-r from-black via-black to-gold-700 text-white overflow-hidden"
//         >
//           <div className="absolute inset-0 bg-black/20" />
//           <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

//           <div className="relative w-full px-4 py-10">
//             <div className="w-full text-center">
//               <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
//                 <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30 capitalize">{category?.name}</Badge>
//                 <h1 className="text-2xl lg:text-4xl font-bold mb-4 leading-tight capitalize">{title}</h1>
//                 <p className="text-xl md:text-2xl text-blue-100 mb-2 md:mb-4 leading-relaxed capitalize">{subtitle}</p>
//                 <div className="flex flex-wrap items-center justify-center gap-6 text-blue-100">
//                   <div className="flex items-center gap-2">
//                     <Calendar className="h-5 w-5" />
//                     <span>{formattedDate}</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <Clock className="h-5 w-5" />
//                     <span>{readTime} min read</span>
//                   </div>
//                   {/* <div className="flex items-center gap-2">
//                     <Eye className="h-5 w-5" />
//                     <span>{views} views</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <Heart className="h-5 w-5" />
//                     <span>{likes} likes</span>
//                   </div> */}
//                 </div>
//               </motion.div>
//             </div>
//           </div>
//         </div>

//         <div className="container mx-auto px-4 py-12">
//           <div className="max-w-4xl mx-auto">
//             {/* Author Info */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6, delay: 0.2 }}
//               className="bg-white rounded-2xl shadow-lg p-4 md:p-8 mb-8 border border-neutral-200"
//             >
//               <div className="flex items-center gap-6">
//                 <Avatar className="h-10 w-10 ring-4 ring-gold-100">
//                   <AvatarImage src={post.member?.imageUrl || '/2logo.jpeg'} alt={author} />
//                   <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
//                     {post.member?.userName 
//                       .split(" ")
//                       .map((n) => n[0])
//                       .join("")}
//                   </AvatarFallback>
//                 </Avatar>
//                 <div className="flex-1">
//                   <h3 className="text-2xl font-bold text-neutral-900 mb-1 capitalize">{author}</h3>
//                   <p className="text-gold-700 font-medium mb-3 capitalize">{authorTitle}</p>
//                 </div>
//               </div>
//               <p className="text-neutral-600 leading-relaxed capitalize">{authorBio}</p>
//             </motion.div>

//             {/* Featured Image */}
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.6, delay: 0.3 }}
//               className="mb-12"
//             >
//               {featuredImage && (
//                 <div className="relative rounded-2xl overflow-hidden shadow-2xl w-full h-[500px] md:max-h-[500px]">
//                   <Image
//                     src={featuredImage}
//                     alt={title}
//                     fill
//                     className="object-fill transition-transform duration-300 hover:scale-105"
//                     priority
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
//                 </div>
//               )}
//             </motion.div>

//             {/* Article Content */}
//             <motion.article
//               ref={contentRef}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6, delay: 0.4 }}
//               className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12 border border-neutral-200"
//             >
//               <div
//                 className="prose prose-lg max-w-none"
//                 dangerouslySetInnerHTML={{
//                   __html: parseMarkdown(content),
//                 }}
//               />

//               {/* Article Actions */}
//               <div className="mt-12 pt-8 border-t border-neutral-200">
//                 <div className="flex flex-wrap items-center justify-between gap-4">
//                   <div className="flex items-center gap-4">
//                     <Button
//                       variant={isLiked ? "default" : "outline"}
//                       size="sm"
//                       onClick={handleLikePost}
//                       className={isLiked ? "bg-red-500 hover:bg-red-600 text-white" : ""}
//                     >
//                       <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
//                       {isLiked ? likes + 1 : likes}
//                     </Button>

//                     <Button
//                       variant={isBookmarked ? "default" : "outline"}
//                       size="sm"
//                       onClick={() => setIsBookmarked(!isBookmarked)}
//                       className={isBookmarked ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}
//                     >
//                       {isBookmarked ? <BookmarkCheck className="h-4 w-4 mr-2" /> : <Bookmark className="h-4 w-4 mr-2" />}
//                       {isBookmarked ? "Saved" : "Save"}
//                     </Button>

//                     <Button 
//                       variant="outline" 
//                       size="sm" 
//                       onClick={() => {
//                         handleCopyText(window.location.href);
//                         open('copy');
//                       }}
//                     >
//                       {copiedText === window.location.href ? (
//                         <Check className="h-4 w-4 mr-2" />
//                       ) : (
//                         <Copy className="h-4 w-4 mr-2" />
//                       )}
//                       {copiedText === window.location.href ? "Copied!" : "Copy Link"}
//                     </Button>
//                   </div>

//                   <div className="flex items-center gap-2">
//                     <span className="text-sm text-neutral-500 mr-2">Share:</span>
//                     <Button 
//                       variant="ghost" 
//                       size="sm" 
//                       onClick={() => open('facebook')} 
//                       className="text-blue-600 hover:bg-blue-50"
//                       aria-label="Share on Facebook"
//                     >
//                       <Facebook className="h-4 w-4" />
//                     </Button>
//                     <Button 
//                       variant="ghost" 
//                       size="sm" 
//                       onClick={() => open('twitter')} 
//                       className="text-blue-400 hover:bg-blue-50"
//                       aria-label="Share on Twitter"
//                     >
//                       <Twitter className="h-4 w-4" />
//                     </Button>
//                     <Button 
//                       variant="ghost" 
//                       size="sm" 
//                       onClick={() => open('linkedin')} 
//                       className="text-blue-700 hover:bg-blue-50"
//                       aria-label="Share on LinkedIn"
//                     >
//                       <Linkedin className="h-4 w-4" />
//                     </Button>
//                     <Button 
//                       variant="ghost" 
//                       size="sm" 
//                       onClick={() => open('whatsapp')} 
//                      className="text-blue-400 hover:bg-blue-50"
//                       aria-label="Share on WhatsApp"
//                     >
//                       <MessageSquare className="h-4 w-4" />
//                     </Button>
                    
//                   </div>
//                 </div>
//               </div>
//             </motion.article>

//             {/* Newsletter Subscription */}
//             <NewsletterSubscription 
//               blogAuthor={ author || post.member?.userName || "Author Name"}
//               blogTitle={title}
//               ownerID={post.authorId}
//               variant='inline'
//               className="mb-12"
//             />

//             {/* video & Image Gallery */}
//             {(post.galleryImages?.length > 0 || !!post.featuredVideo) && (
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{ duration: 0.6, delay: 0.3 }}
//                 className="mb-12"
//               >
//                 <MediaGallery 
//                   images={post.galleryImages || []} 
//                   video={post.featuredVideo || null}
//                 />
//               </motion.div>
//             )}

//             {/* Comments Section */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6, delay: 0.6 }}
//               className="mb-12"
//             >
//               <CommentSection
//                 comments={nestedComments}
//                 onAddComment={handleAddComment}
//                 onLikeComment={handleLikeComment}
//                 onEditComment={handleEditComment}
//                 onDeleteComment={handleDeleteComment}
//                 onReportComment={handleReportComment}
//               />
//             </motion.div>

//             {/* Tags */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6, delay: 0.5 }}
//               className="bg-white rounded-2xl p-8 mb-12 mt-12 border-none shadow-none"
//             >
//               <h3 className="text-xl font-bold text-neutral-900 mb-4">Tags</h3>
//               <div className="flex flex-wrap gap-3">
//                 {tags.map((tag) => (
//                   <Badge 
//                     key={tag.name} 
//                     variant="secondary" 
//                     className="px-4 py-2 text-sm hover:bg-blue-100 cursor-pointer capitalize"
//                   >
//                     #{tag.name}
//                   </Badge>
//                 ))}
//               </div>
//             </motion.div>

//             {/* Related Posts */}
//             {relatedPosts && relatedPosts.length > 0 && (
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 0.7 }}
//                 className="bg-white rounded-2xl shadow-lg p-8 border border-neutral-200"
//               >
//                 <h3 className="text-2xl font-bold text-neutral-900 mb-8">Related Articles</h3>
//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
//                   {relatedPosts.map((relatedPost, index) => (
//                     <motion.div
//                       key={relatedPost.id}
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
//                     >
//                       <Link href={`/blog/${relatedPost.slug}`}>
//                         <div className="group cursor-pointer">
//                           <div className="relative rounded-xl overflow-hidden mb-4 w-full  h-[200px] md:h-[300px]">
//                             <Image
//                               src={relatedPost.featuredImage || ""}
//                               alt={relatedPost.title}
//                               fill
//                               className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
//                             />
//                             <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
//                           </div>
//                           <h4 className="font-bold text-neutral-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
//                             {relatedPost.title}
//                           </h4>
//                           <p className="text-neutral-600 text-sm mb-3 line-clamp-3">{relatedPost.excerpt}</p>
//                           <div className="flex items-center gap-4 text-xs text-neutral-500">
//                             <span>{new Date(relatedPost.createdAt).toLocaleDateString()}</span>
//                             <span>{relatedPost.readTime} min read</span>
//                           </div>
//                         </div>
//                       </Link>
//                     </motion.div>
//                   ))}
//                 </div>
//               </motion.div>
//             )}

//             {/* Navigation */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6, delay: 0.8 }}
//               className="flex justify-between items-center mt-12"
//             >
//               <Link href="/blog">
//                 <Button variant="outline" className="flex items-center gap-2 bg-transparent">
//                   <ChevronLeft className="h-4 w-4" />
//                   Back to Blog
//                 </Button>
//               </Link>
//               {relatedPosts && relatedPosts.length > 0 && (
//                 <Link href={`/blog/${relatedPosts[0].slug}`}>
//                   <Button variant="outline" className="flex items-center gap-2 bg-transparent">
//                     Next Article
//                     <ChevronRight className="h-4 w-4" />
//                   </Button>
//                 </Link>
//               )}
//             </motion.div>
//           </div>
//         </div>
//       </div>
//     </>
//   )
// }



// "use client"

// import { useState, useEffect } from "react"
// import Image from "next/image"
// import { Heart, Share2, ArrowLeft, ChevronLeft, ChevronRight, Play, X } from "lucide-react"
// import Link from "next/link"
// import { BlogPostReaderProps, BlogComment } from "@/type"
// import Header from "@/modules/landingPage/Home/component/header"
// import Footer from "@/lib/utils/widgets/footer/footer"
// import SubscribeWidget from "./BlogNewsletter-subscription"
// import CommentsSection from "./comment-section"
// import { formatDate } from "@/lib/utils"
// import { parseMarkdown } from "@/lib/blog/markdown-parser"
// import { useAuthUser } from "@/lib/auth/getClientAuth"
// import { toast } from "sonner"
// import {
//   addComment,
//   likeComment,
//   editComment,
//   deleteComment,
//   reportComment,
// } from "@/actions/blog/blogActions"

// // ------------------ IMAGE CAROUSEL ------------------
// function ImageCarousel({ images }: { images: string[] }) {
//   const [currentIndex, setCurrentIndex] = useState(0)
//   const [isFullscreen, setIsFullscreen] = useState(false)

//   if (!images || images.length === 0) return null

//   const goToPrevious = () => {
//     setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
//   }

//   const goToNext = () => {
//     setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
//   }

//   return (
//     <>
//       <div className="relative bg-black rounded-lg overflow-hidden mb-8 group">
//         <Image
//           src={images[currentIndex] || "/placeholder.svg"}
//           alt={`Gallery image ${currentIndex + 1}`}
//           width={1200}
//           height={600}
//           className="w-full h-96 object-cover cursor-pointer hover:opacity-90 transition-opacity"
//           onClick={() => setIsFullscreen(true)}
//         />

//         {images.length > 1 && (
//           <>
//             <button
//               onClick={goToPrevious}
//               className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
//               aria-label="Previous image"
//             >
//               <ChevronLeft className="w-6 h-6 text-black" />
//             </button>
//             <button
//               onClick={goToNext}
//               className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
//               aria-label="Next image"
//             >
//               <ChevronRight className="w-6 h-6 text-black" />
//             </button>

//             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
//               {images.map((_, idx) => (
//                 <button
//                   key={idx}
//                   onClick={() => setCurrentIndex(idx)}
//                   className={`w-2 h-2 rounded-full transition-all ${
//                     idx === currentIndex
//                       ? "bg-yellow-600 w-6"
//                       : "bg-white/50 hover:bg-white"
//                   }`}
//                   aria-label={`Go to image ${idx + 1}`}
//                 />
//               ))}
//             </div>
//           </>
//         )}
//       </div>

//       {isFullscreen && (
//         <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-fade-in">
//           <button
//             onClick={() => setIsFullscreen(false)}
//             className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full transition-all"
//             aria-label="Close fullscreen"
//           >
//             <X className="w-6 h-6 text-white" />
//           </button>

//           <div className="relative w-full max-w-4xl">
//             <Image
//               src={images[currentIndex] || "/placeholder.svg"}
//               alt={`Fullscreen image ${currentIndex + 1}`}
//               width={1600}
//               height={900}
//               className="w-full h-auto rounded-lg"
//             />
//             {images.length > 1 && (
//               <>
//                 <button
//                   onClick={goToPrevious}
//                   className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full transition-all"
//                   aria-label="Previous image"
//                 >
//                   <ChevronLeft className="w-8 h-8 text-white" />
//                 </button>
//                 <button
//                   onClick={goToNext}
//                   className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full transition-all"
//                   aria-label="Next image"
//                 >
//                   <ChevronRight className="w-8 h-8 text-white" />
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </>
//   )
// }

// // ------------------ VIDEO PLAYER ------------------
// function VideoPlayer({ videoUrl }: { videoUrl: string }) {
//   const [isPlaying, setIsPlaying] = useState(false)

//   const getEmbedUrl = (url: string) => {
//     if (url.includes("youtube.com/watch?v=")) {
//       const videoId = url.split("v=")[1]?.split("&")[0]
//       return `https://www.youtube.com/embed/${videoId}`
//     }
//     if (url.includes("youtu.be/")) {
//       const videoId = url.split("youtu.be/")[1]?.split("?")[0]
//       return `https://www.youtube.com/embed/${videoId}`
//     }
//     return url
//   }

//   return (
//     <div className="relative bg-black rounded-lg overflow-hidden mb-8 group">
//       {!isPlaying ? (
//         <div className="w-full h-96 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
//           <button
//             onClick={() => setIsPlaying(true)}
//             className="bg-yellow-600 hover:bg-yellow-700 p-4 rounded-full transition-all transform group-hover:scale-110"
//             aria-label="Play video"
//           >
//             <Play className="w-8 h-8 text-white fill-white" />
//           </button>
//         </div>
//       ) : (
//         <iframe
//           src={getEmbedUrl(videoUrl)}
//           title="Blog post video"
//           className="w-full h-96"
//           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//           allowFullScreen
//         />
//       )}
//     </div>
//   )
// }

// // ------------------ MAIN BLOG POST READER ------------------
// export function BlogPostReader({ post, relatedPosts }: BlogPostReaderProps) {
//   const [isLiked, setIsLiked] = useState(false)
//   const [readingProgress, setReadingProgress] = useState(0)
//   const [comments, setComments] = useState<BlogComment[]>(post?.comments || [])
//   const { user } = useAuthUser()

//   useEffect(() => {
//     const handleScroll = () => {
//       const scrollTop = window.scrollY
//       const docHeight =
//         document.documentElement.scrollHeight - window.innerHeight
//       const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
//       setReadingProgress(scrollPercent)
//     }

//     window.addEventListener("scroll", handleScroll)
//     return () => window.removeEventListener("scroll", handleScroll)
//   }, [])

//   // ---- Comment handlers ----
//   const handleAddComment = async (content: string, parentId?: string) => {
//     if (!post) return
//     if (!user) {
//       toast.error("You must be logged in to comment")
//       return
//     }

//     try {
//       const result = await addComment(
//         post.id,
//         content,
//         post.authorId,
//         post.slug,
//         parentId
//       )

//       if (result.success && result.comment) {
//         const newComment: BlogComment = {
//           id: result.comment.id,
//           user: {
//             userName: result.comment.member.userName,
//             imageUrl: result.comment.member.imageUrl,
//             id: result.comment.member.id,
//             userId: result.comment.member.userId,
//             createdAt: result.comment.member.createdAt,
//             updatedAt: result.comment.member.updatedAt,
//             fullName: result.comment.member.fullName,
//             organization: result.comment.member.organization,
//           },
//           content: result.comment.content,
//           createdAt: result.comment.createdAt,
//           updatedAt: result.comment.updatedAt,
//           status: result.comment.status,
//           likes: 0,
//           replies: [],
//           parentId: result.comment.parentId || null,
//         }

//         setComments((prev) =>
//           parentId
//             ? prev.map((c) =>
//                 c.id === parentId
//                   ? {
//                       ...c,
//                       replies: [newComment, ...(c.replies || [])],
//                     }
//                   : c
//               )
//             : [newComment, ...prev]
//         )
//         toast.success("Comment added successfully")
//       }
//     } catch (error) {
//       console.error("Failed to add comment:", error)
//       toast.error("Failed to add comment")
//     }
//   }

//   const handleLikeComment = async (commentId: string) => {
//     try {
//       const result = await likeComment(commentId)
//       if (result.success) {
//         setComments((prev) =>
//           prev.map((c) =>
//             c.id === commentId ? { ...c, likes: c.likes + 1 } : c
//           )
//         )
//       }
//     } catch (error) {
//       toast.error("Failed to like comment")
//     }
//   }

//   const handleEditComment = async (commentId: string, content: string) => {
//     try {
//       const result = await editComment(commentId, content)
//       if (result.success) {
//         setComments((prev) =>
//           prev.map((c) => (c.id === commentId ? { ...c, content } : c))
//         )
//         toast.success("Comment updated successfully")
//       }
//     } catch {
//       toast.error("Failed to edit comment")
//     }
//   }

//   const handleDeleteComment = async (commentId: string) => {
//     try {
//       const result = await deleteComment(commentId)
//       if (result.success) {
//         setComments((prev) => prev.filter((c) => c.id !== commentId))
//         toast.success("Comment deleted successfully")
//       }
//     } catch {
//       toast.error("Failed to delete comment")
//     }
//   }

//   const handleReportComment = async (commentId: string) => {
//     try {
//       const blogSlug = post?.slug
//       const blogOwner = post?.author
//       const parentCommentBy =
//         comments.find((c) => c.parentId === commentId)?.user.userName || ""

//       if (!blogSlug || !blogOwner) return

//       const result = await reportComment(commentId, blogSlug, blogOwner, parentCommentBy)
//       if (result.success) {
//         toast.success("Comment reported successfully. Our team will review it.")
//       }
//     } catch {
//       toast.error("Failed to report comment")
//     }
//   }

//   // ---- Early return AFTER all hooks ----
//   if (!post) {
//     return (
//       <main className="min-h-screen bg-white">
//         <Header mobileMenuOpen={false} setMobileMenuOpen={() => {}} />
//         <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
//           <div className="max-w-3xl mx-auto text-center">
//             <h1 className="text-4xl font-bold text-black mb-4">Post not found</h1>
//             <Link href="/blog" className="text-yellow-600 hover:text-yellow-700">
//               Back to blog
//             </Link>
//           </div>
//         </div>
//         <Footer />
//       </main>
//     )
//   }

//   // ---- Main Content ----
//   return (
//     <main className="min-h-screen bg-white">
//       <Header mobileMenuOpen={false} setMobileMenuOpen={() => {}} />

//       <div
//         className="fixed top-0 left-0 h-1 bg-yellow-600 z-40"
//         style={{ width: `${readingProgress}%` }}
//       ></div>

//       <article className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-3xl mx-auto">
//           <Link
//             href="/blog"
//             className="inline-flex items-center gap-2 text-yellow-600 hover:text-yellow-700 mb-8"
//           >
//             <ArrowLeft className="w-4 h-4" />
//             Back to blog
//           </Link>

//           <div className="mb-8 animate-fade-in">
//             <div className="flex items-center gap-2 mb-4">
//               <span className="text-sm font-semibold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
//                 {post.category?.name}
//               </span>
//               <span className="text-sm text-gray-500">{post.readTime} min read</span>
//             </div>
//             <h1 className="text-5xl font-bold text-black mb-4">{post.title}</h1>
//             <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>

//             <div className="flex items-center justify-between pb-6 border-b-2 border-gray-200">
//               <div className="flex items-center gap-4">
//                 <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold">
//                   {post.author?.charAt(0) || "A"}
//                 </div>
//                 <div>
//                   <p className="font-semibold text-black">{post.author}</p>
//                   <p className="text-sm text-gray-500">
//                     {formatDate(post.createdAt)}
//                   </p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-4">
//                 <button
//                   onClick={() => setIsLiked(!isLiked)}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
//                     isLiked
//                       ? "bg-red-100 text-red-600"
//                       : "bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600"
//                   }`}
//                 >
//                   <Heart
//                     className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`}
//                   />
//                   <span className="font-semibold">
//                     {post.likes + (isLiked ? 1 : 0)}
//                   </span>
//                 </button>
//                 <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all">
//                   <Share2 className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>
//           </div>

//           {post.featuredImage && (
//             <Image
//               src={post.featuredImage || "/placeholder.svg"}
//               alt={post.title}
//               width={1200}
//               height={600}
//               className="w-full rounded-lg mb-8 object-cover h-96"
//             />
//           )}

//           {post.featuredVideo && <VideoPlayer videoUrl={post.featuredVideo} />}

//           {post.galleryImages?.length > 0 && (
//             <ImageCarousel images={post.galleryImages} />
//           )}

//           <div
//             className="prose prose-lg max-w-none mb-12 text-gray-700"
//             dangerouslySetInnerHTML={{ __html: parseMarkdown(post.content) }}
//           />

      

//           <SubscribeWidget author={post.author || post.user?.fullName || ""} />

//           <CommentsSection
//             comments={comments}
//             onAddComment={handleAddComment}
//             onLikeComment={handleLikeComment}
//             onEditComment={handleEditComment}
//             onDeleteComment={handleDeleteComment}
//             onReportComment={handleReportComment}
//           />

//         </div>



//                  {relatedPosts && relatedPosts.length > 0 && (
//             <div className="mt-12 pt-8 border-t border-gray-200">
//               <h3 className="text-2xl font-bold text-black mb-6">
//                 Related Articles
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {relatedPosts.map((relatedPost) => (
//                   <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
//                     <div className="group cursor-pointer">
//                       <div className="relative rounded-lg overflow-hidden mb-4 w-full h-48">
//                         <Image
//                           src={relatedPost.featuredImage || "/placeholder.svg"}
//                           alt={relatedPost.title}
//                           width={600}
//                           height={400}
//                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                         />
//                         <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
//                       </div>
//                       <h4 className="font-bold text-black mb-2 group-hover:text-yellow-600 transition-colors line-clamp-2">
//                         {relatedPost.title}
//                       </h4>
//                       <p className="text-gray-600 text-sm mb-3 line-clamp-3">
//                         {relatedPost.excerpt}
//                       </p>
//                       <div className="flex items-center gap-4 text-xs text-gray-500">
//                         <span>{formatDate(relatedPost.createdAt)}</span>
//                         <span>{relatedPost.readTime} min read</span>
//                       </div>
//                     </div>
//                   </Link>
//                 ))}
//               </div>
//             </div>
//                 )}

//       </article>

//       <Footer />
//     </main>
//   )
// }
























// "use client"

// import { useState, useEffect } from "react"
// import { Heart, Share2, ArrowLeft, ChevronLeft, ChevronRight, Play, X } from "lucide-react"
// import Link from "next/link"
// import { BlogPostReaderProps, BlogComment } from "@/type"
// import Header from "@/modules/landingPage/Home/component/header"
// import Footer from "@/lib/utils/widgets/footer/footer"
// import SubscribeWidget from "./BlogNewsletter-subscription"
// import CommentsSection from "./comment-section"
// import { formatDate } from "@/lib/utils"
// import { parseMarkdown } from "@/lib/blog/markdown-parser"
// import { useAuthUser } from "@/lib/auth/getClientAuth"
// import { toast } from "sonner"
// import { addComment, likeComment, editComment, deleteComment, reportComment } from "@/actions/blog/blogActions"
// import { nestComments } from "@/actions/blog/nestComments"

// function ImageCarousel({ images }: { images: string[] }) {
//   const [currentIndex, setCurrentIndex] = useState(0)
//   const [isFullscreen, setIsFullscreen] = useState(false)

//   if (images.length === 0) return null

//   const goToPrevious = () => {
//     setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
//   }

//   const goToNext = () => {
//     setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
//   }

//   return (
//     <>
//       <div className="relative bg-black rounded-lg overflow-hidden mb-8 group">
//         <img
//           src={images[currentIndex] || "/placeholder.svg"}
//           alt={`Gallery image ${currentIndex + 1}`}
//           className="w-full h-96 object-cover cursor-pointer hover:opacity-90 transition-opacity"
//           onClick={() => setIsFullscreen(true)}
//         />

//         {images.length > 1 && (
//           <>
//             <button
//               onClick={goToPrevious}
//               className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
//               aria-label="Previous image"
//             >
//               <ChevronLeft className="w-6 h-6 text-black" />
//             </button>
//             <button
//               onClick={goToNext}
//               className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
//               aria-label="Next image"
//             >
//               <ChevronRight className="w-6 h-6 text-black" />
//             </button>

//             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
//               {images.map((_, idx) => (
//                 <button
//                   key={idx}
//                   onClick={() => setCurrentIndex(idx)}
//                   className={`w-2 h-2 rounded-full transition-all ${
//                     idx === currentIndex ? "bg-yellow-600 w-6" : "bg-white/50 hover:bg-white"
//                   }`}
//                   aria-label={`Go to image ${idx + 1}`}
//                 />
//               ))}
//             </div>
//           </>
//         )}
//       </div>

//       {/* Fullscreen Modal */}
//       {isFullscreen && (
//         <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-fade-in">
//           <button
//             onClick={() => setIsFullscreen(false)}
//             className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full transition-all"
//             aria-label="Close fullscreen"
//           >
//             <X className="w-6 h-6 text-white" />
//           </button>

//           <div className="relative w-full max-w-4xl">
//             <img
//               src={images[currentIndex] || "/placeholder.svg"}
//               alt={`Fullscreen image ${currentIndex + 1}`}
//               className="w-full h-auto rounded-lg"
//             />

//             {images.length > 1 && (
//               <>
//                 <button
//                   onClick={goToPrevious}
//                   className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full transition-all"
//                   aria-label="Previous image"
//                 >
//                   <ChevronLeft className="w-8 h-8 text-white" />
//                 </button>
//                 <button
//                   onClick={goToNext}
//                   className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full transition-all"
//                   aria-label="Next image"
//                 >
//                   <ChevronRight className="w-8 h-8 text-white" />
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </>
//   )
// }

// function VideoPlayer({ videoUrl }: { videoUrl: string }) {
//   const [isPlaying, setIsPlaying] = useState(false)

//   // Convert YouTube URL to embed URL
//   const getEmbedUrl = (url: string) => {
//     if (url.includes('youtube.com/watch?v=')) {
//       const videoId = url.split('v=')[1]?.split('&')[0]
//       return `https://www.youtube.com/embed/${videoId}`
//     }
//     if (url.includes('youtu.be/')) {
//       const videoId = url.split('youtu.be/')[1]?.split('?')[0]
//       return `https://www.youtube.com/embed/${videoId}`
//     }
//     return url
//   }

//   return (
//     <div className="relative bg-black rounded-lg overflow-hidden mb-8 group">
//       {!isPlaying ? (
//         <>
//           <div className="w-full h-96 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
//             <button
//               onClick={() => setIsPlaying(true)}
//               className="bg-yellow-600 hover:bg-yellow-700 p-4 rounded-full transition-all transform group-hover:scale-110"
//               aria-label="Play video"
//             >
//               <Play className="w-8 h-8 text-white fill-white" />
//             </button>
//           </div>
//         </>
//       ) : (
//         <iframe
//           src={getEmbedUrl(videoUrl)}
//           title="Blog post video"
//           className="w-full h-96"
//           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//           allowFullScreen
//         />
//       )}
//     </div>
//   )
// }

// export function BlogPostReader({ post, relatedPosts }: BlogPostReaderProps) {
//   const [isLiked, setIsLiked] = useState(false)
//   const [readingProgress, setReadingProgress] = useState(0)
//   const [comments, setComments] = useState<BlogComment[]>(post?.comments || [])
//   const { user } = useAuthUser()

//   useEffect(() => {
//     const handleScroll = () => {
//       const scrollTop = window.scrollY
//       const docHeight = document.documentElement.scrollHeight - window.innerHeight
//       const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
//       setReadingProgress(scrollPercent)
//     }

//     window.addEventListener("scroll", handleScroll)
//     return () => window.removeEventListener("scroll", handleScroll)
//   }, [])

//   // Comment handlers following the old template pattern
//   const handleAddComment = async (content: string, parentId?: string) => {
//     if (!post) return
//     if (!user) {
//       toast.error("You must be logged in to comment")
//       return
//     }

//     try {
//       const result = await addComment(
//         post.id,
//         content,
//         post.authorId,
//         post.slug,
//         parentId
//       )

//       if (result.success && result.comment) {
//         const newComment: BlogComment = {
//           id: result.comment.id,
//           user: {
//             userName: result.comment.member.userName,
//             imageUrl: result.comment.member.imageUrl,
//             id: result.comment.member.id,
//             userId: result.comment.member.userId,
//             createdAt: result.comment.member.createdAt,
//             updatedAt: result.comment.member.updatedAt,
//             fullName: result.comment.member.fullName,
//             // author: result.comment.member.userName,
//             organization: result.comment.member.organization,
//           },
//           content: result.comment.content,
//           createdAt: result.comment.createdAt,
//           updatedAt: result.comment.updatedAt,
//           status: result.comment.status,
//           likes: 0,
//           replies: [],
//           parentId: result.comment.parentId || null,
//         }

//         setComments(prev => {
//           if (parentId) {
//             return prev.map(c => 
//               c.id === parentId
//                 ? { 
//                     ...c, 
//                     replies: [newComment, ...(c.replies || [])] as BlogComment[] 
//                   }
//                 : c
//             )
//           } else {
//             return [newComment, ...prev]
//           }
//         })
//         toast.success("Comment added successfully")
//       }
//     } catch (error) {
//       console.error("Failed to add comment:", error)
//       toast.error("Failed to add comment")
//     }
//   }

//   const handleLikeComment = async (commentId: string) => {
//     try {
//       const result = await likeComment(commentId)
//       if (result.success) {
//         setComments(prev =>
//           prev.map(comment =>
//             comment.id === commentId
//               ? { ...comment, likes: comment.likes + 1 }
//               : comment
//           )
//         )
//       }
//     } catch (error) {
//       console.error("Failed to like comment:", error)
//       toast.error("Failed to like comment")
//     }
//   }

//   const handleEditComment = async (commentId: string, content: string) => {
//     try {
//       const result = await editComment(commentId, content)
//       if (result.success) {
//         setComments(prev =>
//           prev.map(comment =>
//             comment.id === commentId
//               ? { ...comment, content }
//               : comment
//           )
//         )
//         toast.success("Comment updated successfully")
//       }
//     } catch (error) {
//       console.error("Failed to edit comment:", error)
//       toast.error("Failed to edit comment")
//     }
//   }

//   const handleDeleteComment = async (commentId: string) => {
//     try {
//       const result = await deleteComment(commentId)
//       if (result.success) {
//         setComments(prev => prev.filter(comment => comment.id !== commentId))
//         toast.success("Comment deleted successfully")
//       }
//     } catch (error) {
//       console.error("Failed to delete comment:", error)
//       toast.error("Failed to delete comment")
//     }
//   }

//   const handleReportComment = async (commentId: string) => {
//     try {
//       const blogSlug = post?.slug
//       const blogOwner = post?.author
//       const parentCommentBy = comments.find(c => c.parentId === commentId)?.user.userName
      
//       if (!blogSlug || !blogOwner) {
//         console.error("Missing required data for reporting comment")
//         return
//       }
      
//       const result = await reportComment(commentId, blogSlug, blogOwner, parentCommentBy || '')
//       if (result.success) {
//         toast.success("Comment reported successfully. Our team will review it.")
//       }
//     } catch (error) {
//       console.error("Failed to report comment:", error)
//       toast.error("Failed to report comment")
//     }
//   }

//   const nestedComments = nestComments(comments, post?.authorId)

//   if (!post) {
//     return (
//       <main className="min-h-screen bg-white">
//         <Header mobileMenuOpen={false} setMobileMenuOpen={() => {}} />
//         <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
//           <div className="max-w-3xl mx-auto text-center">
//             <h1 className="text-4xl font-bold text-black mb-4">Post not found</h1>
//             <Link href="/blog" className="text-yellow-600 hover:text-yellow-700">
//               Back to blog
//             </Link>
//           </div>
//         </div>
//         <Footer />
//       </main>
//     )
//   }

//   return (
//     <main className="min-h-screen bg-white">
//       <Header mobileMenuOpen={false} setMobileMenuOpen={() => {}} />

//       {/* Reading Progress Bar */}
//       <div className="fixed top-0 left-0 h-1 bg-yellow-600 z-40" style={{ width: `${readingProgress}%` }}></div>

//       <article className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-3xl mx-auto">
//           {/* Back Button */}
//           <Link href="/blog" className="inline-flex items-center gap-2 text-yellow-600 hover:text-yellow-700 mb-8">
//             <ArrowLeft className="w-4 h-4" />
//             Back to blog
//           </Link>

//           {/* Header */}
//           <div className="mb-8 animate-fade-in">
//             <div className="flex items-center gap-2 mb-4">
//               <span className="text-sm font-semibold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
//                 {post.category?.name}
//               </span>
//               <span className="text-sm text-gray-500">{post.readTime} min read</span>
//             </div>
//             <h1 className="text-5xl font-bold text-black mb-4">{post.title}</h1>
//             <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>

//             {/* Author Info */}
//             <div className="flex items-center justify-between pb-6 border-b-2 border-gray-200">
//               <div className="flex items-center gap-4">
//                 <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold">
//                   {post.author?.charAt(0) || 'A'}
//                 </div>
//                 <div>
//                   <p className="font-semibold text-black">{post.author}</p>
//                   <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
//                 </div>
//               </div>

//               {/* Share Buttons */}
//               <div className="flex items-center gap-4">
//                 <button
//                   onClick={() => setIsLiked(!isLiked)}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
//                     isLiked
//                       ? "bg-red-100 text-red-600"
//                       : "bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600"
//                   }`}
//                 >
//                   <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
//                   <span className="font-semibold">{post.likes + (isLiked ? 1 : 0)}</span>
//                 </button>
//                 <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all">
//                   <Share2 className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>
//           </div>

//           {post.featuredImage && (
//             <img
//               src={post.featuredImage || "/placeholder.svg"}
//               alt={post.title}
//               className="w-full rounded-lg mb-8 object-cover h-96"
//             />
//           )}

//           {post.featuredVideo && <VideoPlayer videoUrl={post.featuredVideo} />}

//           {post.galleryImages.length > 0 && <ImageCarousel images={post.galleryImages} />}

//           {/* Content */}
//           <div
//             className="prose prose-lg max-w-none mb-12 text-gray-700"
//             dangerouslySetInnerHTML={{
//               __html: parseMarkdown(post.content),
//             }}
//           />

//           {/* Related Posts */}
//           {relatedPosts && relatedPosts.length > 0 && (
//             <div className="mt-12 pt-8 border-t border-gray-200">
//               <h3 className="text-2xl font-bold text-black mb-6">Related Articles</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {relatedPosts.map((relatedPost) => (
//                   <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
//                     <div className="group cursor-pointer">
//                       <div className="relative rounded-lg overflow-hidden mb-4 w-full h-48">
//                         <img
//                           src={relatedPost.featuredImage || "/placeholder.svg"}
//                           alt={relatedPost.title}
//                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                         />
//                         <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
//                       </div>
//                       <h4 className="font-bold text-black mb-2 group-hover:text-yellow-600 transition-colors line-clamp-2">
//                         {relatedPost.title}
//                       </h4>
//                       <p className="text-gray-600 text-sm mb-3 line-clamp-3">{relatedPost.excerpt}</p>
//                       <div className="flex items-center gap-4 text-xs text-gray-500">
//                         <span>{formatDate(relatedPost.createdAt)}</span>
//                         <span>{relatedPost.readTime} min read</span>
//                       </div>
//                     </div>
//                   </Link>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Subscribe Widget */}
//           <SubscribeWidget author={post.author || post.user?.fullName || ''} />

//           {/* Comments Section */}
//           <CommentsSection
//             comments={comments}
//             onAddComment={handleAddComment}
//             onLikeComment={handleLikeComment}
//             onEditComment={handleEditComment}
//             onDeleteComment={handleDeleteComment}
//             onReportComment={handleReportComment}
//           />
//         </div>
//       </article>

//       <Footer />
//     </main>
//   )
// }




























'use client'

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import Head from "next/head"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Calendar,
  Clock,
  MessageSquare,
  Facebook,
  Twitter,
  Linkedin,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  Heart,
  Copy,
  Check,
  Share2,
  ArrowLeft,
  Play,
  X,
} from "lucide-react"

import { MediaGallery } from "./MediaGallary"
import { addComment, deleteComment, editComment, likeComment, likePost, reportComment } from "@/actions/blog/blogActions"

import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { nestComments } from "@/actions/blog/nestComments"
import Loader from "@/components/_component/Loader"
import { useAuthUser } from "@/lib/auth/getClientAuth"
import { generateBlogMetadata } from "@/lib/utils"
import { BlogPostReaderProps, BlogComment } from "@/type"
import { useShare } from "@/lib/hooks/use-Share"
import { toast } from "sonner"
import { parseMarkdown } from "@/lib/blog/markdown-parser"
import Header from "@/modules/landingPage/Home/component/header"
import Footer from "@/lib/utils/widgets/footer/footer"
import CommentsSection from "./comment-section"
import SubscribeWidget from "./BlogNewsletter-subscription"

// ------------------ IMAGE CAROUSEL ------------------
function ImageCarousel({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (!images || images.length === 0) return null

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <>
      <div className="relative bg-black rounded-lg overflow-hidden mb-8 group">
        <Image
          src={images[currentIndex] || "/placeholder.svg"}
          alt={`Gallery image ${currentIndex + 1}`}
          width={1200}
          height={600}
          className="w-full h-96 object-cover cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setIsFullscreen(true)}
        />

        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6 text-black" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6 text-black" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? "bg-yellow-600 w-6"
                      : "bg-white/50 hover:bg-white"
                  }`}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-fade-in">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full transition-all"
            aria-label="Close fullscreen"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="relative w-full max-w-4xl">
            <Image
              src={images[currentIndex] || "/placeholder.svg"}
              alt={`Fullscreen image ${currentIndex + 1}`}
              width={1600}
              height={900}
              className="w-full h-auto rounded-lg"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full transition-all"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-8 h-8 text-white" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full transition-all"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-8 h-8 text-white" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// ------------------ VIDEO PLAYER ------------------



function VideoPlayer({ videoUrl }: { videoUrl: string }) {
  const [isPlaying, setIsPlaying] = useState(false)

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    return url
  }

  const getThumbnailUrl = (url: string) => {
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0]
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0]
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    }
    // Default placeholder thumbnail for non-YouTube videos
    return "/drop-logo.jpg"
  }

  const isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")

  return (
    <div className="relative bg-black rounded-lg overflow-hidden mb-8 group">
      {!isPlaying ? (
        <div className="relative w-full h-96 flex items-center justify-center">
          <img
            src={getThumbnailUrl(videoUrl)}
            alt="Video thumbnail"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
          <button
            onClick={() => setIsPlaying(true)}
            className="z-10 bg-yellow-600 hover:bg-yellow-700 p-4 rounded-full transition-all transform group-hover:scale-110"
            aria-label="Play video"
          >
            <Play className="w-8 h-8 text-white fill-white" />
          </button>
          {isYouTube && (
            <div className="absolute bottom-3 left-3 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
              YouTube
            </div>
          )}
        </div>
      ) : (
        <iframe
          src={getEmbedUrl(videoUrl)}
          title="Video player"
          className="w-full h-96"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  )
}




// function VideoPlayer({ videoUrl }: { videoUrl: string }) {
//   const [isPlaying, setIsPlaying] = useState(false)

//   const getEmbedUrl = (url: string) => {
//     if (url.includes("youtube.com/watch?v=")) {
//       const videoId = url.split("v=")[1]?.split("&")[0]
//       return `https://www.youtube.com/embed/${videoId}`
//     }
//     if (url.includes("youtu.be/")) {
//       const videoId = url.split("youtu.be/")[1]?.split("?")[0]
//       return `https://www.youtube.com/embed/${videoId}`
//     }
//     return url
//   }

//   return (
//     <div className="relative bg-black rounded-lg overflow-hidden mb-8 group">
//       {!isPlaying ? (
//         <div className="w-full h-96 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
//           <button
//             onClick={() => setIsPlaying(true)}
//             className="bg-yellow-600 hover:bg-yellow-700 p-4 rounded-full transition-all transform group-hover:scale-110"
//             aria-label="Play video"
//           >
//             <Play className="w-8 h-8 text-white fill-white" />
//           </button>
//         </div>
//       ) : (
//         <iframe
//           src={getEmbedUrl(videoUrl)}
//           title="Blog post video"
//           className="w-full h-96"
//           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//           allowFullScreen
//         />
//       )}
//     </div>
//   )
// }

// ------------------ MAIN BLOG POST READER ------------------
export function BlogPostReader({ post, relatedPosts }: BlogPostReaderProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const [copiedText, setCopiedText] = useState("")
  const [comments, setComments] = useState<BlogComment[]>(post?.comments || [])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  
  const contentRef = useRef<HTMLDivElement>(null)
  const { user } = useAuthUser()

  // Generate metadata for the blog post
  const metadata = generateBlogMetadata({
    title: post?.title || "",
    description: post?.subtitle || post?.excerpt || "",
    url: typeof window !== 'undefined' ? window.location.href : "",
    imageUrl: post?.featuredImage || "",
    author: post?.author || "",
    publishedTime: post?.createdAt ? new Date(post.createdAt).toISOString() : "",
    tags: post?.tags?.map(tag => tag.name) || [],
  })

  // Share functionality
  const { open } = useShare({
    url: typeof window !== 'undefined' ? window.location.href : '',
    title: post?.title || '',
    description: post?.subtitle || post?.excerpt || '',
    hashtags: post?.tags?.map(tag => tag.name) || [],
    image: post?.featuredImage || '',
  })

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

  // Comment handlers
  const handleAddComment = async (content: string, parentId?: string) => {
    if (!post) return
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
      )

      if (result.success && result.comment) {
        const newComment: BlogComment = {
          id: result.comment.id,
          user: {
            userName: result.comment.member.userName,
            imageUrl: result.comment.member.imageUrl,
            id: result.comment.member.id,
            userId: result.comment.member.userId,
            createdAt: result.comment.member.createdAt,
            updatedAt: result.comment.member.updatedAt,
            fullName: result.comment.member.fullName,
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
        )
        router.refresh()
        toast.success("Comment added successfully")
      }
    } catch (error) {
      console.error("Failed to add comment:", error)
      toast.error("Failed to add comment")
    }
  }

  const handleLikeComment = async (commentId: string) => {
    try {
      const result = await likeComment(commentId)
      if (result.success) {
        setComments(prev =>
          prev.map(comment =>
            comment.id === commentId
              ? { ...comment, likes: comment.likes + 1 }
              : comment
          )
        )
      }
    } catch (error) {
      console.error("Failed to like comment:", error)
      toast.error("Failed to like comment")
    }
  }

  const handleEditComment = async (commentId: string, content: string) => {
    try {
      const result = await editComment(commentId, content)
      if (result.success) {
        setComments(prev =>
          prev.map(comment =>
            comment.id === commentId
              ? { ...comment, content }
              : comment
          )
        )
        router.refresh()
        toast.success("Comment updated successfully")
      }
    } catch (error) {
      console.error("Failed to edit comment:", error)
      toast.error("Failed to edit comment")
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const result = await deleteComment(commentId)
      if (result.success) {
        setComments(prev => prev.filter(comment => comment.id !== commentId))
        router.refresh()
        toast.success("Comment deleted successfully")
      }
    } catch (error) {
      console.error("Failed to delete comment:", error)
      toast.error("Failed to delete comment")
    }
  }

  const handleReportComment = async (commentId: string) => {
    try {
      const blogSlug = post?.slug
      const blogOwner = post?.author
      const parentCommentBy = comments.find(c => c.parentId === commentId)?.user.userName

      if (!blogSlug || !blogOwner) {
        console.error("Missing required data for reporting comment")
        return
      }

      const result = await reportComment(commentId, blogSlug, blogOwner, parentCommentBy || '')
      if (result.success) {
        toast.success("Comment reported successfully. Our team will review it.")
      }
    } catch (error) {
      console.error("Failed to report comment:", error)
      toast.error("Failed to report comment")
    }
  }

  const handleLikePost = async () => {
    if (!post) return
    
    try {
      const result = await likePost(post.id)
      if (result.success) {
        setIsLiked(true)
        toast.success("Post liked!")
      }
    } catch (error) {
      console.error('Failed to like post:', error)
      toast.error("Failed to like post")
    }
  }

  const handleCopyText = async (text: string) => {
    try {
      if (typeof window === 'undefined') return
      
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = text
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      
      setCopiedText(text)
      toast.success("Link copied to clipboard!")
      setTimeout(() => setCopiedText(""), 2000)
    } catch (err) {
      toast.error("Failed to copy link")
      console.error("Failed to copy text: ", err)
    }
  }

  const nestedComments = nestComments(comments, post?.authorId)

  if (!post) {
    return (
      <main className="min-h-screen bg-white">
        <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-black mb-4">Post not found</h1>
            <Link href="/blog" className="text-yellow-600 hover:text-yellow-700">
              Back to blog
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

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

      <main className="min-h-screen bg-white">
        <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

        {/* Reading Progress Bar */}
        <div className="fixed top-0 left-0 w-full h-1 bg-yellow-600 z-40" style={{ width: `${readingProgress}%` }}></div>

        <article className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Back Button - New Style */}
            <Link href="/blog" className="inline-flex items-center gap-2 text-yellow-600 hover:text-yellow-700 mb-8">
              <ArrowLeft className="w-4 h-4" />
              Back to blog
            </Link>

            {/* Header - Combined Style */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-yellow-600 text-white border-yellow-600 hover:bg-yellow-700 capitalize">
                  {post.category?.name}
                </Badge>
                <span className="text-sm text-gray-500">{post.readTime} min read</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-black mb-4 leading-tight">
                {post.title}
              </h1>
              
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {post.subtitle || post.excerpt}
              </p>

              {/* Author Info - Combined Style */}
              <div className="flex items-center justify-between pb-6 border-b-2 border-gray-200">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 ring-2 ring-yellow-600">
                    <AvatarImage src={post.user?.imageUrl || '/no-img.jpg'} alt={post.author} />
                    <AvatarFallback className="text-lg font-bold bg-yellow-600 text-white">
                      {post.author?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-bold text-black mb-1 capitalize">{post.author}</h3>
                    <p className="text-sm text-gray-500">{formattedDate}</p>
                  </div>
                </div>

                {/* Action Buttons - Combined Style */}
                <div className="flex items-center gap-4">
                  <Button
                    variant={isLiked ? "default" : "outline"}
                    size="sm"
                    onClick={handleLikePost}
                    className={isLiked ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                    {isLiked ? post.likes + 1 : post.likes}
                  </Button>


                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      handleCopyText(window.location.href)
                      open('copy')
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
              </div>
            </motion.div>

            {/* Featured Image */}
            {post.featuredImage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-8"
              >
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  width={1200}
                  height={600}
                  className="w-full rounded-lg object-cover h-96"
                  priority
                />
              </motion.div>
            )}

            {/* Video Player */}
            {post.featuredVideo && <VideoPlayer videoUrl={post.featuredVideo} />}

            {/* Image Carousel */}
            {post.galleryImages && post.galleryImages.length > 0 && (
              <ImageCarousel images={post.galleryImages} />
            )}

            {/* Article Content */}
            <motion.article
              ref={contentRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl p-8 mb-12"
            >
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{
                  __html: parseMarkdown(post.content),
                }}
              />
            </motion.article>

            <div>
                <div className="flex items-center gap-4">
                  <Button
                    variant={isLiked ? "default" : "outline"}
                    size="sm"
                    onClick={handleLikePost}
                    className={isLiked ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                    {isLiked ? post.likes + 1 : post.likes}
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
                      handleCopyText(window.location.href)
                      open('copy')
                    }}
                  >
                    {copiedText === window.location.href ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    {copiedText === window.location.href ? "Copied!" : "Copy Link"}
                  </Button>

                  <div className="flex items-center gap-2">
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
                  </div>
                </div>
            </div>

            {/* Newsletter Subscription */}
        <SubscribeWidget
          blogAuthor={post.author || "Author Name"}
          blogTitle={post.title}
          ownerID={post.authorId}
          variant="inline"
          className="mb-12"
        />

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mb-12"
            >
              <CommentsSection
                comments={comments}
                onAddComment={handleAddComment}
                onLikeComment={handleLikeComment}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
                onReportComment={handleReportComment}
              />
            </motion.div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-white rounded-2xl p-8 mb-12"
              >
                <h3 className="text-xl font-bold text-black mb-4">Tags</h3>
                <div className="flex flex-wrap gap-3">
                  {post.tags.map((tag) => (
                    <Badge 
                      key={tag.name} 
                      variant="secondary" 
                      className="px-4 py-2 text-sm hover:bg-yellow-100 cursor-pointer capitalize"
                    >
                      #{tag.name}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Related Posts */}
            {relatedPosts && relatedPosts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="bg-white rounded-2xl p-8 mb-12"
              >
                <h3 className="text-2xl font-bold text-black mb-8">Related Articles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost, index) => (
                    <motion.div
                      key={relatedPost.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                    >
                      <Link href={`/blog/${relatedPost.slug}`}>
                        <div className="group cursor-pointer">
                          <div className="relative rounded-xl overflow-hidden mb-4 w-full h-48">
                            <Image
                              src={relatedPost.featuredImage || ""}
                              alt={relatedPost.title}
                              width={400}
                              height={300}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <h4 className="font-bold text-black mb-2 group-hover:text-yellow-600 transition-colors line-clamp-2">
                            {relatedPost.title}
                          </h4>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-3">{relatedPost.excerpt}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
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
                <Button variant="outline" className="flex items-center gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back to Blog
                </Button>
              </Link>
              {relatedPosts && relatedPosts.length > 0 && (
                <Link href={`/blog/${relatedPosts[0].slug}`}>
                  <Button variant="outline" className="flex items-center gap-2">
                    Next Article
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </motion.div>
          </div>
        </article>

        <Footer />
      </main>
    </>
  )
}