

// import { NextResponse } from "next/server";
// import crypto from "crypto";
// import { PLAN_CONFIG } from "@/lib/planLimit";
// import { PlanSubscriptionStatus } from "@prisma/client";
// import { database } from "@/lib/database";

// // 🔐 Verify Paystack webhook signature
// function verifySignature(rawBody: string, signature: string | null) {
//   const secret = process.env.PAYSTACK_SECRET_KEY!;
//   const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
//   return hash === signature;
// }

// export async function POST(request: Request) {
//   try {
//     const rawBody = await request.text();
//     const paystackSignature = request.headers.get("x-paystack-signature");

//     if (!verifySignature(rawBody, paystackSignature)) {
//       return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
//     }

//     const event = JSON.parse(rawBody);
//     const data = event.data;

//     console.log(`🔔 Paystack Event Received: ${event.event}`);

//     // 🔎 Find membership by Paystack customer
//     const membership = await database.user.findFirst({
//       where: { paystackCustomerId: data?.customer?.customer_code },
//     });

//     if (!membership) {
//       return NextResponse.json({ error: "Membership not found" }, { status: 404 });
//     }

//     // ✅ Handle subscription success & charge events
//     if (
//       [
//         "subscription.create",
//         "subscription.enable",
//         "subscription.charge.success",
//         "invoice.payment_success",
//         "charge.success",
//       ].includes(event.event)
//     ) {
//       let mappedPlan: "FREE" | "LAUNCH" | "SCALE" = "FREE";
//       let billingCycle: "monthly" | "yearly" = "monthly";

//       const planCode = data.plan?.plan_code;

//       // Match plan against PLAN_CONFIG
//       for (const [planName, planConfig] of Object.entries(PLAN_CONFIG)) {
//         if (planConfig.monthly.id === planCode) {
//           mappedPlan = planName as "LAUNCH" | "SCALE";
//           billingCycle = "monthly";
//           break;
//         }
//         if (planConfig.yearly.id === planCode) {
//           mappedPlan = planName as "LAUNCH" | "SCALE";
//           billingCycle = "yearly";
//           break;
//         }
//       }

//       // Determine charge amount
//       const amount =
//         typeof data.amount === "number"
//           ? data.amount / 100
//           : PLAN_CONFIG[mappedPlan]?.[billingCycle]?.amount || 0;

//       // 🧾 Avoid duplicate invoices
//       const existingInvoice = await database.invoice.findFirst({
//         where: { externalId: data.id?.toString() },
//       });

//       if (!existingInvoice) {
//         // Update membership
//         await database.user.update({
//           where: { id: membership.id },
//           data: {
//             plan: mappedPlan,
//             amount,
//             role: mappedPlan === "FREE" ? "USER" : "NEWSLETTEROWNER",
//             subscriptionStatus: PlanSubscriptionStatus.ACTIVE,
//             paystackSubscriptionId: data.subscription?.subscription_code ?? membership.paystackSubscriptionId,
//             nextPaymentDate: data.next_payment_date ? new Date(data.next_payment_date) : membership.nextPaymentDate,
//             lastPaymentDate: data.paid_at ? new Date(data.paid_at) : membership.lastPaymentDate,
//           },
//         });

//         // Create invoice
//         await database.invoice.create({
//           data: {
//             userId: membership.userId,
//             description: `${mappedPlan} Plan - ${billingCycle}`,
//             amount,
//             status: "paid",
//             invoiceUrl: data.invoice_url || data.authorization?.receipt_url || "",
//             date: new Date(),
//             externalId: data.id?.toString(),
//           },
//         });
//       }

//       return NextResponse.json({ success: true, message: "Subscription updated" });
//     }

//     // ⚠️ Handle downgrade / cancellation
//     if (
//       ["subscription.disable", "subscription.not_renew", "subscription.cancel"].includes(event.event)
//     ) {
//       await database.user.update({
//         where: { id: membership.id },
//         data: {
//           plan: "FREE",
//           amount: 0,
//           subscriptionStatus: PlanSubscriptionStatus.INACTIVE,
//         },
//       });

