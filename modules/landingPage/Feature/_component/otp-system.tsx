"use client"

import { motion, useInView , Variants} from "framer-motion" 
import { useRef, useState } from "react"
import { Shield, Clock, RefreshCw, CheckCircle, Smartphone, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function OTPSystem() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [otpCode, setOtpCode] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [generatedOtp, setGeneratedOtp] = useState("")
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "success" | "error">("idle")

    const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants: Variants  = {
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

  const generateOTP = async () => {
    setIsGenerating(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedOtp(otp)
    setIsGenerating(false)
  }

  const verifyOTP = async () => {
    setIsVerifying(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    if (otpCode === generatedOtp) {
      setVerificationStatus("success")
    } else {
      setVerificationStatus("error")
    }
    setIsVerifying(false)
  }

  const resendOTP = async () => {
    setVerificationStatus("idle")
    setOtpCode("")
    await generateOTP()
  }

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
            <Badge className="bg-green-100 text-green-700 border-green-200 mb-4">OTP Authentication</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 font-heading">Secure OTP System</h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Implement robust two-factor authentication with our comprehensive OTP system. Generate, verify, and manage
              one-time passwords with ease.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* OTP Demo */}
            <Card className="bg-white shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-green-500" />
                  OTP Demo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="generate" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="generate">Generate</TabsTrigger>
                    <TabsTrigger value="verify">Verify</TabsTrigger>
                    <TabsTrigger value="resend">Resend</TabsTrigger>
                  </TabsList>

                  <TabsContent value="generate" className="space-y-4">
                    <div className="text-center space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Generated OTP:</p>
                        <div className="text-2xl font-mono font-bold text-green-600">{generatedOtp || "------"}</div>
                      </div>
                      <Button
                        onClick={generateOTP}
                        disabled={isGenerating}
                        className="w-full bg-green-500 hover:bg-green-600"
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Shield className="h-4 w-4 mr-2" />
                            Generate OTP
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="verify" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Enter OTP Code</label>
                        <Input
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          className="text-center text-lg font-mono"
                        />
                      </div>
                      <Button
                        onClick={verifyOTP}
                        disabled={isVerifying || !otpCode || otpCode.length !== 6}
                        className="w-full bg-blue-500 hover:bg-blue-600"
                      >
                        {isVerifying ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Verify OTP
                          </>
                        )}
                      </Button>
                      {verificationStatus === "success" && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
                          <p className="text-green-700 text-sm">OTP verified successfully!</p>
                        </div>
                      )}
                      {verificationStatus === "error" && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                          <p className="text-red-700 text-sm">Invalid OTP. Please try again.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="resend" className="space-y-4">
                    <div className="text-center space-y-4">
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                        <p className="text-sm text-orange-700">
                          Didn't receive the code? You can resend it after 30 seconds.
                        </p>
                      </div>
                      <Button onClick={resendOTP} className="w-full bg-orange-500 hover:bg-orange-600">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Resend OTP
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* API Documentation */}
            <Card className="bg-white shadow-xl border-0">
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-green-100 text-green-700">POST</Badge>
                      <code className="text-sm">/api/otp/generate</code>
                    </div>
                    <p className="text-xs text-gray-600">Generate a new OTP code</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-100 text-blue-700">POST</Badge>
                      <code className="text-sm">/api/otp/verify</code>
                    </div>
                    <p className="text-xs text-gray-600">Verify an OTP code</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-orange-100 text-orange-700">POST</Badge>
                      <code className="text-sm">/api/otp/resend</code>
                    </div>
                    <p className="text-xs text-gray-600">Resend OTP to user</p>
                  </div>
                </div>

                <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs font-mono">
                  <div className="mb-2 text-gray-400">// Example usage</div>
                  <div>curl -X POST \</div>
                  <div className="ml-2">https://api.thenews.com/otp/generate \</div>
                  <div className="ml-2">-H "Content-Type: application/json" \</div>
                  <div className="ml-2">-d '{'email": "user@example.com'}'</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features Grid */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-xl border border-neutral-200 shadow-sm">
              <div className="bg-green-100 p-4 rounded-full inline-flex mb-4">
                <Shield className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Secure Generation</h3>
              <p className="text-sm text-neutral-600">
                Cryptographically secure OTP generation with customizable length and expiry times.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl border border-neutral-200 shadow-sm">
              <div className="bg-blue-100 p-4 rounded-full inline-flex mb-4">
                <Smartphone className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Multi-Channel</h3>
              <p className="text-sm text-neutral-600">
                Send OTP via SMS, email, or push notifications with automatic fallback options.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl border border-neutral-200 shadow-sm">
              <div className="bg-purple-100 p-4 rounded-full inline-flex mb-4">
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Rate Limiting</h3>
              <p className="text-sm text-neutral-600">
                Built-in rate limiting and attempt tracking to prevent abuse and brute force attacks.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
