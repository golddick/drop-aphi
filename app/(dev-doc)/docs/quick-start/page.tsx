"use client"

import { useState } from "react"
import { Copy, Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button" 

export default function QuickStartPage() {
  const [copied, setCopied] = useState(false)
  const [expandedStep, setExpandedStep] = useState(0)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const steps = [
    {
      title: "Get Your API Key",
      description: "Sign up for a DropAphi account and generate your API key from the dashboard.",
      code: `// Your API key will be available in your dashboard
// It will look like:  Drop-aphi-live-xxxxxxxxxxxxxxxxxxxxxxxx`,
      action: "Go to Dashboard",
    },
    {
      title: "Install SDK",
      description: "Install the DropAphi SDK for your preferred language.",
      code: `npm install @dropaphi/sdk
# or
pip install dropaphi
# or
composer require dropaphi/sdk`,
      action: "View All SDKs",
    },
    {
      title: "Initialize Client",
      description: "Create a new DropAphi client instance with your API key.",
      code: `import { DropAphi } from '@dropaphi/sdk'

const client = new DropAphi({
  apiKey: process.env.DROPAPHI_API_KEY
})`,
      action: "View Docs",
    },
    {
      title: "Send Your First Newsletter",
      description: "Add a subscriber and send them a welcome email.",
      code: `// Add subscriber
await client.newsletter.addSubscriber({
  email: 'user@example.com',
  name: 'John Doe'
})

// Send campaign
await client.newsletter.sendCampaign({
  subject: 'Welcome!',
  content: 'Thanks for joining DropAphi',
  recipients: ['user@example.com']
})`,
      action: "Try Playground",
    },
  ]

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-4">Quick Start Guide</h1>
        <p className="text-lg text-muted-foreground">Get up and running with DropAphi in just 5 minutes.</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition ${i <= expandedStep ? "bg-accent" : "bg-secondary"}`}
          />
        ))}
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, i) => (
          <div key={i} className="rounded-lg border border-border bg-card overflow-hidden transition">
            <button
              onClick={() => setExpandedStep(expandedStep === i ? -1 : i)}
              className="w-full p-6 flex items-center justify-between hover:bg-secondary transition"
            >
              <div className="text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold text-sm">
                    {i + 1}
                  </div>
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
              <ChevronDown size={20} className={`transition ${expandedStep === i ? "rotate-180" : ""}`} />
            </button>

            {expandedStep === i && (
              <div className="px-6 pb-6 border-t border-border space-y-4">
                <div className="flex gap-2">
                  <pre className="flex-1 p-4 rounded-lg bg-primary text-primary-foreground font-mono text-sm overflow-x-auto">
                    {step.code}
                  </pre>
                  <Button onClick={() => copyToClipboard(step.code)} variant="outline" size="sm" className="self-start">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </Button>
                </div>
                <Button className="w-full bg-accent hover:bg-accent/90">{step.action}</Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Next Steps */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">What's Next?</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              title: "Explore APIs",
              description: "Learn about Newsletter, OTP, and Blog APIs",
              link: "/docs/api/newsletter",
            },
            {
              title: "Webhooks",
              description: "Set up real-time event notifications",
              link: "/docs/webhooks",
            },
            {
              title: "Code Playground",
              description: "Test API calls interactively",
              link: "/docs/playground",
            },
          ].map((item, i) => (
            <a
              key={i}
              href={item.link}
              className="p-4 rounded-lg border border-border bg-card hover:bg-secondary transition"
            >
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Security Notice */}
      <div className="p-4 rounded-lg border border-amber-500 bg-amber-50 dark:bg-amber-950/20">
        <h3 className="font-semibold mb-2 text-amber-700 dark:text-amber-400">Security Best Practices</h3>
        <ul className="text-sm space-y-1 text-amber-600 dark:text-amber-300">
          <li>• Never commit API keys to version control</li>
          <li>• Use environment variables for all secrets</li>
          <li>• Rotate your API keys regularly</li>
          <li>• Use the test mode keys for development</li>
        </ul>
      </div>

      {/* Common Issues */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Common Issues</h2>
        <div className="space-y-3">
          {[
            {
              issue: "401 Unauthorized",
              solution: "Check that your API key is correct and included in the Authorization header.",
            },
            {
              issue: "429 Too Many Requests",
              solution: "You've exceeded the rate limit. Implement exponential backoff in your client.",
            },
            {
              issue: "Invalid Email Format",
              solution: "Ensure email addresses are valid. Use a validation library if needed.",
            },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-lg bg-secondary">
              <h4 className="font-semibold text-red mb-2">{item.issue}</h4>
              <p className="text-sm">{item.solution}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Support */}
      <div className="p-6 rounded-lg border border-gold bg-card">
        <h3 className="font-semibold mb-2 text-gold">Need Help?</h3>
        <p className="text-sm mb-4">Check our documentation, join our community forum, or contact support.</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Documentation
          </Button>
          <Button variant="outline" size="sm">
            Community
          </Button>
          <Button variant="outline" size="sm">
            Support
          </Button>
        </div>
      </div>
    </div>
  )
}