"use client"

import type React from "react"

import { useState } from "react"
import { Mail, ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitted(true)
    setEmail("")
    setIsLoading(false)

    // Reset after 3 seconds
    setTimeout(() => setIsSubmitted(false), 3000)
  }

  return (
    <div className="bg-gradient-to-r from-yellow-600 to-red-600 rounded-xl p-8 md:p-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-6 h-6 text-white" />
          <h3 className="text-2xl font-bold text-white">Developer Newsletter</h3>
        </div>
        <p className="text-white/90 mb-6">
          Get the latest API updates, code snippets, and best practices delivered to your inbox weekly.
        </p>

        {isSubmitted ? (
          <div className="flex items-center gap-3 p-4 bg-white/20 rounded-lg">
            <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
            <p className="text-white font-medium">Thanks for subscribing! Check your email.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-white"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-black text-white hover:bg-gray-900 flex items-center gap-2 px-6"
            >
              {isLoading ? "Subscribing..." : "Subscribe"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
