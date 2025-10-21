"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Mail, Shield, Code, CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"  

interface APIShowcaseItemProps {
  icon: React.ReactNode
  title: string
  description: string
  features: string[]
  codeSnippet: string
  codeLabel: string
  delay: number
  reversed?: boolean
}

function APIShowcaseItem({
  icon,
  title,
  description,
  features,
  codeSnippet,
  codeLabel,
  delay,
  reversed,
}: APIShowcaseItemProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`grid lg:grid-cols-2 gap-12 items-center mb-20 ${isVisible ? "animate-slide-in-up" : "opacity-0"}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={reversed ? "order-2 lg:order-1" : "order-1"}>
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-yellow-100 to-red-100 rounded-xl">{icon}</div>
          <h3 className="text-3xl font-bold text-black">{title}</h3>
        </div>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">{description}</p>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
        <Button className="bg-red-600 text-white hover:bg-black  flex items-center gap-2">
          Explore API <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <div className={reversed ? "order-1 lg:order-2" : "order-2"}>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 overflow-hidden">
          <div className="text-sm text-gray-400 mb-4 font-mono">{codeLabel}</div>
          <pre className="text-sm text-gray-300 overflow-x-auto font-mono leading-relaxed">
            <code>{codeSnippet}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}

export default function APIShowcase() {
  return (
    <section id="api" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-black mb-4">
            <span className="text-black">Three Powerful APIs,</span>{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-red-600">
              Endless Possibilities
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to build, send, and manage email communications at scale
          </p>
        </div>

        <APIShowcaseItem
          icon={<Mail className="w-8 h-8 text-yellow-600" />}
          title="Newsletter & Email Builder API"
          description="Create stunning newsletters with our drag-and-drop builder or use our REST API to send programmatic emails. Complete subscriber management, analytics, and templates included."
          features={["Drag & Drop Builder", "Custom Templates", "Subscriber Management", "Analytics & Tracking"]}
          codeLabel="POST /api/v1/newsletters/send"
          codeSnippet={`{
  "to": ["user@example.com"],
  "template": "welcome-series",
  "data": {
    "name": "John Doe",
    "company": "Acme Corp"
  },
  "tracking": true,
  "schedule": "2024-01-15T10:00:00Z"
}`}
          delay={0}
        />

        <APIShowcaseItem
          icon={<Shield className="w-8 h-8 text-red-600" />}
          title="OTP Verification API"
          description="Secure user authentication with one-time passwords. No SMTP configuration needed - we handle delivery, rate limiting, and security automatically."
          features={["Instant Delivery", "Rate Limiting", "Custom Templates", "Security Built-in"]}
          codeLabel="POST /api/v1/otp/send & verify"
          codeSnippet={`// Send OTP
{
  "email": "user@example.com",
  "type": "login",
  "length": 6,
  "expiry": 300
}

// Verify OTP
{
  "email": "user@example.com",
  "code": "123456"
}`}
          delay={100}
          reversed
        />

        <APIShowcaseItem
          icon={<Code className="w-8 h-8 text-yellow-600" />}
          title="Blog Content API"
          description="Headless CMS for blog content with customizable templates. Fetch and display blog posts on any website with our flexible API and template system."
          features={["Headless CMS", "Custom Templates", "SEO Optimized", "Cross-Platform"]}
          codeLabel="GET /api/v1/blog/posts"
          codeSnippet={`{
  "posts": [
    {
      "id": "post-123",
      "title": "Getting Started with APIs",
      "content": "...",
      "template": "modern",
      "author": "Jane Doe",
      "published": "2024-01-15"
    }
  ]
}`}
          delay={200}
        />
      </div>
    </section>
  )
}
