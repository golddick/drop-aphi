// "use client"

// import { motion, useInView , Variants} from "framer-motion"
// import { useEffect, useRef, useState } from "react"
// import Image from "next/image"
// import Link from "next/link"
// import { Calendar, Clock, ChevronRight } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { getFeaturedPosts } from "@/actions/blog/get.blog"

// interface FeaturedPost {
//   id: string
//   title: string
//   slug: string
//   excerpt?: string | null
//   featuredImage: string
//   publishedAt: Date
//   readTime?: number | null
//   category?: { name: string } | null
// }

// export function BlogFeatured() {
//   const ref = useRef(null)
//   const isInView = useInView(ref, { once: true, amount: 0.2 })
//   const [posts, setPosts] = useState<FeaturedPost[]>([])

//   useEffect(() => {
//     const fetchPosts = async () => {
//       const res = await getFeaturedPosts(4)
//       if (res.success && res.data) {
//         // Map the response data to match FeaturedPost interface
//         const mappedPosts = res.data.map(post => ({
//           id: post.id,
//           title: post.title,
//           slug: post.slug,
//           excerpt: post.excerpt,
//           featuredImage: post.featuredImage,
//           publishedAt: post.publishedAt,
//           readTime: post.readTime,
//           category: post.category ? { name: post.category.name } : null
//         }))
//         setPosts(mappedPosts)
//       }
//     }
//     fetchPosts()
//   }, [])

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: { staggerChildren: 0.1 },
//     },
//   }

//   const itemVariants:Variants = {
//     hidden: { y: 20, opacity: 0 },
//     visible: {
//       y: 0,
//       opacity: 1,
//       transition: { type: "spring", stiffness: 100, damping: 10 },
//     },
//   }

//   if (!posts.length) return null

//   const [first, ...rest] = posts

//   return (
//     <section className="py-12 bg-white relative">
//       <div className="container mx-auto px-4">
//         <motion.div
//           ref={ref}
//           variants={containerVariants}
//           initial="hidden"
//           animate={isInView ? "visible" : "hidden"}
//           className="max-w-6xl mx-auto"
//         >
//           <motion.div variants={itemVariants} className="mb-8">
//             <h2 className="text-2xl md:text-3xl font-bold font-heading">
//               Featured Articles
//             </h2>
//           </motion.div>

//           <div className="grid md:grid-cols-2 gap-8">
//             {/* First Featured Post (big card) */}
//             <motion.div variants={itemVariants} className="relative">
//               <div className="relative overflow-hidden rounded-xl mb-4 aspect-[16/9]">
//                 <Image
//                   src={first.featuredImage || "/placeholder.svg"}
//                   alt={first.title}
//                   width={600}
//                   height={400}
//                   className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
//                 />
//                 <div className="absolute top-4 left-4 bg-gold-500 text-dark-900 text-xs font-bold px-3 py-1 rounded-full">
//                   Featured
//                 </div>
//               </div>
//               <div className="flex items-center gap-4 text-sm text-neutral-500 mb-2">
//                 <div className="flex items-center gap-1">
//                   <Calendar className="h-4 w-4" />
//                   <span>{new Date(first.publishedAt).toDateString()}</span>
//                 </div>
//                 {first.readTime && (
//                   <div className="flex items-center gap-1">
//                     <Clock className="h-4 w-4" />
//                     <span>{first.readTime}</span>
//                   </div>
//                 )}
//               </div>
//               <h3 className="text-xl md:text-2xl font-bold mb-2 hover:text-gold-600 transition-colors">
//                 <Link href={`/blog/${first.slug}`}>{first.title}</Link>
//               </h3>
//               {first.excerpt && (
//                 <p className="text-neutral-600 mb-4">{first.excerpt}</p>
//               )}
//               <Button
//                 variant="link"
//                 className="text-gold-600 hover:text-gold-700 p-0 h-auto font-medium"
//                 asChild
//               >
//                 <Link href={`/blog/${first.slug}`}>
//                   Read Article <ChevronRight className="h-4 w-4 ml-1" />
//                 </Link>
//               </Button>
//             </motion.div>

//             {/* Other Featured Posts (small list) */}
//             <div className="space-y-6">
//               {rest.map((post) => (
//                 <motion.div
//                   key={post.id}
//                   variants={itemVariants}
//                   className="flex gap-4 items-start border-b border-neutral-100 pb-6 last:border-0"
//                 >
//                   <div className="hidden sm:block shrink-0">
//                     <div className="relative overflow-hidden rounded-lg w-24 h-24">
//                       <Image
//                         src={post.featuredImage || "/placeholder.svg"}
//                         alt={post.title}
//                         width={100}
//                         height={100}
//                         className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
//                       />
//                     </div>
//                   </div>
//                   <div>
//                     <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
//                       {post.category?.name && (
//                         <span className="bg-neutral-100 px-2 py-0.5 rounded-full">
//                           {post.category.name}
//                         </span>
//                       )}
//                       <span>{new Date(post.publishedAt).toDateString()}</span>
//                     </div>
//                     <h3 className="text-base font-bold mb-1 hover:text-gold-600 transition-colors">
//                       <Link href={`/blog/${post.slug}`}>{post.title}</Link>
//                     </h3>
//                     {post.excerpt && (
//                       <p className="text-sm text-neutral-600 line-clamp-2">
//                         {post.excerpt}
//                       </p>
//                     )}
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </section>
//   )
// }







