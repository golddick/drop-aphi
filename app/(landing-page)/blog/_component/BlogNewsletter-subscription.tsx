"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, CheckCircle } from "lucide-react"
import { formatString } from "@/lib/utils"
import { addSubscriber } from "@/actions/subscriber/add.subscriber"
import { getMembership } from "@/actions/membership/getMembership"
import { toast } from "sonner"
import { useAuthUser } from "@/lib/auth/getClientAuth"

interface SubscribeWidgetProps {
  blogAuthor: string
  blogTitle?: string
  ownerID: string
  variant?: "inline" | "sidebar" | "footer" | "minimal"
  className?: string
}

export default function SubscribeWidget({ 
  blogAuthor, 
  blogTitle, 
  ownerID, 
  variant = "minimal",
  className = "" 
}: SubscribeWidgetProps) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [appName, setAppName] = useState("")

const {user} = useAuthUser()

  // Fetch appName from member API using userId from URL
  useEffect(() => {
    const fetchAppName = async () => {
      if (!ownerID) return
      try {
        const result = await getMembership()
        if (result?.organization) {
          setAppName(result.organization)
        }
      } catch (err) {
        console.error("Error fetching member data:", err)
      }
    }
    fetchAppName()
  }, [ownerID])

  const handleSubscribe = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!email.trim()) {
      toast.error("Please enter your email address")
      return
    }

    if (!ownerID) {
      toast.error('Newsletter owner not found')
      return
    }

    setIsLoading(true)

    try {
      const result = await addSubscriber({
        email,
        name: name || email.split('@')[0], // Use email prefix as name if not provided
        source: `${appName || "drop-aphi"} newsletter form from the ${blogTitle || "Unknown Blog"} by ${blogAuthor || "Unknown Author"}`,
        status: "SUBSCRIBED",
        pageUrl: typeof window !== 'undefined' ? window.location.href : "",
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      toast.success(`Welcome to ${appName || "our"} newsletter! You're now subscribed.`)

      setIsSubscribed(true)
      setEmail("")
      setName("")
      
      // Reset subscription status after 5 seconds
      setTimeout(() => setIsSubscribed(false), 5000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubscribe()
    }
  }

  // Minimal variant (from new template)
  if (variant === "minimal") {
    if (isSubscribed) {
      return (
        <div className={`mb-12 p-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg animate-slide-in-up ${className}`}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-green-800 mb-2">Successfully Subscribed!</h3>
              <p className="text-green-700">
                Thanks for subscribing! You'll receive the latest updates from {appName || blogAuthor}.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-12 p-8 bg-gradient-to-r from-yellow-50 to-red-50 border-2 border-yellow-200 rounded-lg ${className}`}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-black mb-2">Subscribe to {blogAuthor}'s updates</h3>
            <p className="text-gray-600 mb-4">
              Get notified when {blogAuthor} publishes new articles and insights.
            </p>
            
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-yellow-600 focus:outline-none"
              />
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-yellow-600 focus:outline-none"
                />
                <Button
                  onClick={handleSubscribe}
                  disabled={isLoading || !email.trim()}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Subscribing..." : "Subscribe"}
                </Button>
              </div>
            </div>
            
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>No spam, unsubscribe anytime</span>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Inline variant (from old template)
  if (isSubscribed) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className={`${className}`}
      >
        <Card className="bg-white">
          <CardContent className="p-8 text-center">
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ delay: 0.2, type: "spring" }}
            >
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-2xl font-bold text-green-800 mb-2">You're All Set!</h3>
            <p className="text-green-700 mb-4">
              Thanks for subscribing! You'll receive the latest updates from {appName || blogAuthor}.
            </p>
            <div className="bg-green-100 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>What's next?</strong> Check your email for amazing content from {appName || blogAuthor}!
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const getVariantStyles = () => {
    switch (variant) {
      case "sidebar":
        return "bg-gradient-to-br from-blue-50 to-indigo-50 border-black"
      case "footer":
        return "bg-gradient-to-r from-purple-50 to-pink-50 border-none"
      default:
        return "bg-white"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`${className}`}
    >
      <Card className={`shadow-lg ${getVariantStyles()}`}>
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-100 to-red-100 rounded-full mb-4">
              <Mail className="h-8 w-8 text-black" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Stay Updated with {formatString(appName || blogAuthor)} Insights
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {blogTitle
                ? `Enjoyed "${blogTitle}"? Get more expert insights delivered to your inbox.`
                : `Join readers getting the latest insights from ${blogAuthor}.`}
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-gray-300 focus:border-yellow-600 focus:ring-yellow-600"
              />
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-gray-300 focus:border-yellow-600 focus:ring-yellow-600"
                required
              />
            </div>

            <Button
              type="submit"
             className="px-6 py-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed w-full "
              disabled={isLoading || !email.trim()}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Subscribing...
                </div>
              ) : (
                <>
                  <Mail className="h-5 w-5 mr-2" />
                  <p className="hidden md:flex">Subscribe to {formatString(appName || blogAuthor)} Newsletter</p>
                  <p className="md:hidden">Subscribe</p>
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-yellow-600 text-white">
                  {appName || "Newsletter"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No spam, unsubscribe anytime</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}