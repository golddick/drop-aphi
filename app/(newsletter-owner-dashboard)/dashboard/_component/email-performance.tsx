"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import { Mail, TrendingUp, Eye, MousePointer, Target, AlertTriangle } from "lucide-react"

interface EmailPerformanceProps {
  timeRange: string
}

export function EmailPerformance({ timeRange }: EmailPerformanceProps) {
  const performanceTrends = [
    { name: "Week 1", sent: 4500, delivered: 4410, opened: 1260, clicked: 189, bounced: 90, unsubscribed: 12 },
    { name: "Week 2", sent: 5200, delivered: 5096, opened: 1508, clicked: 234, bounced: 104, unsubscribed: 15 },
    { name: "Week 3", sent: 4800, delivered: 4704, opened: 1392, clicked: 201, bounced: 96, unsubscribed: 18 },
    { name: "Week 4", sent: 5800, delivered: 5684, opened: 1740, clicked: 278, bounced: 116, unsubscribed: 21 },
  ]

  const deliverabilityData = [
    { name: "Jan", deliveryRate: 98.2, bounceRate: 1.5, spamRate: 0.3 },
    { name: "Feb", deliveryRate: 97.8, bounceRate: 1.8, spamRate: 0.4 },
    { name: "Mar", deliveryRate: 98.5, bounceRate: 1.2, spamRate: 0.3 },
    { name: "Apr", deliveryRate: 98.1, bounceRate: 1.6, spamRate: 0.3 },
    { name: "May", deliveryRate: 98.7, bounceRate: 1.0, spamRate: 0.3 },
    { name: "Jun", deliveryRate: 98.3, bounceRate: 1.4, spamRate: 0.3 },
  ]

  const engagementHeatmap = [
    { hour: "6AM", monday: 12, tuesday: 15, wednesday: 18, thursday: 22, friday: 25, saturday: 8, sunday: 6 },
    { hour: "9AM", monday: 28, tuesday: 32, wednesday: 35, thursday: 38, friday: 30, saturday: 12, sunday: 10 },
    { hour: "12PM", monday: 22, tuesday: 25, wednesday: 28, thursday: 30, friday: 26, saturday: 18, sunday: 15 },
    { hour: "3PM", monday: 35, tuesday: 38, wednesday: 42, thursday: 45, friday: 40, saturday: 20, sunday: 18 },
    { hour: "6PM", monday: 18, tuesday: 20, wednesday: 22, thursday: 25, friday: 28, saturday: 22, sunday: 20 },
    { hour: "9PM", monday: 15, tuesday: 18, wednesday: 20, thursday: 22, friday: 25, saturday: 24, sunday: 22 },
  ]

  const subjectLineAnalysis = [
    { type: "Question", avgOpenRate: 32.5, count: 23, example: "Are you ready for...?" },
    { type: "Urgent", avgOpenRate: 28.7, count: 18, example: "Last chance to..." },
    { type: "Personal", avgOpenRate: 35.2, count: 15, example: "Just for you..." },
    { type: "Number", avgOpenRate: 31.8, count: 12, example: "5 tips for..." },
    { type: "How-to", avgOpenRate: 29.4, count: 19, example: "How to improve..." },
  ]

  const deviceBreakdown = [
    { device: "Mobile", opens: 3450, percentage: 62.3, avgTime: "12s" },
    { device: "Desktop", opens: 1890, percentage: 34.1, avgTime: "28s" },
    { device: "Tablet", opens: 200, percentage: 3.6, avgTime: "18s" },
  ]

  const topPerformingEmails = [
    {
      subject: "Weekly Tech Digest #47",
      sent: "2024-01-15",
      recipients: 2847,
      openRate: 42.3,
      clickRate: 8.7,
      conversions: 45,
      revenue: 1250,
    },
    {
      subject: "New Product Launch: AI Assistant",
      sent: "2024-01-14",
      recipients: 1956,
      openRate: 38.9,
      clickRate: 12.4,
      conversions: 67,
      revenue: 3200,
    },
    {
      subject: "Breaking: Major Industry Update",
      sent: "2024-01-13",
      recipients: 1203,
      openRate: 35.6,
      clickRate: 5.2,
      conversions: 23,
      revenue: 450,
    },
    {
      subject: "Tutorial: Advanced React Patterns",
      sent: "2024-01-12",
      recipients: 892,
      openRate: 48.2,
      clickRate: 15.6,
      conversions: 34,
      revenue: 890,
    },
  ]

  const poorPerformingEmails = [
    {
      subject: "Monthly Newsletter Update",
      sent: "2024-01-16",
      recipients: 2340,
      openRate: 12.4,
      clickRate: 1.8,
      conversions: 5,
      issues: ["Generic subject", "Poor timing"],
    },
    {
      subject: "Check out our blog",
      sent: "2024-01-11",
      recipients: 1567,
      openRate: 8.9,
      clickRate: 0.9,
      conversions: 2,
      issues: ["Vague CTA", "Low engagement"],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Email Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2 text-blue-600" />
              Email Performance Funnel
            </CardTitle>
            <CardDescription>Email journey from sent to conversion</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceTrends}>
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
                <Area type="monotone" dataKey="sent" stackId="1" stroke="#93C5FD" fill="#DBEAFE" name="Sent" />
                <Area
                  type="monotone"
                  dataKey="delivered"
                  stackId="2"
                  stroke="#86EFAC"
                  fill="#D1FAE5"
                  name="Delivered"
                />
                <Area type="monotone" dataKey="opened" stackId="3" stroke="#FCD34D" fill="#FEF3C7" name="Opened" />
                <Area type="monotone" dataKey="clicked" stackId="4" stroke="#F87171" fill="#FEE2E2" name="Clicked" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-green-600" />
              Deliverability Metrics
            </CardTitle>
            <CardDescription>Email delivery health over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={deliverabilityData}>
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
                <Line type="monotone" dataKey="deliveryRate" stroke="#10B981" strokeWidth={3} name="Delivery Rate %" />
                <Line type="monotone" dataKey="bounceRate" stroke="#F59E0B" strokeWidth={3} name="Bounce Rate %" />
                <Line type="monotone" dataKey="spamRate" stroke="#EF4444" strokeWidth={3} name="Spam Rate %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Subject Line & Device Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2 text-purple-600" />
              Subject Line Performance
            </CardTitle>
            <CardDescription>Open rates by subject line type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectLineAnalysis.map((type, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-black">{type.type}</h4>
                      <Badge className="bg-blue-100 text-blue-800">{type.count} emails</Badge>
                    </div>
                    <span className="text-lg font-semibold text-black">{type.avgOpenRate}%</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Example: "{type.example}"</p>
                  <Progress value={type.avgOpenRate} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MousePointer className="h-5 w-5 mr-2 text-orange-600" />
              Device Performance
            </CardTitle>
            <CardDescription>Email opens by device type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deviceBreakdown.map((device, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-black">{device.device}</h4>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">Avg Time: {device.avgTime}</span>
                        <span className="text-lg font-semibold text-black">{device.opens.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-4">
                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${device.percentage}%` }} />
                      </div>
                      <span className="text-sm text-gray-600">{device.percentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Emails */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Top Performing Emails
          </CardTitle>
          <CardDescription>Your best performing email campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformingEmails.map((email, index) => (
              <div
                key={index}
                className="flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex-1 mb-4 lg:mb-0">
                  <h4 className="font-semibold text-black mb-1">{email.subject}</h4>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span>Sent: {email.sent}</span>
                    <span>{email.recipients.toLocaleString()} recipients</span>
                    <span>Revenue: ${email.revenue.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Open Rate</p>
                    <p className="text-lg font-semibold text-green-600">{email.openRate}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Click Rate</p>
                    <p className="text-lg font-semibold text-green-600">{email.clickRate}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Conversions</p>
                    <p className="text-lg font-semibold text-green-600">{email.conversions}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Poor Performing Emails */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
            Needs Improvement
          </CardTitle>
          <CardDescription>Emails with low performance that need attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {poorPerformingEmails.map((email, index) => (
              <div
                key={index}
                className="flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex-1 mb-4 lg:mb-0">
                  <h4 className="font-semibold text-black mb-1">{email.subject}</h4>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                    <span>Sent: {email.sent}</span>
                    <span>{email.recipients.toLocaleString()} recipients</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {email.issues.map((issue, issueIndex) => (
                      <Badge key={issueIndex} className="bg-red-100 text-red-800">
                        {issue}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Open Rate</p>
                    <p className="text-lg font-semibold text-red-600">{email.openRate}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Click Rate</p>
                    <p className="text-lg font-semibold text-red-600">{email.clickRate}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Conversions</p>
                    <p className="text-lg font-semibold text-red-600">{email.conversions}</p>
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