"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, Heart, MessageCircle, ArrowRight } from "lucide-react"
import { getFeaturedPosts } from "@/actions/blog/get.blog"
import { FeaturedPost } from "@/type"


// Extended type for the component with engagement metrics
type FeaturedPostWithEngagement = FeaturedPost & {
  comments?: Array<any>
  likes?: number
}

function BlogCard({ post, delay, featured = false }: { post: FeaturedPost; delay: number; featured?: boolean }) {
  const [isLiked, setIsLiked] = useState(false)
  
  // Type assertion to include engagement properties
  const postWithEngagement = post as FeaturedPostWithEngagement
  
  // Calculate total comments and likes from the post data
  const totalComments = postWithEngagement.comments?.length || 0
  const totalLikes = postWithEngagement.likes || 0
  const currentLikes = isLiked ? totalLikes + 1 : totalLikes

  return (
    <Link href={`/blog/${post.slug}`}>
      <div
        className={`border-2 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group ${
          featured
            ? "border-yellow-600 bg-gradient-to-br from-yellow-50 to-red-50 lg:col-span-2"
            : "border-gray-200 hover:border-yellow-600"
        } animate-slide-in-up`}
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className={`overflow-hidden ${featured ? "h-64" : "h-48"} relative`}>
          {post.featuredImage ? (
            <Image 
              src={post.featuredImage} 
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes={featured ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 100vw, 33vw"}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center bg-gray-100 ${featured ? "text-8xl" : "text-6xl"}`}>
              📝
            </div>
          )}
        </div>
        <div className={`p-6 ${featured ? "lg:p-8" : ""}`}>
          <div className="flex items-center gap-2 mb-3">
            {featured && (
              <div className="flex items-center gap-1 bg-yellow-600 text-white px-3 py-1 rounded-full">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-xs font-semibold">Featured</span>
              </div>
            )}
            {post.category?.name && (
              <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                {post.category.name}
              </span>
            )}
            {post.readTime && (
              <span className="text-xs text-gray-500">{post.readTime} min read</span>
            )}
          </div>
          <h3
            className={`font-bold text-black mb-2 group-hover:text-yellow-600 transition-colors line-clamp-2 ${
              featured ? "text-2xl" : "text-lg"
            }`}
          >
            {post.title}
          </h3>
          <p className={`text-gray-600 mb-4 line-clamp-2 ${featured ? "text-base" : "text-sm"}`}>
            {post.excerpt || "Read more about this featured article..."}
          </p>
          <div
            className={`flex items-center justify-between mb-4 pb-4 border-b border-gray-200 ${
              featured ? "flex-col sm:flex-row gap-4" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`${
                  featured ? "w-10 h-10" : "w-8 h-8"
                } bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold`}
              >
                {post.author?.charAt(0)?.toUpperCase() || "D"}
              </div>
              <div>
                <p className={`font-semibold text-black ${featured ? "text-base" : "text-sm"}`}>
                  {post.author || "DropAphi Team"}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(post.publishedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => {
                e.preventDefault()
                setIsLiked(!isLiked)
              }}
              className={`flex items-center gap-1 transition-all ${
                isLiked ? "text-red-600" : "text-gray-400 hover:text-red-600"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-xs">{currentLikes}</span>
            </button>
            <div className="flex items-center gap-1 text-gray-400">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">{totalComments}</span>
            </div>
            <div className="ml-auto">
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-yellow-600 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function NoFeaturedPostsBanner() {
  return (
    <div className="bg-gradient-to-r from-yellow-50 to-red-50 border-2 border-yellow-200 rounded-lg p-8 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-yellow-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Featured Posts Yet</h3>
        <p className="text-gray-600 mb-4">
          Check back soon for featured articles, or browse all posts to discover great content.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link 
            href="/blog" 
            className="bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
          >
            Browse All Posts
          </Link>
          <Link 
            href="/dashboard/blog/write" 
            className="border-2 border-yellow-600 text-yellow-600 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-50 transition-colors"
          >
            Write Your First Post
          </Link>
        </div>
      </div>
    </div>
  )
}

export function BlogFeatured() {
  const [featuredPosts, setFeaturedPosts] = useState<FeaturedPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        console.log('🔄 Starting to fetch featured posts...')
        
        const res = await getFeaturedPosts(6)

        console.log('📨 Response from server:', {
          success: res.success,
          dataLength: res.data?.length,
          error: res.error
        })
        
        if (res.success && res.data && res.data.length > 0) {
          console.log('🎉 Success! Setting featured posts:', res.data.length)
          setFeaturedPosts(res.data)
        } else {
          console.log('😞 No featured posts found') 
          setFeaturedPosts([])
        }
      } catch (error) {
        console.error('💥 Error in component:', error)
        setFeaturedPosts([])
      } finally {
        setLoading(false)
        console.log('🏁 Finished loading, loading state:', false)
      }
    }
    
    fetchPosts()
  }, [])

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-600 fill-current" />
              Featured Posts
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="text-center py-12">
                <p className="text-gray-500">Loading featured posts...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!featuredPosts.length) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-600 fill-current" />
              Featured Posts
            </h2>
            <NoFeaturedPostsBanner />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-600 fill-current" />
            Featured Posts
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredPosts.map((post, idx) => (
              <BlogCard 
                key={post.id} 
                post={post} 
                delay={idx * 100} 
                featured={true} 
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}