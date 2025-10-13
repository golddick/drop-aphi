'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, Users, Mail, Eye, MousePointer, FileText, Share2, Plus, AlertCircle, UserMinus } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { BlogPerformance, GrowthData, PerformanceData, TopBlog, TopCampaign } from "@/lib/schemas/analytics-schemas"
import { getBlogPerformance, getGrowthTrends, getPerformanceMetrics, getTopBlogs, getTopCampaigns } from "@/actions/analytics/overview-metrics-actions"

interface OverviewMetricsProps {
  timeRange: string
}

// Enhanced interfaces to match server action responses
interface GrowthDataResponse {
  data: GrowthData[]
  isEmpty: boolean
  message?: string
}

interface PerformanceDataResponse {
  data: PerformanceData[]
  isEmpty: boolean
  message?: string
}

interface BlogPerformanceResponse {
  data: BlogPerformance[]
  isEmpty: boolean
  message?: string
}

interface TopCampaignsResponse {
  data: TopCampaign[]
  isEmpty: boolean
  message?: string
}

interface TopBlogsResponse {
  data: TopBlog[]
  isEmpty: boolean
  message?: string
}

export function OverviewMetrics({ timeRange }: OverviewMetricsProps) {
  const [growthData, setGrowthData] = useState<GrowthDataResponse>({ data: [], isEmpty: true })
  const [performanceData, setPerformanceData] = useState<PerformanceDataResponse>({ data: [], isEmpty: true })
  const [blogPerformance, setBlogPerformance] = useState<BlogPerformanceResponse>({ data: [], isEmpty: true })
  const [topCampaigns, setTopCampaigns] = useState<TopCampaignsResponse>({ data: [], isEmpty: true })
  const [topBlogs, setTopBlogs] = useState<TopBlogsResponse>({ data: [], isEmpty: true })
  const [loading, setLoading] = useState(true)
  const [showEmptyStateBanner, setShowEmptyStateBanner] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [
          growth,
          performance,
          blogPerf,
          campaigns,
          blogs
        ] = await Promise.all([
          getGrowthTrends(timeRange),
          getPerformanceMetrics(timeRange),
          getBlogPerformance(timeRange),
          getTopCampaigns(timeRange),
          getTopBlogs(timeRange)
        ])

        console.log(growth, performance, blogPerf, campaigns, blogs, 'Loading...')

        // Type assertions to ensure proper typing
        setGrowthData(growth as GrowthDataResponse)
        setPerformanceData(performance as PerformanceDataResponse)
        setBlogPerformance(blogPerf as BlogPerformanceResponse)
        setTopCampaigns(campaigns as TopCampaignsResponse)
        setTopBlogs(blogs as TopBlogsResponse)

        console.log(growthData, performanceData, blogPerformance, topCampaigns, topBlogs, 'Fetched...')

        // Show banner if all data is empty
        const allEmpty = 
          (growth as GrowthDataResponse).isEmpty && 
          (performance as PerformanceDataResponse).isEmpty && 
          (blogPerf as BlogPerformanceResponse).isEmpty && 
          (campaigns as TopCampaignsResponse).isEmpty && 
          (blogs as TopBlogsResponse).isEmpty
        setShowEmptyStateBanner(allEmpty)

      } catch (error) {
        console.error('Error fetching overview metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeRange])

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border border-gray-200">
              <CardContent className="p-6">
                <div className="h-[350px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading chart...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Empty state banner
  const EmptyStateBanner = () => (
    <Alert className="mb-6 bg-blue-50 border-blue-200">
      <AlertCircle className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-semibold mb-1">Welcome to your analytics dashboard!</p>
            <p>Get started by creating content and engaging with your audience to see analytics data.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/mail/write">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Mail className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </Link>
            <Link href="/dashboard/blog/write">
              <Button size="sm" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                <FileText className="h-4 w-4 mr-2" />
                Write Blog Post
              </Button>
            </Link>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )

  // Empty state component for charts
  const EmptyChartState = ({ icon: Icon, title, message, action }: { 
    icon: any, 
    title: string, 
    message?: string, 
    action?: React.ReactNode 
  }) => (
    <div className="h-[300px] sm:h-[350px] flex flex-col items-center justify-center text-center p-6">
      <Icon className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-sm mb-4">{message}</p>
      {action}
    </div>
  )

  // Empty state component for lists
  const EmptyListState = ({ icon: Icon, title, message, action }: { 
    icon: any, 
    title: string, 
    message?: string, 
    action?: React.ReactNode 
  }) => (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <Icon className="h-16 w-16 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-sm mb-4">{message}</p>
      {action}
    </div>
  )

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "published":
        return "bg-green-100 text-green-800 border-green-200"
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200"
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
              {entry.name}: {entry.value.toLocaleString()}
              {entry.dataKey?.includes('Rate') || entry.dataKey?.includes('Engagement') ? '%' : ''}
              {entry.dataKey?.includes('ReadTime') ? ' min' : ''}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Calculate net growth for display
  const calculateNetGrowth = () => {
    if (growthData.isEmpty || growthData.data.length === 0) return 0
    
    const latestData = growthData.data[growthData.data.length - 1]
    return latestData.subscribers - latestData.unsubscribers
  }

  return (
    <div className="space-y-6">
      {/* Empty State Banner */}
      {showEmptyStateBanner && <EmptyStateBanner />}

      {/* Growth Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Growth Trends
              </CardTitle>
             
            </div>
            <CardDescription>Subscriber growth, unsubscribes, emails, and blog views over time</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {growthData.isEmpty ? (
              <EmptyChartState
                icon={TrendingUp}
                title="No Growth Data"
                message={growthData.message || "Start by adding subscribers, sending emails, or publishing blog posts to see growth trends."}
                action={
                  <div className="flex gap-2">
                    <Link href="/dashboard/subscribers">
                      <Button size="sm" variant="outline">
                        <Users className="h-4 w-4 mr-2" />
                        Add Subscribers
                      </Button>
                    </Link>
                  </div>
                }
              />
            ) : (
              <div className="h-[300px] sm:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData.data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickMargin={10} />
                    <YAxis stroke="#6b7280" fontSize={12} tickMargin={10} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                    <Area
                      type="monotone"
                      dataKey="subscribers"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="#93C5FD"
                      name="Subscribers"
                    />
                    <Area
                      type="monotone"
                      dataKey="unsubscribers"
                      stackId="2"
                      stroke="#EF4444"
                      fill="#FCA5A5"
                      name="Unsubscribers"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="emails" 
                      stackId="3" 
                      stroke="#10B981" 
                      fill="#86EFAC" 
                      name="Emails Sent" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="blogViews" 
                      stackId="4" 
                      stroke="#F59E0B" 
                      fill="#FDE68A" 
                      name="Blog Views" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <Eye className="h-5 w-5 mr-2 text-blue-600" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Email and blog engagement rates</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {performanceData.isEmpty ? (
              <EmptyChartState
                icon={Eye}
                title="No Performance Data"
                message={performanceData.message || "Send some emails and publish blog posts to see engagement metrics."}
                action={
                  <div className="flex gap-2">
                    <Link href="/dashboard/mail/write">
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                    </Link>
                  </div>
                }
              />
            ) : (
              <div className="h-[300px] sm:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData.data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickMargin={10} />
                    <YAxis stroke="#6b7280" fontSize={12} tickMargin={10} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                    <Line type="monotone" dataKey="openRate" stroke="#3B82F6" strokeWidth={3} name="Open Rate %" dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} />
                    <Line type="monotone" dataKey="clickRate" stroke="#10B981" strokeWidth={3} name="Click Rate %" dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
                    <Line type="monotone" dataKey="blogEngagement" stroke="#F59E0B" strokeWidth={3} name="Blog Engagement %" dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>


      {/* Top Performing Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Email Campaigns */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <Mail className="h-5 w-5 mr-2 text-green-600" />
              Top Email Campaigns
            </CardTitle>
            <CardDescription>Your best performing email campaigns</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {topCampaigns.isEmpty ? (
              <EmptyListState
                icon={Mail}
                title="No Campaigns Yet"
                message={topCampaigns.message || "Create your first email campaign to see performance analytics."}
                action={
                  <Link href="/dashboard/mail/write">
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Campaign
                    </Button>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-4">
                {topCampaigns.data.map((campaign, index) => (
                  <div
                    key={index}
                    className="  grid grid-cols-[2fr_0.5fr] sm:items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200"
                  >
                    <div className="flex-1 mb-3 sm:mb-0 sm:mr-4 ">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate capitalize">{campaign.name}</h4>
                        <Badge variant="secondary" className={`text-xs border ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{campaign.subscribers.toLocaleString()} subscribers</p>
                    </div>

                    <div className="flex flex-row gap-2 md:gap-3">
                      <div className="text-center min-w-[70px]">
                        <div className="flex items-center justify-center mb-1">
                          <Eye className="h-3 w-3 mr-1 text-blue-600" />
                          <span className="text-xs text-gray-600">Open</span>
                        </div>
                        <p className="text-sm font-semibold text-black">{campaign.openRate}%</p>
                        <Progress value={campaign.openRate} className="w-12 h-1.5 mt-1" />
                      </div>
                      <div className="text-center min-w-[70px]">
                        <div className="flex items-center justify-center mb-1">
                          <MousePointer className="h-3 w-3 mr-1 text-green-600" />
                          <span className="text-xs text-gray-600">Click</span>
                        </div>
                        <p className="text-sm font-semibold text-black">{campaign.clickRate}%</p>
                        <Progress value={campaign.clickRate} className="w-12 h-1.5 mt-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Blog Posts */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Top Blog Posts
            </CardTitle>
            <CardDescription>Your most engaging blog content</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {topBlogs.isEmpty ? (
              <EmptyListState
                icon={FileText}
                title="No Blog Posts Yet"
                message={topBlogs.message || "Write and publish your first blog post to see performance analytics."}
                action={
                  <Link href="/dashboard/blog/write">
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Write Blog Post
                    </Button>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-4">
                {topBlogs.data.map((blog, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200"
                  >
                    <div className="flex-1 mb-3 sm:mb-0 sm:mr-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{blog.name}</h4>
                        <Badge variant="secondary" className={`text-xs border ${getStatusColor(blog.status)}`}>
                          {blog.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{blog.views.toLocaleString()} views</p>
                    </div>

                    <div className="flex flex-col xs:flex-row gap-3">
                      <div className="text-center min-w-[70px]">
                        <div className="flex items-center justify-center mb-1">
                          <Eye className="h-3 w-3 mr-1 text-blue-600" />
                          <span className="text-xs text-gray-600">Read</span>
                        </div>
                        <p className="text-sm font-semibold text-black">{blog.readRate}%</p>
                        <Progress value={blog.readRate} className="w-12 h-1.5 mt-1" />
                      </div>
                      <div className="text-center min-w-[70px]">
                        <div className="flex items-center justify-center mb-1">
                          <Share2 className="h-3 w-3 mr-1 text-green-600" />
                          <span className="text-xs text-gray-600">Shares</span>
                        </div>
                        <p className="text-sm font-semibold text-black">{blog.shares}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


