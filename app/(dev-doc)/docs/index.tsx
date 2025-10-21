"use client"

import { ArrowRight, Code2, Zap, Shield } from "lucide-react"
import Link from "next/link"

export default function DocsHome() {
  const quickLinks = [
    {
      icon: Zap,
      title: "Quick Start",
      description: "Get up and running in 5 minutes",
      href: "/docs/quick-start",
    },
    {
      icon: Shield,
      title: "Authentication",
      description: "Secure your API requests with JWT",
      href: "/docs/authentication",
    },
    {
      icon: Code2,
      title: "Code Examples",
      description: "Copy-paste ready code snippets",
      href: "/docs/playground",
    },
  ]

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-balance">DropAphi Developer Documentation</h1>
        <p className="text-lg text-muted-foreground">
          Build powerful communication features with our comprehensive API suite. Choose from Newsletter, OTP, and Blog
          APIs to power your application.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-6">
        {quickLinks.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group p-6 rounded-lg border border-border hover:border-accent bg-card hover:bg-secondary transition"
            >
              <Icon className="w-8 h-8 text-accent mb-3" />
              <h3 className="font-semibold mb-2">{link.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{link.description}</p>
              <div className="flex items-center text-accent text-sm font-medium group-hover:translate-x-1 transition">
                Learn more <ArrowRight size={16} className="ml-2" />
              </div>
            </Link>
          )
        })}
      </div>

      {/* API Status */}
      <div className="p-6 rounded-lg border border-border bg-card">
        <h2 className="font-semibold mb-4">API Status</h2>
        <div className="space-y-3">
          {[
            { name: "Newsletter API", status: "operational" },
            { name: "OTP API", status: "operational" },
            { name: "Blog API", status: "operational" },
          ].map((api) => (
            <div key={api.name} className="flex items-center justify-between">
              <span className="text-sm">{api.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground capitalize">{api.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code Example */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Get Started in Seconds</h2>
        <div className="p-4 rounded-lg bg-primary text-primary-foreground font-mono text-sm overflow-x-auto">
          <pre>{`// Initialize DropAphi
import { DropAphi } from '@dropaphi/sdk'

const client = new DropAphi({
  apiKey: 'your_api_key_here'
})

// Send a newsletter
await client.newsletter.send({
  subject: 'Hello World',
  content: 'Welcome to DropAphi'
})`}</pre>
        </div>
      </div>
    </div>
  )
}
