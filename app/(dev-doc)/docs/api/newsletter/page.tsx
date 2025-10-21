"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NewsletterAPIPage() {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("curl")

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const endpoints = [
    {
      method: "POST",
      path: "/subscribers",
      description: "Add a new subscriber",
      params: ["email", "name", "tags"],
    },
    {
      method: "GET",
      path: "/subscribers/{id}",
      description: "Fetch subscriber details",
      params: ["id"],
    },
    {
      method: "POST",
      path: "/campaigns",
      description: "Create and send a campaign",
      params: ["subject", "content", "recipients"],
    },
    {
      method: "PUT",
      path: "/subscribers/{id}",
      description: "Update subscriber information",
      params: ["id", "email", "name"],
    },
  ]

  const codeExamples = {
    curl: `curl -X POST https://api.dropaphi.com/v1/subscribers \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "tags": ["premium", "active"]
  }'`,
    javascript: `const response = await fetch('https://api.dropaphi.com/v1/subscribers', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe',
    tags: ['premium', 'active']
  })
})`,
    python: `import requests

response = requests.post(
    'https://api.dropaphi.com/v1/subscribers',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    json={
        'email': 'user@example.com',
        'name': 'John Doe',
        'tags': ['premium', 'active']
    }
)`,
  }

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-4">Newsletter API</h1>
        <p className="text-lg text-muted-foreground">Manage subscribers and send newsletters programmatically.</p>
      </div>

      {/* Base URL */}
      <div className="p-6 rounded-lg border border-border bg-card">
        <h3 className="font-semibold mb-2">Base URL</h3>
        <code className="text-sm bg-secondary p-2 rounded">https://api.dropaphi.com/v1/newsletter</code>
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
        <h2 className="text-2xl font-bold">Add Subscriber Example</h2>
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
    "id": "sub_123456",
    "email": "user@example.com",
    "name": "John Doe",
    "tags": ["premium", "active"],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}`}</pre>
        </div>
      </div>

      {/* Error Codes */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Error Codes</h2>
        <div className="space-y-2">
          {[
            { code: 400, message: "Bad Request - Invalid parameters" },
            { code: 401, message: "Unauthorized - Invalid API key" },
            { code: 429, message: "Too Many Requests - Rate limit exceeded" },
            { code: 500, message: "Internal Server Error" },
          ].map((error) => (
            <div key={error.code} className="flex items-center gap-4 p-3 rounded-lg bg-secondary">
              <span className="font-mono font-semibold text-red">{error.code}</span>
              <span className="text-sm">{error.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
