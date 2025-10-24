// "use server";

// import { getServerAuth } from "@/lib/auth/getauth";
// import { database } from "@/lib/database";
// import { KYCStatus } from "@/lib/generated/prisma";
// import { PLAN_CONFIG } from "@/lib/planLimit";
// import axios from "axios";

// interface PaystackInitializeResponse {
//   status: boolean;
//   message: string;
//   data?: {
//     authorization_url?: string;
//     access_code?: string;
//     reference?: string;
//   };
// }

// interface PaystackErrorResponse {
//   message?: string;
//   status?: boolean;
//   [key: string]: any;
// }

// interface CustomAxiosError<T = any> extends Error {
//   isAxiosError: boolean;
//   response?: {
//     data?: T;
//     status?: number;
//     statusText?: string;
//   };
// }

// function isAxiosError<T = any>(error: unknown): error is CustomAxiosError<T> {
//   return (
//     typeof error === "object" &&
//     error !== null &&
//     "isAxiosError" in error &&
//     (error as any).isAxiosError === true
//   );
// }


// export const paystackSubscribe = async ({
//   planName,
//   billingCycle,
//   userId,
//   redirectPath,
// }: {
//   planName: keyof typeof PLAN_CONFIG;
//   billingCycle: "monthly" | "yearly";
//   userId: string;
//   redirectPath?: string;
// }) => {
//   try {
//     console.log("=== PAYSTACK SUBSCRIPTION DEBUG ===");
    
//     const user = await getServerAuth();
//     if (!user) {
//       console.log("❌ User not authenticated");
//       return { success: false, error: "User not authenticated" };
//     }

//     const email = user.email;
//     if (!email) {
//       console.log("❌ User email not found");
//       return { success: false, error: "User email not found" };
//     }

//     const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
//     const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL! || "http://localhost:3003";

//     // 👇 CRITICAL DEBUG INFO
//     console.log("🔑 Paystack Secret Key exists:", !!paystackSecret);
//     console.log("🔑 Paystack Secret Key starts with:", paystackSecret?.substring(0, 10));
//     console.log("🌐 Website URL:", websiteUrl);
//     console.log("📋 Plan Name:", planName);
//     console.log("⏰ Billing Cycle:", billingCycle);
//     console.log("👤 User ID:", userId);
//     console.log("📧 User Email:", email);

//     if (!paystackSecret || !websiteUrl) {
//       console.log("❌ Missing environment variables");
//       return {
//         success: false,
//         error: "Payment system configuration error",
//       };
//     }

//     const membership = await database.user.findUnique({ where: { userId } });
//     console.log("👤 Membership found:", !!membership);
//     console.log("📊 KYC Status:", membership?.kycStatus);
//     console.log("💳 Paystack Customer ID:", membership?.paystackCustomerId);

//     if (!membership) {
//       return { success: false, error: "User membership not found" };
//     }

//     if (membership.kycStatus !== KYCStatus.APPROVED) {
//       return { success: false, kycRequired: true };
//     }

//     if (!membership?.paystackCustomerId) {
//       return { success: false, error: "User payment profile not set up" };
//     }

//     const planConfig = PLAN_CONFIG[planName]?.[billingCycle];
//     console.log("💰 Plan Config:", planConfig);

//     if (!planConfig) {
//       console.log("❌ Invalid plan configuration");
//       return {
//         success: false,
//         error: "Invalid subscription plan or billing cycle",
//       };
//     }

//     console.log("🆔 Plan ID:", planConfig.id);
//     console.log("💵 Plan Amount:", planConfig.amount);
//     console.log("🔄 Callback URL:", redirectPath);

//     const callbackUrl = redirectPath
//       ? `${websiteUrl}${redirectPath}`
//       : `${websiteUrl}/success`;

//     console.log("🎯 Final Callback URL:", callbackUrl);

//     // 👇 LOG THE EXACT REQUEST BEING SENT
//     console.log("🚀 Sending request to Paystack...");
//     console.log("📤 Request payload:", {
//       email,
//       amount: planConfig.amount * 100,
//       plan: planConfig.id,
//       metadata: { userId, planName, planCode: planConfig.id, billingCycle },
//       callback_url: callbackUrl,
//     });

