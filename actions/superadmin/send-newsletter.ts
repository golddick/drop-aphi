// // app/actions/send-newsletter.ts
// "use server"

// import { database } from "@/lib/database"
// import { revalidatePath } from "next/cache"
// import type { Prisma } from "@prisma/client"
// import { getServerAuth } from "@/lib/auth/getauth"
// import { sendPlatformNotificationEmail } from "@/lib/email/sendPlatformNotification"

// interface EmailElement {
//   id: string
//   type: "text" | "image" | "video" | "button" | "social" | "divider" | "columns" | "logo"
//   content?: string
//   properties?: Record<string, any>
// }

// interface SendNewsletterParams {
//   title: string
//   content: string
//   emailSubject: string
//   previewText?: string
//   elements: EmailElement[]
//   campaignName?: string
//   campaignDescription?: string
//   trackOpens?: boolean
//   trackClicks?: boolean
//   enableUnsubscribe?: boolean
//   scheduleDate?: Date
//   scheduleTime?: string
//   templateUsed?: string
//   builderMode?: "drag-drop" | "code"
//   builderData?: Record<string, any>
// }

// export async function sendNewsletterAction(params: SendNewsletterParams) {
//   try {
//     const user = await getServerAuth()
//     if (!user) {
//       throw new Error("You must be logged in to send newsletters")
//     }

//     if (user.role !== "SUPERADMIN") {
//       throw new Error("Unauthorized: You must be an admin to send newsletters")
//     }

//     const userId = user.userId

//     // Validate required fields
//     if (!params.emailSubject.trim()) {
//       throw new Error("Email subject is required")
//     }
//     if (!params.content.trim()) {
//       throw new Error("Email content is required")
//     }
//     if (!params.title.trim()) {
//       throw new Error("Email title is required")
//     }

//     // Get newsletter subscribers
//     const subscribers = await database.platformSubscriber.findMany({
//       where: {
//         status: "SUBSCRIBED"
//       },
//       select: {
//         email: true
//       }
//     })

//     if (subscribers.length === 0) {
//       throw new Error("No subscribers found for your newsletter")
//     }

//     const subscriberEmails = subscribers.map(s => s.email)

//     let campaignId: string | undefined

//     // Create campaign if provided
//     if (params.campaignName) {
//       // Check if campaign name already exists for this user
//       const existingCampaign = await database.campaign.findFirst({
//         where: {
//           name: params.campaignName,
//           userId: userId
//         }
//       })

//       if (existingCampaign) {
//         throw new Error("Campaign name already exists")
//       }

//       const campaign = await database.campaign.create({
//         data: {
//           name: params.campaignName,
//           userId: userId,
//           description: params.campaignDescription,
//           type: "NEWSLETTER",
//           status: "ACTIVE",
//           recipients: subscribers.length,
//           emailsSent: 0,
//           openRate: 0,
//           clickRate: 0
//         }
//       })
//       campaignId = campaign.id
//     }

//     // Generate a unique message ID
//     const messageId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}@${process.env.DOMAIN || 'yourdomain.com'}`

//     // Create email record with all related data in a transaction
//     const result = await database.$transaction(async (tx) => {
//       // Create the main email record
//       const email = await tx.email.create({
//         data: {
//           title: params.title.trim(),
//           content: params.content,
//           emailSubject: params.emailSubject.trim(),
//           previewText: params.previewText,
//           builderMode: params.builderMode || "drag-drop",
//           builderData: params.builderData as any,
//           templateUsed: params.templateUsed,
//           status: params.scheduleDate ? "SCHEDULED" : "DRAFT",
//           emailType: "NEWSLETTER",
//           trackOpens: params.trackOpens ?? true,
//           trackClicks: params.trackClicks ?? true,
//           enableUnsubscribe: params.enableUnsubscribe ?? true,
//           scheduleDate: params.scheduleDate,
//           scheduleTime: params.scheduleTime,
//           recipients: subscribers.length,
//           userId: userId,
//           newsLetterOwnerId: userId,
//           campaignId: campaignId,
//           messageId: messageId
//         }
//       })

