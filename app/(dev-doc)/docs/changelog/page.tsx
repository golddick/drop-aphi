"use client"

import { Calendar, Plus, Zap, Bug, AlertCircle } from "lucide-react"

export default function ChangelogPage() {
  const releases = [
    {
      version: "2.5.0",
      date: "Oct 15, 2025",
      type: "feature",
      icon: Plus,
      changes: [
        "Added SMS API support for OTP delivery",
        "Implemented webhook retry mechanism with exponential backoff",
        "Added batch operations for newsletter subscribers",
        "New analytics dashboard with real-time metrics",
      ],
    },
    {
      version: "2.4.2",
      date: "Oct 10, 2025",
      type: "bugfix",
      icon: Bug,
      changes: [
        "Fixed email template rendering issue on mobile devices",
        "Corrected rate limit calculation for trial keys",
        "Resolved webhook signature verification bug",
        "Fixed timezone handling in scheduled campaigns",
      ],
    },
    {
      version: "2.4.1",
      date: "Oct 5, 2025",
      type: "feature",
      icon: Zap,
      changes: [
        "Improved API response times by 40%",
        "Added support for custom email headers",
        "Enhanced error messages with actionable suggestions",
        "New JavaScript SDK with TypeScript support",
      ],
    },
    {
      version: "2.4.0",
      date: "Sep 28, 2025",
      type: "feature",
      icon: Plus,
      changes: [
        "Launched Blog API with nested comments support",
        "Added featured posts functionality",
        "Implemented content moderation system",
        "New dashboard for content creators",
      ],
    },
    {
      version: "2.3.0",
      date: "Sep 15, 2025",
      type: "feature",
      icon: Plus,
      changes: [
        "Released OTP API with email delivery",
        "Added API key management dashboard",
        "Implemented trial key system (14-day expiry)",
        "New authentication documentation",
      ],
    },
  ]

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-balance">Changelog</h1>
        <p className="text-lg text-muted-foreground">
          Track all updates, features, and improvements to the DropAphi platform.
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {releases.map((release, idx) => {
          const Icon = release.icon
          const isFeature = release.type === "feature"
          const isBugfix = release.type === "bugfix"

          return (
            <div key={release.version} className="relative">
              {/* Timeline line */}
              {idx !== releases.length - 1 && <div className="absolute left-6 top-16 w-0.5 h-24 bg-border" />}

              <div className="flex gap-6">
                {/* Timeline dot */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isFeature
                      ? "bg-yellow-100 text-yellow-600"
                      : isBugfix
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="flex-1 p-6 rounded-lg border-2 border-border hover:border-accent transition">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold">v{release.version}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {release.date}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        isFeature
                          ? "bg-yellow-100 text-yellow-700"
                          : isBugfix
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {release.type === "feature" ? "Feature" : release.type === "bugfix" ? "Bug Fix" : "Update"}
                    </span>
                  </div>

                  <ul className="space-y-2">
                    {release.changes.map((change, changeIdx) => (
                      <li key={changeIdx} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="text-accent font-bold">•</span>
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Upcoming */}
      <div className="p-6 rounded-lg border-2 border-blue-200 bg-blue-50">
        <div className="flex gap-3">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-black mb-2">Coming Soon</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• WhatsApp API for OTP delivery</li>
              <li>• Advanced automation workflows</li>
              <li>• AI-powered content recommendations</li>
              <li>• Enhanced analytics with predictive insights</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
