"use client"

import { motion, useInView ,Variants} from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import { Bell, Mail, Smartphone, Zap, Settings, BarChart3, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function NotificationSystem() {
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

  const notificationTypes = [
    {
      icon: Mail,
      title: "Email Notifications",
      description: "Automated email alerts for new blog posts and updates",
      features: ["Custom templates", "Subscriber segmentation", "Delivery tracking"],
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: Smartphone,
      title: "Push Notifications",
      description: "Real-time push notifications for mobile and web apps",
      features: ["Cross-platform support", "Rich media", "Action buttons"],
      color: "text-green-500",
      bgColor: "bg-green-50",
      comingSoon: true,
    },
    {
      icon: Bell,
      title: "In-App Notifications",
      description: "Native notifications within your application interface",
      features: ["Real-time updates", "Custom styling", "Read/unread status"],
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      comingSoon: true,
    },
  ]

  const notificationFeatures = [
    "Automated blog post notifications",
    "Subscriber preference management",
    "Multi-channel delivery",
    "Template customization",
    "Delivery analytics",
    "Rate limiting & throttling",
    "A/B testing for notifications",
    "Webhook integrations",
  ]

  return (
    <section className="py-16 md:py-24 bg-black text-white relative">
      <div className="absolute left-0 top-0 w-1/3 h-full bg-gradient-to-r from-gold-500/5 to-transparent"></div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-12 md:mb-16">
            <Badge className="bg-gold-500/20 text-gold-400 border-gold-500/30 mb-4">Notification System</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 font-heading">Smart Notification System</h2>
            <p className="text-lg text-neutral-300 max-w-3xl mx-auto leading-relaxed">
              Keep your audience engaged with automated notifications for new blog posts, updates, and important
              announcements across multiple channels.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <motion.div variants={itemVariants}>
              <div className="relative">
                <Image
                  src="/placeholder.svg?height=500&width=600&text=Notification+Dashboard"
                  width={600}
                  height={500}
                  alt="Notification System Dashboard"
                  className="rounded-xl shadow-2xl w-full h-auto border border-neutral-800"
                />
                <div className="absolute -top-4 -right-4 bg-gold-500 text-black p-3 rounded-full">
                  <Bell className="h-6 w-6" />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-4">Automated Blog Notifications</h3>
                <p className="text-neutral-300 mb-6">
                  Automatically notify your subscribers when new blog posts are published. Our system handles everything
                  from template creation to delivery tracking.
                </p>
              </div>

              <div className="grid gap-3">
                {notificationFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="bg-gold-500 w-2 h-2 rounded-full shrink-0"></div>
                    <span className="text-neutral-300">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="h-5 w-5 text-gold-400" />
                  <span className="font-semibold text-white">Instant Delivery</span>
                </div>
                <p className="text-sm text-neutral-400">
                  Notifications are sent within seconds of blog post publication, ensuring your audience stays
                  up-to-date with your latest content.
                </p>
              </div>

              <Button className="bg-gold-500 hover:bg-gold-600 text-black">Setup Notifications</Button>
            </motion.div>
          </div>

          {/* Notification Types */}
          <motion.div variants={itemVariants} className="mb-16">
            <h3 className="text-2xl font-bold text-center mb-12">Multi-Channel Notifications</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {notificationTypes.map((type, index) => (
                <div key={index} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 relative">
                  {type.comingSoon && (
                    <div className="absolute -top-3 -right-3">
                      <Badge className="bg-gold-500 text-black">Coming Soon</Badge>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-lg ${type.bgColor}`}>
                      <type.icon className={`h-6 w-6 ${type.color}`} />
                    </div>
                    <h4 className="font-semibold text-white">{type.title}</h4>
                  </div>
                  <p className="text-neutral-400 mb-4">{type.description}</p>
                  <ul className="space-y-2">
                    {type.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm text-neutral-300">
                        <div className={`w-1.5 h-1.5 rounded-full ${type.color.replace("text-", "bg-")}`}></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Notification Flow */}
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-bold text-center mb-12">How It Works</h3>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  step: "1",
                  icon: FileText,
                  title: "Blog Published",
                  description: "New blog post is published on your platform",
                },
                {
                  step: "2",
                  icon: Settings,
                  title: "Trigger Activated",
                  description: "Notification system detects the new content",
                },
                {
                  step: "3",
                  icon: Mail,
                  title: "Notifications Sent",
                  description: "Automated emails sent to all subscribers",
                },
                {
                  step: "4",
                  icon: BarChart3,
                  title: "Track Performance",
                  description: "Monitor delivery rates and engagement metrics",
                },
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="relative mb-6">
                    <div className="bg-gradient-to-r from-gold-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="h-8 w-8 text-black" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-white border-2 border-neutral-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-black">
                      {step.step}
                    </div>
                    {index < 3 && (
                      <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-neutral-700 -translate-x-1/2"></div>
                    )}
                  </div>
                  <h4 className="font-semibold text-white mb-2">{step.title}</h4>
                  <p className="text-sm text-neutral-400">{step.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Coming Soon API */}
          <motion.div variants={itemVariants} className="mt-16 text-center">
            <div className="bg-gradient-to-r from-gold-500/10 to-red-500/10 border border-gold-500/20 rounded-xl p-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Bell className="h-8 w-8 text-gold-400" />
                <h3 className="text-2xl font-bold text-white">Notification API Coming Soon</h3>
              </div>
              <p className="text-neutral-300 mb-6 max-w-2xl mx-auto">
                We're building a comprehensive Notification API that will allow you to send push notifications, SMS, and
                in-app notifications alongside our existing email system. Join the waitlist to be notified when it
                launches.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-gradient-to-r from-gold-500 to-red-500 text-black hover:from-gold-400 hover:to-red-400">
                  Join Waitlist
                </Button>
                <Button
                  variant="outline"
                  className="border-gold-500/30 text-gold-400 hover:bg-gold-500/10 bg-transparent"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
