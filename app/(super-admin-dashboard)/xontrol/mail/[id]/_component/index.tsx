

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Download, Share } from "lucide-react"
import { getEmailAnalyticsAction } from "@/actions/superadmin/email-analytics"
import { useEmailID } from "@/lib/hooks/get.email_ID"

// Define proper TypeScript interfaces
interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface EmailData {
  id: string
  title: string
  subject: string
  createdAt: string
  sentAt?: string
  status: string
}

interface StatsData {
  totalSent: number
  openRate: number
  clickRate: number
  bounceRate: number
  deliveredCount: number
  openedCount: number
  clickedCount: number
  bounceCount: number
}

interface EngagementData {
  date: string
  opens: number
  clicks: number
  bounces: number
}

interface DeviceData {
  name: string
  value: number
  fill: string
}

interface GeoData {
  country: string
  opens: number
  clicks: number
}

interface TopLink {
  url: string
  clicks: number
  percentage: number
}

interface RecipientTimeline {
  time: string
  engaged: number
  opened: number
  clicked: number
}

interface RecipientData {
  id: string
  email: string
  opened: boolean
  clicked: boolean
  openedAt: string | null
  status: string
}

interface AnalyticsData {
  email: EmailData
  stats: StatsData
  engagementData: EngagementData[]
  deviceData: DeviceData[]
  geoData: GeoData[]
  topLinks: TopLink[]
  recipientTimeline: RecipientTimeline[]
  recipientData: RecipientData[]
}

interface DisplayStat {
  label: string
  value: string
  change: string
}

const chartConfig: ChartConfig = {
  opens: {
    label: "Opens",
    color: "#ef4444",
  },
  clicks: {
    label: "Clicks",
    color: "#f97316",
  },
  bounces: {
    label: "Bounces",
    color: "#eab308",
  },
  engaged: {
    label: "Engaged",
    color: "#ef4444",
  },
  opened: {
    label: "Opened",
    color: "#f97316",
  },
  clicked: {
    label: "Clicked",
    color: "#eab308",
  },
}



export default function EmailAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const emailId = useEmailID()

  console.log(emailId, 'email ')
  useEffect(() => {
    fetchAnalyticsData()
  }, [emailId])

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await getEmailAnalyticsAction(emailId)
      
      if (result.success && result.data) {
        setAnalyticsData(result.data)
      } else {
        setError(result.message || "Failed to load analytics data")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load analytics data"
      setError(errorMessage)
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="w-full space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/xontrol/mail">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Loading Analytics...</h1>
                <p className="text-muted-foreground">Campaign ID: {emailId}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading analytics data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="w-full space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/xontrol/mail">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Error</h1>
                <p className="text-muted-foreground">Email ID: {emailId}</p>
              </div>
            </div>
          </div>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchAnalyticsData}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="w-full space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/xontrol/mail">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">No Data Found</h1>
                <p className="text-muted-foreground">Email ID: {emailId}</p>
              </div>
            </div>
          </div>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No analytics data available for this email.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const { email, stats, engagementData, deviceData, geoData, topLinks, recipientTimeline, recipientData } = analyticsData

  const displayStats: DisplayStat[] = [
    { label: "Total Sent", value: stats.totalSent.toLocaleString(), change: "+12%" },
    { label: "Open Rate", value: `${stats.openRate}%`, change: "+5.2%" },
    { label: "Click Rate", value: `${stats.clickRate}%`, change: "+3.1%" },
    { label: "Bounce Rate", value: `${stats.bounceRate}%`, change: "-0.8%" },
  ]

  console.log(stats, 'stats')

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="w-full space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/xontrol/mail">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{email.title}</h1>
              <p className="text-muted-foreground">{email.subject} • ID: {email.id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayStats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <span className="text-xs text-green-600">{stat.change}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <Tabs defaultValue="engagement" className="space-y-4">
          <TabsList>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            {/* <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="geography">Geography</TabsTrigger> */}
            <TabsTrigger value="links">Top Links</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="recipients">Recipients</TabsTrigger>
          </TabsList>

          {/* Engagement Chart */}
          <TabsContent value="engagement">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Over Time</CardTitle>
                <CardDescription>Opens, clicks, and bounces by day</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Line type="monotone" dataKey="opens" stroke="var(--color-opens)" strokeWidth={2} />
                      <Line type="monotone" dataKey="clicks" stroke="var(--color-clicks)" strokeWidth={2} />
                      <Line type="monotone" dataKey="bounces" stroke="var(--color-bounces)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Device Breakdown */}
          {/* <TabsContent value="devices">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Device Distribution</CardTitle>
                  <CardDescription>Opens by device type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deviceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }: { name: string; value: number }) => `${name}: ${value}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {deviceData.map((entry: DeviceData, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Device Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {deviceData.map((device: DeviceData) => (
                    <div key={device.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: device.fill }} />
                        <span className="text-sm font-medium">{device.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{device.value}%</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent> */}

          {/* Geographic Distribution */}
          {/* <TabsContent value="geography">
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Opens and clicks by country</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={geoData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="country" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="opens" fill="#ef4444" />
                      <Bar dataKey="clicks" fill="#f97316" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent> */}

          {/* Top Links */}
          <TabsContent value="links">
            <Card>
              <CardHeader>
                <CardTitle>Top Clicked Links</CardTitle>
                <CardDescription>Most engaged links in your email</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topLinks.map((link: TopLink, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-accent hover:underline truncate"
                        >
                          {link.url}
                        </a>
                        <span className="text-sm font-medium">{link.clicks} clicks</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-accent h-2 rounded-full" style={{ width: `${link.percentage}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground">{link.percentage}% of total clicks</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recipient Timeline */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Recipient Engagement Timeline</CardTitle>
                <CardDescription>When recipients engaged with your email</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={recipientTimeline}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Line type="monotone" dataKey="engaged" stroke="#ef4444" strokeWidth={2} />
                      <Line type="monotone" dataKey="opened" stroke="#f97316" strokeWidth={2} />
                      <Line type="monotone" dataKey="clicked" stroke="#eab308" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recipients Tab */}
          <TabsContent value="recipients">
            <Card>
              <CardHeader>
                <CardTitle>Email Recipients</CardTitle>
                <CardDescription>Detailed recipient engagement status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Email Address</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Opened</th>
                        <th className="text-left py-3 px-4 font-semibold">Clicked</th>
                        <th className="text-left py-3 px-4 font-semibold">Opened At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipientData.map((recipient: RecipientData) => (
                        <tr key={recipient.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">{recipient.email}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                recipient.opened ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {recipient.opened ? "Opened" : "Not Opened"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="flex items-center gap-1">
                              {recipient.opened ? (
                                <span className="w-2 h-2 bg-green-500 rounded-full" />
                              ) : (
                                <span className="w-2 h-2 bg-gray-300 rounded-full" />
                              )}
                              {recipient.opened ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="flex items-center gap-1">
                              {recipient.clicked ? (
                                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                              ) : (
                                <span className="w-2 h-2 bg-gray-300 rounded-full" />
                              )}
                              {recipient.clicked ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{recipient.openedAt || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}