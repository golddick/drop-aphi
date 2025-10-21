"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function WebhooksPage() {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const webhookEvents = [
    {
      event: "subscriber.created",
      description: "Triggered when a new subscriber is added",
      payload: {
        id: "sub_123456",
        email: "user@example.com",
        createdAt: "2024-01-15T10:30:00Z",
      },
    },
    {
      event: "campaign.sent",
      description: "Triggered when a campaign is successfully sent",
      payload: {
        campaignId: "camp_123456",
        recipientCount: 1000,
        sentAt: "2024-01-15T10:30:00Z",
      },
    },
    {
      event: "otp.verified",
      description: "Triggered when an OTP is successfully verified",
      payload: {
        phone: "+1234567890",
        verifiedAt: "2024-01-15T10:30:00Z",
      },
    },
  ]

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-4">Webhooks</h1>
        <p className="text-lg text-muted-foreground">
          Receive real-time notifications about events in your DropAphi account.
        </p>
      </div>

      {/* Setup Instructions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Setup Webhooks</h2>
        <div className="space-y-3">
          {[
            "Go to your DropAphi dashboard",
            "Navigate to Settings → Webhooks",
            "Click 'Add Webhook' and enter your endpoint URL",
            "Select the events you want to receive",
            "Save and test your webhook",
          ].map((step, i) => (
            <div key={i} className="flex gap-3 p-4 rounded-lg bg-secondary">
              <div className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                {i + 1}
              </div>
              <p className="text-sm">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Webhook Events */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Webhook Events</h2>
        <div className="space-y-4">
          {webhookEvents.map((webhook, i) => (
            <div key={i} className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-semibold mb-2">{webhook.event}</h3>
              <p className="text-sm text-muted-foreground mb-4">{webhook.description}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Payload</span>
                  <Button
                    onClick={() => copyToClipboard(JSON.stringify(webhook.payload, null, 2))}
                    variant="ghost"
                    size="sm"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </Button>
                </div>
                <pre className="p-4 rounded-lg bg-primary text-primary-foreground font-mono text-sm overflow-x-auto">
                  {JSON.stringify(webhook.payload, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Webhook Handler Example */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Webhook Handler Example</h2>
        <div className="p-4 rounded-lg bg-primary text-primary-foreground font-mono text-sm overflow-x-auto">
          <pre>{`// Next.js API Route: /api/webhooks/dropaphi
export async function POST(req) {
  const event = req.body
  
  // Verify webhook signature
  const signature = req.headers['x-dropaphi-signature']
  if (!verifySignature(event, signature)) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // Handle different events
  switch (event.type) {
    case 'subscriber.created':
      await handleSubscriberCreated(event.data)
      break
    case 'campaign.sent':
      await handleCampaignSent(event.data)
      break
    default:
      console.log('Unknown event:', event.type)
  }
  
  return new Response('OK', { status: 200 })
}`}</pre>
        </div>
      </div>

      {/* Security */}
      <div className="p-6 rounded-lg border border-gold bg-card">
        <h3 className="font-semibold mb-3 text-gold">Security Best Practices</h3>
        <ul className="space-y-2 text-sm">
          <li>• Always verify webhook signatures before processing</li>
          <li>• Use HTTPS for your webhook endpoint</li>
          <li>• Implement idempotency to handle duplicate events</li>
          <li>• Return a 2xx status code quickly, then process asynchronously</li>
          <li>• Log all webhook events for debugging</li>
        </ul>
      </div>
    </div>
  )
}
