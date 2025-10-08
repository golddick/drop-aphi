"use client"

import { motion, useInView, Variants } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import { Target, Users, Zap, Globe, Shield, Code } from "lucide-react"

export function AboutMission() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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

  return (
    <section className="py-16 md:py-24 bg-white relative">
      <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-gold-50 to-transparent opacity-50"></div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-6xl mx-auto"
        >
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-16">
            <motion.div variants={itemVariants} className="order-2 md:order-1">
              <div className="relative">
                <Image
                  src="/placeholder.svg?height=600&width=600&text=API+Dashboard"
                  width={600}
                  height={600}
                  alt="Xypher API Dashboard"
                  className="rounded-lg shadow-elegant w-full h-auto"
                />
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gold-100 rounded-full blur-xl opacity-70 hidden md:block"></div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="order-1 md:order-2">
              <span className="inline-block px-4 py-1.5 bg-gold-100 text-gold-700 rounded-full text-sm font-medium mb-4">
                Our Mission & Vision
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 font-heading">
                Simplifying Digital Communication for Developers
              </h2>

              <div className="space-y-6 text-neutral-600">
                <p className="leading-relaxed">
                  At Xypher, we believe that powerful communication tools shouldn't require complex infrastructure. Our
                  mission is to provide developers with simple, reliable APIs that handle the complexity of email
                  delivery, user verification, and content management.
                </p>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="bg-gold-100 p-3 rounded-full h-12 w-12 flex items-center justify-center shrink-0">
                      <Target className="h-6 w-6 text-gold-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Our Mission</h3>
                      <p className="text-neutral-600">
                        To democratize access to enterprise-grade communication tools through simple, developer-friendly
                        APIs that scale from startup to enterprise.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-red-100 p-3 rounded-full h-12 w-12 flex items-center justify-center shrink-0">
                      <Zap className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Our Vision</h3>
                      <p className="text-neutral-600">
                        To become the go-to platform for developers who need reliable, fast, and secure communication
                        APIs without the infrastructure headaches.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-gold-100 p-3 rounded-full h-12 w-12 flex items-center justify-center shrink-0">
                      <Users className="h-6 w-6 text-gold-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Our Values</h3>
                      <p className="text-neutral-600">
                        Developer experience, reliability, security, and transparency drive everything we do. We build
                        tools we'd want to use ourselves.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Core Principles */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gradient-to-br from-gold-50 to-red-50 rounded-xl border border-gold-100">
              <div className="bg-gold-500 p-4 rounded-full inline-flex mb-4">
                <Code className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Developer First</h3>
              <p className="text-neutral-600">
                Every API is designed with developers in mind. Clear documentation, intuitive endpoints, and
                comprehensive SDKs.
              </p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-red-50 to-gold-50 rounded-xl border border-red-100">
              <div className="bg-red-500 p-4 rounded-full inline-flex mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Security & Privacy</h3>
              <p className="text-neutral-600">
                Enterprise-grade security with SOC 2 compliance, end-to-end encryption, and privacy by design
                principles.
              </p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-gold-50 to-red-50 rounded-xl border border-gold-100">
              <div className="bg-gradient-to-r from-gold-500 to-red-500 p-4 rounded-full inline-flex mb-4">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Global Scale</h3>
              <p className="text-neutral-600">
                Built for global reach with 150+ edge locations, 99.9% uptime SLA, and sub-100ms response times
                worldwide.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
