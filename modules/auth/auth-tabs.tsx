

"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginForm } from "./login-form"
import { SignupForm } from "./signup-form"
import { ResetPasswordForm } from "./reset-password-form"
import { OTPVerificationForm } from "./otp-verification-form"
import { useRouter } from "next/navigation"

export function AuthTabs() {
  const [activeTab, setActiveTab] = useState("login")
  const [showOTPVerification, setShowOTPVerification] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [otpPurpose, setOtpPurpose] = useState<"login" | "signup" | "reset" | "email-verification">("login")
  const router = useRouter()

  const handleOTPRequired = (email: string, purpose: "login" | "signup" | "reset" | "email-verification" = "login") => {
    setUserEmail(email)
    setOtpPurpose(purpose)
    setShowOTPVerification(true)
  }

  const handleEmailVerificationRequired = (email: string) => {
    // Treat email verification as OTP verification
    setUserEmail(email)
    setOtpPurpose("email-verification")
    setShowOTPVerification(true)
  }

  const handleOTPVerified = (user?: any) => {
    setShowOTPVerification(false)
    
    switch (otpPurpose) {
      case "login":
        router.push('/dashboard')
        break
      case "signup":
        setActiveTab("login")
        break
      case "reset":
        // Redirect to set new password page with email parameter
        router.push('/auth/set-new-password?email=' + encodeURIComponent(userEmail))
        break
      case "email-verification":
        // After email verification via OTP, proceed with login
        router.push('/dashboard')
        break
      default:
        setActiveTab("login")
    }
  }

  const handleOTPBack = () => {
    setShowOTPVerification(false)
    // Stay on the current tab when going back from OTP
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  if (showOTPVerification) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>
            {otpPurpose === "email-verification" ? "Verify Your Email" : "Verify Your Account"}
          </CardTitle>
          <CardDescription>
            {otpPurpose === "email-verification" 
              ? "We've sent a verification code to verify your email address"
              : "We've sent a verification code to your email"
            }
            <br />
            <span className="font-semibold text-gray-900">{userEmail}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OTPVerificationForm
            email={userEmail}
            onVerified={handleOTPVerified}
            onBack={handleOTPBack}
            purpose={otpPurpose}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md mx-auto">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
        <TabsTrigger value="reset">Reset</TabsTrigger>
      </TabsList>

      <TabsContent value="login">
        <Card>
          <CardHeader>
            <CardTitle>Login to Your Account</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm 
              onOTPRequired={(email) => handleOTPRequired(email, "login")}
              onEmailVerificationRequired={(email) => handleEmailVerificationRequired(email)}
              onLoginSuccess={() => router.push('/dashboard')}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="signup">
        <Card>
          <CardHeader>
            <CardTitle>Create New Account</CardTitle>
            <CardDescription>Sign up for a new account to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <SignupForm 
              onOTPRequired={(email) => handleOTPRequired(email, "signup")}
              onSignupSuccess={() => {
                // This will be called after successful registration but before OTP
                console.log("Registration successful, OTP required")
              }}
              onTabChange={handleTabChange}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reset">
        <Card>
          <CardHeader>
            <CardTitle>Reset Your Password</CardTitle>
            <CardDescription>Enter your email to receive an OTP code</CardDescription>
          </CardHeader>
          <CardContent>
            <ResetPasswordForm 
              onOTPRequired={(email) => handleOTPRequired(email, "reset")}
              onResetSuccess={() => {
                // This will be called after successful reset request but before OTP
                console.log("Reset request successful, OTP required")
              }}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}