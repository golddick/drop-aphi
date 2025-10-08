
 

"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, AlertCircle, CheckCircle } from "lucide-react"
import { requestPasswordReset } from "@/actions/auth/reset-password"
import { useRouter } from "next/navigation"

interface ResetPasswordFormProps {
  onOTPRequired: (email: string) => void
  onResetSuccess?: () => void
}

export function ResetPasswordForm({ onOTPRequired, onResetSuccess }: ResetPasswordFormProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; general?: string }>({})
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const validateForm = () => {
    const newErrors: { email?: string } = {}

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({}) 
    setSuccess(false)

    try {
      const result = await requestPasswordReset({ email: email.trim() })

      if (result.success) {
        setSuccess(true)
        // Trigger OTP verification for password reset
        onOTPRequired(email)
        if (onResetSuccess) {
          onResetSuccess()
        }
         // Navigate to set password page after a brief delay
        setTimeout(() => {
          router.push(`/auth/set-new-password?email=${encodeURIComponent(email.trim())}`)
        }, 1000)
      } else {
        setErrors({ general: result.message || "Failed to send reset instructions" })
      }
    } catch (error) {
      console.error("Reset password error:", error)
      setErrors({ general: "An error occurred. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
            disabled={isLoading || success}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.email}
          </p>
        )}
      </div>

      {errors.general && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-600">
            Reset code sent! Please check your email for the verification code.
          </p>
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || success}
        size="lg"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Sending...
          </>
        ) : success ? (
          "Code Sent"
        ) : (
          "Send Reset Code"
        )}
      </Button>
    </form>
  )
}