//       // Create email elements
//       if (params.elements && params.elements.length > 0) {
//         const elementsData = params.elements.map((element, index) => ({
//           emailId: email.id,
//           elementId: element.id,
//           type: element.type.toUpperCase() as any,
//           content: element.content || "",
//           properties: element.properties as any,
//           sortOrder: index
//         }))

//         await tx.emailElement.createMany({
//           data: elementsData
//         })
//       }

//       // Create email recipients
//       const recipientsData = subscriberEmails.map(recipient => ({
//         emailId: email.id,
//         recipientEmail: recipient,
//         status: "PENDING" as const
//       }))

//       await tx.emailRecipient.createMany({
//         data: recipientsData
//       })

//       // Create email analytics record
//       await tx.emailAnalytics.create({
//         data: {
//           emailId: email.id,
//           totalRecipients: subscribers.length,
//           deliveredCount: 0,
//           totalOpens: 0,
//           uniqueOpens: 0,
//           totalClicks: 0,
//           uniqueClicks: 0,
//           deliveryRate: 0,
//           openRate: 0,
//           clickRate: 0,
//           bounceRate: 0,
//           unsubscribeCount: 0,
//           spamReportCount: 0,
//           forwardCount: 0
//         }
//       })

//       return { email, recipientsCount: subscribers.length }
//     })

//     // If not scheduled, send immediately using platform sender
//     if (!params.scheduleDate) {
//       const sendResult = await sendEmailToSubscribers(
//         result.email.id, 
//         subscriberEmails, 
//         params.emailSubject, 
//         params.content,
//         params.trackOpens ?? true,
//         params.trackClicks ?? true,
//         params.enableUnsubscribe ?? true
//       )

//       if (!sendResult.success) {
//         throw new Error(`Failed to send some emails: ${sendResult.error}`)
//       }
//     }

//     revalidatePath("/xontrol/mail")
//     revalidatePath("/campaigns")
//     revalidatePath("/analytics")

//     return {
//       success: true,
//       message: params.scheduleDate 
//         ? `Newsletter scheduled successfully for ${params.scheduleDate.toLocaleDateString()}`
//         : "Newsletter sent successfully",
//       data: {
//         emailId: result.email.id,
//         campaignId: campaignId,
//         recipients: result.recipientsCount,
//         scheduled: !!params.scheduleDate
//       }
//     }

//   } catch (error) {
//     console.error("Error sending newsletter:", error)
//     return {
//       success: false,
//       message: error instanceof Error ? error.message : "Failed to send newsletter"
//     }
//   }
// }

// // Updated helper function to use platform email sender
// async function sendEmailToSubscribers(
//   emailId: string, 
//   recipientEmails: string[], 
//   subject: string,
//   content: string,
//   trackOpens: boolean,
//   trackClicks: boolean,
//   enableUnsubscribe: boolean
// ) {
//   try {
//     // Use the platform notification email sender
//     const sendResult = await sendPlatformNotificationEmail({
//       userEmail: recipientEmails,
//       subject: subject,
//       content: content,
//       adminEmail: process.env.ADMIN_EMAIL || 'admin@yourdomain.com',
//       fromApplication: 'Drop-Aphi',
//       trackOpens: trackOpens,
//       trackClicks: trackClicks,
//       enableUnsubscribe: enableUnsubscribe
//     })

//     // Update database based on send results
//     if (sendResult.success) {
//       // Update all recipients to SENT status
//       await database.emailRecipient.updateMany({
//         where: {
//           emailId: emailId,
//           recipientEmail: { in: recipientEmails }
//         },
//         data: {
//           status: "SENT",
//           sentAt: new Date()
//         }
//       })

//       // Update email statistics
//       await database.email.update({
//         where: { id: emailId },
//         data: {
//           emailsSentCount: recipientEmails.length,
//           sentAt: new Date(),
//           status: "SENT"
//         }
//       })

