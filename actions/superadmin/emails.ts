"use server"

import { getServerAuth } from "@/lib/auth/getauth"
import { database } from "@/lib/database"

export async function getEmailCampaignsAction() {
  try {
    const user = await getServerAuth()
    if (!user) {
      return { success: false, message: "You must be logged in to view email campaigns" }
    }

    // Check if user is SUPERADMIN
    if (user.role !== "SUPERADMIN") {
      return { success: false, message: "Unauthorized: You must be an admin" }
    }

    // Fetch email campaigns with analytics
    const emails = await database.email.findMany({
      where: {
        userId: user.userId,
      },
      include: {
        emailAnalytics: true,
        emailRecipients: true,
        campaign: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match the EmailCampaign interface
    const campaigns = emails.map(email => {
      const analytics = email.emailAnalytics
      const recipients = email.emailRecipients || []
      
      // Calculate rates
      const totalRecipients = email.recipients || recipients.length
      const deliveredCount = recipients.filter(r => r.status === "SENT").length
      const openCount = analytics?.uniqueOpens || 0
      const clickCount = analytics?.uniqueClicks || 0

      const deliveryRate = totalRecipients > 0 ? (deliveredCount / totalRecipients) * 100 : 0
      const openRate = deliveredCount > 0 ? (openCount / deliveredCount) * 100 : 0
      const clickRate = deliveredCount > 0 ? (clickCount / deliveredCount) * 100 : 0

      // Map EmailStatus enum to component status
      let status: "draft" | "scheduled" | "sent" | "failed"
      
      switch (email.status) {
        case "SENT":
          status = "sent"
          break
        case "SCHEDULED":
          status = "scheduled"
          break
        case "FAILED":
          status = "failed"
          break
        case "SENDING":
          status = "scheduled" // Map SENDING to scheduled for display
          break
        case "CANCELLED":
          status = "failed" // Map CANCELLED to failed for display
          break
        default:
          status = "draft" // DRAFT and any other status
      }

      return {
        id: email.id,
        title: email.title,
        subject: email.emailSubject,
        status,
        createdAt: email.createdAt.toISOString(),
        sentAt: email.sentAt?.toISOString(),
        opens: openCount,
        clicks: clickCount,
        recipients: totalRecipients,
        deliveryRate: Math.round(deliveryRate * 10) / 10, // Round to 1 decimal
        openRate: Math.round(openRate * 10) / 10,
        clickRate: Math.round(clickRate * 10) / 10
      }
    })

    return {
      success: true,
      campaigns
    }
  } catch (error) {
    console.error("Failed to fetch email campaigns:", error)
    return { success: false, message: "Failed to fetch email campaigns" }
  }
}