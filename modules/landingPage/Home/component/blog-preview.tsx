"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Heart, MessageCircle, ArrowRight } from "lucide-react"

interface BlogCardProps {
  id: number
  title: string
  excerpt: string
  author: string
  date: string
  likes: number
  comments: number
  delay: number
}

function BlogCard({ id, title, excerpt, author, date, likes, comments, delay }: BlogCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <Link href={`/blog/${id}`}>
      <div
        ref={ref}
        className={`border-2 border-gray-200 rounded-lg overflow-hidden hover:border-yellow-600 hover:shadow-lg transition-all duration-300 cursor-pointer group ${
          isVisible ? "animate-slide-in-up" : "opacity-0"
        }`}
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="h-48 bg-gradient-to-br from-yellow-100 to-red-100 overflow-hidden">
          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-300 group-hover:scale-105 transition-transform duration-300">
            📝
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-lg font-bold text-black mb-2 group-hover:text-yellow-600 transition-colors">{title}</h3>
          <p className="text-gray-600 mb-4 line-clamp-2">{excerpt}</p>
          <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
            <span>{author}</span>
            <span>{date}</span>
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
              <span className="text-xs">{likes + (isLiked ? 1 : 0)}</span>
            </button>
            <div className="flex items-center gap-1 text-gray-400">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">{comments}</span>
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

export default function BlogPreview() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-16">
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold text-black mb-4">Latest from Our Blog</h2>
            <p className="text-xl text-gray-600">Insights, tutorials, and updates from the DropAphi team</p>
          </div>
          <Link
            href="/blog"
            className="hidden sm:flex items-center gap-2 px-6 py-3 border-2 border-black text-black rounded-lg hover:bg-black hover:text-white transition-all"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <BlogCard
            id={1}
            title="Getting Started with DropAphi APIs"
            excerpt="Learn how to integrate DropAphi's powerful APIs into your application in just a few minutes."
            author="Sarah Chen"
            date="Oct 15, 2025"
            likes={234}
            comments={12}
            delay={0}
          />
          <BlogCard
            id={2}
            title="Building Scalable Email Campaigns"
            excerpt="Best practices for creating email campaigns that scale with your growing user base."
            author="Mike Johnson"
            date="Oct 12, 2025"
            likes={189}
            comments={8}
            delay={100}
          />
          <BlogCard
            id={3}
            title="Authentication Best Practices"
            excerpt="Secure your applications with our comprehensive guide to OTP implementation and security."
            author="Alex Rodriguez"
            date="Oct 10, 2025"
            likes={312}
            comments={24}
            delay={200}
          />
        </div>

        <Link
          href="/blog"
          className="sm:hidden flex items-center justify-center gap-2 px-6 py-3 border-2 border-black text-black rounded-lg hover:bg-black hover:text-white transition-all w-full"
        >
          View All Blog Posts <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  )
}
