'use server';

import { database } from "@/lib/database";
import { getAuthCookies } from "./cookie";
import { verifyAccess, verifyRefresh, signAccessToken, hashToken } from "./jwt";

export async function getServerAuth() {
  try {
    const { accessToken, refreshToken } = await getAuthCookies();

    if (!accessToken && !refreshToken) {
      console.log("No auth tokens found");
      return null;
    }

    // Try access token first
    if (accessToken) {
      try {
        const user = verifyAccess(accessToken);
        console.log("Access token valid for user:", user.id);
        return { 
          ...user, 
          userName: user.userName ?? null, 
          imageUrl: user.imageUrl ?? null 
        };
      } catch (accessError: any) {
        if (accessError.name === "TokenExpiredError") {
          console.log("Access token expired");
          // Continue to refresh token logic
        } else {
          console.error("Access token invalid:", accessError);
          return null;
        }
      }
    }

    // Try refresh token if access token is invalid/missing
    if (!refreshToken) {
      console.log("No refresh token available");
      return null;
    }

    try {
      const payload = verifyRefresh(refreshToken);
      console.log("Refresh token valid for user:", payload.sub);

      // Check refresh token in DB
      const dbToken = await database.refreshToken.findFirst({ 
        where: { 
          jti: payload.jti,
          userId: payload.sub,
          expiresAt: { gt: new Date() }
        } 
      });
      
      if (!dbToken) {
        console.log("Refresh token invalid in DB or expired");
        return null;
      }

      // Verify token hash matches
      const hashedToken = hashToken(refreshToken);
      if (dbToken.hashed !== hashedToken) {
        console.log("Refresh token hash mismatch");
        return null;
      }

      // Fetch user from DB
      const user = await database.user.findUnique({
        where: { id: payload.sub },
        select: { 
          id: true, 
          userId: true,
          email: true, 
          role: true, 
          userName: true, 
          imageUrl: true,
          kycStatus: true,
          isEmailVerified: true,
          accType: true,
          SenderName: true,
        },
      });
      
      if (!user) {
        console.log("User not found");
        return null;
      }

      // Create JWT user payload
      const jwtUser = {
        id: user.id,
        userId: user.userId,
        email: user.email,
        role: user.role,
        userName: user.userName,
        imageUrl: user.imageUrl ?? undefined,
        SenderName: user.SenderName ?? undefined,
        kycStatus: user.kycStatus,
        isEmailVerified: user.isEmailVerified,
        accType: user.accType,
      };

      // Issue new access token
      const newAccessToken = signAccessToken(jwtUser);

      console.log("New access token issued for user:", user.id);
      
      // Return user data (cookies will be set by the login action)
      return { 
        ...jwtUser, 
        userName: user.userName ?? null, 
        imageUrl: user.imageUrl ?? null 
      };

    } catch (refreshError: any) {
      console.error("Refresh token invalid:", refreshError.message);
      return null;
    }
  } catch (error) {
    console.error("Server auth error:", error);
    return null;
  }
}

// Separate function to refresh tokens (call this from client actions)
export async function refreshAuthTokens() {
  try {
    const { refreshToken } = await getAuthCookies();

    if (!refreshToken) {
      return { success: false, error: "No refresh token" };
    }

    const payload = verifyRefresh(refreshToken);
    
    // Check refresh token in DB
    const dbToken = await database.refreshToken.findFirst({ 
      where: { 
        jti: payload.jti,
        userId: payload.sub,
        expiresAt: { gt: new Date() }
      } 
    });
    
    if (!dbToken) {
      return { success: false, error: "Refresh token invalid" };
    }

    // Verify token hash matches
    const hashedToken = hashToken(refreshToken);
    if (dbToken.hashed !== hashedToken) {
      return { success: false, error: "Token validation failed" };
    }

    // Fetch user from DB
    const user = await database.user.findUnique({
      where: { id: payload.sub },
      select: { 
        id: true,
        userId: true, 
        email: true, 
        role: true, 
        userName: true, 
        imageUrl: true,
        kycStatus: true,
        isEmailVerified: true,
        accType: true,
        SenderName: true,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const jwtUser = {
      id: user.id,
      userId: user.userId,
      email: user.email,
      role: user.role,
      userName: user.userName,
      imageUrl: user.imageUrl ?? undefined,
      SenderName: user.SenderName ?? undefined,
      kycStatus: user.kycStatus,
      isEmailVerified: user.isEmailVerified,
      accType: user.accType,
    };

    const newAccessToken = signAccessToken(jwtUser);

    // Set new cookies
    const { setAuthCookies } = await import('./cookie');
    await setAuthCookies({ 
      accessToken: newAccessToken, 
      refreshToken 
    });

    return { 
      success: true, 
      user: jwtUser,
      accessToken: newAccessToken 
    };

  } catch (error: any) {
    console.error("Token refresh error:", error);
    return { success: false, error: error.message };
  }
}