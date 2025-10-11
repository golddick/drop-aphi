// import { corsOptions, withCors } from "@/lib/cors";
// import { database } from "@/lib/database";
// import { verifyApiKey } from "@/lib/key/apiKey";
// import { rateLimiter } from "@/lib/rateLimiter";
// import { NextRequest } from "next/server";
// import { z } from "zod";


// // ✅ Input validation
// const schema = z.object({
//   email: z.string().email("Invalid email"),
//   otp: z.string().length(6, "OTP must be 6 digits"),
// });

// export async function OPTIONS(req: NextRequest) {
//   return corsOptions(req);
// }

// export async function POST(req: NextRequest) {
//   try {
//     // 🔑 Validate API key
//     const apiKey = req.headers.get("drop-aphi-key");
//     if (!apiKey) {
//       return withCors({ error: "Missing API key", code: "NO_API_KEY" }, req, 401);
//     }

//      const verification = await verifyApiKey(apiKey);
//         if (!verification.valid || !verification.user)
//           return withCors(
//             { error: verification.message || "Unauthorized", code: "INVALID_API_KEY" },
//             req,
//             403
//           );
    
//         const userId = (verification.user as any).userId ?? "unknown";
//         const appName = (verification.user as any).senderName ?? "Drop-aphi";

//     // 🧾 Check active membership
//     const membership = await database.user.findUnique({
//       where: { userId: userId },
//     });

//     if (!membership || membership.subscriptionStatus !== "ACTIVE") {
//       return withCors(
//         { error: "User does not have an active subscription", code: "SUBSCRIPTION_INVALID" },
//         req,
//         403
//       );
//     }

//     // 🚦 Apply custom rate limit (100 req/min per API key)
//     const { success, limit, remaining, reset } = await rateLimiter(apiKey, 100, 60);

//     if (!success) {
//       const res = withCors(
//         { error: "Rate limit exceeded", code: "RATE_LIMITED" },
//         req,
//         429
//       );
//       res.headers.set("X-RateLimit-Limit", limit.toString());
//       res.headers.set("X-RateLimit-Remaining", remaining.toString());
//       res.headers.set("X-RateLimit-Reset", reset.toString());
//       return res;
//     }

//     // 🧩 Parse and validate request body
//     const body = await req.json();
//     const parsed = schema.safeParse(body);
//     if (!parsed.success) {
//       return withCors({ error: parsed.error.format(), code: "VALIDATION_ERROR" }, req, 400);
//     }

//     const { email, otp } = parsed.data;

//     // 🔍 Find OTP record
//     const record = await database.thirdPartyOTP.findUnique({ where: { email } });
//     if (!record) {
//       return withCors({ error: "No OTP found", code: "OTP_NOT_FOUND" }, req, 404);
//     }

//     // 🕒 Check expiration
//     if (record.expiresAt < new Date()) {
//       return withCors({ error: "OTP expired", code: "OTP_EXPIRED" }, req, 400);
//     }

//     // ❌ Check mismatch
//     if (record.code !== otp) {
//       return withCors({ error: "Invalid OTP", code: "INVALID_OTP" }, req, 400);
//     }

//     // ✅ Verified → Delete OTP record
//     await database.thirdPartyOTP.delete({ where: { email } });

//     // ✅ Successful response
//     const res = withCors({ success: true, message: "OTP verified successfully" }, req, 200);
//     res.headers.set("X-RateLimit-Limit", limit.toString());
//     res.headers.set("X-RateLimit-Remaining", remaining.toString());
//     res.headers.set("X-RateLimit-Reset", reset.toString());
//     return res;
//   } catch (err: any) {
//     console.error("[OTP_VERIFY_ERROR]", err);
//     return withCors({ error: "Internal server error", code: "SERVER_ERROR" }, req, 500);
//   }
// }








import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { corsOptions, withCors } from "@/lib/cors";
import { verifyApiKey } from "@/lib/key/apiKey";
import { database } from "@/lib/database";
import { rateLimiter } from "@/lib/rateLimiter";

// -------------------------
// 🧾 Validation Schema
// -------------------------
const schema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().min(4, "OTP must be at least 4 digits").max(10, "OTP too long"),
  purpose: z.string().default("custom"),
});

// -------------------------
// ⚙️ OPTIONS handler
// -------------------------
export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}

// -------------------------
// 🚀 POST handler
// -------------------------
export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get("drop-aphi-key");
    if (!apiKey)
      return withCors({ error: "Missing API key", code: "NO_API_KEY" }, req, 401);

    // 🚦 Apply rate limit (100 req/min per API key)
    const { success, limit, remaining, reset } = await rateLimiter(apiKey, 100, 60);
    if (!success) {
      const res = withCors(
        { error: "Rate limit exceeded", code: "RATE_LIMITED" },
        req,
        429
      );
      res.headers.set("X-RateLimit-Limit", limit.toString());
      res.headers.set("X-RateLimit-Remaining", remaining.toString());
      res.headers.set("X-RateLimit-Reset", reset.toString());
      return res;
    }

    const verification = await verifyApiKey(apiKey);
    if (!verification.valid || !verification.user)
      return withCors(
        { error: verification.message || "Unauthorized", code: "INVALID_API_KEY" },
        req,
        403
      );

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      return withCors({ error: parsed.error.format(), code: "VALIDATION_ERROR" }, req, 400);

    const { email, otp, purpose } = parsed.data;

    // 🔍 Find OTP record
    const record = await database.thirdPartyOTP.findUnique({
      where: { email },
    });

    if (!record)
      return withCors(
        { error: "OTP not found or not requested for this email", code: "OTP_NOT_FOUND" },
        req,
        404
      );

    // ⏰ Check expiration
    if (new Date() > record.expiresAt)
      return withCors(
        { error: "OTP has expired. Please request a new one.", code: "OTP_EXPIRED" },
        req,
        400
      );

    // 🚫 Limit attempts (max 5)
    if (record.attempts >= 5)
      return withCors(
        { error: "Too many invalid attempts. Please regenerate OTP.", code: "MAX_ATTEMPTS" },
        req,
        429
      );

    // 🔐 Verify hashed OTP
    const match = await bcrypt.compare(otp, record.code);
    if (!match) {
      await database.thirdPartyOTP.update({
        where: { email },
        data: { attempts: record.attempts + 1 },
      });

      return withCors(
        { error: "Invalid OTP. Please try again.", code: "INVALID_OTP" },
        req,
        401
      );
    }

    // ✅ OTP verified — mark as used/expired
    await database.thirdPartyOTP.update({
      where: { email },
      data: { attempts: 0,verified:true ,expiresAt: new Date(Date.now() - 1000) }, // expire immediately
    });

    const response = withCors(
      { success: true, message: "OTP verified successfully", email, purpose },
      req,
      200
    );

    // Add rate limit headers for transparency
    response.headers.set("X-RateLimit-Limit", limit.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", reset.toString());

    return response;
  } catch (err: any) {
    console.error("OTP Verify Error:", err);
    return withCors({ error: "Internal server error", code: "SERVER_ERROR" }, req, 500);
  }
}
