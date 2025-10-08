"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Users, TrendingUp, UserPlus, UserMinus, Globe, MapPin } from "lucide-react"

interface SubscriberAnalyticsProps {
  timeRange: string
}

export function SubscriberAnalytics({ timeRange }: SubscriberAnalyticsProps) {
  const subscriberGrowthData = [
    { name: "Jan", newSubscribers: 125, unsubscribes: 8, netGrowth: 117, total: 1200 },
    { name: "Feb", newSubscribers: 189, unsubscribes: 12, netGrowth: 177, total: 1377 },
    { name: "Mar", newSubscribers: 234, unsubscribes: 15, netGrowth: 219, total: 1596 },
    { name: "Apr", newSubscribers: 198, unsubscribes: 18, netGrowth: 180, total: 1776 },
    { name: "May", newSubscribers: 267, unsubscribes: 21, netGrowth: 246, total: 2022 },
    { name: "Jun", newSubscribers: 312, unsubscribes: 19, netGrowth: 293, total: 2315 },
    { name: "Jul", newSubscribers: 345, unsubscribes: 23, netGrowth: 322, total: 2637 },
  ]

  const segmentData = [
    { name: "Highly Engaged", value: 32, count: 5083, color: "#10B981" },
    { name: "Moderately Engaged", value: 45, count: 7157, color: "#3B82F6" },
    { name: "Low Engagement", value: 18, count: 2865, color: "#F59E0B" },
    { name: "At Risk", value: 5, count: 795, color: "#EF4444" },
  ]

  const sourceBreakdown = [
    { source: "Website Form", count: 4850, percentage: 38.2, growth: 12.5 },
    { source: "Social Media", count: 3120, percentage: 24.6, growth: 8.3 },
    { source: "API Import", count: 2340, percentage: 18.4, growth: -2.1 },
    { source: "Referrals", count: 1560, percentage: 12.3, growth: 15.7 },
    { source: "Popup Forms", count: 830, percentage: 6.5, growth: 22.1 },
  ]

  const demographicData = [
    { ageGroup: "18-24", count: 1250, percentage: 12.4 },
    { ageGroup: "25-34", count: 3420, percentage: 34.0 },
    { ageGroup: "35-44", count: 2890, percentage: 28.7 },
    { ageGroup: "45-54", count: 1680, percentage: 16.7 },
    { ageGroup: "55+", count: 820, percentage: 8.2 },
  ]

  const locationData = [
    { country: "United States", subscribers: 4250, percentage: 33.8 },
    { country: "United Kingdom", subscribers: 2130, percentage: 16.9 },
    { country: "Canada", subscribers: 1560, percentage: 12.4 },
    { country: "Australia", subscribers: 1240, percentage: 9.9 },
    { country: "Germany", subscribers: 980, percentage: 7.8 },
    { country: "Other", subscribers: 2440, percentage: 19.2 },
  ]

  const churnAnalysis = [
    { reason: "Too frequent emails", count: 45, percentage: 32.1 },
    { reason: "Content not relevant", count: 38, percentage: 27.1 },
    { reason: "Never subscribed", count: 25, percentage: 17.9 },
    { reason: "Email preferences changed", count: 18, percentage: 12.9 },
    { reason: "Other/Unknown", count: 14, percentage: 10.0 },
  ]

  return (
    <div className="space-y-6">
      {/* Subscriber Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Subscriber Growth Trend
            </CardTitle>
            <CardDescription>New subscribers vs unsubscribes over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={subscriberGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="newSubscribers"
                  stackId="1"
                  stroke="#10B981"
                  fill="#86EFAC"
                  name="New Subscribers"
                />
                <Area
                  type="monotone"
                  dataKey="unsubscribes"
                  stackId="2"
                  stroke="#EF4444"
                  fill="#FCA5A5"
                  name="Unsubscribes"
                />
                <Line type="monotone" dataKey="netGrowth" stroke="#3B82F6" strokeWidth={3} name="Net Growth" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Engagement Segments
            </CardTitle>
            <CardDescription>Subscriber engagement distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row items-center">
              <div className="w-full lg:w-1/2">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={segmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {segmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full lg:w-1/2 space-y-3">
                {segmentData.map((segment, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: segment.color }} />
                      <span className="text-sm text-gray-700">{segment.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-black">{segment.count.toLocaleString()}</span>
                      <span className="text-xs text-gray-500 block">{segment.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscriber Sources */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="h-5 w-5 mr-2 text-purple-600" />
            Subscriber Acquisition Sources
          </CardTitle>
          <CardDescription>Where your subscribers are coming from and their growth rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sourceBreakdown.map((source, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-black">{source.source}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-black">{source.count.toLocaleString()}</span>
                      <Badge
                        className={
                          source.growth > 0
                            ? "bg-green-100 text-green-800"
                            : source.growth < 0
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                        }
                      >
                        {source.growth > 0 ? "+" : ""}
                        {source.growth}%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-4">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${source.percentage}%` }} />
                    </div>
                    <span className="text-sm text-gray-600">{source.percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demographics & Location */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-indigo-600" />
              Age Demographics
            </CardTitle>
            <CardDescription>Subscriber age distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={demographicData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="ageGroup" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2 text-green-600" />
              Geographic Distribution
            </CardTitle>
            <CardDescription>Top subscriber locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {locationData.map((location, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm font-medium text-black">{location.country}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${location.percentage}%` }} />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {location.subscribers.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 w-12 text-right">{location.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Churn Analysis */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserMinus className="h-5 w-5 mr-2 text-red-600" />
            Churn Analysis
          </CardTitle>
          <CardDescription>Why subscribers are leaving</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={churnAnalysis} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#666" />
              <YAxis dataKey="reason" type="category" stroke="#666" width={120} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar dataKey="count" fill="#EF4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
