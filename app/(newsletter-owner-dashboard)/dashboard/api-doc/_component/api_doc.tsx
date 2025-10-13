"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, ExternalLink, Mail, Shield, FileText } from "lucide-react"

export function ApiDocumentation() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className="relative bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-800 border-b border-neutral-700">
        <span className="text-sm text-neutral-400">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(code, id)}
          className="h-6 px-2 text-neutral-400 hover:text-white"
        >
          <Copy className="h-3 w-3" />
          {copiedCode === id ? "Copied!" : "Copy"}
        </Button>
      </div>
      <pre className="p-4 text-sm text-neutral-300 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  )

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-neutral-800 bg-neutral-900/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                <span className="text-gold-400">Xy</span>pher API Documentation
              </h1>
              <p className="text-neutral-400">
                Complete guide to integrating Newsletter, OTP Verification, and Blog APIs
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-gold-500 text-gold-400 hover:bg-gold-500/10 bg-transparent">
                <ExternalLink className="h-4 w-4 mr-2" />
                API Playground
              </Button>
              <Button className="bg-gradient-to-r from-gold-500 to-red-500 text-black hover:from-gold-400 hover:to-red-400">
                Get API Key
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-neutral-900 border border-neutral-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gold-500 data-[state=active]:text-black">
              Overview
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="data-[state=active]:bg-gold-500 data-[state=active]:text-black">
              Newsletter API
            </TabsTrigger>
            <TabsTrigger value="otp" className="data-[state=active]:bg-gold-500 data-[state=active]:text-black">
              OTP API
            </TabsTrigger>
            <TabsTrigger value="blog" className="data-[state=active]:bg-gold-500 data-[state=active]:text-black">
              Blog API
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-white">Getting Started</CardTitle>
                  <CardDescription>
                    Xypher provides three powerful APIs to handle all your communication needs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg">
                      <Mail className="h-8 w-8 text-blue-400 mb-3" />
                      <h3 className="font-semibold text-white mb-2">Newsletter API</h3>
                      <p className="text-sm text-neutral-400">
                        Manage subscribers, send newsletters, and track engagement
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg">
                      <Shield className="h-8 w-8 text-green-400 mb-3" />
                      <h3 className="font-semibold text-white mb-2">OTP Verification</h3>
                      <p className="text-sm text-neutral-400">
                        Generate and verify OTP codes with built-in email delivery
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg">
                      <FileText className="h-8 w-8 text-purple-400 mb-3" />
                      <h3 className="font-semibold text-white mb-2">Blog API</h3>
                      <p className="text-sm text-neutral-400">
                        Fetch blog content, manage likes, comments, and replies
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Authentication</h4>
                    <p className="text-neutral-400">
                      All API requests require authentication using your API key in the Authorization header:
                    </p>
                    <CodeBlock
                      language="bash"
                      id="auth-example"
                      code={`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  https://api.xypher.com/v1/endpoint`}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Base URL</h4>
                    <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
                      <code className="text-gold-400">https://api.xypher.com/v1</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Newsletter API Tab */}
          <TabsContent value="newsletter" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-400" />
                    Newsletter API
                  </CardTitle>
                  <CardDescription>Manage newsletter subscriptions and send campaigns</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Subscribe Endpoint */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-500 text-black">POST</Badge>
                      <code className="text-gold-400">/newsletter/subscribe</code>
                    </div>
                    <p className="text-neutral-400">Subscribe a user to your newsletter</p>

                    <div className="space-y-4">
                      <h5 className="font-semibold text-white">Request Body</h5>
                      <CodeBlock
                        language="json"
                        id="subscribe-request"
                        code={`{
  "email": "user@example.com",
  "name": "John Doe",
  "tags": ["developer", "api"],
  "customFields": {
    "company": "Tech Corp",
    "role": "Developer"
  }
}`}
                      />
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-semibold text-white">Response</h5>
                      <CodeBlock
                        language="json"
                        id="subscribe-response"
                        code={`{
  "success": true,
  "data": {
    "id": "sub_1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "status": "active",
    "subscribedAt": "2024-01-15T10:30:00Z",
    "tags": ["developer", "api"]
  },
  "message": "Successfully subscribed"
}`}
                      />
                    </div>
                  </div>

                  {/* Get Subscribers Endpoint */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-500 text-white">GET</Badge>
                      <code className="text-gold-400">/newsletter/subscribers</code>
                    </div>
                    <p className="text-neutral-400">Retrieve all subscribers with pagination and filtering</p>

                    <div className="space-y-4">
                      <h5 className="font-semibold text-white">Query Parameters</h5>
                      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 space-y-2">
                        <div className="flex gap-4">
                          <code className="text-gold-400">page</code>
                          <span className="text-neutral-400">Page number (default: 1)</span>
                        </div>
                        <div className="flex gap-4">
                          <code className="text-gold-400">limit</code>
                          <span className="text-neutral-400">Items per page (default: 50, max: 100)</span>
                        </div>
                        <div className="flex gap-4">
                          <code className="text-gold-400">status</code>
                          <span className="text-neutral-400">Filter by status (active, unsubscribed, bounced)</span>
                        </div>
                        <div className="flex gap-4">
                          <code className="text-gold-400">tags</code>
                          <span className="text-neutral-400">Filter by tags (comma-separated)</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-semibold text-white">Response</h5>
                      <CodeBlock
                        language="json"
                        id="subscribers-response"
                        code={`{
  "success": true,
  "data": {
    "subscribers": [
      {
        "id": "sub_1234567890",
        "email": "user@example.com",
        "name": "John Doe",
        "status": "active",
        "subscribedAt": "2024-01-15T10:30:00Z",
        "tags": ["developer", "api"],
        "customFields": {
          "company": "Tech Corp",
          "role": "Developer"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1250,
      "totalPages": 25
    }
  }
}`}
                      />
                    </div>
                  </div>

                  {/* Send Newsletter Endpoint */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-500 text-black">POST</Badge>
                      <code className="text-gold-400">/newsletter/send</code>
                    </div>
                    <p className="text-neutral-400">Send a newsletter campaign to subscribers</p>

                    <div className="space-y-4">
                      <h5 className="font-semibold text-white">Request Body</h5>
                      <CodeBlock
                        language="json"
                        id="send-request"
                        code={`{
  "subject": "Weekly Tech Updates",
  "content": {
    "html": "<h1>Hello {{name}}</h1><p>Your weekly updates...</p>",
    "text": "Hello {{name}}, Your weekly updates..."
  },
  "recipients": {
    "type": "all", // or "tags" or "specific"
    "tags": ["developer", "api"], // if type is "tags"
    "emails": ["user@example.com"] // if type is "specific"
  },
  "scheduledAt": "2024-01-16T09:00:00Z", // optional
  "trackOpens": true,
  "trackClicks": true
}`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* OTP API Tab */}
          <TabsContent value="otp" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-400" />
                    OTP Verification API
                  </CardTitle>
                  <CardDescription>
                    Generate and verify one-time passwords with automatic email delivery
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Generate OTP Endpoint */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-500 text-black">POST</Badge>
                      <code className="text-gold-400">/otp/generate</code>
                    </div>
                    <p className="text-neutral-400">Generate and send OTP to user's email</p>

                    <div className="space-y-4">
                      <h5 className="font-semibold text-white">Request Body</h5>
                      <CodeBlock
                        language="json"
                        id="otp-generate-request"
                        code={`{
  "email": "user@example.com",
  "purpose": "email_verification", // or "password_reset", "login", "custom"
  "expiryMinutes": 10, // optional, default: 10
  "length": 6, // optional, default: 6
  "template": {
    "subject": "Your verification code",
    "message": "Your OTP is: {{otp}}. Valid for {{expiry}} minutes."
  }
}`}
                      />
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-semibold text-white">Response</h5>
                      <CodeBlock
                        language="json"
                        id="otp-generate-response"
                        code={`{
  "success": true,
  "data": {
    "otpId": "otp_1234567890",
    "email": "user@example.com",
    "purpose": "email_verification",
    "expiresAt": "2024-01-15T10:40:00Z",
    "attemptsRemaining": 3
  },
  "message": "OTP sent successfully"
}`}
                      />
                    </div>
                  </div>

                  {/* Verify OTP Endpoint */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-500 text-white">POST</Badge>
                      <code className="text-gold-400">/otp/verify</code>
                    </div>
                    <p className="text-neutral-400">Verify the OTP code provided by user</p>

                    <div className="space-y-4">
                      <h5 className="font-semibold text-white">Request Body</h5>
                      <CodeBlock
                        language="json"
                        id="otp-verify-request"
                        code={`{
  "otpId": "otp_1234567890",
  "code": "123456",
  "email": "user@example.com" // optional for additional security
}`}
                      />
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-semibold text-white">Response (Success)</h5>
                      <CodeBlock
                        language="json"
                        id="otp-verify-success"
                        code={`{
  "success": true,
  "data": {
    "otpId": "otp_1234567890",
    "email": "user@example.com",
    "purpose": "email_verification",
    "verifiedAt": "2024-01-15T10:35:00Z"
  },
  "message": "OTP verified successfully"
}`}
                      />
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-semibold text-white">Response (Failed)</h5>
                      <CodeBlock
                        language="json"
                        id="otp-verify-failed"
                        code={`{
  "success": false,
  "error": {
    "code": "INVALID_OTP",
    "message": "Invalid or expired OTP",
    "attemptsRemaining": 2
  }
}`}
                      />
                    </div>
                  </div>

                  {/* Resend OTP Endpoint */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-yellow-500 text-black">POST</Badge>
                      <code className="text-gold-400">/otp/resend</code>
                    </div>
                    <p className="text-neutral-400">Resend OTP to the same email address</p>

                    <div className="space-y-4">
                      <h5 className="font-semibold text-white">Request Body</h5>
                      <CodeBlock
                        language="json"
                        id="otp-resend-request"
                        code={`{
  "otpId": "otp_1234567890"
}`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Blog API Tab */}
          <TabsContent value="blog" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-400" />
                    Blog API
                  </CardTitle>
                  <CardDescription>
                    Fetch blog content and manage interactions like likes, comments, and replies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Get Blog Posts */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-500 text-white">GET</Badge>
                      <code className="text-gold-400">/blog/posts</code>
                    </div>
                    <p className="text-neutral-400">Retrieve blog posts with pagination and filtering</p>

                    <div className="space-y-4">
                      <h5 className="font-semibold text-white">Response</h5>
                      <CodeBlock
                        language="json"
                        id="blog-posts-response"
                        code={`{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "post_1234567890",
        "title": "Getting Started with APIs",
        "slug": "getting-started-with-apis",
        "excerpt": "Learn how to integrate APIs effectively...",
        "content": "Full blog content here...",
        "author": {
          "id": "author_123",
          "name": "John Developer",
          "avatar": "https://example.com/avatar.jpg"
        },
        "publishedAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z",
        "tags": ["api", "tutorial", "development"],
        "category": "Development",
        "featuredImage": "https://example.com/featured.jpg",
        "readingTime": 5,
        "stats": {
          "views": 1250,
          "likes": 45,
          "comments": 12
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "totalPages": 15
    }
  }
}`}
                      />
                    </div>
                  </div>

                  {/* Get Single Blog Post */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-500 text-white">GET</Badge>
                      <code className="text-gold-400">/blog/posts/{"{id}"}</code>
                    </div>
                    <p className="text-neutral-400">Get a specific blog post by ID or slug</p>
                  </div>

                  {/* Like Blog Post */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-500 text-black">POST</Badge>
                      <code className="text-gold-400">/blog/posts/{"{id}"}/like</code>
                    </div>
                    <p className="text-neutral-400">Like or unlike a blog post</p>

                    <div className="space-y-4">
                      <h5 className="font-semibold text-white">Request Body</h5>
                      <CodeBlock
                        language="json"
                        id="like-request"
                        code={`{
  "userId": "user_123", // optional if using session
  "action": "like" // or "unlike"
}`}
                      />
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-semibold text-white">Response</h5>
                      <CodeBlock
                        language="json"
                        id="like-response"
                        code={`{
  "success": true,
  "data": {
    "postId": "post_1234567890",
    "liked": true,
    "totalLikes": 46
  },
  "message": "Post liked successfully"
}`}
                      />
                    </div>
                  </div>

                  {/* Get Comments */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-500 text-white">GET</Badge>
                      <code className="text-gold-400">/blog/posts/{"{id}"}/comments</code>
                    </div>
                    <p className="text-neutral-400">Get comments for a specific blog post</p>

                    <div className="space-y-4">
                      <h5 className="font-semibold text-white">Response</h5>
                      <CodeBlock
                        language="json"
                        id="comments-response"
                        code={`{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "comment_123",
        "content": "Great article! Very helpful.",
        "author": {
          "id": "user_456",
          "name": "Jane Reader",
          "avatar": "https://example.com/jane.jpg"
        },
        "createdAt": "2024-01-15T11:00:00Z",
        "updatedAt": "2024-01-15T11:00:00Z",
        "likes": 5,
        "replies": [
          {
            "id": "reply_789",
            "content": "Thanks for the feedback!",
            "author": {
              "id": "author_123",
              "name": "John Developer",
              "avatar": "https://example.com/john.jpg"
            },
            "createdAt": "2024-01-15T11:30:00Z",
            "likes": 2
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12,
      "totalPages": 1
    }
  }
}`}
                      />
                    </div>
                  </div>

                  {/* Add Comment */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-500 text-black">POST</Badge>
                      <code className="text-gold-400">/blog/posts/{"{id}"}/comments</code>
                    </div>
                    <p className="text-neutral-400">Add a new comment to a blog post</p>

                    <div className="space-y-4">
                      <h5 className="font-semibold text-white">Request Body</h5>
                      <CodeBlock
                        language="json"
                        id="comment-request"
                        code={`{
  "content": "This is a great article!",
  "author": {
    "name": "Jane Reader",
    "email": "jane@example.com",
    "website": "https://janereader.com" // optional
  }
}`}
                      />
                    </div>
                  </div>

                  {/* Add Reply */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-500 text-black">POST</Badge>
                      <code className="text-gold-400">/blog/comments/{"{commentId}"}/replies</code>
                    </div>
                    <p className="text-neutral-400">Reply to a specific comment</p>

                    <div className="space-y-4">
                      <h5 className="font-semibold text-white">Request Body</h5>
                      <CodeBlock
                        language="json"
                        id="reply-request"
                        code={`{
  "content": "Thanks for your comment!",
  "author": {
    "name": "John Developer",
    "email": "john@example.com"
  }
}`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Rate Limits and Error Codes */}
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Rate Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Free Plan</span>
                  <span className="text-white">1,000 requests/hour</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Professional</span>
                  <span className="text-white">10,000 requests/hour</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Enterprise</span>
                  <span className="text-white">Unlimited</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Common Error Codes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-red-400">400</span>
                  <span className="text-neutral-400">Bad Request</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-400">401</span>
                  <span className="text-neutral-400">Unauthorized</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-400">429</span>
                  <span className="text-neutral-400">Rate Limited</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-400">500</span>
                  <span className="text-neutral-400">Server Error</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}










