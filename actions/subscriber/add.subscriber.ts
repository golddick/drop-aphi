


'use server'

import { getServerAuth } from '@/lib/auth/getauth'
import { checkUsageLimit, incrementUsage } from '@/lib/checkAndUpdateUsage'
import { database } from '@/lib/database'
import { sendConfirmationEmail } from '@/lib/email/sendConfirmation'
import { getWelcomeTemplate } from '@/lib/email/template/new-subscriber'
import { NotificationCategory, NotificationPriority, NotificationStatus, NotificationType, SubscriptionStatus } from '@/lib/generated/prisma'
import { validateEmail } from '@/lib/ZeroBounceApi'
import { revalidatePath } from 'next/cache'

export const addSubscriber = async ({
  email,
  name,
  campaignId,
  source,
  status,
  pageUrl,
}: {
  email: string
  name?: string
  campaignId?: string | null
  source: string
  status: SubscriptionStatus
  pageUrl?: string
}) => {
  try {
    const user = await getServerAuth()
    if (!user) return { error: 'Unauthorized' }

    const ownerId = user.id
    const adminEmail = user.email || ''
    const userID = user.userId

    // 1. Validate email format
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return { error: 'Invalid email address' }
    }

    // 2. Check if subscriber already exists and handle different cases
    const existingSubscriber = await database.subscriber.findFirst({
      where: {
        email,
        newsLetterOwnerId: userID,
      },
    })

    // Handle existing subscriber cases
    if (existingSubscriber) {
      // If subscriber exists and is already SUBSCRIBED
      if (existingSubscriber.status === 'SUBSCRIBED') {
        return { 
          error: 'Subscriber already exists',
          code: 'ALREADY_SUBSCRIBED',
          subscriber: existingSubscriber 
        }
      }

      // If subscriber exists but is UNSUBSCRIBED - resubscribe them
      if (existingSubscriber.status === 'UNSUBSCRIBED') {
        console.log(`[RESUBSCRIBE] Reactivating unsubscribed user: ${email}`)

        // Use transaction to ensure data consistency
        const result = await database.$transaction(async (tx) => {
          // 1. Delete all unsubscribe events for this email and owner
          await tx.unsubscribeEvent.deleteMany({
            where: {
              email: email,
              newsLetterOwnerId: userID,
            },
          })

          console.log(`[RESUBSCRIBE] Deleted unsubscribe events for: ${email}`)

          // 2. Update the existing subscriber to SUBSCRIBED
          const updatedSubscriber = await tx.subscriber.update({
            where: {
              id: existingSubscriber.id,
            },
            data: {
              status: 'SUBSCRIBED' as SubscriptionStatus,
              name: name || existingSubscriber.name, // Update name if provided
              source: source || existingSubscriber.source,
              pageUrl: pageUrl || existingSubscriber.pageUrl,
              unsubscribedAt: null, // Clear unsubscribe timestamp
              unsubscribeReason: null, // Clear unsubscribe reason
              unsubscribeSource: null, // Clear unsubscribe source
              updatedAt: new Date(),
            },
          })

          // 3. Update any UNSUBSCRIBED email recipients back to PENDING
          await tx.emailRecipient.updateMany({
            where: {
              recipientEmail: email,
              email: {
                newsLetterOwnerId: userID,
              },
              status: 'UNSUBSCRIBED',
            },
            data: {
              status: 'PENDING',
              unsubscribeAt: null,
            },
          })

          // 4. Create a resubscription event for analytics (optional - if you want to track resubscriptions)
          // Commented out since we're deleting unsubscribe events, but you can enable if needed
          /*
          await tx.unsubscribeEvent.create({
            data: {
              email: email,
              newsLetterOwnerId: userID,
              reason: 'User resubscribed - previous unsubscribe events cleared',
              source: 'resubscription',
              userAgent: 'system',
              ipAddress: 'system',
            },
          })
          */

          return updatedSubscriber
        })

        // Send welcome back email
        await sendResubscriptionEmail({
          email,
          userID,
          name: name || existingSubscriber.name || '',
          adminEmail,
        })

        revalidatePath('/dashboard/subscribers')
        return { 
          success: true, 
          subscriber: result,
          message: 'Subscriber reactivated successfully - previous unsubscribe history cleared',
          wasUnsubscribed: true
        }
      }
    }

    // 3. Get platform name and URL
    const owner = await database.user.findUnique({ where: { userId: userID } })
    const platformName = owner?.SenderName || owner?.userName || 'Drop-aphi'
    const platformUrl = owner?.website || undefined

    // 4. Validate email with ZeroBounce (only for new subscribers)
    const validation = await validateEmail({ email })
    if (validation.status === 'invalid') {
      return { error: 'Invalid email address' }
    }

    // 5. Check usage limits (only for new subscribers)
    const usageCheck = await checkUsageLimit(userID, 'subscribersAdded')
    if (!usageCheck.success) return { error: usageCheck.message }

    // 6. Create new subscriber (only if doesn't exist or was unsubscribed)
    const subscriber = await database.subscriber.create({
      data: {
        email,
        name,
        status,
        source,
        pageUrl,
        newsLetterOwnerId: userID,
      },
    })

    // 7. Fetch campaign if exists
    const campaign = campaignId
      ? await database.campaign.findUnique({ where: { id: campaignId } })
      : null

    // 8. Increment usage count (only for new subscribers)
    await incrementUsage(userID, 'subscribersAdded')

    // 9. Get user template or system template
    let userTemplate = await database.emailNotification.findFirst({
      where: {
        userId: userID,
        category: NotificationCategory.NEWSLETTER,
        type: NotificationType.EMAIL,
      },
    })

    // 10. Create a default template if none exists
    if (!userTemplate) {
      const defaultTemplate = getWelcomeTemplate({ 
        name: '[Name]',
        email: '[Email]',
        platformName: '[Platform]',
        platformUrl,
      })

      userTemplate = await database.emailNotification.create({
        data: {
          userId: userID,
          type: NotificationType.EMAIL,
          category: NotificationCategory.NEWSLETTER,
          priority: NotificationPriority.LOW,
          title: defaultTemplate.title,
          content: defaultTemplate.content,
          status: NotificationStatus.DRAFT,
          textContent: defaultTemplate.content.text,
          htmlContent: defaultTemplate.content.html,
          recipients: 0,
        },
      })
    }

    const activeTemplate = userTemplate
    if (!activeTemplate) throw new Error('No email template available')

    // 11. Personalize content dynamically (DO NOT overwrite template in DB)
    const templateContent = {
      subject: activeTemplate.title,
      html: activeTemplate.htmlContent,
      text: activeTemplate.textContent,
    }

    const personalizedContent = {
      ...templateContent,
      html: templateContent.html
        ?.replace(/\[Name\]/g, name || '')
        .replace(/\[Email\]/g, email)
        .replace(/\[Platform\]/g, platformName),
      text: templateContent.text
        ?.replace(/\[Name\]/g, name || '')
        .replace(/\[Email\]/g, email)
        .replace(/\[Platform\]/g, platformName),
      subject: templateContent.subject
        ?.replace(/\[Name\]/g, name || '')
        .replace(/\[Platform\]/g, platformName),
    }

    // 12. Increment recipient count for the template
    await database.emailNotification.update({
      where: { id: activeTemplate.id, userId: userID },
      data: {
        metadata: {
          subscriberId: subscriber.id,
          subscriberEmail: subscriber.email,
          subscriberName: subscriber.name,
        },
      },
    })

    // 13. Send personalized confirmation email (no DB overwrite)
    await sendConfirmationEmail({
      userEmail: email,
      newsLetterOwnerId: userID,
      emailTemplateId: activeTemplate.id,
      notificationTemplateContent: personalizedContent,
      adminEmail,
      fromApplication: platformName,
    })

    revalidatePath('/dashboard/subscribers')
    return { 
      success: true, 
      subscriber,
      message: 'Subscriber added successfully',
      wasUnsubscribed: false
    }
  } catch (error) {
    console.error('[ADD_SUBSCRIBER_ERROR]', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add subscriber',
    }
  }
}