//       // Update analytics with initial counts
//       await database.emailAnalytics.update({
//         where: { emailId: emailId },
//         data: {
//           deliveredCount: recipientEmails.length,
//           deliveryRate: 100
//         }
//       })

//       console.log(`Successfully sent newsletter ${emailId} to ${recipientEmails.length} recipients`)
//     } else {
//       // Handle partial failures
//       const failedEmails = sendResult.stats?.failedEmails || []
//       const successfulEmails = recipientEmails.filter(email => !failedEmails.includes(email))

//       // Update successful sends
//       if (successfulEmails.length > 0) {
//         await database.emailRecipient.updateMany({
//           where: {
//             emailId: emailId,
//             recipientEmail: { in: successfulEmails }
//           },
//           data: {
//             status: "SENT",
//             sentAt: new Date()
//           }
//         })
//       }

//       // Update failed sends
//       if (failedEmails.length > 0) {
//         await database.emailRecipient.updateMany({
//           where: {
//             emailId: emailId,
//             recipientEmail: { in: failedEmails }
//           },
//           data: {
//             status: "FAILED",
//             bounceReason: "Email delivery failed"
//           }
//         })
//       }

//       // Update email statistics
//       await database.email.update({
//         where: { id: emailId },
//         data: {
//           emailsSentCount: successfulEmails.length,
//           sentAt: new Date(),
//           status: successfulEmails.length > 0 ? "SENT" : "FAILED"
//         }
//       })

//       // Update analytics
//       await database.emailAnalytics.update({
//         where: { emailId: emailId },
//         data: {
//           deliveredCount: successfulEmails.length,
//           deliveryRate: (successfulEmails.length / recipientEmails.length) * 100
//         }
//       })

//       if (successfulEmails.length === 0) {
//         throw new Error("All email deliveries failed")
//       }
//     }

//     return {
//       success: sendResult.success,
//       error: sendResult.error,
//       stats: sendResult.stats
//     }

//   } catch (error) {
//     console.error("Error in sendEmailToSubscribers:", error)
    
//     // Mark all recipients as failed in case of general error
//     await database.emailRecipient.updateMany({
//       where: {
//         emailId: emailId
//       },
//       data: {
//         status: "FAILED",
//         bounceReason: error instanceof Error ? error.message : "Unknown error"
//       }
//     })

//     await database.email.update({
//       where: { id: emailId },
//       data: {
//         status: "FAILED"
//       }
//     })

//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Failed to send emails"
//     }
//   }
// }































"use server"

import { database } from "@/lib/database"
import { revalidatePath } from "next/cache"
import type { Prisma } from "@prisma/client"
import { getServerAuth } from "@/lib/auth/getauth"
import { sendPlatformNotificationEmail } from "@/lib/email/sendPlatformNotification"

interface EmailElement {
  id: string
  type: "text" | "image" | "video" | "button" | "social" | "divider" | "columns" | "logo"
  content?: string
  properties?: Record<string, any>
}

interface SendNewsletterParams {
  title: string
  content: string
  emailSubject: string
  previewText?: string
  elements: EmailElement[]
  campaignName?: string
  campaignDescription?: string
  trackOpens?: boolean
  trackClicks?: boolean
  enableUnsubscribe?: boolean
  scheduleDate?: Date
  scheduleTime?: string
  templateUsed?: string
  builderMode?: "drag-drop" | "code"
  builderData?: Record<string, any>
}

