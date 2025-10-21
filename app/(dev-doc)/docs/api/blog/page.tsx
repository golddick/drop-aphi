"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function BlogAPIPage() {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("curl")

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const endpoints = [
    {
      method: "GET",
      path: "/posts",
      description: "List all blog posts with pagination",
      params: ["page", "limit", "category"],
    },
    {
      method: "GET",
      path: "/posts/{id}",
      description: "Get a specific blog post with comments",
      params: ["id", "includeComments"],
    },
    {
      method: "POST",
      path: "/posts",
      description: "Create a new blog post",
      params: ["title", "content", "category", "tags"],
    },
    {
      method: "POST",
      path: "/posts/{id}/comments",
      description: "Add a comment to a post",
      params: ["id", "author", "content"],
    },
  ]

  const codeExamples = {
    curl: `curl -X GET "https://api.dropaphi.com/v1/blog/posts?page=1&limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    javascript: `const response = await fetch(
  'https://api.dropaphi.com/v1/blog/posts?page=1&limit=10',
  {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  }
)
const posts = await response.json()`,
    python: `import requests

response = requests.get(
    'https://api.dropaphi.com/v1/blog/posts',
    params={'page': 1, 'limit': 10},
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    }
)
posts = response.json()`,
  }

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-4">Blog API</h1>
        <p className="text-lg text-muted-foreground">
          Manage blog posts, comments, and content with our headless CMS API.
        </p>
      </div>

      {/* Base URL */}
      <div className="p-6 rounded-lg border border-border bg-card">
        <h3 className="font-semibold mb-2">Base URL</h3>
        <code className="text-sm bg-secondary p-2 rounded">https://api.dropaphi.com/v1/blog</code>
      </div>

      {/* Endpoints */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Endpoints</h2>
        <div className="space-y-3">
          {endpoints.map((endpoint, i) => (
            <div key={i} className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-4 mb-3">
                <span
                  className={`px-3 py-1 rounded text-sm font-semibold text-white ${
                    endpoint.method === "POST"
                      ? "bg-blue-600"
                      : endpoint.method === "GET"
                        ? "bg-green-600"
                        : "bg-yellow-600"
                  }`}
                >
                  {endpoint.method}
                </span>
                <div className="flex-1">
                  <code className="font-mono text-sm">{endpoint.path}</code>
                  <p className="text-sm text-muted-foreground mt-1">{endpoint.description}</p>
                </div>
              </div>
              <div className="text-sm">
                <span className="font-semibold">Parameters:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {endpoint.params.map((param) => (
                    <span key={param} className="px-2 py-1 rounded bg-secondary text-xs">
                      {param}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code Examples */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Get Posts Example</h2>
        <div className="space-y-4">
          <div className="flex gap-2 border-b border-border">
            {Object.keys(codeExamples).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                  activeTab === tab ? "border-accent text-accent" : "border-transparent text-muted-foreground"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <pre className="flex-1 p-4 rounded-lg bg-primary text-primary-foreground font-mono text-sm overflow-x-auto">
              {codeExamples[activeTab as keyof typeof codeExamples]}
            </pre>
            <Button
              onClick={() => copyToClipboard(codeExamples[activeTab as keyof typeof codeExamples])}
              variant="outline"
              size="sm"
              className="self-start"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Response Schema */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Response Schema</h2>
        <div className="p-4 rounded-lg bg-primary text-primary-foreground font-mono text-sm overflow-x-auto">
          <pre>{`{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "post_123456",
        "title": "Getting Started with DropAphi",
        "content": "...",
        "category": "tutorial",
        "tags": ["api", "guide"],
        "author": "John Doe",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z",
        "commentCount": 5
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 42
    }
  }
}`}</pre>
        </div>
      </div>

      {/* Content Fetching */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Content Fetching</h2>
        <div className="p-6 rounded-lg border border-border bg-card space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Supported Content Types</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {["Markdown", "HTML", "Plain Text", "Rich Text"].map((type) => (
                <div key={type} className="p-3 rounded-lg bg-secondary text-sm">
                  {type}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comments System */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Comments System</h2>
        <div className="p-6 rounded-lg border border-border bg-card space-y-4">
          <p className="text-sm text-muted-foreground">
            The Blog API supports nested comments with threaded replies, likes, and moderation.
          </p>
          <div className="p-4 rounded-lg bg-primary text-primary-foreground font-mono text-sm overflow-x-auto">
            <pre>{`{
  "id": "comment_123456",
  "postId": "post_123456",
  "author": "Jane Smith",
  "content": "Great article!",
  "likes": 12,
  "replies": [
    {
      "id": "comment_123457",
      "author": "John Doe",
      "content": "Thanks for reading!"
    }
  ],
  "createdAt": "2024-01-15T10:30:00Z"
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
