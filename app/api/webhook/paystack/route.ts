

import { NextResponse } from "next/server";
import crypto from "crypto";
import { PLAN_CONFIG } from "@/lib/planLimit";
import { PlanSubscriptionStatus } from "@prisma/client";
import { database } from "@/lib/database";

// 🔐 Verify Paystack webhook signature
function verifySignature(rawBody: string, signature: string | null) {
  const secret = process.env.PAYSTACK_SECRET_KEY!;
  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  return hash === signature;
}

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
        // Update membership
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
          },
        });
      }

      return NextResponse.json({ success: true, message: "Subscription updated" });
    }

    // ⚠️ Handle downgrade / cancellation
    if (
      ["subscription.disable", "subscription.not_renew", "subscription.cancel"].includes(event.event)
    ) {
      await database.user.update({
        where: { id: membership.id },
        data: {
          plan: "FREE",
          amount: 0,
          subscriptionStatus: PlanSubscriptionStatus.INACTIVE,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Subscription cancelled, downgraded to FREE",
      });
    }

    // ⚠️ Handle failed payments
    if (event.event === "invoice.payment_failed") {
      await database.user.update({
        where: { id: membership.id },
        data: {
          subscriptionStatus: PlanSubscriptionStatus.PAST_DUE,
          failedAttempts: (membership.failedAttempts || 0) + 1,
        },
      });

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
