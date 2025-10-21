


'use server'

import { getServerAuth } from '@/lib/auth/getauth'
import { checkUsageLimit, incrementUsage } from '@/lib/checkAndUpdateUsage'
import { database } from '@/lib/database'
import { sendConfirmationEmail } from '@/lib/email/sendConfirmation'
import { getWelcomeTemplate } from '@/lib/email/template/new-subscriber'
import { resubscribeTemplate } from '@/lib/email/template/resubscribeTemplate'
import { NotificationCategory, NotificationPriority, NotificationStatus, NotificationType, SubscriptionStatus } from '@/lib/generated/prisma'
import { validateEmail } from '@/lib/ZeroBounceApi'
import { KYCStatus } from '@prisma/client'
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

    // 1. Check user's membership and KYC status
    const membership = await database.user.findUnique({
      where: { userId: userID },
      select: {
        kycStatus: true,
        plan: true,
        subscriptionStatus: true
      }
    })

    if (!membership) {
      return { error: 'Membership not found' }
    }

    // 2. Verify KYC is approved before allowing subscription operations
    if (membership.kycStatus !== KYCStatus.APPROVED) {
      return { 
        error: 'KYC verification required before managing subscribers',
        code: 'KYC_REQUIRED',
        kycRequired: true
      }
    }

    // 3. Validate email format
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return { error: 'Invalid email address' }
    }

    // 4. Check if subscriber already exists and handle different cases
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

          return updatedSubscriber
        })

        // Send welcome back email using the resubscribe template
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

    // 5. Get platform name and URL
    const owner = await database.user.findUnique({ where: { userId: userID } })
    const platformName = owner?.SenderName || owner?.userName || 'Drop-aphi'
    const platformUrl = owner?.website || 'https://drop-aphi.vercel.app'

    // 6. Validate email with ZeroBounce (only for new subscribers)
    const validation = await validateEmail({ email })
    if (validation.status === 'invalid') {
      return { error: 'Invalid email address' }
    }

    // 7. Check usage limits (only for new subscribers)
    const usageCheck = await checkUsageLimit(userID, 'subscribersAdded')
    if (!usageCheck.success) return { error: usageCheck.message }

    // 8. Create new subscriber (only if doesn't exist or was unsubscribed)
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

    // 9. Fetch campaign if exists
    const campaign = campaignId
      ? await database.campaign.findUnique({ where: { id: campaignId } })
      : null

    // 10. Increment usage count (only for new subscribers)
    await incrementUsage(userID, 'subscribersAdded')

    // 11. Get user template or system template
    let userTemplate = await database.emailNotification.findFirst({
      where: {
        userId: userID,
        category: NotificationCategory.NEWSLETTER,
        type: NotificationType.EMAIL,
        priority:NotificationPriority.HIGH
      },
    })

    // 12. Create a default template if none exists
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
          priority: NotificationPriority.HIGH,
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

    // 13. Personalize content dynamically (DO NOT overwrite template in DB)
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

    // 14. Increment recipient count for the template
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

    // 15. Send personalized confirmation email (no DB overwrite)
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

// Helper function to send resubscription welcome email using the template
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
    const platformUrl = owner?.website || 'https://drop-aphi.vercel.app'

    // Get or create resubscription template
    let resubscribeTemplateRecord = await database.emailNotification.findFirst({
      where: {
        userId: userID,
        category: NotificationCategory.NEWSLETTER,
        type: NotificationType.EMAIL,
        priority: NotificationPriority.LOW,
      },
    })

    if (!resubscribeTemplateRecord) {
      // Use the resubscribe template function directly
      const template = resubscribeTemplate({
        name: name || '',
        platformName,
        platformUrl
      })

      resubscribeTemplateRecord = await database.emailNotification.create({
        data: {
          userId: userID,
          type: NotificationType.EMAIL,
          category: NotificationCategory.NEWSLETTER,
          priority: NotificationPriority.LOW,
          title: template.title,
          content: template.content,
          status: NotificationStatus.DRAFT,
          textContent: template.content.text,
          htmlContent: template.content.html,
          recipients: 0,
        },
      })
    }

    // Personalize the template content
    const personalizedContent = {
      subject: resubscribeTemplateRecord.title.replace(/\[Platform\]/g, platformName),
      html: resubscribeTemplateRecord.htmlContent
        ?.replace(/\[Name\]/g, name || '')
        .replace(/\[Platform\]/g, platformName)
        .replace(/{{platform_url}}/g, platformUrl),
      text: resubscribeTemplateRecord.textContent
        ?.replace(/\[Name\]/g, name || '')
        .replace(/\[Platform\]/g, platformName)
        .replace(/{{platform_url}}/g, platformUrl),
    }

    // Send resubscription email
    await sendConfirmationEmail({
      userEmail: email,
      newsLetterOwnerId: userID,
      emailTemplateId: resubscribeTemplateRecord.id,
      notificationTemplateContent: personalizedContent,
      adminEmail,
      fromApplication: platformName,
    })

    console.log(`[RESUBSCRIBE_EMAIL_SENT] Welcome back email sent to: ${email}`)

  } catch (error) {
    console.error('[RESUBSCRIBE_EMAIL_ERROR]', error)
    // Don't throw error - resubscription should still succeed even if email fails
  }
}