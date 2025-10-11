"use server"

import { database } from "@/lib/database"
import { SendOTP } from "@/lib/email/sendOTP"
import crypto from "crypto"

const OTP_EXPIRY_MINUTES = 10 // OTP valid for 10 minutes
const OTP_LENGTH = 6 // 6-digit OTP

interface OTPResult {
  success: boolean
  message: string
  otpId?: string
  error?: string
}

interface VerifyOTPResult {
  success: boolean
  message: string
  user?: any
  error?: string 
}

// Generate OTP
export async function generateOTP(email: string): Promise<OTPResult> {
  try {
    if (!email) {
      return {
        success: false,
        message: "Email is required",
        error: "EMAIL_REQUIRED"
      }
    }

    // Check if user exists
    const user = await database.user.findUnique({
      where: { email }
    })

    if (!user) {
      return {
        success: false,
        message: "User not found",
        error: "USER_NOT_FOUND"
      }
    }
 
    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString()
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

    // Create hash of OTP for security
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex')

    // Delete any existing OTPs for this email
    await database.oTP.deleteMany({
      where: { email }
    })

    // Create new OTP record
    const otpRecord = await database.oTP.create({
      data: {
        email,
        otp: hashedOTP,
        expiresAt,
        attempts: 0
      }
    })

    console.log(`OTP for ${email}: ${otp}`)
     await SendOTP({ userEmail: email, otp });

    return {
      success: true,
      message: "OTP sent successfully",
      otpId: otpRecord.id
    }

  } catch (error) {
    console.error("OTP generation error:", error)
    return {
      success: false,
      message: "Failed to generate OTP",
      error: "GENERATION_FAILED"
    }
  }
}

// Verify OTP
export async function verifyOTP(email: string, otp: string): Promise<VerifyOTPResult> {
  try {
    if (!email || !otp) {
      return {
        success: false,
        message: "Email and OTP are required",
        error: "INVALID_INPUT"
      }
    }

    // Find the latest OTP for this email
    const otpRecord = await database.oTP.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' }
    })

    if (!otpRecord) {
      return {
        success: false,
        message: "OTP not found or expired",
        error: "OTP_NOT_FOUND"
      }
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < new Date()) {
      await database.oTP.delete({
        where: { id: otpRecord.id }
      })
      return {
        success: false,
        message: "OTP has expired",
        error: "OTP_EXPIRED"
      }
    }

    // Check if maximum attempts exceeded
    if (otpRecord.attempts >= 5) {
      await database.oTP.delete({
        where: { id: otpRecord.id }
      })
      return {
        success: false,
        message: "Maximum attempts exceeded. Please request a new OTP.",
        error: "MAX_ATTEMPTS_EXCEEDED"
      }
    }

    // Verify OTP
    const hashedInputOTP = crypto.createHash('sha256').update(otp).digest('hex')
    const isOTPValid = hashedInputOTP === otpRecord.otp

    // Increment attempts
    await database.oTP.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } }
    })

    if (!isOTPValid) {
      const remainingAttempts = 5 - (otpRecord.attempts + 1)
      return {
        success: false,
        message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
        error: "INVALID_OTP"
      }
    }

    // OTP is valid - delete the OTP record
    await database.oTP.delete({
      where: { id: otpRecord.id }
    })

    // Get user details
    const user = await database.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        userName: true,
        imageUrl: true,
        isEmailVerified: true,
        kycStatus: true,
      }
    })

    if (!user) {
      return {
        success: false,
        message: "User not found",
        error: "USER_NOT_FOUND"
      }
    }

    // Update email verification status if this is for verification
    if (!user.isEmailVerified) {
      await database.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true }
      })
    }

    return {
      success: true,
      message: "OTP verified successfully",
      user
    }

  } catch (error) {
    console.error("OTP verification error:", error)
    return {
      success: false,
      message: "Failed to verify OTP",
      error: "VERIFICATION_FAILED"
    }
  }
}

// Regenerate OTP
export async function regenerateOTP(email: string): Promise<OTPResult> {
  try {
    if (!email) {
      return {
        success: false,
        message: "Email is required",
        error: "EMAIL_REQUIRED"
      }
    }

    // Check if user exists
    const user = await database.user.findUnique({
      where: { email }
    })

    if (!user) {
      return {
        success: false,
        message: "User not found",
        error: "USER_NOT_FOUND"
      }
    }

    // Delete existing OTP
    await database.oTP.deleteMany({
      where: { email }
    })

    // Generate new OTP
    return await generateOTP(email)

  } catch (error) {
    console.error("OTP regeneration error:", error)
    return {
      success: false,
      message: "Failed to regenerate OTP",
      error: "REGENERATION_FAILED"
    }
  }
}

// Check if OTP exists and is valid
export async function checkOTPStatus(email: string): Promise<{
  exists: boolean
  expiresAt?: Date
  attempts?: number
}> {
  try {
    const otpRecord = await database.oTP.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' }
    })

    if (!otpRecord) {
      return { exists: false }
    }

    return {
      exists: true,
      expiresAt: otpRecord.expiresAt,
      attempts: otpRecord.attempts
    }
  } catch (error) {
    console.error("OTP status check error:", error)
    return { exists: false }
  }
}