"use server"

import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import {
  createJti,
  hashToken,
  signAccessToken,
  signRefreshToken,
  ACCESS_TTL,
  REFRESH_TTL,
  type JwtUser
} from "@/lib/auth/jwt"
import { generateOTP } from "../otp/otp"
import { database } from "@/lib/database"
import { setAuthCookies } from "@/lib/auth/cookie"

interface LoginFormData {
  email: string
  password: string
  rememberMe?: boolean
}

interface LoginResult {
  success: boolean
  message: string
  user?: {
    id: string
    email: string
    role: string
    userName: string
    imageUrl: string | null
  }
  error?: string
  requiresOTP?: boolean
  requiresEmailVerification?: boolean
}

export async function loginUser(formData: LoginFormData): Promise<LoginResult> {
  try {
    const { email, password, rememberMe = false } = formData

    console.log("🔐 Login attempt for:", email)

    if (!email || !password) {
      return {
        success: false,
        message: "Email and password are required",
        error: "EMAIL_PASSWORD_REQUIRED"
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

    const user = await database.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        userId: true,
        email: true,
        password: true,
        role: true,
        userName: true,
        imageUrl: true,
        isLoggedIn: true,
        kycStatus: true,
        isEmailVerified: true,
        accType: true,
        SenderName: true,
        is2FAEnabled: true,
      },
    })

    if (!user) {
      console.log("❌ User not found for email:", email)
      return {
        success: false,
        message: "Invalid email or password",
        error: "INVALID_CREDENTIALS"
      }
    }

    console.log("✅ User found - Database ID:", user.id, "UserID:", user.userId)

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      console.log("❌ Invalid password for user:", user.id)
      return {
        success: false,
        message: "Invalid email or password",
        error: "INVALID_CREDENTIALS"
      }
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      console.log("❌ Email not verified for user:", user.id)
      return {
        success: false,
        message: "Email not verified. Please verify your email to continue.",
        error: "EMAIL_NOT_VERIFIED",
        requiresEmailVerification: true
      }
    }

    // Check if 2FA is enabled for the user
    if (user.is2FAEnabled) {
      console.log("🔐 2FA enabled for user:", user.id)
      const otpResult = await generateOTP(email)
      if (otpResult.success) {
        return {
          success: false,
          message: "Two-factor authentication required. An OTP has been sent to your email.",
          error: "2FA_REQUIRED",
          requiresOTP: true
        }
      } else {
        return {
          success: false,
          message: "Failed to send 2FA code. Please try again.",
          error: "2FA_FAILED"
        }
      }
    }

    // Check current active sessions
    const activeSessions = await database.refreshToken.findMany({
      where: { 
        userId: user.id, // Use database ID for query
        expiresAt: {
          gt: new Date()
        }
      },
    })

    // Optional: Device limit check
    const MAX_DEVICES = 3;
    if (activeSessions.length >= MAX_DEVICES) {
      return {
        success: false,
        message: "Maximum device limit reached. Please log out from one device to continue.",
        error: "DEVICE_LIMIT_EXCEEDED"
      }
    }

    // ✅ FIX: Use consistent IDs - user.id for database relations, user.userId for JWT
    console.log("🔐 Creating tokens - Database ID:", user.id, "UserID:", user.userId)

    // Create JWT user payload - use user.userId as public identifier
    const jwtUser: JwtUser = {
      id: user.id, 
      userId:user.userId,
      email: user.email,
      role: user.role,
      userName: user.userName,
      imageUrl: user.imageUrl ?? undefined,
      SenderName: user.SenderName ?? undefined,
      kycStatus: user.kycStatus,
      isEmailVerified: user.isEmailVerified,
      accType: user.accType,
    }

    // Generate tokens
    const accessToken = signAccessToken(jwtUser)
    const jti = createJti()
    // ✅ FIX: Use user.id (database ID) for refresh token relation
    const refreshToken = signRefreshToken({ sub: user.id, jti })
    const hashed = hashToken(refreshToken)

    const expiresAt = new Date(Date.now() + REFRESH_TTL * 1000)

    console.log("🔐 Tokens generated - Access token length:", accessToken.length)
    console.log("🔐 Refresh token length:", refreshToken.length)

    // ✅ FIX: Save refresh token with database ID
    try {
      await database.refreshToken.create({
        data: {
          userId: user.id, // Use database ID for relation
          jti,
          hashed,
          userAgent: "Server Action",
          ip: "Unknown",
          expiresAt,
        },
      })
      console.log("✅ Refresh token saved to database")
    } catch (dbError: any) {
      console.error("❌ Database error creating refresh token:", dbError)
      if (dbError.code === 'P2003') {
        return {
          success: false,
          message: "Database configuration error. Please contact support.",
          error: "DATABASE_ERROR"
        }
      }
      throw dbError
    }

    // Update user login status - use database ID
    await database.user.update({
      where: { id: user.id }, // Use database ID
      data: { isLoggedIn: true, loggedInAt: new Date() },
    })

    // Set cookies
    await setAuthCookies({
      accessToken, 
      refreshToken,
      rememberMe
    })

    console.log("✅ Login successful for user:", user.userId)

    return {
      success: true,
      message: "Login successful",
      user: {
        id: user.userId, // Return public identifier
        email: user.email,
        role: user.role,
        userName: user.userName,
        imageUrl: user.imageUrl,
      }
    }

  } catch (error: any) {
    console.error("❌ Login error:", error)
    
    if (error.code === 'P2003') {
      return {
        success: false,
        message: "Database relationship error. Please contact support.",
        error: "DATABASE_RELATION_ERROR"
      }
    }
    
    return {
      success: false,
      message: "An error occurred during login. Please try again.",
      error: "INTERNAL_SERVER_ERROR"
    }
  }
}

// Enhanced logout function with better error handling
export async function logoutUser(): Promise<{ success: boolean; message: string }> {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value
    
    console.log("🔐 Logout initiated")
    
    if (refreshToken) {
      try {
        const { verifyRefresh, hashToken } = await import('@/lib/auth/jwt')
        const decoded = verifyRefresh(refreshToken)
        const hashedToken = hashToken(refreshToken)
        
        await database.refreshToken.deleteMany({
          where: {
            jti: decoded.jti,
            hashed: hashedToken
          }
        })
        console.log("✅ Refresh token invalidated")
      } catch (error) {
        console.error('Error invalidating refresh token:', error)
      }
    }

    // Clear cookies
    cookieStore.delete('access_token')
    cookieStore.delete('refresh_token')
    
    console.log("✅ Cookies cleared")
    
    return { success: true, message: "Logged out successfully" }
    
  } catch (error) {
    console.error('❌ Logout error:', error)
    return { success: false, message: "Logout failed" }
  } finally {
    redirect('/auth')
  }
}

// Additional utility function to check auth status
export async function checkAuthStatus(): Promise<{ 
  isAuthenticated: boolean; 
  user?: JwtUser 
}> {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('access_token')?.value
    
    console.log("🔐 Auth check - Access token present:", !!accessToken)
    
    if (!accessToken) {
      return { isAuthenticated: false }
    }

    // Verify the access token
    const { verifyAccess } = await import('@/lib/auth/jwt')
    const user = verifyAccess(accessToken)
    
    console.log("✅ Auth valid for user:", user.id)
    
    return { isAuthenticated: true, user }
    
  } catch (error) {
    console.error('❌ Auth check error:', error)
    return { isAuthenticated: false }
  }
}