"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Mail,
  Users,
  TrendingUp,
  Clock,
  Globe,
  Eye,
  MousePointer,
  Send,
  Edit,
  Copy,
  Trash2,
  Play,
  Pause,
  Download,
  Bot,
  Zap,
} from "lucide-react"
import Link from "next/link"

// Mock email data
const mockEmailData = {
  id: 1,
  subject: "Welcome to Our Platform!",
  previewText: "Get started with your new account and explore amazing features",
  integration: { name: "WordPress Blog", logo: "🌐", id: 1 },
  campaign: "Welcome Series",
  type: "automated",
  status: "active",
  recipients: 1250,
  delivered: 1225,
  opened: 857,
  clicked: 154,
  bounced: 25,
  unsubscribed: 12,
  openRate: 68.5,
  clickRate: 12.3,
  deliveryRate: 98.2,
  bounceRate: 2.0,
  unsubscribeRate: 1.0,
  sentDate: "2024-01-15T10:30:00Z",
  fromName: "TheNews Team",
  fromEmail: "hello@thenews.com",
  replyTo: "support@thenews.com",
  content: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #000; color: #fff; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Welcome to TheNews!</h1>
      </div>
      <div style="padding: 30px 20px;">
        <h2 style="color: #333; margin-bottom: 20px;">Hello and Welcome!</h2>
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          We're thrilled to have you join our community! Your account has been successfully created, 
          and you're now ready to explore all the amazing features we have to offer.
        </p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
          <ul style="color: #666; line-height: 1.6;">
            <li>Complete your profile setup</li>
            <li>Explore our feature gallery</li>
            <li>Join our community discussions</li>
            <li>Subscribe to our newsletter</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: #EAB308; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Get Started Now
          </a>
        </div>
        <p style="color: #666; line-height: 1.6;">
          If you have any questions, don't hesitate to reach out to our support team. 
          We're here to help you make the most of your experience!
        </p>
      </div>
      <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
        <p>© 2024 TheNews. All rights reserved.</p>
        <p><a href="#" style="color: #666;">Unsubscribe</a> | <a href="#" style="color: #666;">Update Preferences</a></p>
      </div>
    </div>
  `,
  avgTimeToOpen: "2h 15m",
  peakEngagementTime: "10:30 AM",
  topCountries: [
    { country: "United States", opens: 342, percentage: 39.9 },
    { country: "United Kingdom", opens: 128, percentage: 14.9 },
    { country: "Canada", opens: 95, percentage: 11.1 },
    { country: "Australia", opens: 67, percentage: 7.8 },
    { country: "Germany", opens: 54, percentage: 6.3 },
  ],
}

interface EmailDetailsProps {
  emailId: string
}

export function EmailDetails({ emailId }: EmailDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const email = mockEmailData // In real app, fetch by emailId

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800 border-green-200",
      sent: "bg-blue-100 text-blue-800 border-blue-200",
      scheduled: "bg-yellow-100 text-yellow-800 border-yellow-200",
      draft: "bg-gray-100 text-gray-800 border-gray-200",
      paused: "bg-red-100 text-red-800 border-red-200",
    }
    return variants[status as keyof typeof variants] || variants.draft
  }

  const getTypeBadge = (type: string) => {
    return type === "automated"
      ? "bg-purple-100 text-purple-800 border-purple-200"
      : "bg-orange-100 text-orange-800 border-orange-200"
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/emails" className="mr-4">
                <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Emails
                </Button>
              </Link>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold">{email.subject}</h1>
                  <Badge className={`${getStatusBadge(email.status)}`}>
                    {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                  </Badge>
                  <Badge className={`${getTypeBadge(email.type)}`}>
                    {email.type === "automated" ? (
                      <>
                        <Bot className="w-3 h-3 mr-1" />
                        Automated
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3 mr-1" />
                        Instant
                      </>
                    )}
                  </Badge>
                </div>
                <p className="text-gray-300">{email.previewText}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="text-white border-white hover:bg-gray-800 bg-transparent">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" className="text-white border-white hover:bg-gray-800 bg-transparent">
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="preview">Email Preview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Performance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Recipients</p>
                      <p className="text-2xl font-bold text-black">{email.recipients.toLocaleString()}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Open Rate</p>
                      <p className="text-2xl font-bold text-black">{email.openRate}%</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <Eye className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Click Rate</p>
                      <p className="text-2xl font-bold text-black">{email.clickRate}%</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <MousePointer className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                      <p className="text-2xl font-bold text-black">{email.deliveryRate}%</p>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <Send className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="bg-black text-white">
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Performance Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Open Rate</span>
                      <span className="font-medium text-black">{email.openRate}%</span>
                    </div>
                    <Progress value={email.openRate} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Click Rate</span>
                      <span className="font-medium text-black">{email.clickRate}%</span>
                    </div>
                    <Progress value={email.clickRate} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Delivery Rate</span>
                      <span className="font-medium text-black">{email.deliveryRate}%</span>
                    </div>
                    <Progress value={email.deliveryRate} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Bounce Rate</span>
                      <span className="font-medium text-black">{email.bounceRate}%</span>
                    </div>
                    <Progress value={email.bounceRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-black text-white">
                  <CardTitle className="flex items-center">
                    <Mail className="w-5 h-5 mr-2" />
                    Email Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Integration</p>
                      <p className="font-medium text-black flex items-center">
                        <span className="mr-2">{email.integration.logo}</span>
                        {email.integration.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Campaign</p>
                      <p className="font-medium text-black">{email.campaign}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">From Name</p>
                      <p className="font-medium text-black">{email.fromName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">From Email</p>
                      <p className="font-medium text-black">{email.fromEmail}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Reply To</p>
                      <p className="font-medium text-black">{email.replyTo}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Sent Date</p>
                      <p className="font-medium text-black">{new Date(email.sentDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Statistics */}
            <Card>
              <CardHeader className="bg-black text-white">
                <CardTitle>Detailed Statistics</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-black">{email.recipients.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Recipients</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{email.delivered.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Delivered</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{email.opened.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Opened</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{email.clicked.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Clicked</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{email.bounced.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Bounced</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{email.unsubscribed.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Unsubscribed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader className="bg-black text-white">
                <CardTitle className="flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Email Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Email Client Mockup */}
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  {/* Email Header */}
                  <div className="bg-gray-100 p-4 border-b border-gray-300">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-black">
                          From: {email.fromName} &lt;{email.fromEmail}&gt;
                        </p>
                        <p className="text-gray-600">To: subscriber@example.com</p>
                        <p className="text-gray-600">Subject: {email.subject}</p>
                      </div>
                      <div className="text-gray-500">{new Date(email.sentDate).toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Email Content */}
                  <div className="bg-white p-4">
                    <div dangerouslySetInnerHTML={{ __html: email.content }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="bg-black text-white">
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Time Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Time to Open</span>
                    <span className="font-semibold text-black">{email.avgTimeToOpen}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Peak Engagement Time</span>
                    <span className="font-semibold text-black">{email.peakEngagementTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Engagement Duration</span>
                    <span className="font-semibold text-black">4h 32m</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-black text-white">
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Geographic Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {email.topCountries.map((country, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-black">{country.country}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{country.opens}</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-500 h-2 rounded-full"
                              style={{ width: `${country.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12">{country.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="bg-black text-white">
                  <CardTitle>Email Configuration</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Email Type</p>
                      <p className="font-medium text-black capitalize">{email.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <p className="font-medium text-black capitalize">{email.status}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tracking Opens</p>
                      <p className="font-medium text-black">Enabled</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tracking Clicks</p>
                      <p className="font-medium text-black">Enabled</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Unsubscribe Link</p>
                      <p className="font-medium text-black">Enabled</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Created Date</p>
                      <p className="font-medium text-black">{new Date(email.sentDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-black text-white">
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <Button className="w-full justify-start bg-yellow-500 hover:bg-yellow-600 text-black">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Email
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-300 hover:bg-gray-50 bg-transparent"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate Email
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-300 hover:bg-gray-50 bg-transparent"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  {email.status === "active" ? (
                    <Button
                      variant="outline"
                      className="w-full justify-start border-gray-300 hover:bg-gray-50 bg-transparent"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Pause Campaign
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full justify-start border-gray-300 hover:bg-gray-50 bg-transparent"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Activate Campaign
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50 bg-transparent"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Email
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Integration Details */}
            <Card>
              <CardHeader className="bg-black text-white">
                <CardTitle>Integration Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">{email.integration.logo}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-black">{email.integration.name}</h3>
                    <p className="text-gray-600">Campaign: {email.campaign}</p>
                    <p className="text-sm text-gray-500">Integration ID: {email.integration.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
