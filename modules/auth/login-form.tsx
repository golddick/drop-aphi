

"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle } from "lucide-react"
import { loginUser } from "@/actions/auth/login"

interface LoginFormProps {
  onOTPRequired: (email: string) => void
  onLoginSuccess?: () => void
  onEmailVerificationRequired?: (email: string) => void // Add this prop
}

export function LoginForm({ onOTPRequired, onLoginSuccess, onEmailVerificationRequired }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ 
    email?: string; 
    password?: string; 
    general?: string;
  }>({})

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
   
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const result = await loginUser({
        email: email.trim(),
        password,
        rememberMe
      })

      if (result.success) {
        // Login successful
        if (onLoginSuccess) {
          onLoginSuccess()
        }
      } else {
        // Handle different error cases
        if (result.requiresOTP) {
          // Trigger OTP verification flow
          onOTPRequired(email)
        } else if (result.requiresEmailVerification) {
          // Handle email verification required
          setErrors({ general: result.message })
          // Redirect to email verification page if callback provided
          if (onEmailVerificationRequired) {
            onEmailVerificationRequired(email)
          }
        } else if (result.error?.includes('DEVICE_LIMIT_EXCEEDED')) {
          setErrors({ general: result.message })
        } else if (result.error?.includes('credentials') || result.error?.includes('invalid')) {
          setErrors({ general: "Invalid email or password" })
        } else if (result.error?.includes('EMAIL_NOT_VERIFIED')) {
          // Fallback for old error format
          setErrors({ general: "Please verify your email address before logging in" })
          if (onEmailVerificationRequired) {
            onEmailVerificationRequired(email)
          }
        } else {
          setErrors({ general: result.message || "Login failed. Please try again." })
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      setErrors({ general: "An error occurred during login. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === 'email') setEmail(value)
    if (field === 'password') setPassword(value)
    
    // Clear errors when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }))
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
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
            disabled={isLoading}
            autoComplete="email"
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
            disabled={isLoading}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.password}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="remember" 
            checked={rememberMe} 
            onCheckedChange={(checked) => setRememberMe(checked as boolean)} 
            disabled={isLoading}
          />
          <Label htmlFor="remember" className="text-sm font-medium">
            Remember me
          </Label>
        </div>
        <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500 hover:underline">
          Forgot password?
        </a>
      </div>

      {errors.general && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
        size="lg"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Signing in...
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </>
        )}
      </Button>
    </form>
  )
}