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
    const adminEmail = user.email|| ''
    const userID = user.userId

    // 1. Validate email format
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return { error: 'Invalid email address' }
    }

    // 2. Check if subscriber already exists
    const existing = await database.subscriber.findFirst({
      where: {
        email,
        newsLetterOwnerId: ownerId,
      },
    })
    if (existing) return { error: 'Subscriber already exists' }

    // 3. Get platform name and URL
    const owner = await database.user.findUnique({ where: { userId: userID } })
    const platformName = owner?.SenderName || owner?.userName || 'Drop-aphi'
    const platformUrl = owner?.website || undefined

    // 4. Validate email with ZeroBounce
    const validation = await validateEmail({ email })
    if (validation.status === 'invalid') {
      return { error: 'Invalid email address' }
    }

    // 5. Check usage limits
    const usageCheck = await checkUsageLimit(userID, 'subscribersAdded')
    if (!usageCheck.success) return { error: usageCheck.message }

    // 6. Create new subscriber
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

    // 8. Increment usage count
    await incrementUsage(userID, 'subscribersAdded')

    // 9. Get user template or system template
    let userTemplate = await database.emailNotification.findFirst({
      where: {
        userId: userID,
        category: NotificationCategory.NEWSLETTER,
        type: NotificationType.EMAIL,
      },
    })


    // 11. Create a default template if none exists
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

    // 12. Personalize content dynamically (DO NOT overwrite template in DB)
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

    // 13. Increment recipient count for the template
    await database.emailNotification.update({
      where: { id: activeTemplate.id , userId: userID},
      data: {
        metadata: {
          subscriberId: subscriber.id,
          subscriberEmail: subscriber.email,
          subscriberName: subscriber.name ,
        },
      },
    })

    // 14. Send personalized confirmation email (no DB overwrite)
    await sendConfirmationEmail({
      userEmail: email,
      newsLetterOwnerId: userID,
      emailTemplateId: activeTemplate.id,
      notificationTemplateContent: personalizedContent,
      adminEmail,
      fromApplication: platformName,
    })

    revalidatePath('/dashboard/subscribers')
    return { success: true, subscriber }
  } catch (error) {
    console.error('[ADD_SUBSCRIBER_ERROR]', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add subscriber',
    }
  }
}