//     const response = await axios.post<PaystackInitializeResponse>(
//       "https://api.paystack.co/transaction/initialize",
//       {
//         email,
//         amount: planConfig.amount * 100,
//         plan: planConfig.id,
//         metadata: { userId, planName, planCode: planConfig.id, billingCycle },
//         callback_url: callbackUrl,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${paystackSecret}`,
//           "Content-Type": "application/json",
//         },
//         timeout: 10000,
//       }
//     );

//     console.log("✅ Paystack Response:", response.data);

//     if (!response.data?.status || !response.data.data?.authorization_url) {
//       console.log("❌ Invalid response from Paystack");
//       return {
//         success: false,
//         error: "Payment gateway returned invalid response",
//       };
//     }

//     console.log("🎉 Success - Authorization URL:", response.data.data.authorization_url);
//     return { success: true, url: response.data.data.authorization_url };
    
//   } catch (error: unknown) {
//     console.error("💥 PAYSTACK ERROR DETAILS:");
//     console.error("Full error object:", error);
    
//     if (isAxiosError<PaystackErrorResponse>(error)) {
//       console.error("📊 Axios Error Details:");
//       console.error("Status:", error.response?.status);
//       console.error("Status Text:", error.response?.statusText);
//       console.error("Response Data:", error.response?.data);
//     }

//     let errorMessage = "Failed to initialize payment. Please try again later.";

//     if (isAxiosError<PaystackErrorResponse>(error)) {
//       errorMessage = error.response?.data?.message || error.message;
//     } else if (error instanceof Error) {
//       errorMessage = error.message;
//     }

//     return { success: false, error: errorMessage };
//   }
// };








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
  redirectPath,
}: {
  planName: keyof typeof PLAN_CONFIG;
  billingCycle: "monthly" | "yearly";
  userId: string;
  redirectPath?: string;
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
    const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL;

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

    const callbackUrl = redirectPath
      ? `${websiteUrl}${redirectPath}`
      : `${websiteUrl}/success`;

    const response = await axios.post<PaystackInitializeResponse>(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: planConfig.amount * 100,
        plan: planConfig.id,
        metadata: { 
          userId, 
          planName, 
          planCode: planConfig.id, 
          billingCycle,
          custom_fields: [
            {
              display_name: "Plan Name",
              variable_name: "plan_name",
              value: planName
            },
            {
              display_name: "Billing Cycle", 
              variable_name: "billing_cycle",
              value: billingCycle
            }
          ]
        },
        callback_url: callbackUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
        },
        timeout: 15000, // Increased timeout for production
      }
    );

    if (!response.data?.status || !response.data.data?.authorization_url) {
      return {
        success: false,
        error: "Payment gateway returned invalid response",
      };
    }

    return { 
      success: true, 
      url: response.data.data.authorization_url,
      reference: response.data.data.reference 
    };
    
  } catch (error: unknown) {
    // Log error for monitoring (use your logging service in production)
    console.error("Paystack subscription error:", error);

    let errorMessage = "Failed to initialize payment. Please try again.";
    let userFriendlyMessage = "We encountered an issue processing your payment. Please try again in a moment.";

    if (isAxiosError<PaystackErrorResponse>(error)) {
      const status = error.response?.status;
      const paystackMessage = error.response?.data?.message;
      
      // Map Paystack errors to user-friendly messages
      switch (status) {
        case 400:
          userFriendlyMessage = "Invalid payment request. Please check your details and try again.";
          break;
        case 401:
          userFriendlyMessage = "Payment service temporarily unavailable. Please try again later.";
          break;
        case 404:
          userFriendlyMessage = "The selected plan is not available. Please contact support.";
          break;
        case 422:
          userFriendlyMessage = paystackMessage || "Please check your payment information and try again.";
          break;
        case 500:
        case 502:
        case 503:
          userFriendlyMessage = "Payment service is temporarily unavailable. Please try again in a few minutes.";
          break;
        default:
          userFriendlyMessage = paystackMessage || userFriendlyMessage;
      }
      
      errorMessage = paystackMessage || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Return user-friendly message while logging technical details
    return { 
      success: false, 
      error: userFriendlyMessage,
      technicalError: process.env.NODE_ENV === "development" ? errorMessage : undefined
    };
  }
};