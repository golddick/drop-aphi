"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Rocket, Users, Globe, Zap, Award, TrendingUp } from "lucide-react"

export function AboutTimeline() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const timelineEvents = [
    {
      year: "2022",
      title: "Company Founded",
      description: "Xypher was founded with a vision to simplify digital communication for developers worldwide.",
      icon: Rocket,
      color: "bg-blue-500",
    },
    {
      year: "2022",
      title: "First API Launch",
      description: "Launched our Newsletter API, helping developers send beautiful emails without the complexity.",
      icon: Zap,
      color: "bg-green-500",
    },
    {
      year: "2023",
      title: "10K Developers",
      description: "Reached our first major milestone with 10,000 developers using our platform.",
      icon: Users,
      color: "bg-purple-500",
    },
    {
      year: "2023",
      title: "OTP API Release",
      description: "Expanded our offering with secure OTP verification services for user authentication.",
      icon: Award,
      color: "bg-orange-500",
    },
    {
      year: "2024",
      title: "Global Expansion",
      description: "Expanded to 150+ countries with edge locations worldwide for optimal performance.",
      icon: Globe,
      color: "bg-red-500",
    },
    {
      year: "2024",
      title: "50K+ Developers",
      description: "Celebrating 50,000+ developers and 10M+ emails delivered through our platform.",
      icon: TrendingUp,
      color: "bg-gold-500",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-neutral-50 to-gold-50">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-gold-100 text-gold-700 rounded-full text-sm font-medium mb-4">
            Our Journey
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 font-heading">
            Building the Future of Communication
          </h2>
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
            From a simple idea to serving thousands of developers worldwide, here's how we've grown and evolved.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold-500 to-red-500 hidden md:block"></div>

            <div className="space-y-12">
              {timelineEvents.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative flex items-start gap-6"
                >
                  {/* Timeline dot */}
                  <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-full bg-white border-4 border-gold-200 shadow-lg shrink-0 relative z-10">
                    <div className={`${event.color} p-2 rounded-full`}>
                      <event.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-white rounded-xl p-6 shadow-lg border border-neutral-200 md:ml-0 ml-0">
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`md:hidden ${event.color} p-2 rounded-full`}>
                        <event.icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gold-600 bg-gold-100 px-3 py-1 rounded-full">
                        {event.year}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">{event.title}</h3>
                    <p className="text-neutral-600">{event.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
