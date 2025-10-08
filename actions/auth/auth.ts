"use server"

import { hash } from "bcryptjs"
import { generateOTP } from "../otp/otp"
import { database } from "@/lib/database"
import { generateCustomUserId } from "@/lib/utils"

interface SignupFormData {
  fullName: string
  userName: string
  email: string
  password: string
}

interface SignupResult {
  success: boolean
  message: string
  userId?: string
  email?: string
  error?: string
}

export async function registerUser(formData: SignupFormData): Promise<SignupResult> {
  try {
    const { fullName, userName, email, password } = formData

    // Validate required fields
    if (!fullName || !userName || !email || !password) {
      return {
        success: false,
        message: "All fields are required",
        error: "VALIDATION_ERROR",
      }
    }

    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/
    if (!emailRegex.test(email)) {
      return {
        success: false,
        message: "Please enter a valid email address",
        error: "VALIDATION_ERROR",
      }
    }

    // Check if user already exists
    const existingUser = await database.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return {
        success: false,
        message: "An account with this email already exists",
        error: "USER_ALREADY_EXISTS",
      }
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user in database
    const user = await database.user.create({
      data: {
        userId: generateCustomUserId(),
        fullName: fullName.trim(),
        userName: userName.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        isEmailVerified: false, // Pending OTP verification
      },
    })

    // Generate OTP for email verification
    const otpResult = await generateOTP(email)

    if (!otpResult.success) {
      // Delete user if OTP generation fails
      await database.user.delete({
        where: { id: user.id },
      })

      return {
        success: false,
        message: "Failed to send verification code. Please try again.",
        error: "OTP_GENERATION_FAILED",
      }
    }

    return {
      success: true,
      message: "Account created successfully. Please check your email for verification code.",
      userId: user.id,
      email: user.email,
    }
  } catch (error) {
    console.error("Registration error:", error)

    return {
      success: false,
      message: "An error occurred during registration. Please try again.",
      error: "INTERNAL_SERVER_ERROR",
    }
  }
}
