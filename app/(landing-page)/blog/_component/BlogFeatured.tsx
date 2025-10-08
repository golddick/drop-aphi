"use client"

import { motion, useInView , Variants} from "framer-motion"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getFeaturedPosts } from "@/actions/blog/get.blog"

interface FeaturedPost {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  featuredImage: string
  publishedAt: Date
  readTime?: number | null
  category?: { name: string } | null
}

export function BlogFeatured() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [posts, setPosts] = useState<FeaturedPost[]>([])

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await getFeaturedPosts(4)
      if (res.success && res.data) {
        // Map the response data to match FeaturedPost interface
        const mappedPosts = res.data.map(post => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          featuredImage: post.featuredImage,
          publishedAt: post.publishedAt,
          readTime: post.readTime,
          category: post.category ? { name: post.category.name } : null
        }))
        setPosts(mappedPosts)
      }
    }
    fetchPosts()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants:Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 10 },
    },
  }

  if (!posts.length) return null

  const [first, ...rest] = posts

  return (
    <section className="py-12 bg-white relative">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold font-heading">
              Featured Articles
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* First Featured Post (big card) */}
            <motion.div variants={itemVariants} className="relative">
              <div className="relative overflow-hidden rounded-xl mb-4 aspect-[16/9]">
                <Image
                  src={first.featuredImage || "/placeholder.svg"}
                  alt={first.title}
                  width={600}
                  height={400}
                  className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-gold-500 text-dark-900 text-xs font-bold px-3 py-1 rounded-full">
                  Featured
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-neutral-500 mb-2">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(first.publishedAt).toDateString()}</span>
                </div>
                {first.readTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{first.readTime}</span>
                  </div>
                )}
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2 hover:text-gold-600 transition-colors">
                <Link href={`/blog/${first.slug}`}>{first.title}</Link>
              </h3>
              {first.excerpt && (
                <p className="text-neutral-600 mb-4">{first.excerpt}</p>
              )}
              <Button
                variant="link"
                className="text-gold-600 hover:text-gold-700 p-0 h-auto font-medium"
                asChild
              >
                <Link href={`/blog/${first.slug}`}>
                  Read Article <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </motion.div>

            {/* Other Featured Posts (small list) */}
            <div className="space-y-6">
              {rest.map((post) => (
                <motion.div
                  key={post.id}
                  variants={itemVariants}
                  className="flex gap-4 items-start border-b border-neutral-100 pb-6 last:border-0"
                >
                  <div className="hidden sm:block shrink-0">
                    <div className="relative overflow-hidden rounded-lg w-24 h-24">
                      <Image
                        src={post.featuredImage || "/placeholder.svg"}
                        alt={post.title}
                        width={100}
                        height={100}
                        className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                      {post.category?.name && (
                        <span className="bg-neutral-100 px-2 py-0.5 rounded-full">
                          {post.category.name}
                        </span>
                      )}
                      <span>{new Date(post.publishedAt).toDateString()}</span>
                    </div>
                    <h3 className="text-base font-bold mb-1 hover:text-gold-600 transition-colors">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-neutral-600 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}