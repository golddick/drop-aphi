"use server";

import { getServerAuth } from "@/lib/auth/getauth";
import { database } from "@/lib/database";
import { Plan, PlanSubscriptionStatus } from "@/lib/generated/prisma";

export const addPaystack = async () => {
  try {
    // Authenticate the user
    const user = await getServerAuth();
    if (!user) {
      throw new Error("User not authenticated");
    }

    console.log(user, "user");

    const userId = user.userId;
    const email = user.email;
    const userName = user.userName;

    if (!email) {
      throw new Error("User email not found");
    }

    // Check if user exists in DB
    const existingUser = await database.user.findUnique({
      where: { userId: userId },
    });

    if (!existingUser) {
      throw new Error("No user found in database");
    }

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    // If user already has Paystack customer, handle membershipUsage
    if (existingUser.paystackCustomerId) {
      // Check if membership usage already exists for this month
      const existingUsage = await database.membershipUsage.findFirst({
        where: {
          userId: userId,
          month: currentMonth
        }
      });

      if (!existingUsage) {
        // Create new membership usage if it doesn't exist
        await database.membershipUsage.create({
          data: {
            userId: userId,
            month: currentMonth,
            emailsSent: 0,
            subscribersAdded: 0,
            campaignsCreated: 0,
          },
        });
      }

      return {
        success: true,
        message: "Membership already exists",
        paystackCustomerId: existingUser.paystackCustomerId,
      };
    }

    // Create Paystack customer
    const response = await fetch("https://api.paystack.co/customer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        first_name: userName || "",
        metadata: {
          appUserId: userId,
        },
      }),
    });

    const data = await response.json();

    if (!data.status || !data.data) {
      throw new Error(data.message || "Paystack customer creation failed");
    }

    const paystackCustomer = data.data;

    // Update user with Paystack customer info
    await database.user.update({
      where: { userId: userId },
      data: {
        paystackCustomerId: paystackCustomer.customer_code,
        plan: Plan.FREE,
        subscriptionStatus: PlanSubscriptionStatus.INACTIVE,
      },
    });

    // Create membership usage for current month (only if it doesn't exist)
    const existingUsage = await database.membershipUsage.findFirst({
      where: {
        userId: userId,
        month: currentMonth
      }
    });

    if (!existingUsage) {
      await database.membershipUsage.create({
        data: {
          userId: userId,
          month: currentMonth,
          emailsSent: 0,
          subscribersAdded: 0,
          campaignsCreated: 0,
        },
      });
    }

    return {
      success: true,
      message: "Paystack integration completed",
      paystackCustomerId: paystackCustomer.customer_code,
    };
  } catch (error: any) {
    console.error("Paystack integration error:", error);
    return {
      success: false,
      error: error.message || "Failed to integrate with Paystack",
    };
  };
};