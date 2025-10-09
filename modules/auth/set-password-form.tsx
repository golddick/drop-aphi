




"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Mail, RefreshCw } from "lucide-react"
import { completePasswordReset } from "@/actions/auth/reset-password"
import { regenerateOTP } from "@/actions/otp/otp"

export default function SetNewPasswordPage() { 
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [errors, setErrors] = useState<{ password?: string; otp?: string; general?: string }>({})
  const [success, setSuccess] = useState(false)
  const [resendSuccess, setResendSuccess] = useState("")
  const [countdown, setCountdown] = useState(0)

  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email') 

  useEffect(() => {
    if (!email) {
      router.push('/auth?tab=reset') // Redirect back to reset form
    }
  }, [email, router])

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const validateForm = () => {
    const newErrors: { password?: string; otp?: string } = {}

    if (!otp) {
      newErrors.otp = "Verification code is required"
    } else if (otp.length !== 6) {
      newErrors.otp = "Verification code must be 6 digits"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number"
    } else if (password !== confirmPassword) {
      newErrors.password = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})
    setResendSuccess("")

    try {
      const result = await completePasswordReset({
        email: email!,
        otp,
        newPassword: password
      })

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/auth?passwordReset=true&tab=login')
        }, 2000)
      } else {
        setErrors({ general: result.message })
      }
    } catch (error) {
      console.error("Password reset error:", error)
      setErrors({ general: "An error occurred. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!email || countdown > 0) return;

    setIsResending(true);
    setErrors({});
    setResendSuccess("");

    try {
      // Use resendOTP with purpose parameter
      const result = await regenerateOTP( email);

      if (result.success) {
        setResendSuccess("Verification code sent successfully!");
        setCountdown(60); // 60 seconds countdown
        setOtp(""); // Clear previous OTP
      } else {
        setErrors({
          general: result.message || "Failed to resend verification code",
        });
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setErrors({ general: "Failed to resend verification code" });
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value.replace(/\D/g, '').slice(0, 6))
    // Clear OTP error when user starts typing
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: undefined }))
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }))
    }
  }

  if (!email) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Set New Password</CardTitle>
          <CardDescription>
            Enter the verification code sent to your email and create a new password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Code sent to: <strong>{email}</strong>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Check your email for the 6-digit verification code
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="otp">Verification Code</Label>
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResendOTP}
                  disabled={isResending || countdown > 0}
                  className="h-auto p-0 text-sm"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    `Resend in ${countdown}s`
                  ) : (
                    "Resend Code"
                  )}
                </Button>
              </div>
              
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => handleOtpChange(e.target.value)}
                className="text-center text-lg font-mono tracking-widest"
                disabled={isLoading || success}
                maxLength={6}
              />
              
              {errors.otp && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.otp}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) {
                      setErrors(prev => ({ ...prev, password: undefined }))
                    }
                  }}
                  className="pl-10 pr-10"
                  disabled={isLoading || success}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  disabled={isLoading || success}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (errors.password) {
                    setErrors(prev => ({ ...prev, password: undefined }))
                  }
                }}
                disabled={isLoading || success}
              />
            </div>

            {errors.password && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.password}
              </p>
            )}

            {resendSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <p className="text-sm text-green-600">{resendSuccess}</p>
              </div>
            )}

            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <p className="text-sm text-green-600">
                  Password updated successfully! Redirecting to login...
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
                  Updating...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Password Updated
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/auth?tab=reset')}
              className="text-sm"
            >
              Back to Reset Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}