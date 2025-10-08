import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";

// ------------------ Environment & Defaults ------------------
const ACCESS_SECRET: string = process.env.JWT_ACCESS_SECRET || "super_access_secret_at_least_32_chars";
const REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || "super_refresh_secret_at_least_32_chars";


export const ACCESS_TTL = 15 * 60;        // 15 minutes
export const REFRESH_TTL = 2 * 24 * 60 * 60;

// ------------------ Types ------------------
export type JwtUser = {
  id: string;
  userId:string;
  email: string;
  role: string;
  userName: string;
  imageUrl?: string;
  SenderName?: string;
  kycStatus: string;
  isEmailVerified: boolean;
  accType: string;
};

export type RefreshPayload = {
  sub: string;  // user id
  jti: string;  // unique token id
  exp?: number; // expiration
};

// ------------------ Access Token ------------------
export function signAccessToken(user: JwtUser): string {
  const options: SignOptions = { expiresIn: ACCESS_TTL };
  return jwt.sign(user, ACCESS_SECRET as jwt.Secret, options);
}

export function verifyAccess(token: string): JwtUser & jwt.JwtPayload {
  try {
    return jwt.verify(token, ACCESS_SECRET) as JwtUser & jwt.JwtPayload;
  } catch (err) {
    console.error("Access token verification error:", err);
    throw err;
  }
}

// ------------------ Refresh Token ------------------
export function signRefreshToken(payload: RefreshPayload): string {
  const options: SignOptions = { expiresIn: REFRESH_TTL };
  return jwt.sign(payload, REFRESH_SECRET as jwt.Secret, options);
}

export function verifyRefresh(token: string): RefreshPayload & jwt.JwtPayload {
  try {
    return jwt.verify(token, REFRESH_SECRET) as RefreshPayload & jwt.JwtPayload;
  } catch (err) {
    console.error("Refresh token verification error:", err);
    throw err;
  }
}

// ------------------ Utility ------------------
/**
 * Generates a unique token ID (jti) for refresh tokens
 */
export function createJti(): string {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Hash a token for storage in DB
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}