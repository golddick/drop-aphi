"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function JavaScriptSDKPage() {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const examples = [
    {
      title: "Installation",
      code: `npm install @dropaphi/sdk`,
    },
    {
      title: "Initialize",
      code: `import { DropAphi } from '@dropaphi/sdk'

const client = new DropAphi({
  apiKey: 'sk_live_your_api_key'
})`,
    },
    {
      title: "Newsletter API",
      code: `// Add subscriber
const subscriber = await client.newsletter.addSubscriber({
  email: 'user@example.com',
  name: 'John Doe',
  tags: ['premium']
})

// Send campaign
const campaign = await client.newsletter.sendCampaign({
  subject: 'Hello World',
  content: 'Welcome to DropAphi',
  recipients: ['user@example.com']
})`,
    },
    {
      title: "OTP API",
      code: `// Send OTP
const otp = await client.otp.send({
  phone: '+1234567890',
  message: 'Your OTP is {otp}'
})

// Verify OTP
const verified = await client.otp.verify({
  phone: '+1234567890',
  code: '123456'
})`,
    },
    {
      title: "Blog API",
      code: `// Get posts
const posts = await client.blog.getPosts({
  page: 1,
  limit: 10
})

// Get single post
const post = await client.blog.getPost({
  id: 'post_123456',
  includeComments: true
})`,
    },
  ]

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-4">JavaScript SDK</h1>
        <p className="text-lg text-muted-foreground">Official JavaScript/TypeScript SDK for DropAphi APIs.</p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-2 gap-4">
        {[
          "Full TypeScript support",
          "Promise-based API",
          "Automatic retry logic",
          "Request/response validation",
          "Webhook signature verification",
          "Rate limit handling",
        ].map((feature, i) => (
          <div key={i} className="flex gap-3 p-4 rounded-lg bg-secondary">
            <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center flex-shrink-0 text-xs text-accent-foreground">
              ✓
            </div>
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </div>

      {/* Code Examples */}
      <div className="space-y-4">
        {examples.map((example, i) => (
          <div key={i} className="space-y-2">
            <h3 className="font-semibold">{example.title}</h3>
            <div className="flex gap-2">
              <pre className="flex-1 p-4 rounded-lg bg-primary text-primary-foreground font-mono text-sm overflow-x-auto">
                {example.code}
              </pre>
              <Button onClick={() => copyToClipboard(example.code)} variant="outline" size="sm" className="self-start">
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Error Handling */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Error Handling</h2>
        <div className="p-4 rounded-lg bg-primary text-primary-foreground font-mono text-sm overflow-x-auto">
          <pre>{`try {
  const subscriber = await client.newsletter.addSubscriber({
    email: 'user@example.com'
  })
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    console.error('Invalid input:', error.message)
  } else if (error.code === 'RATE_LIMIT') {
    console.error('Rate limited, retry after:', error.retryAfter)
  } else {
    console.error('API error:', error.message)
  }
}`}</pre>
        </div>
      </div>

      {/* TypeScript Support */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">TypeScript Support</h2>
        <p className="text-muted-foreground mb-4">The SDK includes full TypeScript definitions for type safety.</p>
        <div className="p-4 rounded-lg bg-primary text-primary-foreground font-mono text-sm overflow-x-auto">
          <pre>{`import { DropAphi, Subscriber, Campaign } from '@dropaphi/sdk'

const client = new DropAphi({ apiKey: 'sk_live_...' })

const subscriber: Subscriber = await client.newsletter.addSubscriber({
  email: 'user@example.com',
  name: 'John Doe'
})

const campaign: Campaign = await client.newsletter.sendCampaign({
  subject: 'Hello',
  content: 'Welcome',
  recipients: [subscriber.email]
})`}</pre>
        </div>
      </div>
    </div>
  )
}
