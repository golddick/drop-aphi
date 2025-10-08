'use server';

import { cookies } from "next/headers";
import { ACCESS_TTL, REFRESH_TTL } from "./jwt";

const isProd = process.env.NODE_ENV === "production";


const REMEMBER_TTL = 30 * 24 * 60 * 60; // 30 days

// Set auth cookies
export async function setAuthCookies({
  accessToken,
  refreshToken,
  rememberMe = false, 
}: {
  accessToken: string;
  refreshToken: string;
  rememberMe?: boolean;
}) {
  try {
    const store = await cookies();

    console.log("🔐 Setting cookies - Access token length:", accessToken.length);
    console.log("🔐 Setting cookies - Refresh token length:", refreshToken.length);
    console.log("🔐 Remember me:", rememberMe);

    // Access token (always short)
    store.set("access_token", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TTL,
    });

    // Refresh token (long, depends on rememberMe)
    store.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: rememberMe ? REMEMBER_TTL : REFRESH_TTL,
    });

    console.log("✅ Cookies set successfully");
    return true;
  } catch (error) {
    console.error("❌ Failed to set cookies:", error);
    return false;
  }
}

// Clear auth cookies
export async function clearAuthCookies() {
  try {
    const store = await cookies();
    store.delete("access_token");
    store.delete("refresh_token");
    console.log("✅ Cookies cleared");
    return true;
  } catch (error) {
    console.error("❌ Failed to clear cookies:", error);
    return false;
  }
}

// Get auth cookies
export async function getAuthCookies() {
  try {
    const store = await cookies();
    const accessToken = store.get("access_token")?.value;
    const refreshToken = store.get("refresh_token")?.value;

    console.log("📋 Retrieved cookies - Access:", !!accessToken, "Refresh:", !!refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error("❌ Failed to get cookies:", error);
    return { accessToken: null, refreshToken: null };
  }
}
