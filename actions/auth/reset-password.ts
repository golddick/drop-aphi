"use server"

import { hash, compare } from "bcryptjs"
import { generateOTP, verifyOTP } from "../otp/otp"
import { database } from "@/lib/database"

interface ResetPasswordData {
  email: string
}

interface ResetPasswordResult {
  success: boolean
  message: string
  error?: string
}

interface VerifyResetOTPData {
  email: string
  otp: string
}

interface VerifyResetOTPResult {
  success: boolean
  message: string
  isValid?: boolean
  error?: string
}

interface UpdatePasswordData {
  email: string
  otp: string
  newPassword: string
}

interface UpdatePasswordResult {
  success: boolean
  message: string
  error?: string
}

export async function requestPasswordReset(formData: ResetPasswordData): Promise<ResetPasswordResult> {
  try {
    const { email } = formData

    if (!email) {
      return {
        success: false,
        message: "Email is required",
        error: "EMAIL_REQUIRED"
      }
    }

    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/
    if (!emailRegex.test(email)) {
      return {
        success: false,
        message: "Please enter a valid email address",
        error: "INVALID_EMAIL"
      }
    }

    // Check if user exists
    const user = await database.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      // For security reasons, don't reveal if email exists or not
      return {
        success: true,
        message: "If an account with that email exists, a reset code has been sent."
      }
    }

    // Generate OTP for password reset verification
    const otpResult = await generateOTP(email)
    
    if (otpResult.success) {
      return {
        success: true,
        message: "Reset code sent successfully. Please check your email."
      }
    } else {
      return {
        success: false,
        message: "Failed to send reset code. Please try again.",
        error: "OTP_GENERATION_FAILED"
      }
    }

  } catch (error) {
    console.error("Password reset request error:", error)
    return {
      success: false,
      message: "An error occurred. Please try again.",
      error: "INTERNAL_SERVER_ERROR"
    }
  }
}

export async function verifyResetOTP(formData: VerifyResetOTPData): Promise<VerifyResetOTPResult> {
  try {
    const { email, otp } = formData

    if (!email || !otp) {
      return {
        success: false,
        message: "Email and OTP are required",
        error: "MISSING_DATA"
      }
    }

    // Verify OTP using existing OTP system
    const otpResult = await verifyOTP(
      email,
      otp)

    if (otpResult.success) {
      return {
        success: true,
        message: "OTP verified successfully",
        isValid: true
      }
    } else {
      return {
        success: false,
        message: otpResult.message,
        error: otpResult.error
      }
    }

  } catch (error) {
    console.error("OTP verification error:", error)
    return {
      success: false,
      message: "An error occurred during OTP verification",
      error: "INTERNAL_SERVER_ERROR"
    }
  }
}

export async function updatePasswordWithOTP(formData: UpdatePasswordData): Promise<UpdatePasswordResult> {
  try {
    const { email, otp, newPassword } = formData

    if (!email || !otp || !newPassword) {
      return {
        success: false,
        message: "All fields are required",
        error: "MISSING_DATA"
      }
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return {
        success: false,
        message: "Password must be at least 8 characters long",
        error: "WEAK_PASSWORD"
      }
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return {
        success: false,
        message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        error: "WEAK_PASSWORD"
      }
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 12)

    // Update user password
    await database.user.update({
      where: { email: email.toLowerCase() },
      data: { password: hashedPassword }
    })

    // Invalidate all existing refresh tokens for security
    await database.refreshToken.deleteMany({
      where: { 
        user: { email: email.toLowerCase() } 
      }
    })

    return {
      success: true,
      message: "Password updated successfully. You can now login with your new password."
    }

  } catch (error) {
    console.error("Password update error:", error)
    return {
      success: false,
      message: "An error occurred while updating your password",
      error: "INTERNAL_SERVER_ERROR"
    }
  }
}

// Combined function for the reset password flow
export async function completePasswordReset(formData: UpdatePasswordData): Promise<UpdatePasswordResult> {
  try {
    const { email, otp, newPassword } = formData

    if (!email || !otp || !newPassword) {
      return {
        success: false,
        message: "All fields are required",
        error: "MISSING_DATA"
      }
    }

    // Verify OTP first
    const otpResult = await verifyOTP(
      email,
      otp)

    if (!otpResult.success) {
      return {
        success: false,
        message: otpResult.message,
        error: otpResult.error
      }
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return {
        success: false,
        message: "Password must be at least 8 characters long",
        error: "WEAK_PASSWORD"
      }
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return {
        success: false,
        message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        error: "WEAK_PASSWORD"
      }
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 12)

    // Update user password
    await database.user.update({
      where: { email: email.toLowerCase() },
      data: { password: hashedPassword }
    })

    // Invalidate all existing refresh tokens for security
    await database.refreshToken.deleteMany({
      where: { 
        user: { email: email.toLowerCase() } 
      }
    })

    return {
      success: true,
      message: "Password updated successfully. You can now login with your new password."
    }

  } catch (error) {
    console.error("Complete password reset error:", error)
    return {
      success: false,
      message: "An error occurred during password reset",
      error: "INTERNAL_SERVER_ERROR"
    }
  }
}