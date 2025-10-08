"use client"

import { motion, useInView, Variants } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import { BarChart3, TrendingUp, Eye, MousePointer, Users, Target, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function EmailAnalytics() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  }

  const analyticsMetrics = [
    {
      icon: Eye,
      title: "Open Rate Tracking",
      description: "Track when and how often your emails are opened",
      value: "24.7%",
      trend: "+2.3%",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: MousePointer,
      title: "Click Rate Analysis",
      description: "Monitor link clicks and engagement patterns",
      value: "3.8%",
      trend: "+0.8%",
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      icon: Users,
      title: "Subscriber Growth",
      description: "Track subscriber acquisition and churn rates",
      value: "1,247",
      trend: "+12.5%",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      icon: Target,
      title: "Conversion Tracking",
      description: "Measure campaign ROI and goal completions",
      value: "8.2%",
      trend: "+1.4%",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
  ]

  const analyticsFeatures = [
    "Real-time performance tracking",
    "Geographic engagement data",
    "Device and client analytics",
    "A/B testing results",
    "Automated reporting",
    "Custom dashboard creation",
    "Export and API access",
    "Predictive insights",
  ]

  return (
    <section className="py-16 md:py-24 bg-white relative">
      <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-purple-50 to-transparent opacity-50"></div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-12 md:mb-16">
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 mb-4">Email Analytics</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 font-heading">
              Advanced Email Analytics & Insights
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Get detailed insights into your email performance with comprehensive analytics including open rates, click
              rates, subscriber behavior, and conversion tracking.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <motion.div variants={itemVariants}>
              <div className="relative">
                <Image
                  src="/placeholder.svg?height=500&width=600&text=Analytics+Dashboard"
                  width={600}
                  height={500}
                  alt="Email Analytics Dashboard"
                  className="rounded-xl shadow-2xl w-full h-auto border border-neutral-200"
                />
                <div className="absolute -top-4 -right-4 bg-purple-500 text-white p-3 rounded-full">
                  <BarChart3 className="h-6 w-6" />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-4">Data-Driven Email Marketing</h3>
                <p className="text-neutral-600 mb-6">
                  Make informed decisions with comprehensive analytics that show exactly how your emails are performing
                  and where you can improve.
                </p>
              </div>

              <div className="grid gap-4">
                {analyticsFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="bg-purple-500 w-2 h-2 rounded-full shrink-0"></div>
                    <span className="text-neutral-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="h-5 w-5 text-purple-500" />
                  <span className="font-semibold text-neutral-900">Real-time Tracking</span>
                </div>
                <p className="text-sm text-neutral-600">
                  See your email performance update in real-time as subscribers open, click, and engage with your
                  content.
                </p>
              </div>

              <Button className="bg-purple-500 hover:bg-purple-600 text-white">View Analytics Demo</Button>
            </motion.div>
          </div>

          {/* Analytics Metrics */}
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-bold text-center mb-12">Key Performance Metrics</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {analyticsMetrics.map((metric, index) => (
                <div key={index} className={`${metric.bgColor} p-6 rounded-xl border border-neutral-200`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${metric.bgColor} p-3 rounded-lg`}>
                      <metric.icon className={`h-6 w-6 ${metric.color}`} />
                    </div>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      <span>{metric.trend}</span>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
                    <h4 className="font-semibold text-neutral-900">{metric.title}</h4>
                  </div>
                  <p className="text-sm text-neutral-600">{metric.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Additional Analytics Features */}
          <motion.div variants={itemVariants} className="mt-16 text-center">
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-4">Advanced Reporting Features</h3>
              <p className="text-neutral-600 mb-6 max-w-2xl mx-auto">
                Export detailed reports, set up automated insights, and integrate with your favorite analytics tools for
                comprehensive email marketing analysis.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-purple-500 hover:bg-purple-600 text-white">Start Free Trial</Button>
                <Button
                  variant="outline"
                  className="border-purple-300 text-purple-600 hover:bg-purple-50 bg-transparent"
                >
                  View Sample Report
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
