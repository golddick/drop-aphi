import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs"; // ✅ Hash OTPs
import { verifyApiKey } from "@/lib/key/apiKey";
import { database } from "@/lib/database";
import { send3rdPartyOTPEmail } from "@/lib/email/send3rdPartyOTP";
import { corsOptions, withCors } from "@/lib/cors";

// -------------------------
// 🧾 Validation Schema
// -------------------------
const schema = z.object({
  email: z.string().email("Invalid email address"),
  purpose: z.string().default("custom"),
  expiryMinutes: z.number().min(1).max(1440).optional().default(10),
  length: z.number().min(4).max(10).optional().default(6),
  template: z.object({
    subject: z.string().default("Your new verification code"),
    message: z
      .string()
      .optional()
      .default("Hello! {{userName}}."),
  }),
});

// -------------------------
// 🔢 Helper: Generate OTP
// -------------------------
function generateOtp(length: number): string {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

// -------------------------
// ⚙️ OPTIONS handler
// -------------------------
export async function OPTIONS(req: NextRequest) {
  return corsOptions(req);
}

// -------------------------
// 🔄 POST handler (Regenerate OTP)
// -------------------------
export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get("drop-aphi-key");
    if (!apiKey)
      return withCors({ error: "Missing API key", code: "NO_API_KEY" }, req, 401);

    const verification = await verifyApiKey(apiKey);
    if (!verification.valid || !verification.user)
      return withCors(
        { error: verification.message || "Unauthorized", code: "INVALID_API_KEY" },
        req,
        403
      );

    const userId = (verification.user as any).userId ?? "unknown";
    const appName = (verification.user as any).senderName ?? "Drop-aphi";
    const userName = (verification.user as any).userName?? "username";

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      return withCors({ error: parsed.error.format(), code: "VALIDATION_ERROR" }, req, 400);

    const { email, purpose, expiryMinutes, length, template } = parsed.data;

    // 🧭 Check existing OTP
    const existingOtp = await database.thirdPartyOTP.findUnique({ where: { email } });

    if (!existingOtp) {
      return withCors(
        { error: "No previous OTP found. Please request a new one instead.", code: "NO_OTP" },
        req,
        404
      );
    }

    // 🔢 Generate new OTP and hash it
    const newOtp = generateOtp(length);
    const hashedOtp = await bcrypt.hash(newOtp, 10); // ✅ Securely hashed
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // 🔁 Update OTP record
    await database.thirdPartyOTP.update({
      where: { email },
      data: {
        code: hashedOtp, // ✅ store hash only
        otpType: purpose,
        expiresAt,
        createdBy: userId,
        createdAt: new Date(),
        attempts: existingOtp.attempts + 1,
      },
    });

    // ✉️ Replace placeholders
    const textMessage = template.message
      .replace("{{userName}}", userName)
      .replace("{{expiry}}", expiryMinutes.toString());

    // 💎 Advanced HTML email
    const html = `
      <div style="max-width:600px;margin:auto;background:#f9fafb;border-radius:12px;padding:30px;font-family:Arial,Helvetica,sans-serif;border:1px solid #e5e7eb;">
        <div style="text-align:center;padding-bottom:20px;">
          <h1 style="color:#111827;font-size:22px;margin-bottom:8px;">${template.subject}</h1>
          <p style="color:#6b7280;font-size:14px;">A new one-time passcode (OTP) has been generated for ${purpose}.</p>
        </div>
        
        <p style="color:#374151;font-size:15px;margin-top:10px;">${textMessage}</p>

        <div style="text-align:center;background:#111827;color:#ffffff;border-radius:10px;padding:20px;margin:20px 0;">
          <h2 style="font-size:36px;letter-spacing:6px;margin:0;">${newOtp}</h2>
        </div>

        <p style="color:#6b7280;font-size:13px;margin-top:25px;text-align:center;">
          This code will expire in <strong>${expiryMinutes} minutes</strong>.
          Please do not share this code with anyone.
        </p>

        <div style="text-align:center;margin-top:40px;">
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
          <p style="color:#9ca3af;font-size:12px;">
            © ${new Date().getFullYear()} <a href="https://thenews.africa"
              style="color:#666;text-decoration:underline;"
              target="_blank">${appName}</a>.<br/>
            All rights reserved.
          </p>
        </div>
      </div>
    `;

    // ✉️ Send email
    const result = await send3rdPartyOTPEmail(email, template.subject, html, appName);
    if (!result.success)
      return withCors({ error: "Failed to send email", code: "EMAIL_FAILED" }, req, 500);

    // ✅ Don’t include OTP in response
    return withCors(
      {
        success: true,
        email,
        expiresAt,
        message: "OTP regenerated successfully",
      },
      req,
      200
    );
  } catch (err: any) {
    return withCors(
      { error: "Internal server error", code: "SERVER_ERROR" },
      req,
      500
    );
  }
}