export async function sendNewsletterAction(params: SendNewsletterParams) {
  try {
    const user = await getServerAuth()
    if (!user) {
      throw new Error("You must be logged in to send newsletters")
    }

    if (user.role !== "SUPERADMIN") {
      throw new Error("Unauthorized: You must be an admin to send newsletters")
    }

    const userId = user.userId

    // Validate required fields
    if (!params.emailSubject.trim()) {
      throw new Error("Email subject is required")
    }
    if (!params.content.trim()) {
      throw new Error("Email content is required")
    }
    if (!params.title.trim()) {
      throw new Error("Email title is required")
    }

    // Get newsletter subscribers
    const subscribers = await database.platformSubscriber.findMany({
      where: {
        status: "SUBSCRIBED"
      },
      select: {
        email: true
      }
    })

    if (subscribers.length === 0) {
      throw new Error("No subscribers found for your newsletter")
    }

    const subscriberEmails = subscribers.map(s => s.email)

    let campaignId: string | undefined

    // Handle campaign - use existing or create new
    if (params.campaignName) {
      // Check if campaign already exists for this user
      const existingCampaign = await database.campaign.findFirst({
        where: {
          name: params.campaignName,
          userId: userId
        }
      })

      if (existingCampaign) {
        // Use existing campaign
        campaignId = existingCampaign.id
        
        // Update campaign stats if needed
        await database.campaign.update({
          where: { id: campaignId },
          data: {
            recipients: {
              increment: subscribers.length
            }
          }
        })
      } else {
        // Create new campaign only if it doesn't exist
        const campaign = await database.campaign.create({
          data: {
            name: params.campaignName,
            userId: userId,
            description: params.campaignDescription,
            type: "NEWSLETTER",
            status: "ACTIVE",
            recipients: subscribers.length,
            emailsSent: 0,
            openRate: 0,
            clickRate: 0
          }
        })
        campaignId = campaign.id
      }
    }

    // Generate a unique message ID
    const messageId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}@${process.env.DOMAIN || 'yourdomain.com'}`

    // Create email record with all related data in a transaction
    const result = await database.$transaction(async (tx) => {
      // Create the main email record
      const email = await tx.email.create({
        data: {
          title: params.title.trim(),
          content: params.content,
          emailSubject: params.emailSubject.trim(),
          previewText: params.previewText,
          builderMode: params.builderMode || "drag-drop",
          builderData: params.builderData as any,
          templateUsed: params.templateUsed,
          status: params.scheduleDate ? "SCHEDULED" : "DRAFT",
          emailType: "NEWSLETTER",
          trackOpens: params.trackOpens ?? true,
          trackClicks: params.trackClicks ?? true,
          enableUnsubscribe: params.enableUnsubscribe ?? true,
          scheduleDate: params.scheduleDate,
          scheduleTime: params.scheduleTime,
          recipients: subscribers.length,
          userId: userId,
          newsLetterOwnerId: userId,
          campaignId: campaignId,
          messageId: messageId
        }
      })

      // Create email elements
      if (params.elements && params.elements.length > 0) {
        const elementsData = params.elements.map((element, index) => ({
          emailId: email.id,
          elementId: element.id,
          type: element.type.toUpperCase() as any,
          content: element.content || "",
          properties: element.properties as any,
          sortOrder: index
        }))

        await tx.emailElement.createMany({
          data: elementsData
        })
      }

      // Create email recipients
      const recipientsData = subscriberEmails.map(recipient => ({
        emailId: email.id,
        recipientEmail: recipient,
        status: "PENDING" as const
      }))

      await tx.emailRecipient.createMany({
        data: recipientsData
      })

      // Create email analytics record
      await tx.emailAnalytics.create({
        data: {
          emailId: email.id,
          totalRecipients: subscribers.length,
          deliveredCount: 0,
          totalOpens: 0,
          uniqueOpens: 0,
          totalClicks: 0,
          uniqueClicks: 0,
          deliveryRate: 0,
          openRate: 0,
          clickRate: 0,
          bounceRate: 0,
          unsubscribeCount: 0,
          spamReportCount: 0,
          forwardCount: 0
        }
      })

      return { email, recipientsCount: subscribers.length }
    })

    // If not scheduled, send immediately using platform sender
    if (!params.scheduleDate) {
      const sendResult = await sendEmailToSubscribers(
        result.email.id, 
        subscriberEmails, 
        params.emailSubject, 
        params.content,
        params.trackOpens ?? true,
        params.trackClicks ?? true,
        params.enableUnsubscribe ?? true
      )

      if (!sendResult.success) {
        throw new Error(`Failed to send some emails: ${sendResult.error}`)
      }
    }

    revalidatePath("/xontrol/mail")
    revalidatePath("/campaigns")
    revalidatePath("/analytics")

    return {
      success: true,
      message: params.scheduleDate 
        ? `Newsletter scheduled successfully for ${params.scheduleDate.toLocaleDateString()}`
        : "Newsletter sent successfully",
      data: {
        emailId: result.email.id,
        campaignId: campaignId,
        recipients: result.recipientsCount,
        scheduled: !!params.scheduleDate
      }
    }

  } catch (error) {
    console.error("Error sending newsletter:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send newsletter"
    }
  }
}

// Updated helper function to use platform email sender
async function sendEmailToSubscribers(
  emailId: string, 
  recipientEmails: string[], 
  subject: string,
  content: string,
  trackOpens: boolean,
  trackClicks: boolean,
  enableUnsubscribe: boolean
) {
  try {
    // Use the platform notification email sender
    const sendResult = await sendPlatformNotificationEmail({
      userEmail: recipientEmails,
      subject: subject,
      content: content,
      adminEmail: process.env.ADMIN_EMAIL || 'admin@yourdomain.com',
      fromApplication: 'Drop-Aphi',
      trackOpens: trackOpens,
      trackClicks: trackClicks,
      enableUnsubscribe: enableUnsubscribe
    })

    // Update database based on send results
    if (sendResult.success) {
      // Update all recipients to SENT status
      await database.emailRecipient.updateMany({
        where: {
          emailId: emailId,
          recipientEmail: { in: recipientEmails }
        },
        data: {
          status: "SENT",
          sentAt: new Date()
        }
      })

      // Update email statistics
      await database.email.update({
        where: { id: emailId },
        data: {
          emailsSentCount: recipientEmails.length,
          sentAt: new Date(),
          status: "SENT"
        }
      })

      // Update analytics with initial counts
      await database.emailAnalytics.update({
        where: { emailId: emailId },
        data: {
          deliveredCount: recipientEmails.length,
          deliveryRate: 100
        }
      })

      console.log(`Successfully sent newsletter ${emailId} to ${recipientEmails.length} recipients`)
    } else {
      // Handle partial failures
      const failedEmails = sendResult.stats?.failedEmails || []
      const successfulEmails = recipientEmails.filter(email => !failedEmails.includes(email))

      // Update successful sends
      if (successfulEmails.length > 0) {
        await database.emailRecipient.updateMany({
          where: {
            emailId: emailId,
            recipientEmail: { in: successfulEmails }
          },
          data: {
            status: "SENT",
            sentAt: new Date()
          }
        })
      }

      // Update failed sends
      if (failedEmails.length > 0) {
        await database.emailRecipient.updateMany({
          where: {
            emailId: emailId,
            recipientEmail: { in: failedEmails }
          },
          data: {
            status: "FAILED",
            bounceReason: "Email delivery failed"
          }
        })
      }

      // Update email statistics
      await database.email.update({
        where: { id: emailId },
        data: {
          emailsSentCount: successfulEmails.length,
          sentAt: new Date(),
          status: successfulEmails.length > 0 ? "SENT" : "FAILED"
        }
      })

      // Update analytics
      await database.emailAnalytics.update({
        where: { emailId: emailId },
        data: {
          deliveredCount: successfulEmails.length,
          deliveryRate: (successfulEmails.length / recipientEmails.length) * 100
        }
      })

      if (successfulEmails.length === 0) {
        throw new Error("All email deliveries failed")
      }
    }

    return {
      success: sendResult.success,
      error: sendResult.error,
      stats: sendResult.stats
    }

  } catch (error) {
    console.error("Error in sendEmailToSubscribers:", error)
    
    // Mark all recipients as failed in case of general error
    await database.emailRecipient.updateMany({
      where: {
        emailId: emailId
      },
      data: {
        status: "FAILED",
        bounceReason: error instanceof Error ? error.message : "Unknown error"
      }
    })

    await database.email.update({
      where: { id: emailId },
      data: {
        status: "FAILED"
      }
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send emails"
    }
  }
}