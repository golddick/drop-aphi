"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, User, UserPlus, AlertCircle, AtSign } from "lucide-react"
import { registerUser } from "@/actions/auth/auth"

interface SignupFormProps {
  onOTPRequired: (email: string) => void
  onSignupSuccess?: () => void
  onTabChange?: (tab: string) => void
}

export function SignupForm({ onOTPRequired, onSignupSuccess, onTabChange }: SignupFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters"
    } else if (formData.fullName.trim().length > 50) {
      newErrors.fullName = "Full name must be less than 50 characters"
    }

    // Username validation
    if (!formData.userName.trim()) {
      newErrors.userName = "Username is required"
    } else if (formData.userName.trim().length < 3) {
      newErrors.userName = "Username must be at least 3 characters"
    } else if (formData.userName.trim().length > 20) {
      newErrors.userName = "Username must be less than 20 characters"
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.userName)) {
      newErrors.userName = "Username can only contain letters, numbers, and underscores"
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    // Terms validation
    if (!agreeToTerms) {
      newErrors.terms = "You must agree to the terms and conditions"
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
      const result = await registerUser({
        fullName: formData.fullName.trim(),
        userName: formData.userName.trim().toLowerCase(),
        email: formData.email.toLowerCase(),
        password: formData.password
      })

      if (result.success) {
        // Registration successful, trigger OTP verification
        onOTPRequired(formData.email)
        
        // Optional: Call success callback if provided
        if (onSignupSuccess) {
          onSignupSuccess()
        }
      } else {
        // Registration failed, show error
        if (result.error === "USER_ALREADY_EXISTS") {
          setErrors({ email: "An account with this email already exists. Please try logging in." })
        } else if (result.error === "USERNAME_TAKEN") {
          setErrors({ userName: "This username is already taken. Please choose a different one." })
        } else if (result.error === "VALIDATION_ERROR") {
          setErrors({ general: "Please check your information and try again." })
        } else {
          setErrors({ general: result.message || "Registration failed. Please try again." })
        }
      }
    } catch (error) {
      console.error("Registration error:", error)
      setErrors({ general: "An error occurred during registration. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Clear specific error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
    
    // Clear general error when any input changes
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: "" }))
    }
  }

  // Auto-generate username from full name
  const handleFullNameChange = (value: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      fullName: value,
      // Auto-generate username if it's empty or matches the old full name pattern
      userName: prev.userName === "" || prev.userName === generateUsername(prev.fullName) 
        ? generateUsername(value) 
        : prev.userName
    }))
    
    if (errors.fullName) {
      setErrors((prev) => ({ ...prev, fullName: "" }))
    }
  }

  const generateUsername = (fullName: string): string => {
    if (!fullName.trim()) return ""
    
    // Convert to lowercase and remove special characters
    const cleanName = fullName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 15)
    
    return cleanName || ""
  }

  const handleLoginRedirect = () => {
    if (onTabChange) {
      onTabChange("login")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        {/* Full Name Field */}
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => handleFullNameChange(e.target.value)}
              className={`pl-10 ${errors.fullName ? "border-red-500" : ""}`}
              disabled={isLoading}
              autoComplete="name"
            />
          </div>
          {errors.fullName && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Username Field */}
        <div className="space-y-2">
          <Label htmlFor="userName">Username</Label>
          <div className="relative">
            <AtSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="userName"
              placeholder="Choose a username"
              value={formData.userName}
              onChange={(e) => handleInputChange("userName", e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
              className={`pl-10 ${errors.userName ? "border-red-500" : ""}`}
              disabled={isLoading}
              autoComplete="username"
            />
          </div>
          {errors.userName && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.userName}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Letters, numbers, and underscores only. 3-20 characters.
          </p>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
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

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
              disabled={isLoading}
              autoComplete="new-password"
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

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              className={`pl-10 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={agreeToTerms}
            onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
            disabled={isLoading}
          />
          <Label htmlFor="terms" className="text-sm">
            I agree to the{" "}
            <a href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </Label>
        </div>
        {errors.terms && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.terms}
          </p>
        )}
      </div>

      {/* General Error Message */}
      {errors.general && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isLoading} size="lg">
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Creating account...
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4 mr-2" />
            Create Account
          </>
        )}
      </Button>

      {/* Login Redirect */}
      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={handleLoginRedirect}
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
            disabled={isLoading}
          >
            Sign in here
          </button>
        </p>
      </div>

      {/* Password Requirements */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Password must contain at least 8 characters with uppercase, lowercase, and number
        </p>
      </div>
    </form>
  )
}