




import { getServerAuth } from "@/lib/auth/getauth";
import { database } from "@/lib/database";
import { createApiKey, getApiKey, regenerateApiKey, createTrialApiKey } from "@/lib/key/apiKey";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const user = await getServerAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const regenerate = searchParams.get("regenerate") === "true";

    // Check user's subscription status
    const subscription = await database.user.findFirst({
      where: { userId: user.userId },
    });

    // Check if user already has an API key
    const existingApiKey = await database.apiKey.findFirst({
      where: { userId: user.userId },
    });

    // If user has inactive/free subscription and no existing key → eligible for trial
    const isEligibleForTrial = (!subscription || subscription.subscriptionStatus === "INACTIVE" || subscription.plan === "FREE") && 
                               !existingApiKey;

    if (isEligibleForTrial) {
      // Create trial key for ALL first-time users (no limit)
      const trialKeyRecord = await createTrialApiKey();
      return NextResponse.json(trialKeyRecord, { status: 200 });
    }

    // For users with existing keys or active subscriptions
    let apiKeyRecord;

    if (regenerate) {
      // Only allow regeneration for premium users with active subscription
      // Trial users cannot regenerate
      if (existingApiKey?.isTrial) {
        return NextResponse.json({ 
          error: "Trial users cannot regenerate API keys. Please upgrade your plan." 
        }, { status: 403 });
      }
      
      if (!subscription || subscription.subscriptionStatus !== 'ACTIVE' || subscription.plan === "FREE") {
        return NextResponse.json({ 
          error: "Active subscription required to regenerate API key" 
        }, { status: 403 });
      }
      
      apiKeyRecord = await regenerateApiKey();
    } else {
      const existing = await database.apiKey.findFirst({
        where: { userId: user.userId },
      });

      if (existing) {
        // Check if trial key has expired
        if (existing.isTrial && existing.expiresAt < new Date()) {
          await database.apiKey.delete({ where: { id: existing.id } });
          return NextResponse.json({ 
            error: "Trial API key has expired. Please upgrade your plan." 
          }, { status: 403 });
        }
        
        apiKeyRecord = await getApiKey();
      } else {
        // Create new key only for premium users
        // If user gets here, they're not eligible for trial (already had one or have subscription)
        if (!subscription || subscription.subscriptionStatus !== 'ACTIVE' || subscription.plan === "FREE") {
          return NextResponse.json({ 
            error: "Trial period ended. Please upgrade to create a new API key." 
          }, { status: 403 });
        }
        
        apiKeyRecord = await createApiKey();
      }
    }

    return NextResponse.json(apiKeyRecord, { status: 200 });
  } catch (err: any) {
    console.error("API Key Error:", err);
    return NextResponse.json({ error: "Failed to generate key" }, { status: 500 });
  }
}