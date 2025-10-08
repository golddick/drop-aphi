"use client"

import { motion, useInView, Variants } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import { Shield, CheckCircle, AlertTriangle, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function EmailVerification() {
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

  const verificationSteps = [
    {
      step: "1",
      title: "Email Submission",
      description: "User enters their email address in your subscription form",
      icon: Mail,
      color: "bg-blue-500",
    },
    {
      step: "2",
      title: "Instant Verification",
      description: "Our system validates email format and checks deliverability",
      icon: Shield,
      color: "bg-green-500",
    },
    {
      step: "3",
      title: "Confirmation Email",
      description: "Automated verification email sent with secure confirmation link",
      icon: CheckCircle,
      color: "bg-purple-500",
    },
    {
      step: "4",
      title: "Verified Subscriber",
      description: "Email confirmed and subscriber added to your verified list",
      icon: Lock,
      color: "bg-gold-500",
    },
  ]

  const verificationFeatures = [
    "Real-time email validation",
    "Disposable email detection",
    "Domain verification",
    "Bounce rate reduction",
    "Spam trap protection",
    "Double opt-in confirmation",
  ]

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-green-50 to-blue-50 relative">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-12 md:mb-16">
            <Badge className="bg-green-100 text-green-700 border-green-200 mb-4">Email Verification</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 font-heading">
              Verify Emails Before Subscribing
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Ensure high deliverability and maintain a clean subscriber list with our advanced email verification
              system that validates emails in real-time.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <motion.div variants={itemVariants} className="order-2 lg:order-1">
              <div className="relative">
                <Image
                  src="/placeholder.svg?height=500&width=600&text=Email+Verification+Process"
                  width={600}
                  height={500}
                  alt="Email Verification Process Dashboard"
                  className="rounded-xl shadow-2xl w-full h-auto border border-neutral-200"
                />
                <div className="absolute -bottom-4 -left-4 bg-green-500 text-white p-3 rounded-full">
                  <Shield className="h-6 w-6" />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="order-1 lg:order-2 space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-4">Protect Your Sender Reputation</h3>
                <p className="text-neutral-600 mb-6">
                  Our email verification system checks every subscription in real-time, preventing invalid emails from
                  entering your list and protecting your sender reputation.
                </p>
              </div>

              <div className="grid gap-3">
                {verificationFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                    <span className="text-neutral-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white p-6 rounded-xl border border-green-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <span className="font-semibold text-neutral-900">Reduce Bounce Rate by 95%</span>
                </div>
                <p className="text-sm text-neutral-600">
                  Our verification system has helped customers reduce their bounce rates from 15% to less than 1%,
                  significantly improving deliverability.
                </p>
              </div>

              <Button className="bg-green-500 hover:bg-green-600 text-white">Enable Verification</Button>
            </motion.div>
          </div>

          {/* Verification Process */}
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-bold text-center mb-12">How Email Verification Works</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {verificationSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="relative mb-6">
                    <div
                      className={`${step.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}
                    >
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-white border-2 border-neutral-200 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-neutral-700">
                      {step.step}
                    </div>
                    {index < verificationSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-neutral-200 -translate-x-1/2"></div>
                    )}
                  </div>
                  <h4 className="font-semibold text-neutral-900 mb-2">{step.title}</h4>
                  <p className="text-sm text-neutral-600">{step.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
