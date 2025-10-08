"use server";

import { getServerAuth } from "@/lib/auth/getauth";
import { database } from "@/lib/database";
import { KYCStatus } from "@/lib/generated/prisma";
import { PLAN_CONFIG } from "@/lib/planLimit";
import axios from "axios";

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url?: string;
    access_code?: string;
    reference?: string;
  };
}

interface PaystackErrorResponse {
  message?: string;
  status?: boolean;
  [key: string]: any;
}

interface CustomAxiosError<T = any> extends Error {
  isAxiosError: boolean;
  response?: {
    data?: T;
    status?: number;
    statusText?: string;
  };
}

function isAxiosError<T = any>(error: unknown): error is CustomAxiosError<T> {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    (error as any).isAxiosError === true
  );
}

export const paystackSubscribe = async ({
  planName,
  billingCycle,
  userId,
  redirectPath, // 👈 add this
}: {
  planName: keyof typeof PLAN_CONFIG;
  billingCycle: "monthly" | "yearly";
  userId: string;
  redirectPath?: string; // 👈 optional
}) => {
  try {
    const user = await getServerAuth();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const email = user.email;
    if (!email) {
      return { success: false, error: "User email not found" };
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const websiteUrl =
      process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3003";

    if (!paystackSecret || !websiteUrl) {
      return {
        success: false,
        error: "Payment system configuration error",
      };
    }

    const membership = await database.user.findUnique({ where: { userId } });
    if (!membership) {
      return { success: false, error: "User membership not found" };
    }

    if (membership.kycStatus !== KYCStatus.APPROVED) {
      return { success: false, kycRequired: true };
    }

    if (!membership?.paystackCustomerId) {
      return { success: false, error: "User payment profile not set up" };
    }

    const planConfig = PLAN_CONFIG[planName]?.[billingCycle];
    if (!planConfig) {
      return {
        success: false,
        error: "Invalid subscription plan or billing cycle",
      };
    }

    // 👇 dynamic callback URL
    const callbackUrl = redirectPath
      ? `${websiteUrl}${redirectPath}`
      : `${websiteUrl}/success`;

    const response = await axios.post<PaystackInitializeResponse>(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: planConfig.amount * 100,
        plan: planConfig.id,
        metadata: { userId, planName, planCode: planConfig.id, billingCycle },
        callback_url: callbackUrl, // 👈 here
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    if (!response.data?.status || !response.data.data?.authorization_url) {
      return {
        success: false,
        error: "Payment gateway returned invalid response",
      };
    }

    return { success: true, url: response.data.data.authorization_url };
  } catch (error: unknown) {
    console.error("Paystack Error:", error);

    let errorMessage = "Failed to initialize payment. Please try again later.";

    if (isAxiosError<PaystackErrorResponse>(error)) {
      errorMessage =
        error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
};
