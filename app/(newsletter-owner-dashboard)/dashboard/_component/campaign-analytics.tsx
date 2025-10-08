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
  RadialBarChart,
  RadialBar,
} from "recharts"
import { Target, TrendingUp, Users, Mail, Eye, MousePointer, Calendar, Zap } from "lucide-react"

interface CampaignAnalyticsProps {
  timeRange: string
}

interface AutomationDataItem {
  name: string
  completion: number
  color: string
  fill?: string
}

interface CampaignPerformanceData {
  name: string
  sent: number
  opened: number
  clicked: number
  conversions: number
}

interface CampaignTypeData {
  type: string
  campaigns: number
  avgOpenRate: number
  avgClickRate: number
}

interface TopCampaign {
  name: string
  type: string
  status: string
  subscribers: number
  lastSent: string
  openRate: number
  clickRate: number
  revenue: number
}

export function CampaignAnalytics({ timeRange }: CampaignAnalyticsProps) {
  const campaignPerformanceData: CampaignPerformanceData[] = [
    { name: "Week 1", sent: 4500, opened: 1260, clicked: 189, conversions: 23 },
    { name: "Week 2", sent: 5200, opened: 1508, clicked: 234, conversions: 31 },
    { name: "Week 3", sent: 4800, opened: 1392, clicked: 201, conversions: 28 },
    { name: "Week 4", sent: 5800, opened: 1740, clicked: 278, conversions: 42 },
  ]

  const campaignTypeData: CampaignTypeData[] = [
    { type: "Newsletter", campaigns: 8, avgOpenRate: 28.5, avgClickRate: 4.2 },
    { type: "Product", campaigns: 5, avgOpenRate: 32.1, avgClickRate: 6.8 },
    { type: "News", campaigns: 6, avgOpenRate: 18.9, avgClickRate: 2.1 },
    { type: "Educational", campaigns: 4, avgOpenRate: 45.2, avgClickRate: 12.5 },
  ]

  const automationData: AutomationDataItem[] = [
    { name: "Welcome Series", completion: 85, color: "#3B82F6", fill: "#3B82F6" },
    { name: "Abandoned Cart", completion: 72, color: "#10B981", fill: "#10B981" },
    { name: "Re-engagement", completion: 68, color: "#F59E0B", fill: "#F59E0B" },
    { name: "Newsletter", completion: 94, color: "#EF4444", fill: "#EF4444" },
  ]

  const topCampaigns: TopCampaign[] = [
    {
      name: "Weekly Tech Digest",
      type: "Newsletter",
      status: "Active",
      subscribers: 2847,
      lastSent: "2024-01-15",
      openRate: 31.2,
      clickRate: 4.8,
      revenue: 1250,
    },
    {
      name: "Product Launch Alert",
      type: "Product",
      status: "Completed",
      subscribers: 1956,
      lastSent: "2024-01-14",
      openRate: 28.7,
      clickRate: 6.2,
      revenue: 3200,
    },
    {
      name: "Breaking News Flash",
      type: "News",
      status: "Active",
      subscribers: 1203,
      lastSent: "2024-01-16",
      openRate: 22.4,
      clickRate: 2.1,
      revenue: 450,
    },
    {
      name: "Developer Tutorial Series",
      type: "Educational",
      status: "Scheduled",
      subscribers: 892,
      lastSent: "2024-01-10",
      openRate: 45.6,
      clickRate: 12.4,
      revenue: 890,
    },
  ]

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "paused":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case "newsletter":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "product":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "news":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "educational":
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
              {entry.dataKey.includes("Rate") ? "%" : ""}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4 lg:space-y-6 p-2 sm:p-4">
      {/* Campaign Performance Overview */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Campaign Performance Funnel Card */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              Campaign Performance Funnel
            </CardTitle>
            <CardDescription>Email funnel metrics over {timeRange}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[300px] sm:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={campaignPerformanceData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickMargin={10} />
                  <YAxis stroke="#6b7280" fontSize={12} tickMargin={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Bar dataKey="sent" fill="#93C5FD" name="Emails Sent" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="opened" fill="#86EFAC" name="Opened" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="clicked" fill="#FCD34D" name="Clicked" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="conversions" fill="#F87171" name="Conversions" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Automation Performance Card */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <Zap className="h-5 w-5 mr-2 text-yellow-600" />
              Automation Performance
            </CardTitle>
            <CardDescription>Automation workflow completion rates</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[300px] sm:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="20%"
                  outerRadius="90%"
                  data={automationData}
                >
                  <RadialBar
                    dataKey="completion"
                    cornerRadius={10}
                    background={{ fill: "#f3f4f6" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-3">
              {automationData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-3 border border-white shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-semibold text-gray-900 mr-2">
                      {item.completion}%
                    </span>
                    <Progress
                      value={item.completion}
                      className="w-16 h-2"
                      style={{ backgroundColor: `${item.color}20` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Type Performance */}
      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <Mail className="h-5 w-5 mr-2 text-purple-600" />
            Performance by Campaign Type
          </CardTitle>
          <CardDescription>Compare performance across different campaign types</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[300px] sm:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={campaignTypeData}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="type" stroke="#6b7280" fontSize={12} tickMargin={10} />
                <YAxis stroke="#6b7280" fontSize={12} tickMargin={10} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar dataKey="avgOpenRate" fill="#3B82F6" name="Avg Open Rate %" radius={[2, 2, 0, 0]} />
                <Bar dataKey="avgClickRate" fill="#10B981" name="Avg Click Rate %" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Campaign List */}
      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Campaign Performance Details
          </CardTitle>
          <CardDescription>
            Detailed performance metrics for all campaigns in {timeRange}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 sm:space-y-4">
            {topCampaigns.map((campaign, index) => (
              <div
                key={index}
                className="flex flex-col lg:flex-row lg:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200 hover:border-gray-300"
              >
                <div className="flex-1 mb-3 lg:mb-0 lg:mr-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                    <h4 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                      {campaign.name}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="secondary"
                        className={`text-xs border ${getStatusColor(campaign.status)}`}
                      >
                        {campaign.status}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`text-xs border ${getTypeColor(campaign.type)}`}
                      >
                        {campaign.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-400" />
                      <span>{campaign.subscribers.toLocaleString()} subscribers</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-400" />
                      <span>Last sent: {campaign.lastSent}</span>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-400" />
                      <span>Revenue: ${campaign.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col xs:flex-row gap-4 sm:gap-6 lg:gap-8">
                  <div className="text-center min-w-[90px]">
                    <div className="flex items-center justify-center mb-2">
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-blue-600" />
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Open Rate</span>
                    </div>
                    <p className="text-sm sm:text-lg font-bold text-gray-900 mb-1">
                      {campaign.openRate}%
                    </p>
                    <Progress value={campaign.openRate} className="w-full h-2 sm:h-2.5" />
                  </div>
                  <div className="text-center min-w-[90px]">
                    <div className="flex items-center justify-center mb-2">
                      <MousePointer className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-green-600" />
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Click Rate</span>
                    </div>
                    <p className="text-sm sm:text-lg font-bold text-gray-900 mb-1">
                      {campaign.clickRate}%
                    </p>
                    <Progress value={campaign.clickRate * 5} className="w-full h-2 sm:h-2.5" />
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
