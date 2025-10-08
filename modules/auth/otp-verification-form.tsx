
"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, RefreshCw, CheckCircle, ArrowLeft, Clock, Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { checkOTPStatus, regenerateOTP, verifyOTP } from "@/actions/otp/otp"

interface OTPVerificationFormProps { 
  email: string
  onVerified: (user: any) => void
  onBack: () => void
  purpose: "login" | "signup" | "reset" | "email-verification"
}

export function OTPVerificationForm({ email, onVerified, onBack, purpose = "login" }: OTPVerificationFormProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [resendTimer, setResendTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [otpStatus, setOtpStatus] = useState<{ exists: boolean; expiresAt?: Date; attempts?: number }>({ exists: false })
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()

  // Check OTP status on component mount
  useEffect(() => {
    checkOTPStatus(email).then(setOtpStatus)
  }, [email])

  // Start resend timer
  useEffect(() => {
    if (resendTimer > 0 && !canResend) {
      const timer = setTimeout(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer, canResend])

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return // Only allow digits

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError("")
    setSuccess("")

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== "") && index === 5) {
      handleVerify(newOtp.join(""))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Move to previous input on backspace
        inputRefs.current[index - 1]?.focus()
      } else if (otp[index]) {
        // Clear current input
        const newOtp = [...otp]
        newOtp[index] = ""
        setOtp(newOtp)
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)

    if (pastedData.length === 6) {
      const newOtp = pastedData.split("")
      setOtp(newOtp)
      inputRefs.current[5]?.focus() // Focus last input
      handleVerify(pastedData)
    }
  }

  const handleVerify = async (otpCode?: string) => {
    const codeToVerify = otpCode || otp.join("")

    if (codeToVerify.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await verifyOTP(email, codeToVerify)

      if (result.success) {
        setSuccess("Verification successful!")
        
        // Call the success callback with user data
        if (result.user) {
          onVerified(result.user)
        } else {
          // If no user data returned, redirect based on purpose
          switch (purpose) {
            case "signup":
              router.push("/auth?login")
              break
            case "reset":
              router.push("/auth?login")
              break
            default:
              router.push("/auth?login")
          }
        }
      } else {
        setError(result.message)
        
        // Clear OTP on invalid attempt
        if (result.error === "INVALID_OTP" || result.error === "OTP_EXPIRED") {
          setOtp(["", "", "", "", "", ""])
          inputRefs.current[0]?.focus()
        }
      }
    } catch (error) {
      console.error("Verification error:", error)
      setError("Verification failed. Please try again.")
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return

    setIsResending(true)
    setError("")
    setSuccess("")

    try {
      const result = await regenerateOTP(email)

      if (result.success) {
        setSuccess("New OTP sent successfully!")
        setResendTimer(60)
        setCanResend(false)
        setOtp(["", "", "", "", "", ""])
        
        // Refresh OTP status
        const status = await checkOTPStatus(email)
        setOtpStatus(status)
        
        inputRefs.current[0]?.focus()
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error("Resend error:", error)
      setError("Failed to resend OTP. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getPurposeText = () => {
    switch (purpose) {
      case "signup":
        return "Complete your registration"
      case "login":
        return "Verify your email address"
      default:
        return "Secure your account"
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter Verification Code</h3>
        <p className="text-sm text-gray-600 mb-1">{getPurposeText()}</p>
        <p className="text-sm text-gray-600 mb-4">We've sent a 6-digit code to:</p>
        <p className="font-medium text-gray-900 mb-4">{email}</p>
        
        {/* OTP Status Information */}
        {otpStatus.exists && otpStatus.expiresAt && (
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Expires: {new Date(otpStatus.expiresAt).toLocaleTimeString()}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Label className="text-center block text-sm font-medium">Enter 6-digit code</Label>
        <div className="flex justify-center gap-2">
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className={`w-12 h-12 text-center text-lg font-bold ${
                error ? "border-red-500 bg-red-50" : 
                success ? "border-green-500 bg-green-50" : 
                "border-gray-300"
              }`}
              disabled={isLoading}
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>

        {/* Attempts remaining */}
        {otpStatus.attempts !== undefined && otpStatus.attempts > 0 && (
          <p className="text-center text-xs text-amber-600">
            Attempts used: {otpStatus.attempts}/5
          </p>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center justify-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-center justify-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Button 
          onClick={() => handleVerify()} 
          className="w-full" 
          disabled={isLoading || otp.some((digit) => !digit)}
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Verifying...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Verify Code
            </>
          )}
        </Button>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">Didn't receive the code?</p>

          <Button
            onClick={handleResend}
            variant="outline"
            disabled={!canResend || isResending}
            className="w-full"
            size="sm"
          >
            {isResending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sending...
              </>
            ) : !canResend ? (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Resend in {formatTime(resendTimer)}
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Resend Code
              </>
            )}
          </Button>
        </div>

        <Button 
          onClick={onBack} 
          variant="ghost" 
          className="w-full"
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {purpose === "signup" ? "Sign Up" : "Login"}
        </Button>
      </div>

      {/* Security notice */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          For security reasons, this code will expire in 10 minutes and can only be used once.
        </p>
      </div>
    </div>
  )
}






