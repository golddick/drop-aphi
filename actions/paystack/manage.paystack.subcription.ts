"use server";

import { database } from "@/lib/database";
import axios from "axios";



type PaystackSubscriptionResponse = {
  status: boolean;
  message: string;
  data?: {
    authorization?: {
      authorization_url?: string;
    };
    // You can extend with other Paystack subscription fields if needed
  };
};

type ManageSubscriptionResult =
  | { url: string }
  | { error: string };

export const managePaystackSubscription = async ({
  customerCode,
}: {
  customerCode: string | undefined;
}): Promise<ManageSubscriptionResult> => {
  if (!customerCode) {
    console.error("No customer code provided");
    return { error: "No customer account found. Please contact support." };
  }

  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecret) {
    console.error("PAYSTACK_SECRET_KEY is missing");
    return {
      error: "Payment system is currently unavailable. Please try again later.",
    };
  }

  try {
    // Get membership with active subscription
    const membership = await database.user.findFirst({
      where: {
        paystackCustomerId: customerCode,
        subscriptionStatus: "ACTIVE",
      },
    });

    if (!membership?.paystackSubscriptionId) {
      console.warn(`No active subscription for customer: ${customerCode}`);
      return {
        error: "No active subscription found. You may need to upgrade first.",
      };
    }

    // Get subscription details from Paystack
 const subscriptionResponse = await axios.get<PaystackSubscriptionResponse>(
  `https://api.paystack.co/subscription/${membership.paystackSubscriptionId}`,
  {
    headers: {
      Authorization: `Bearer ${paystackSecret}`,
      "Content-Type": "application/json",
    },
    timeout: 10000,
  }
);


    const authUrl = subscriptionResponse.data?.data?.authorization?.authorization_url;

    if (!authUrl) {
      console.error("No authorization URL in Paystack response:", subscriptionResponse.data);
      return {
        error: "Subscription management is currently unavailable. Please try again later.",
      };
    }

    return { url: authUrl };
  } catch (error: any) {
    console.error("Subscription management failed:", {
      error: error.response?.data || error.message,
      stack: error.stack,
      customerCode,
    });

    if (error.response?.data?.message?.includes("Invalid subscription")) {
      return { error: "Your subscription appears to be invalid. Please contact support." };
    }

    if (error.code === "ECONNABORTED") {
      return { error: "Request timed out. Please try again." };
    }

    return {
      error:
        error.response?.data?.message ||
        "We're having trouble accessing your subscription. Please try again or contact support.",
    };
  }
};
