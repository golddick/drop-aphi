

'use client'

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Mail,
  MousePointer,
  Eye,
  FileText,
  RefreshCw,
  Pen,
} from "lucide-react"
import { OverviewMetrics } from "./overview-metrics"
import Link from "next/link"
import { getOverallStats } from "@/actions/analytics/analytics-actions"
import { OverallStats } from "@/lib/schemas/analytics-stats"


export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30d")
  const [selectedTab, setSelectedTab] = useState("overview")
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const timeRangeOptions = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    { value: "1y", label: "Last year" },
    { value: "all", label: "All time" },
  ]

  const fetchStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)
      
      const stats = await getOverallStats(timeRange)
      setOverallStats(stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data')
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [timeRange])

  const handleRefresh = () => {
    fetchStats(true)
  }

  // Show loading state
  if (loading && !overallStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 w-full">
        <div className="w-full px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-red-500" />
              <p className="text-gray-600">Loading analytics...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error && !overallStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 w-full">
        <div className="w-full px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => fetchStats()}>Try Again</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Use actual stats or fallback to empty values
  const stats = overallStats || {
    totalSubscribers: 0,
    subscriberGrowth: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    emailsSent: 0,
    emailGrowth: 0,
    avgOpenRate: 0,
    openRateChange: 0,
    avgClickRate: 0,
    clickRateChange: 0,
    revenueGrowth: 0,
    totalBlogs: 0,
    blogGrowth: 0,
    blogViews: 0,
    blogViewGrowth: 0,
    avgReadTime: 0,
    readTimeChange: 0,
  }

  const renderTrendIndicator = (value: number) => {
    if (value > 0) {
      return (
        <>
          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-sm text-green-600">+{value.toFixed(1)}%</span>
        </>
      )
    } else if (value < 0) {
      return (
        <>
          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
          <span className="text-sm text-red-600">{value.toFixed(1)}%</span>
        </>
      )
    } else {
      return (
        <>
          <TrendingUp className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-sm text-gray-500">0%</span>
        </>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 w-full">
      <div className="w-full px-4 py-8">
        <div className="w-full">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-black mb-2">
                Analytics <span className="text-red-600">Dashboard</span>
              </h1>
              <p className="text-gray-600 text-lg">
                Comprehensive insights across all your campaigns, subscribers, blogs, and integrations
              </p>
            </div>

            <div className="flex flex-row justify-between gap-4 mt-4 lg:mt-0">
              <Select value={timeRange} onValueChange={setTimeRange} disabled={refreshing}>
                <SelectTrigger className=" w-fit border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Link href={"/dashboard/blog/write"}>
                <Button variant="outline" className="border-gray-300 bg-transparent hover:bg-black hover:text-white">
                  <Pen className="h-4 w-4 mr-2" />
                    <span className="">
                          Write  Blog 
                    </span>
                </Button>
              </Link>
              <Link href={"/dashboard/mail/write"}  className=" hidden lg:block">
                <Button variant="outline" className="border-gray-300 bg-transparent hover:bg-black hover:text-white ">
                  <Pen className="h-4 w-4 mr-2" />
                  Write Mail
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="border-gray-300 bg-transparent hover:bg-black hover:text-white w-fit"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                <span className=" hidden md:block">
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </span>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            {/* Total Subscribers */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Subscribers</p>
                    <p className="text-2xl font-bold text-black">{stats.totalSubscribers.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      {renderTrendIndicator(stats.subscriberGrowth)}
                      <span className="text-sm text-gray-500 ml-1">vs last period</span>
                    </div>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emails Sent */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Emails Sent</p>
                    <p className="text-2xl font-bold text-black">{stats.emailsSent.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      {renderTrendIndicator(stats.emailGrowth)}
                      <span className="text-sm text-gray-500 ml-1">vs last period</span>
                    </div>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Blogs */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Blogs</p>
                    <p className="text-2xl font-bold text-black">{stats.totalBlogs}</p>
                    <div className="flex items-center mt-2">
                      {renderTrendIndicator(stats.blogGrowth)}
                      <span className="text-sm text-gray-500 ml-1">vs last period</span>
                    </div>
                  </div>
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <FileText className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Blog Views */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Blog Views</p>
                    <p className="text-2xl font-bold text-black">{stats.blogViews.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      {renderTrendIndicator(stats.blogViewGrowth)}
                      <span className="text-sm text-gray-500 ml-1">vs last period</span>
                    </div>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <Eye className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avg Open Rate */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Avg Open Rate</p>
                    <p className="text-2xl font-bold text-black">{stats.avgOpenRate}%</p>
                    <div className="flex items-center mt-2">
                      {renderTrendIndicator(stats.openRateChange)}
                      <span className="text-sm text-gray-500 ml-1">vs last period</span>
                    </div>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <Eye className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avg Click Rate */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Avg Click Rate</p>
                    <p className="text-2xl font-bold text-black">{stats.avgClickRate}%</p>
                    <div className="flex items-center mt-2">
                      {renderTrendIndicator(stats.clickRateChange)}
                      <span className="text-sm text-gray-500 ml-1">vs last period</span>
                    </div>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <MousePointer className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <div className="shadow-none border-none">
              <TabsList className="grid w-full grid-cols-1 bg-white shadow-none border-none rounded-lg p-1">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-transparent shadow-none border-none data-[state=active]:text-black"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                {/* Other tabs remain commented out as in your original code */}
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-6">
              <OverviewMetrics timeRange={timeRange} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

