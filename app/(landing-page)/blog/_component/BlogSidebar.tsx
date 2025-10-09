"use client"

import { motion, useInView , Variants} from "framer-motion"
import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight } from "lucide-react"
import {  getCategories, getPopularPosts, getTags } from "@/actions/blog/get.blog"
import { formatDate } from "@/lib/utils"

interface Category {
  id: string
  name: string
  _count: {
    posts: number
  }
}

interface BlogPost {
  id: string
  title: string
  slug: string
  featuredImage: string
 publishedAt: Date | null
}

interface PopularPost extends BlogPost {
  performanceScore: number
  commentsCount: number
}


interface Tag {
  id: string
  name: string
}

export function BlogSidebar() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  const [categories, setCategories] = useState<Category[]>([])
  const [popularPosts, setPopularPosts] = useState<PopularPost[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState({
    categories: true,
    posts: true,
    tags: true
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesRes = await getCategories()
        setCategories(categoriesRes)
        setLoading(prev => ({ ...prev, categories: false }))

        // Fetch popular posts
        const postsRes = await getPopularPosts()
        setPopularPosts(postsRes)
        setLoading(prev => ({ ...prev, posts: false }))

        // Fetch tags
        const tagsRes = await getTags()
        setTags(tagsRes)
        setLoading(prev => ({ ...prev, tags: false }))
      } catch (error) {
        console.error("Failed to fetch data:", error)
        // Set loading states to false even if there's an error
        setLoading({
          categories: false,
          posts: false,
          tags: false
        })
      }
    }

    fetchData()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="space-y-8"
    >
      {/* Newsletter Subscription */}
      <motion.div variants={itemVariants} className="bg-neutral-50 rounded-xl p-6 border border-neutral-100">
        <h3 className="text-lg font-bold mb-4">Subscribe to Our Newsletter</h3>
        <p className="text-neutral-600 text-sm mb-4">
          Get the latest articles, tips, and insights delivered straight to your inbox.
        </p>
        <div className="space-y-3">
          <Input
            type="email"
            placeholder="Your email address"
            className="border-neutral-200 focus-visible:ring-gold-500"
          />
          <Button className="w-full bg-gold-500 hover:bg-gold-600">
            Subscribe <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div variants={itemVariants} className="bg-neutral-50 rounded-xl p-6 border border-neutral-100">
        <h3 className="text-lg font-bold mb-4">Categories</h3>
        {loading.categories ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between py-2">
                <div className="h-4 bg-neutral-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-neutral-200 rounded w-8 animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.id}    className="flex justify-between items-center py-2 text-neutral-700 hover:text-gold-600 transition-colors">
                  <span>{category.name}</span>
                  <span className="bg-neutral-200 text-neutral-700 text-xs px-2 py-0.5 rounded-full">
                    {category._count.posts}
                  </span>
              </li>
            ))}
          </ul>
        )}
      </motion.div>

      {/* Popular Posts */}
      <motion.div variants={itemVariants} className="bg-neutral-50 rounded-xl p-6 border border-neutral-100">
        <h3 className="text-lg font-bold mb-4">Popular Articles</h3>
        {loading.posts ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="shrink-0">
                  <div className="w-[60px] h-[60px] bg-neutral-200 rounded-md animate-pulse"></div>
                </div>
                <div className="flex-1">
                  <div className="h-4 bg-neutral-200 rounded w-full mb-2 animate-pulse"></div>
                  <div className="h-3 bg-neutral-200 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {popularPosts.map((post) => (
              <div key={post.id} className="flex gap-3">
                <div className="shrink-0">
                  <Image
                    src={post.featuredImage || "/2logo.jpg"}
                    alt={post.title}
                    width={60}
                    height={60}
                    className="rounded-md object-cover w-[60px] h-[60px]"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-sm line-clamp-2 hover:text-gold-600 transition-colors">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h4>
                  <p className="text-xs text-neutral-500 mt-1">
                    {formatDate(post.publishedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* CTA */}
      <motion.div variants={itemVariants} className="bg-dark-800 text-white rounded-xl p-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/20 rounded-full blur-xl -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <h3 className="text-lg font-bold mb-2">Need Help With Your Newsletter?</h3>
          <p className="text-neutral-300 text-sm mb-4">
            Our team of experts can help you create, optimize, and grow your newsletter.
          </p>
          <Button className="bg-gold-500 text-dark-900 hover:bg-gold-400">Book a Consultation</Button>
        </div>
      </motion.div>

      {/* Tags */}
      <motion.div variants={itemVariants} className="bg-neutral-50 rounded-xl p-6 border border-neutral-100">
        <h3 className="text-lg font-bold mb-4">Tags</h3>
        {loading.tags ? (
          <div className="flex flex-wrap gap-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-6 bg-neutral-200 rounded-full w-16 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="bg-neutral-200 hover:bg-gold-100 text-neutral-700 hover:text-gold-700 px-3 py-1 rounded-full text-xs transition-colors capitalize"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}