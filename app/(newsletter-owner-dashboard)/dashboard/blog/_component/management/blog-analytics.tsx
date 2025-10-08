"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Eye, Heart, MessageSquare, Share2, Calendar, Users, Globe, Star } from "lucide-react"
import { PostStatus } from "@/lib/generated/prisma"


interface BlogPost {
  id: string
  title: string
  status:PostStatus
  views: number
  likes: number
  comments: number
  shares: number
  publishedAt: string | null
  category: string
  seoScore: number
  isFeatured: boolean
}

interface BlogAnalyticsProps {
  posts: BlogPost[]
}

export function BlogAnalytics({ posts }: BlogAnalyticsProps) {
  const publishedPosts = posts.filter((p) => p.status === "PUBLISHED")

  const totalViews = posts.reduce((sum, p) => sum + p.views, 0)
  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0)
  const totalComments = posts.reduce((sum, p) => sum + p.comments, 0)
  const totalShares = posts.reduce((sum, p) => sum + p.shares, 0)

  const avgSeoScore = posts.length > 0 ? Math.round(posts.reduce((sum, p) => sum + p.seoScore, 0) / posts.length) : 0

  const topPerformingPosts = publishedPosts.sort((a, b) => b.views - a.views).slice(0, 5)

  const categoryStats = posts.reduce(
    (acc, post) => {
      acc[post.category] = (acc[post.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const monthlyStats = publishedPosts.reduce(
    (acc, post) => {
      if (post.publishedAt) {
        const month = new Date(post.publishedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        })
        acc[month] = (acc[month] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border border-gray-200 rounded-lg  text-black">
          <CardContent className="p-4 text-center">
            <Eye className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold ">{totalViews.toLocaleString()}</div>
            <div className="text-sm ">Total Views</div>
          </CardContent>
        </Card>

        <Card className=" bg-white border border-gray-200 rounded-lg  text-black">
          <CardContent className="p-4 text-center">
            <Heart className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold ">{totalLikes.toLocaleString()}</div>
            <div className="text-sm ">Total Likes</div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-lg  text-black">
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold ">{totalComments}</div>
            <div className="text-sm ">Total Comments</div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-lg  text-black">
          <CardContent className="p-4 text-center">
            <Share2 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold ">{totalShares}</div>
            <div className="text-sm ">Total Shares</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Posts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performing Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformingPosts.map((post, index) => (
                <div key={post.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{post.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {post.comments}
                      </span>
                    </div>
                  </div>
                  {post.isFeatured && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Posts by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(categoryStats)
                .sort(([, a], [, b]) => b - a)
                .map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-gray-700">{category}</span>
                    <Badge variant="secondary">{count} posts</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Publishing Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Publishing Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(monthlyStats)
                .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                .map(([month, count]) => (
                  <div key={month} className="flex items-center justify-between">
                    <span className="text-gray-700">{month}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(count / Math.max(...Object.values(monthlyStats))) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* SEO Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              SEO Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-blue-600 mb-2">{avgSeoScore}%</div>
              <p className="text-gray-600">Average SEO Score</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Excellent (80-100%)</span>
                <Badge className="bg-green-100 text-green-800">
                  {posts.filter((p) => p.seoScore >= 80).length} posts
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Good (60-79%)</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {posts.filter((p) => p.seoScore >= 60 && p.seoScore < 80).length} posts
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Needs Work (0-59%)</span>
                <Badge className="bg-red-100 text-red-800">{posts.filter((p) => p.seoScore < 60).length} posts</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Engagement Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
               {totalViews > 0  ? Math.min(100, ((totalLikes / totalViews) * 100)).toFixed(1) : 0}%
              </div>
              <p className="text-gray-600">Like Rate</p>
              <p className="text-sm text-gray-500">Likes per view</p>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {totalViews > 0 ? Math.min(100, (totalComments / totalViews) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-gray-600">Comment Rate</p>
              <p className="text-sm text-gray-500">Comments per view</p>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {totalViews > 0 ?  Math.min(100, (totalShares / totalViews) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-gray-600">Share Rate</p>
              <p className="text-sm text-gray-500">Shares per view</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
