"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Mail, Zap, Users, BarChart3, Code2, Shield, Globe, Lock, CheckCircle } from "lucide-react"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  features: string[]
  delay: number
}

function FeatureCard({ icon, title, description, features, delay }: FeatureCardProps) {
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
      className={`p-8 border-2 border-gray-200 rounded-xl hover:border-yellow-600 hover:shadow-xl transition-all duration-300 bg-white ${
        isVisible ? "animate-slide-in-up" : "opacity-0"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-red-100 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-black mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <ul className="space-y-3">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-black mb-4">Powerful Features for Everyone</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to build, write, and connect with your audience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Mail className="w-7 h-7 text-yellow-600" />}
            title="Newsletter Platform"
            description="Create beautiful newsletters effortlessly"
            features={["Drag-and-drop editor", "Subscriber management", "Real-time analytics", "Custom templates"]}
            delay={0}
          />
          <FeatureCard
            icon={<Shield className="w-7 h-7 text-red-600" />}
            title="OTP API"
            description="Secure authentication made simple"
            features={["Instant delivery", "Rate limiting", "Custom templates", "Security built-in"]}
            delay={100}
          />
          {/* <FeatureCard
            icon={<Users className="w-7 h-7 text-yellow-600" />}
            title="Subscriber Management"
            description="Centralized contact management"
            features={["Segmentation", "Preferences", "Automation", "Compliance tools"]}
            delay={200}
          /> */}
          <FeatureCard
            icon={<BarChart3 className="w-7 h-7 text-red-600" />}
            title="Analytics Dashboard"
            description="Real-time insights and metrics"
            features={["Open rates", "Click tracking", "Engagement metrics", "Custom reports"]}
            delay={300}
          />
          <FeatureCard
            icon={<Code2 className="w-7 h-7 text-yellow-600" />}
            title="Developer APIs"
            description="Powerful REST APIs for integration"
            features={["Well-documented", "SDKs available", "Webhooks", "Rate limiting"]}
            delay={400}
          />
          {/* <FeatureCard
            icon={<Globe className="w-7 h-7 text-red-600" />}
            title="Global CDN"
            description="Lightning-fast delivery worldwide"
            features={["150+ edge locations", "Sub-second latency", "Auto-scaling", "99.99% uptime"]}
            delay={500}
          /> */}
          {/* <FeatureCard
            icon={<Lock className="w-7 h-7 text-yellow-600" />}
            title="Enterprise Security"
            description="Bank-level security standards"
            features={["SOC 2 compliant", "End-to-end encryption", "GDPR ready", "Regular audits"]}
            delay={600}
          /> */}
          {/* <FeatureCard
            icon={<Zap className="w-7 h-7 text-red-600" />}
            title="Automation Workflows"
            description="Trigger-based actions and campaigns"
            features={["Visual builder", "A/B testing", "Conditional logic", "Performance tracking"]}
            delay={700}
          /> */}
        </div>
      </div>
    </section>
  )
}
