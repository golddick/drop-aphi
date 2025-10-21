"use client"

import type React from "react"
import { useState, useTransition } from "react"
import { Mail, ArrowRight, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { subscribeToPlatformNewsletter } from "@/actions/Platfrom/newsletter-actions"

export default function PlatformNewsletterSignup() {
  const [email, setEmail] = useState("")
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ 
    success?: boolean; 
    message?: string; 
    errors?: { email?: string[] } 
  }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formData = new FormData()
    formData.append("email", email)
    formData.append("source", "platform_newsletter")
    formData.append("name", "") // Send empty string instead of null

    startTransition(async () => {
      try {
        const response = await subscribeToPlatformNewsletter({} as any, formData)
        setResult(response)
        
        if (response.success) {
          setEmail("")
        }
      } catch (error) {
        console.error("Subscription error:", error)
        setResult({
          success: false,
          message: "An error occurred. Please try again."
        })
      }
    })
  }

  return (
    <div className="bg-gradient-to-r from-yellow-600 to-red-600 rounded-xl p-6 md:p-8 lg:p-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-6 h-6 text-white" />
          <h3 className="text-xl md:text-2xl font-bold text-white">Platform Updates</h3>
        </div>
        <p className="text-white/90 mb-6 text-sm md:text-base">
          Get the latest platform features, API updates, and developer news delivered to your inbox.
        </p>

        {result.success ? (
          <div className="flex items-center gap-3 p-4 bg-white/20 rounded-lg">
            <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
            <p className="text-white font-medium text-sm md:text-base">
              {result.message || "Thanks for subscribing! Welcome to our platform updates."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-white text-sm md:text-base"
            />
            <Button
              type="submit"
              disabled={isPending}
              className="bg-black text-white hover:bg-gray-900 flex items-center justify-center gap-2 px-6 py-3 w-full sm:w-auto"
            >
              {isPending ? "Subscribing..." : "Subscribe"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        )}

        {result.errors?.email && (
          <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg mt-3">
            <AlertCircle className="w-4 h-4 text-red-300 flex-shrink-0" />
            <p className="text-red-100 text-sm">
              {result.errors.email[0]}
            </p>
          </div>
        )}

        {!result.success && result.message && (
          <div className="flex items-center gap-2 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg mt-3">
            <AlertCircle className="w-4 h-4 text-yellow-300 flex-shrink-0" />
            <p className="text-yellow-100 text-sm">
              {result.message}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}