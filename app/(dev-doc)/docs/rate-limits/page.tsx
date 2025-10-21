"use client"

import { AlertCircle, TrendingUp } from "lucide-react"

export default function RateLimitsPage() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-balance">Rate Limits</h1>
        <p className="text-lg text-muted-foreground">
          Understand DropAphi's rate limiting policies to ensure your application runs smoothly.
        </p>
      </div>

      {/* Rate Limit Tiers */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Rate Limit Tiers</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: "Trial",
              requests: "100",
              period: "per hour",
              color: "bg-blue-50 border-blue-200",
              icon: "🔵",
            },
            {
              name: "Pro",
              requests: "10,000",
              period: "per hour",
              color: "bg-yellow-50 border-yellow-200",
              icon: "⭐",
            },
            {
              name: "Enterprise",
              requests: "Unlimited",
              period: "custom limits",
              color: "bg-red-50 border-red-200",
              icon: "🚀",
            },
          ].map((tier) => (
            <div key={tier.name} className={`p-6 rounded-lg border-2 ${tier.color}`}>
              <div className="text-3xl mb-3">{tier.icon}</div>
              <h3 className="font-bold text-lg mb-2">{tier.name}</h3>
              <p className="text-2xl font-bold text-black mb-1">{tier.requests}</p>
              <p className="text-sm text-muted-foreground">{tier.period}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rate Limit Headers */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Rate Limit Headers</h2>
        <p className="text-muted-foreground">
          Every API response includes rate limit information in the response headers:
        </p>
        <div className="p-4 rounded-lg bg-primary text-primary-foreground font-mono text-sm overflow-x-auto">
          <pre>{`X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9999
X-RateLimit-Reset: 1634567890`}</pre>
        </div>
      </div>

      {/* Best Practices */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Best Practices</h2>
        <div className="space-y-3">
          {[
            "Monitor the X-RateLimit-Remaining header to track your usage",
            "Implement exponential backoff when you receive 429 responses",
            "Cache responses when possible to reduce API calls",
            "Use batch endpoints for bulk operations",
            "Contact support for higher rate limits if needed",
          ].map((practice, idx) => (
            <div key={idx} className="flex gap-3 p-4 rounded-lg bg-secondary">
              <TrendingUp className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-sm">{practice}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quota Reset */}
      <div className="p-6 rounded-lg border-2 border-yellow-200 bg-yellow-50">
        <div className="flex gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-black mb-2">Quota Reset</h3>
            <p className="text-sm text-muted-foreground">
              Rate limits reset every hour at the top of the hour (UTC). Your remaining quota is shown in the
              X-RateLimit-Reset header.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
