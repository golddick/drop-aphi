"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Edit3,
  Eye,
  Trash2,
  MoreVertical,
  Calendar,
  Clock,
  Users,
  Heart,
  MessageSquare,
  Copy,
  Share2,
  Archive,
  Globe,
  Lock,
  Star,
  MoreHorizontal,
  Edit,
  ExternalLink,
  MessageCircle,
  Flag,
  AlertTriangle,
} from "lucide-react"
import { BiWorld } from "react-icons/bi"


import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils"
import { PostStatus, PostVisibility } from "@/lib/generated/prisma"


type BlogMember = {
  userId: string;
  fullName: string;
  imageUrl?: string | null;

}

type BlogPostFlag = {
    id: string;
    reason: string;
    comment:string;
    flaggedBy:string;
    status: string;
    createdAt: Date;
    reviewedAt: Date | null;
    postId: string;
    userId: string;
}

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  featuredImage: string | null
  category: string
  tags: string[]
  author: string
  authorTitle: string
  status: PostStatus
  visibility: PostVisibility   
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  scheduledAt: string | null
  wordCount: number
  readTime: number
  views: number
  likes: number
  comments: number
  shares: number
  seoScore: number
  isFeatured: boolean
  slug: string
  flaggedAt?: Date | string | null;
  flagReason: string | null
  isFlagged: boolean
  flaggedPosts:BlogPostFlag[]
  members: BlogMember
}

interface BlogPostCardProps {
  post: BlogPost 
  onEdit: () => void 
  onView: () => void
  onDelete: () => void
  onPublishe: () => void
  onArchive: () => void
  getStatusIcon: (status: PostStatus) => React.ReactNode
  getStatusColor: (status: PostStatus) => string
}

export function BlogPostCard({
  post,
  onEdit,
  onView,
  onDelete,
  onPublishe,
  onArchive,
  getStatusIcon,
  getStatusColor,
}: BlogPostCardProps) {
  const [isHovered, setIsHovered] = useState(false)



  const getSeoScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100"
    if (score >= 60) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  return (
    <motion.div whileHover={{ y: -2 }} onHoverStart={() => setIsHovered(true)} onHoverEnd={() => setIsHovered(false)}>
       <Card className="group hover:shadow-lg transition-all duration-200 border-gray-200">
      <CardHeader className="p-0">
        <div className="relative w-full h-48">
          <Image
            src={post.featuredImage || "/placeholder.svg"}
            alt={post.title}
            fill
            className=" object-cover rounded-t-lg"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={getStatusColor(post.status)} variant="secondary">
              {post.status}
            </Badge>
            {post.isFeatured && (
              <Badge className="bg-blue-100 text-blue-800" variant="secondary">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
           {post.isFlagged && (
                    <div className="absolute bottom-2 right-2">
                      <Badge variant="destructive" className="shadow-lg">
                        <Flag className="h-3 w-3 mr-1" />
                        Flagged
                      </Badge>
                    </div>
                  )}
          <div className="absolute top-3 right-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onView}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                 {post.status !== "PUBLISHED" && (
                <DropdownMenuItem onClick={onPublishe}>
                  <BiWorld className="h-4 w-4 mr-2" />
                  Publish
                </DropdownMenuItem>
                 )}
                <DropdownMenuSeparator />
                 {post.status !== "ARCHIVED" && (
                <DropdownMenuItem onClick={onArchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                 )}
                <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 mb-1">{post.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Badge variant="outline" className="text-xs">
              {post.category}
            </Badge>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readTime} min read
            </span>
            <span>•</span>
            <span className={getSeoScoreColor(post.seoScore)}>SEO: {post.seoScore}%</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.views.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {post.likes}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {post.comments}
              </span>
            </div>

            <div className="text-xs text-gray-500">
               <span>
                {post.status === "PUBLISHED" && post.publishedAt
                  ? `Published ${formatDate(post.publishedAt)}`
                  : `Updated ${formatDate(post.updatedAt)}`}
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-transparent"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={onView}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>




    {/* <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >

            <Card
              className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${
                post.isFlagged ? "border-red-200 bg-red-50" : ""
              }`}
              onClick={() => setSelectedPost(post)}
            >
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={post.featuredImage || "/placeholder.svg"}
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  {post.isFlagged && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="destructive" className="shadow-lg">
                        <Flag className="h-3 w-3 mr-1" />
                        Flagged
                      </Badge>
                    </div>
                  )}
                  <Badge className={`absolute top-2 left-2 ${getStatusColor(post.status)}`}>
                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                  </Badge>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.members.imageUrl || "/2logo.jpeg"} alt={post.author} />
                      <AvatarFallback>{post.author || 'author'.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{post.author}</p>
                      <p className="text-xs text-gray-500">{formatDate (post.createdAt)}</p>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{post.title}</h3>

                  {post.isFlagged && (
                    <div className="mb-3 p-2 bg-red-100 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-1 mb-1">
                        <AlertTriangle className="h-3 w-3 text-red-600" />
                        <span className="text-xs font-medium text-red-700">Admin Message</span>
                      </div>
                      <p className="text-xs text-red-600 line-clamp-2">{post.flagReason}</p>
                    </div>
                  )}

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
    </motion.div> */}
    </motion.div>
  )
}



