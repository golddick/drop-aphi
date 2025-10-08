"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { FileText, Eye, Clock, Share2, Heart, MessageCircle, TrendingUp, Users, Calendar, Globe } from "lucide-react"

interface BlogAnalyticsProps {
  timeRange: string
}

interface BlogPerformanceData {
  name: string
  views: number
  reads: number
  engagement: number
  shares: number
}

interface BlogTopicData {
  topic: string
  posts: number
  avgViews: number
  avgReadTime: number
  engagementRate: number
}

interface TopBlog {
  name: string
  category: string
  status: string
  published: string
  views: number
  readRate: number
  avgReadTime: number
  shares: number
  likes: number
  comments: number
}

interface TrafficSourceData {
  source: string
  visitors: number
  percentage: number
  color: string
  [key: string]: string | number
}

export function BlogAnalytics({ timeRange }: BlogAnalyticsProps) {
  const blogPerformanceData: BlogPerformanceData[] = [
    { name: "Week 1", views: 12450, reads: 8560, engagement: 68.7, shares: 234 },
    { name: "Week 2", views: 15680, reads: 11240, engagement: 71.6, shares: 312 },
    { name: "Week 3", views: 14230, reads: 9870, engagement: 69.3, shares: 278 },
    { name: "Week 4", views: 18940, reads: 13420, engagement: 70.8, shares: 401 },
  ]

  const blogTopicData: BlogTopicData[] = [
    { topic: "Technology", posts: 45, avgViews: 2850, avgReadTime: 4.2, engagementRate: 72.5 },
    { topic: "Marketing", posts: 32, avgViews: 3240, avgReadTime: 3.8, engagementRate: 68.9 },
    { topic: "Design", posts: 28, avgViews: 1980, avgReadTime: 2.9, engagementRate: 61.4 },
    { topic: "Business", posts: 35, avgViews: 2560, avgReadTime: 3.5, engagementRate: 65.2 },
    { topic: "Development", posts: 41, avgViews: 3120, avgReadTime: 4.8, engagementRate: 75.3 },
  ]

  const topBlogs: TopBlog[] = [
    {
      name: "The Future of AI in Web Development",
      category: "Technology",
      status: "Published",
      published: "2024-01-15",
      views: 12560,
      readRate: 78.4,
      avgReadTime: 4.8,
      shares: 456,
      likes: 892,
      comments: 134,
    },
    {
      name: "Advanced React Patterns for 2024",
      category: "Development",
      status: "Published",
      published: "2024-01-14",
      views: 9870,
      readRate: 82.1,
      avgReadTime: 5.2,
      shares: 321,
      likes: 745,
      comments: 98,
    },
    {
      name: "Content Marketing Strategies That Convert",
      category: "Marketing",
      status: "Published",
      published: "2024-01-16",
      views: 8450,
      readRate: 71.3,
      avgReadTime: 3.4,
      shares: 234,
      likes: 567,
      comments: 67,
    },
    {
      name: "UI/UX Design Principles for Modern Apps",
      category: "Design",
      status: "Scheduled",
      published: "2024-01-18",
      views: 7230,
      readRate: 68.9,
      avgReadTime: 3.1,
      shares: 189,
      likes: 423,
      comments: 45,
    },
    {
      name: "Building Scalable SaaS Products",
      category: "Business",
      status: "Published",
      published: "2024-01-12",
      views: 6540,
      readRate: 75.6,
      avgReadTime: 4.1,
      shares: 278,
      likes: 512,
      comments: 78,
    },
  ]

  const trafficSources: TrafficSourceData[] = [
    { source: "Organic Search", visitors: 45620, percentage: 45, color: "#3B82F6" },
    { source: "Social Media", visitors: 23450, percentage: 23, color: "#10B981" },
    { source: "Direct", visitors: 18760, percentage: 18, color: "#F59E0B" },
    { source: "Referral", visitors: 8920, percentage: 9, color: "#EF4444" },
    { source: "Email", visitors: 3450, percentage: 3, color: "#8B5CF6" },
    { source: "Other", visitors: 1800, percentage: 2, color: "#6B7280" },
  ]

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "published":
        return "bg-green-100 text-green-800 border-green-200"
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "archived":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCategoryColor = (category: string): string => {
    switch (category.toLowerCase()) {
      case "technology":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "development":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "marketing":
        return "bg-green-100 text-green-800 border-green-200"
      case "design":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "business":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.dataKey.includes('Rate') || entry.dataKey.includes('engagement') ? '%' : ''}
              {entry.dataKey.includes('ReadTime') ? ' min' : ''}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6 p-2 sm:p-4">
      {/* Blog Performance Overview */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Blog Performance Trends
            </CardTitle>
            <CardDescription>Key metrics and engagement over {timeRange}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[300px] sm:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={blogPerformanceData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6b7280"
                    fontSize={12}
                    tickMargin={10}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickMargin={10}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{
                      fontSize: "12px",
                      paddingTop: "10px",
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#3B82F6" 
                    name="Views" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="reads" 
                    stroke="#10B981" 
                    name="Reads" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="engagement" 
                    stroke="#F59E0B" 
                    name="Engagement %" 
                    strokeWidth={2}
                    dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <Globe className="h-5 w-5 mr-2 text-green-600" />
              Traffic Sources
            </CardTitle>
            <CardDescription>Where your blog visitors come from</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[300px] sm:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trafficSources}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ source, percentage }) => `${source}: ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="percentage"
                  >
                    {trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {trafficSources.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }} 
                    />
                    <span className="text-sm text-gray-700">{item.source}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-black">{item.visitors.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topic Performance */}
      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <FileText className="h-5 w-5 mr-2 text-purple-600" />
            Performance by Topic
          </CardTitle>
          <CardDescription>Compare performance across different blog topics</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[300px] sm:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={blogTopicData}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="topic" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickMargin={10}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickMargin={10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{
                    fontSize: "12px",
                    paddingTop: "10px",
                  }}
                />
                <Bar 
                  dataKey="avgViews" 
                  fill="#3B82F6" 
                  name="Avg Views" 
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="engagementRate" 
                  fill="#10B981" 
                  name="Engagement Rate %" 
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="avgReadTime" 
                  fill="#F59E0B" 
                  name="Avg Read Time (min)" 
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Blogs */}
      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Top Performing Blogs
          </CardTitle>
          <CardDescription>Detailed performance metrics for all blog posts</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {topBlogs.map((blog, index) => (
              <div
                key={index}
                className="flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200 hover:border-gray-300"
              >
                <div className="flex-1 mb-4 lg:mb-0 lg:mr-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                    <h4 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                      {blog.name}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs border ${getStatusColor(blog.status)}`}
                      >
                        {blog.status}
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs border ${getCategoryColor(blog.category)}`}
                      >
                        {blog.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-400" />
                      <span>Published: {blog.published}</span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-400" />
                      <span>{blog.views.toLocaleString()} views</span>
                    </div>
                    <div className="flex items-center">
                      <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-400" />
                      <span>{blog.shares} shares</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
                  <div className="text-center min-w-[80px]">
                    <div className="flex items-center justify-center mb-1">
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-blue-600" />
                      <span className="text-xs sm:text-sm text-gray-600">Read Rate</span>
                    </div>
                    <p className="text-sm sm:text-lg font-semibold text-black">{blog.readRate}%</p>
                    <Progress value={blog.readRate} className="w-16 sm:w-20 h-1.5 sm:h-2 mt-1" />
                  </div>
                  <div className="text-center min-w-[80px]">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-green-600" />
                      <span className="text-xs sm:text-sm text-gray-600">Read Time</span>
                    </div>
                    <p className="text-sm sm:text-lg font-semibold text-black">{blog.avgReadTime}m</p>
                    <Progress value={blog.avgReadTime * 20} className="w-16 sm:w-20 h-1.5 sm:h-2 mt-1" />
                  </div>
                  <div className="text-center min-w-[80px]">
                    <div className="flex items-center justify-center mb-1">
                      <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-red-600" />
                      <span className="text-xs sm:text-sm text-gray-600">Engagement</span>
                    </div>
                    <p className="text-sm sm:text-lg font-semibold text-black">{blog.likes}</p>
                    <div className="flex justify-center gap-1 mt-1 text-xs text-gray-500">
                      <MessageCircle className="h-3 w-3" />
                      <span>{blog.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}