//       return NextResponse.json({
//         success: true,
//         message: "Subscription cancelled, downgraded to FREE",
//       });
//     }

//     // ⚠️ Handle failed payments
//     if (event.event === "invoice.payment_failed") {
//       await database.user.update({
//         where: { id: membership.id },
//         data: {
//           subscriptionStatus: PlanSubscriptionStatus.PAST_DUE,
//           failedAttempts: (membership.failedAttempts || 0) + 1,
//         },
//       });

//       return NextResponse.json({
//         success: true,
//         message: "Payment failed, membership marked as past_due",
//       });
//     }

//     console.warn("Unhandled Paystack event:", event.event);
//     return NextResponse.json({ message: "Event ignored" });
//   } catch (error: any) {
//     console.error("🚨 Paystack webhook error:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }















import { NextResponse } from "next/server";
import crypto from "crypto";
import { PLAN_CONFIG, PLAN_LIMITS } from "@/lib/planLimit";
import { PlanSubscriptionStatus } from "@prisma/client";
import { database } from "@/lib/database";

// 🔐 Verify Paystack webhook signature
function verifySignature(rawBody: string, signature: string | null) {
  const secret = process.env.PAYSTACK_SECRET_KEY!;
  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  return hash === signature;
}

// 🎯 Plan-based limits configuration


