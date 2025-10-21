




// import { getServerAuth } from "@/lib/auth/getauth";
// import { database } from "@/lib/database";
// import { createApiKey, getApiKey, regenerateApiKey, createTrialApiKey } from "@/lib/key/apiKey";
// import { NextResponse } from "next/server";

// export async function GET(req: Request) {
//   try {
//     const user = await getServerAuth();
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { searchParams } = new URL(req.url);
//     const regenerate = searchParams.get("regenerate") === "true";

//     // Check user's subscription status
//     const subscription = await database.user.findFirst({
//       where: { userId: user.userId },
//     });

//     // Check if user already has an API key
//     const existingApiKey = await database.apiKey.findFirst({
//       where: { userId: user.userId },
//     });

//     // If user has inactive/free subscription and no existing key → eligible for trial
//     const isEligibleForTrial = (!subscription || subscription.subscriptionStatus === "INACTIVE" || subscription.plan === "FREE") && 
//                                !existingApiKey;

//     if (isEligibleForTrial) {
//       // Create trial key for ALL first-time users (no limit)
//       const trialKeyRecord = await createTrialApiKey();
//       return NextResponse.json(trialKeyRecord, { status: 200 });
//     }

//     // For users with existing keys or active subscriptions
//     let apiKeyRecord;

//     if (regenerate) {
//       // Only allow regeneration for premium users with active subscription
//       // Trial users cannot regenerate
//       if (existingApiKey?.isTrial) {
//         return NextResponse.json({ 
//           error: "Trial users cannot regenerate API keys. Please upgrade your plan." 
//         }, { status: 403 });
//       }
      
//       if (!subscription || subscription.subscriptionStatus !== 'ACTIVE' || subscription.plan === "FREE") {
//         return NextResponse.json({ 
//           error: "Active subscription required to regenerate API key" 
//         }, { status: 403 });
//       }
      
//       apiKeyRecord = await regenerateApiKey();
//     } else {
//       const existing = await database.apiKey.findFirst({
//         where: { userId: user.userId },
//       });

//       if (existing) {
//         // Check if trial key has expired
//         if (existing.isTrial && existing.expiresAt < new Date()) {
//           await database.apiKey.delete({ where: { id: existing.id } });
//           return NextResponse.json({ 
//             error: "Trial API key has expired. Please upgrade your plan." 
//           }, { status: 403 });
//         }
        
//         apiKeyRecord = await getApiKey();
//       } else {
//         // Create new key only for premium users
//         // If user gets here, they're not eligible for trial (already had one or have subscription)
//         if (!subscription || subscription.subscriptionStatus !== 'ACTIVE' || subscription.plan === "FREE") {
//           return NextResponse.json({ 
//             error: "Trial period ended. Please upgrade to create a new API key." 
//           }, { status: 403 });
//         }
        
//         apiKeyRecord = await createApiKey();
//       }
//     }

//     return NextResponse.json(apiKeyRecord, { status: 200 });
//   } catch (err) {
//     console.error("API Key Error:", err);
//     return NextResponse.json({ error: "Failed to generate key" }, { status: 500 });
//   }
// }



import { getServerAuth } from "@/lib/auth/getauth";
import { database } from "@/lib/database";
import {
  createApiKey,
  getApiKey,
  regenerateApiKey,
  createTrialApiKey,
} from "@/lib/key/apiKey";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const user = await getServerAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const regenerate = searchParams.get("regenerate") === "true";

    // Fetch user with subscription and KYC details
    const userData = await database.user.findFirst({
      where: { userId: user.userId },
      select: {
        id: true,
        plan: true,
        subscriptionStatus: true,
        approvedKYC: true,
      },
    });

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Ensure KYC approval before any key generation
    if (!userData.approvedKYC) {
      return NextResponse.json(
        { error: "You must complete and get your KYC approved before generating an API key." },
        { status: 403 }
      );
    }

    // Check if user already has an API key
    const existingApiKey = await database.apiKey.findFirst({
      where: { userId: user.userId },
    });

    // Check if user is on free plan
    const isFreePlan = userData.plan === "FREE" ;
    
    // Check if user has active subscription
    const hasActiveSubscription = userData.subscriptionStatus === "ACTIVE" ;

    // Determine eligibility for trial
    const isEligibleForTrial =
      (isFreePlan || !hasActiveSubscription) &&
      !existingApiKey;

    let apiKeyRecord;

    if (isEligibleForTrial) {
      // ✅ Create a trial key with "drop-aphi-key-trial-xxxxx"
      const trialKeyRecord = await createTrialApiKey();
      return NextResponse.json(trialKeyRecord, { status: 200 });
    }

    // For non-trial users, check subscription status
    if (!hasActiveSubscription || isFreePlan) {
      return NextResponse.json(
        { 
          error: "Active premium subscription required to generate API key. Please upgrade your plan." 
        },
        { status: 403 }
      );
    }

    if (regenerate) {
      // Only allow regeneration for active premium users
      if (existingApiKey?.isTrial) {
        return NextResponse.json(
          {
            error: "Trial users cannot regenerate API keys. Please upgrade your plan.",
          },
          { status: 403 }
        );
      }

      // ✅ Regenerate production key with live prefix
      apiKeyRecord = await regenerateApiKey();
    } else {
      // Fetch or create new key
      if (existingApiKey) {
        // Check for expired trial key
        if (existingApiKey.isTrial && existingApiKey.expiresAt < new Date()) {
          await database.apiKey.delete({ where: { id: existingApiKey.id } });
          return NextResponse.json(
            {
              error: "Trial API key has expired. Please upgrade your plan.",
            },
            { status: 403 }
          );
        }

        // Return existing premium key
        apiKeyRecord = await getApiKey();
      } else {
        // ✅ Create production key with "drop-aphi-key-live-xxxxx"
        apiKeyRecord = await createApiKey();
      }
    }

    return NextResponse.json(apiKeyRecord, { status: 200 });
  } catch (err) {
    console.error("API Key Error:", err);
    return NextResponse.json(
      { error: "Failed to generate key" },
      { status: 500 }
    );
  }
}






