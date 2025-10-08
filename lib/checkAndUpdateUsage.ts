

import dayjs from "dayjs";
import { database } from "./database";

// 👇 Action keys match your MembershipUsage schema
type ActionKey = 
  | "emailsSent"
  | "subscribersAdded"
  | "blogPostsCreated"; // ✅ NEW

interface UsageResult {
  success: boolean;
  message?: string;
  newCount?: number;
}

// ✅ Helper to generate current month key (e.g. "2025-07")
function getCurrentMonthKey(): string {
  return dayjs().format("YYYY-MM");
}

// ✅ Check if user is within limit
export async function checkUsageLimit(userId: string, action: ActionKey): Promise<UsageResult> {
  const currentMonth = getCurrentMonthKey();
console.log("Checking usage for", userId, action, "in month", currentMonth)
  try {
    const membership = await database.user.findUnique({
      where: { userId }
    });

    if (!membership) {
      return {
        success: false,
        message: "No active membership found"
      };
    }

    const limitFieldMap: Record<ActionKey, keyof typeof membership> = {
      emailsSent: "emailLimit",
      subscribersAdded: "subscriberLimit",
      blogPostsCreated: "blogPostLimit" // ✅ NEW
    };

    const limitField = limitFieldMap[action];
    const limit = membership[limitField];

    if (limit === null || limit === undefined) {
      return { success: true }; // Unlimited
    }

    let usage = await database.membershipUsage.findUnique({
      where: {
        userId_month: {
          userId,
          month: currentMonth
        }
      }
    });

    if (!usage) {
      usage = await database.membershipUsage.create({
        data: {
          userId,
          month: currentMonth,
          emailsSent: 0,
          subscribersAdded: 0,
          blogPostsCreated: 0 // ✅ NEW
        }
      });
    }

    const currentCount = usage[action] || 0;
    const numericLimit = typeof limit === "number" ? limit : Number(limit);

    if (currentCount >= numericLimit) {
      return {
        success: false,
        message: `You've reached your monthly limit of ${numericLimit} for ${action}.`
      };
    }

    return { success: true };

  } catch (error) {
    console.error("Usage check failed:", error);
    return {
      success: false,
      message: "Failed to check usage limits"
    };
  }
}

// ✅ Increment user usage by 1 (or custom)
export async function incrementUsage(
  userId: string,
  action: ActionKey,
  incrementBy: number = 1
): Promise<UsageResult> {
  const currentMonth = getCurrentMonthKey();

  try {
    let usage = await database.membershipUsage.findUnique({
      where: {
        userId_month: {
          userId,
          month: currentMonth
        }
      }
    });

    if (!usage) {
      usage = await database.membershipUsage.create({
        data: {
          userId,
          month: currentMonth,
          emailsSent: 0,
          subscribersAdded: 0,
          blogPostsCreated: 0 // ✅ NEW
        }
      });
    }

    const updatedUsage = await database.membershipUsage.update({
      where: { id: usage.id },
      data: {
        [action]: (usage[action] || 0) + incrementBy
      }
    });

    return {
      success: true,
      newCount: updatedUsage[action]
    };
  } catch (error) {
    console.error("Failed to increment usage:", error);
    return {
      success: false,
      message: "Failed to track usage"
    };
  }
}

// ✅ Decrement subscriber count when user unsubscribes
export async function decrementSubscriberUsage(userId: string, count: number = 1) {
  const month = getCurrentMonthKey();

  try {
    await database.membershipUsage.updateMany({
      where: {
        userId,
        month
      },
      data: {
        subscribersAdded: {
          decrement: count
        }
      }
    });
  } catch (error) {
    console.error("Failed to decrement subscriber usage:", error);
  }
}


export async function decrementBlogUsage(userId: string, count: number = 1) {
  const month = getCurrentMonthKey();

  try {
    await database.membershipUsage.updateMany({
      where: {
        userId,
        month
      },
      data: {
        blogPostsCreated: {
          decrement: count
        }
      }
    });
  } catch (error) {
    console.error("Failed to decrement blog usage:", error);
  }
}



