"use server"

import { getServerAuth } from "@/lib/auth/getauth";
import { database } from "@/lib/database";
import { revalidatePath } from "next/cache";

// Get current user's subscription details
export async function getCurrentSubscription() {
  try {
    const user = await getServerAuth();
    if (!user) {
      return { error: "You must be logged in to view subscription" };
    }

    const membership = await database.user.findUnique({
      where: { id: user.id },
      select: {
        plan: true,
        subscriptionStatus: true,
        currentPeriodEnd: true,
        nextPaymentDate: true,
        amount: true,
        currency: true,
        subscriberLimit: true,
        emailLimit: true,
        blogPostLimit: true,
        aiGenerationLimit: true,
      },
    });

    if (!membership) {
      return { error: "No subscription found" };
    }

    // Convert to lowercase status to match client expectations
    return {
      ...membership,
      subscriptionStatus: membership.subscriptionStatus.toLowerCase()
    };
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return { error: "Failed to fetch subscription data" };
  }
}

// Get current usage statistics

export async function getUsageStats() {
  try {
    const user = await getServerAuth();
    if (!user) {
      return { error: "You must be logged in to view usage" };
    }
  
    const currentMonth = new Date().toISOString().slice(0, 7); // "2024-01"

    // First, let's see ALL usage records for this user to understand the data
    const allUsage = await database.membershipUsage.findMany({
      where: { 
        userId: user.userId
      },
      select: {
        id: true,
        month: true, // Include month to see what's stored
        emailsSent: true,
        subscribersAdded: true,
        blogPostsCreated: true,
        aiGenerationsUsed: true,
        createdAt: true,
      },
    });

    // Now try to find the current month's usage
    const currentUsage = await database.membershipUsage.findFirst({
      where: { 
        userId: user.userId, 
        month: currentMonth 
      },
      select: {
        emailsSent: true,
        subscribersAdded: true,
        blogPostsCreated: true,
        aiGenerationsUsed: true,
      },
    });

    // If we found current month usage, return it
    if (currentUsage) {
      return currentUsage;
    }

    // If no current month usage found, check if we have any records at all
    if (allUsage.length > 0) {
      // Return the most recent record (assuming you want latest data)
      const mostRecent = allUsage[allUsage.length - 1];
      return {
        emailsSent: mostRecent.emailsSent,
        subscribersAdded: mostRecent.subscribersAdded,
        blogPostsCreated: mostRecent.blogPostsCreated,
        aiGenerationsUsed: mostRecent.aiGenerationsUsed,
      };
    }

    // No records found at all, return defaults
    return {
      emailsSent: 0,
      subscribersAdded: 0,
      blogPostsCreated: 0,
      aiGenerationsUsed: 0,
    };
  } catch (error) {
    console.error("Error fetching usage stats:", error);
    return { error: "Failed to fetch usage statistics" };
  }
}

export async function downgradeToFreePlan() {
  try {
    const user = await getServerAuth();
    if (!user) {
      return { success: false, error: "You must be logged in to downgrade plan" };
    }
    
    await database.user.update({
      where: { id: user.id },
      data: {
        plan: "FREE",
        subscriptionStatus: "INACTIVE",
        amount: 0,
        subscriberLimit: 500,
        emailLimit: 20,
        blogPostLimit: 10,
        aiGenerationLimit: 5,
        nextPaymentDate: null,
      },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to downgrade:", error);
    return { success: false, error: "Unable to downgrade to Free plan" };
  }
}

// Cancel subscription
export async function cancelSubscription() {
  try {
    const user = await getServerAuth();
    if (!user) {
      return { success: false, error: "You must be logged in to cancel subscription" };
    }

    await database.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: "CANCELLED",
        nextPaymentDate: null,
      },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return { success: false, error: "Failed to cancel subscription" };
  }
}

// Toggle auto-renewal
export async function toggleAutoRenew(autoRenew: boolean) {
  try {
    const user = await getServerAuth();
    if (!user) {
      return { success: false, error: "You must be logged in to change auto-renew" };
    }

    await database.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: autoRenew ? "ACTIVE" : "INACTIVE",
      },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Error toggling auto-renew:", error);
    return { success: false, error: "Failed to update auto-renewal" };
  }
}

// Get billing history
export async function getBillingHistory() {
  try {
    const user = await getServerAuth();
    if (!user) {
      return { error: "You must be logged in to view billing history" };
    }

    const invoices = await database.invoice.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    return invoices.map((invoice) => ({
      id: invoice.id,
      date: invoice.date.toISOString(),
      amount: invoice.amount,
      status: invoice.status,
      description: invoice.description,
      invoiceUrl: invoice.invoiceUrl,
    }));
  } catch (error) {
    console.error("Error fetching billing history:", error);
    return { error: "Failed to fetch billing history" };
  }
}