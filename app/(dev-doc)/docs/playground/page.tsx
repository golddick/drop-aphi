"use client"

import { useState } from "react"
import { Play, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PlaygroundPage() {
  const [code, setCode] = useState(`// DropAphi API Playground
const client = new DropAphi({
  apiKey: 'sk_live_demo'
})

// Add a subscriber
const subscriber = await client.newsletter.addSubscriber({
  email: 'user@example.com',
  name: 'John Doe',
  tags: ['premium']
})

console.log(subscriber)`)

  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const runCode = async () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setResponse(
        JSON.stringify(
          {
            success: true,
            data: {
              id: "sub_123456",
              email: "user@example.com",
              name: "John Doe",
              tags: ["premium"],
              createdAt: "2024-01-15T10:30:00Z",
            },
          },
          null,
          2,
        ),
      )
      setLoading(false)
    }, 1000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Code Playground</h1>
        <p className="text-lg text-muted-foreground">Test API calls in real-time with our interactive playground.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Code Editor */}
        <div className="space-y-4">
          <h2 className="font-semibold">Code</h2>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-96 p-4 rounded-lg bg-primary text-primary-foreground font-mono text-sm border border-border resize-none"
          />
          <Button onClick={runCode} disabled={loading} className="w-full bg-accent hover:bg-accent/90">
            <Play size={16} className="mr-2" />
            {loading ? "Running..." : "Run Code"}
          </Button>
        </div>

        {/* Response */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Response</h2>
            {response && (
              <Button onClick={() => copyToClipboard(response)} variant="ghost" size="sm">
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            )}
          </div>
          <pre className="w-full h-96 p-4 rounded-lg bg-secondary border border-border font-mono text-sm overflow-auto">
            {response || "// Response will appear here"}
          </pre>
        </div>
      </div>

      {/* Templates */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Quick Templates</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              title: "Add Subscriber",
              code: `client.newsletter.addSubscriber({
  email: 'user@example.com',
  name: 'John Doe'
})`,
            },
            {
              title: "Send Campaign",
              code: `client.newsletter.sendCampaign({
  subject: 'Hello World',
  content: 'Welcome to DropAphi',
  recipients: ['user@example.com']
})`,
            },
            {
              title: "Send OTP",
              code: `client.otp.send({
  phone: '+1234567890',
  message: 'Your OTP is {otp}'
})`,
            },
            {
              title: "Get Blog Post",
              code: `client.blog.getPost({
  id: 'post_123',
  includeComments: true
})`,
            },
          ].map((template, i) => (
            <button
              key={i}
              onClick={() => setCode(template.code)}
              className="p-4 rounded-lg border border-border bg-card hover:bg-secondary transition text-left"
            >
              <h3 className="font-semibold mb-2">{template.title}</h3>
              <code className="text-xs text-muted-foreground font-mono">{template.code.split("\n")[0]}...</code>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
