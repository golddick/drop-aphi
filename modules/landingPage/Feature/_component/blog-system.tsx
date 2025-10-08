"use client"

import { motion, useInView, Variants } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import { FileText, Heart, MessageCircle, Share2, Eye, Tag, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function BlogSystem() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

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

  const blogFeatures = [
    {
      icon: FileText,
      title: "Content Management",
      description: "Create, edit, and publish blog posts with our intuitive editor",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: Heart,
      title: "Like System",
      description: "Readers can like posts and show appreciation for content",
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      icon: MessageCircle,
      title: "Comments & Replies",
      description: "Engage with readers through nested comments and replies",
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      icon: Eye,
      title: "View Analytics",
      description: "Track post views, engagement, and reader behavior",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      icon: Tag,
      title: "Categorization",
      description: "Organize content with tags and categories for easy discovery",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      icon: Search,
      title: "Search & Filter",
      description: "Powerful search functionality with filtering options",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
    },
  ]

  const apiEndpoints = [
    { method: "GET", endpoint: "/blog/posts", description: "Fetch all blog posts with pagination" },
    { method: "POST", endpoint: "/blog/posts/{id}/like", description: "Like or unlike a blog post" },
    { method: "POST", endpoint: "/blog/posts/{id}/comments", description: "Add a comment to a post" },
    { method: "POST", endpoint: "/blog/comments/{id}/replies", description: "Reply to a comment" },
    { method: "GET", endpoint: "/blog/posts/{id}/analytics", description: "Get post performance metrics" },
    { method: "GET", endpoint: "/blog/search", description: "Search posts by keywords and filters" },
  ]

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 to-red-50 relative">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-12 md:mb-16">
            <Badge className="bg-orange-100 text-orange-700 border-orange-200 mb-4">Blog Content System</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 font-heading">
              Complete Blog Management Platform
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Build engaging blog experiences with our headless CMS that includes content management, reader engagement
              features, and comprehensive analytics.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <motion.div variants={itemVariants} className="order-2 lg:order-1">
              <div className="relative">
                <Image
                  src="/placeholder.svg?height=500&width=600&text=Blog+Management+Dashboard"
                  width={600}
                  height={500}
                  alt="Blog Management Dashboard"
                  className="rounded-xl shadow-2xl w-full h-auto border border-neutral-200"
                />
                <div className="absolute -bottom-4 -left-4 bg-orange-500 text-white p-3 rounded-full">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="order-1 lg:order-2 space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-4">Headless Blog System</h3>
                <p className="text-neutral-600 mb-6">
                  Our blog system provides all the tools you need to create, manage, and analyze blog content. From
                  writing to reader engagement, everything is covered.
                </p>
              </div>

              <div className="grid gap-4">
                {blogFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-4 p-4 ${feature.bgColor} rounded-lg border border-neutral-200`}
                  >
                    <div className="bg-white p-2 rounded-lg shrink-0 shadow-sm">
                      <feature.icon className={`h-5 w-5 ${feature.color}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-1">{feature.title}</h4>
                      <p className="text-sm text-neutral-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="bg-orange-500 hover:bg-orange-600 text-white">Explore Blog API</Button>
            </motion.div>
          </div>

          {/* API Endpoints */}
          <motion.div variants={itemVariants} className="mb-16">
            <h3 className="text-2xl font-bold text-center mb-8">Blog API Endpoints</h3>
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-lg">
              <div className="bg-neutral-900 text-white p-4">
                <h4 className="font-semibold">Available Endpoints</h4>
              </div>
              <div className="divide-y divide-neutral-200">
                {apiEndpoints.map((endpoint, index) => (
                  <div key={index} className="p-4 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <Badge
                        className={`text-xs ${
                          endpoint.method === "GET"
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : "bg-green-100 text-green-700 border-green-200"
                        }`}
                      >
                        {endpoint.method}
                      </Badge>
                      <code className="font-mono text-sm text-neutral-700 flex-1">{endpoint.endpoint}</code>
                    </div>
                    <p className="text-sm text-neutral-600 mt-2 ml-16">{endpoint.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Engagement Features */}
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-bold text-center mb-8">Reader Engagement Features</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white rounded-xl border border-neutral-200 shadow-sm">
                <div className="bg-red-100 p-4 rounded-full inline-flex mb-4">
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
                <h4 className="font-semibold text-neutral-900 mb-2">Like System</h4>
                <p className="text-sm text-neutral-600 mb-4">
                  Readers can like posts to show appreciation and help surface popular content.
                </p>
                <div className="text-2xl font-bold text-red-500">2.3K</div>
                <div className="text-sm text-neutral-500">Average likes per post</div>
              </div>

              <div className="text-center p-6 bg-white rounded-xl border border-neutral-200 shadow-sm">
                <div className="bg-green-100 p-4 rounded-full inline-flex mb-4">
                  <MessageCircle className="h-8 w-8 text-green-500" />
                </div>
                <h4 className="font-semibold text-neutral-900 mb-2">Comments & Replies</h4>
                <p className="text-sm text-neutral-600 mb-4">
                  Nested comment system with replies for meaningful discussions.
                </p>
                <div className="text-2xl font-bold text-green-500">847</div>
                <div className="text-sm text-neutral-500">Comments this month</div>
              </div>

              <div className="text-center p-6 bg-white rounded-xl border border-neutral-200 shadow-sm">
                <div className="bg-blue-100 p-4 rounded-full inline-flex mb-4">
                  <Share2 className="h-8 w-8 text-blue-500" />
                </div>
                <h4 className="font-semibold text-neutral-900 mb-2">Social Sharing</h4>
                <p className="text-sm text-neutral-600 mb-4">Built-in social sharing buttons for major platforms.</p>
                <div className="text-2xl font-bold text-blue-500">1.2K</div>
                <div className="text-sm text-neutral-500">Shares this month</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