export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const paystackSignature = request.headers.get("x-paystack-signature");

    if (!verifySignature(rawBody, paystackSignature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const data = event.data;

    console.log(`🔔 Paystack Event Received: ${event.event}`);

    // 🔎 Find membership by Paystack customer
    const membership = await database.user.findFirst({
      where: { paystackCustomerId: data?.customer?.customer_code },
    });

    if (!membership) {
      return NextResponse.json({ error: "Membership not found" }, { status: 404 });
    }

    // ✅ Handle subscription success & charge events
    if (
      [
        "subscription.create",
        "subscription.enable",
        "subscription.charge.success",
        "invoice.payment_success",
        "charge.success",
      ].includes(event.event)
    ) {
      let mappedPlan: "FREE" | "LAUNCH" | "SCALE" = "FREE";
      let billingCycle: "monthly" | "yearly" = "monthly";

      const planCode = data.plan?.plan_code;

      // Match plan against PLAN_CONFIG
      for (const [planName, planConfig] of Object.entries(PLAN_CONFIG)) {
        if (planConfig.monthly.id === planCode) {
          mappedPlan = planName as "LAUNCH" | "SCALE";
          billingCycle = "monthly";
          break;
        }
        if (planConfig.yearly.id === planCode) {
          mappedPlan = planName as "LAUNCH" | "SCALE";
          billingCycle = "yearly";
          break;
        }
      }

      // Get plan limits
      const planLimits = PLAN_LIMITS[mappedPlan];

      // Determine charge amount
      const amount =
        typeof data.amount === "number"
          ? data.amount / 100
          : PLAN_CONFIG[mappedPlan]?.[billingCycle]?.amount || 0;

      // 🧾 Avoid duplicate invoices
      const existingInvoice = await database.invoice.findFirst({
        where: { externalId: data.id?.toString() },
      });

      if (!existingInvoice) {
        // Update membership with plan limits
        await database.user.update({
          where: { id: membership.id },
          data: {
            plan: mappedPlan,
            amount,
            role: mappedPlan === "FREE" ? "USER" : "NEWSLETTEROWNER",
            subscriptionStatus: PlanSubscriptionStatus.ACTIVE,
            paystackSubscriptionId: data.subscription?.subscription_code ?? membership.paystackSubscriptionId,
            nextPaymentDate: data.next_payment_date ? new Date(data.next_payment_date) : membership.nextPaymentDate,
            lastPaymentDate: data.paid_at ? new Date(data.paid_at) : membership.lastPaymentDate,
            // 🎯 Update plan-based limits
            subscriberLimit: planLimits.subscriberLimit,
            emailLimit: planLimits.emailLimit,
            blogPostLimit: planLimits.blogPostLimit,
            aiGenerationLimit: planLimits.aiGenerationLimit,
            // Reset failed attempts on successful payment
            failedAttempts: 0,
          },
        });

        // Create invoice
        await database.invoice.create({
          data: {
            userId: membership.userId,
            description: `${mappedPlan} Plan - ${billingCycle}`,
            amount,
            status: "paid",
            invoiceUrl: data.invoice_url || data.authorization?.receipt_url || "",
            date: new Date(),
            externalId: data.id?.toString(),
            plan: mappedPlan,
            billingCycle: billingCycle,
          },
        });

        console.log(`✅ Updated user ${membership.userId} to ${mappedPlan} plan with limits:`, planLimits);
      }

      return NextResponse.json({ success: true, message: "Subscription updated" });
    }

    // ⚠️ Handle downgrade / cancellation
    if (
      ["subscription.disable", "subscription.not_renew", "subscription.cancel"].includes(event.event)
    ) {
      const freeLimits = PLAN_LIMITS.FREE;
      
      await database.user.update({
        where: { id: membership.id },
        data: {
          plan: "FREE",
          amount: 0,
          role: "USER",
          subscriptionStatus: PlanSubscriptionStatus.INACTIVE,
          // 🎯 Reset to free plan limits
          subscriberLimit: freeLimits.subscriberLimit,
          emailLimit: freeLimits.emailLimit,
          blogPostLimit: freeLimits.blogPostLimit,
          aiGenerationLimit: freeLimits.aiGenerationLimit,
          nextPaymentDate: null,
          paystackSubscriptionId: null,
        },
      });

      console.log(`📉 Downgraded user ${membership.userId} to FREE plan`);

      return NextResponse.json({
        success: true,
        message: "Subscription cancelled, downgraded to FREE",
      });
    }

    // ⚠️ Handle failed payments
    if (event.event === "invoice.payment_failed") {
      const failedAttempts = (membership.failedAttempts || 0) + 1;
      
      // Auto-downgrade to FREE after 3 failed attempts
      if (failedAttempts >= 3) {
        const freeLimits = PLAN_LIMITS.FREE;
        
        await database.user.update({
          where: { id: membership.id },
          data: {
            plan: "FREE",
            amount: 0,
            role: "USER",
            subscriptionStatus: PlanSubscriptionStatus.INACTIVE,
            subscriberLimit: freeLimits.subscriberLimit,
            emailLimit: freeLimits.emailLimit,
            blogPostLimit: freeLimits.blogPostLimit,
            aiGenerationLimit: freeLimits.aiGenerationLimit,
            failedAttempts: 0, // Reset after downgrade
            nextPaymentDate: null,
            paystackSubscriptionId: null,
          },
        });

        console.log(`🔻 Auto-downgraded user ${membership.userId} to FREE after 3 failed payments`);
        
        return NextResponse.json({
          success: true,
          message: "Auto-downgraded to FREE after 3 failed payments",
        });
      }

      // Just increment failed attempts
      await database.user.update({
        where: { id: membership.id },
        data: {
          subscriptionStatus: PlanSubscriptionStatus.PAST_DUE,
          failedAttempts,
        },
      });

      console.log(`❌ Payment failed for user ${membership.userId}, attempt ${failedAttempts}`);

      return NextResponse.json({
        success: true,
        message: "Payment failed, membership marked as past_due",
      });
    }

    console.warn("Unhandled Paystack event:", event.event);
    return NextResponse.json({ message: "Event ignored" });
  } catch (error: any) {
    console.error("🚨 Paystack webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}