// Helper function to send resubscription welcome email
async function sendResubscriptionEmail({
  email,
  userID,
  name,
  adminEmail,
}: {
  email: string
  userID: string
  name?: string
  adminEmail: string
}) {
  try {
    const owner = await database.user.findUnique({ where: { userId: userID } })
    const platformName = owner?.SenderName || owner?.userName || 'Drop-aphi'

    // Get or create resubscription template
    let resubscribeTemplate = await database.emailNotification.findFirst({
      where: {
        userId: userID,
        category: NotificationCategory.NEWSLETTER,
        type: NotificationType.EMAIL,
        title: {
          contains: 'Welcome Back'
        }
      },
    })

    if (!resubscribeTemplate) {
      // Create a simple welcome back template
      const welcomeBackTemplate = {
        title: `Welcome Back to ${platformName}!`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
              .content { padding: 20px; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome Back!</h1>
                <p>We've cleared your unsubscribe history</p>
              </div>
              <div class="content">
                <p>Hello ${name || 'there'},</p>
                <p>We're thrilled to have you back in the ${platformName} community!</p>
                <p>You've been successfully resubscribed and will start receiving our updates again.</p>
                <p>Thank you for giving us another chance to share valuable content with you.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Welcome Back!

          Hello ${name || 'there'},

          We're thrilled to have you back in the ${platformName} community!

          You've been successfully resubscribed and will start receiving our updates again.

          Note: Your previous unsubscribe history has been cleared, giving you a fresh start.

          Thank you for giving us another chance to share valuable content with you.

          © ${new Date().getFullYear()} ${platformName}. All rights reserved.
        `
      }

      resubscribeTemplate = await database.emailNotification.create({
        data: {
          userId: userID,
          type: NotificationType.EMAIL,
          category: NotificationCategory.NEWSLETTER,
          priority: NotificationPriority.LOW,
          title: welcomeBackTemplate.title,
          content: { html: welcomeBackTemplate.html, text: welcomeBackTemplate.text },
          status: NotificationStatus.DRAFT,
          textContent: welcomeBackTemplate.text,
          htmlContent: welcomeBackTemplate.html,
          recipients: 0,
        },
      })
    }

    // Send resubscription email
    await sendConfirmationEmail({
      userEmail: email,
      newsLetterOwnerId: userID,
      emailTemplateId: resubscribeTemplate.id,
      notificationTemplateContent: {
        subject: resubscribeTemplate.title,
        html: resubscribeTemplate.htmlContent?.replace(/\[Name\]/g, name || ''),
        text: resubscribeTemplate.textContent?.replace(/\[Name\]/g, name || ''),
      },
      adminEmail,
      fromApplication: platformName,
    })

  } catch (error) {
    console.error('[RESUBSCRIBE_EMAIL_ERROR]', error)
    // Don't throw error - resubscription should still succeed even if email fails
  }
}