// import { getServerAuth } from "@/lib/auth/getauth";
// import { database } from "@/lib/database";
// import {
//   createApiKey,
//   getApiKey,
//   regenerateApiKey,
//   createTrialApiKey,
// } from "@/lib/key/apiKey";
// import { NextResponse } from "next/server";

// export async function GET(req: Request) {
//   try {
//     const user = await getServerAuth();
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { searchParams } = new URL(req.url);
//     const regenerate = searchParams.get("regenerate") === "true";

//     // Fetch user with subscription and KYC details
//     const subscription = await database.user.findFirst({
//       where: { userId: user.userId },
//       select: {
//         id: true,
//         plan: true,
//         subscriptionStatus: true,
//         approvedKYC: true,
//       },
//     });

//     if (!subscription) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     // ✅ Ensure KYC approval before any key generation
//     if (!subscription.approvedKYC) {
//       return NextResponse.json(
//         { 
//           error: "You must complete and get your KYC approved before generating an API key.",
//           code: "KYC_REQUIRED"
//         },
//         { status: 403 }
//       );
//     }

//     // Check if user already has an API key
//     const existingApiKey = await database.apiKey.findFirst({
//       where: { userId: user.userId },
//     });

//     // Determine eligibility for trial
//     const isEligibleForTrial =
//       (subscription.plan === "FREE" || 
//        subscription.subscriptionStatus === "INACTIVE") &&
//       !existingApiKey;

//     let apiKeyRecord;

//     if (isEligibleForTrial) {
//       // ✅ Create a trial key with "drop-aphi-key-trial-xxxxx"
//       const trialKeyRecord = await createTrialApiKey();
//       return NextResponse.json(trialKeyRecord, { status: 200 });
//     }

//     if (regenerate) {
//       // Only allow regeneration for active (premium) users
//       if (existingApiKey?.isTrial) {
//         return NextResponse.json(
//           {
//             error: "Trial users cannot regenerate API keys. Please upgrade your plan.",
//             code: "TRIAL_LIMITATION"
//           },
//           { status: 403 }
//         );
//       }

//       // ✅ Check for active subscription (not free plan)
//       if (subscription.plan === "FREE" || subscription.subscriptionStatus !== "ACTIVE") {
//         return NextResponse.json(
//           { 
//             error: "Active premium subscription required to regenerate API key.",
//             code: "SUBSCRIPTION_REQUIRED"
//           },
//           { status: 403 }
//         );
//       }

//       // ✅ Regenerate production key with live prefix
//       apiKeyRecord = await regenerateApiKey();
//     } else {
//       // Fetch or create new key
//       if (existingApiKey) {
//         // Check for expired trial key
//         if (existingApiKey.isTrial && existingApiKey.expiresAt < new Date()) {
//           await database.apiKey.delete({ where: { id: existingApiKey.id } });
//           return NextResponse.json(
//             {
//               error: "Trial API key has expired. Please upgrade your plan.",
//               code: "TRIAL_EXPIRED"
//             },
//             { status: 403 }
//           );
//         }

//         apiKeyRecord = await getApiKey();
//       } else {
//         // ✅ Only users with active premium subscription can create new production keys
//         if (subscription.plan === "FREE" || subscription.subscriptionStatus !== "ACTIVE") {
//           return NextResponse.json(
//             {
//               error: "Active premium subscription required to create API keys. Trial period has ended.",
//               code: "SUBSCRIPTION_REQUIRED"
//             },
//             { status: 403 }
//           );
//         }

//         // ✅ Create production key with "drop-aphi-key-live-xxxxx"
//         apiKeyRecord = await createApiKey();
//       }
//     }

//     return NextResponse.json(apiKeyRecord, { status: 200 });
//   } catch (err) {
//     console.error("API Key Error:", err);
//     return NextResponse.json(
//       { error: "Failed to generate key" },
//       { status: 500 }
//     );
//   }
// }