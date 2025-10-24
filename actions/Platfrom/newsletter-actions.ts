




// app/actions/platform-newsletter-actions.ts

'use server'

import { database } from "@/lib/database"
import { z } from "zod"
import { sendPlatformNotificationEmail } from '@/lib/email/sendPlatformNotification'
import { validateEmail } from '@/lib/ZeroBounceApi'
import { revalidatePath } from 'next/cache'
import { getPlatformWelcomeTemplate } from "@/lib/email/template/platform-email-template"

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().optional(),
  source: z.string().optional().default("platform_newsletter"),
})
 
const domain = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://drop-aphi.vercel.app';

export type SubscribeState = {
  success?: boolean
  message?: string
  errors?: {
    email?: string[]
  }
}


export async function subscribeToPlatformNewsletter(
  prevState: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  try {
    // Validate form data
    const validatedFields = subscribeSchema.safeParse({
      email: formData.get("email"),
      name: formData.get("name") || "", // Ensure name is never null
      source: formData.get("source"),
    })

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { email, name, source } = validatedFields.data

    // Validate email with ZeroBounce
    const validation = await validateEmail({ email })
    if (validation.status === 'invalid') {
      return {
        success: false,
        message: "Please enter a valid email address.",
      }
    }

    // Check if email already exists
    const existingSubscriber = await database.platformSubscriber.findUnique({
      where: { email },
    })

    const platformName = "Drop-aphi"
    const platformUrl = domain
    const adminEmail = "hello@drop-aphi.com" 

    if (existingSubscriber) {
      if (existingSubscriber.status === "SUBSCRIBED") {
        return {
          success: false,
          message: "You're already subscribed to our platform updates!",
        }
      } else {
        // Reactivate unsubscribed user
        const updatedSubscriber = await database.platformSubscriber.update({
          where: { email },
          data: {
            status: "SUBSCRIBED",
            name: name || existingSubscriber.name || "",
            source: source || existingSubscriber.source,
            updatedAt: new Date(),
          },
        })

        // Send resubscription welcome email
        await sendPlatformResubscriptionEmail({
          email,
          name: name || existingSubscriber.name || "",
          platformName,
          platformUrl,
          adminEmail,
        })

        revalidatePath('/')
        return {
          success: true,
          message: "Welcome back! You've been resubscribed to platform updates.",
        }
      }
    } else {
      // Create new subscriber
      const subscriber = await database.platformSubscriber.create({
        data: {
          email,
          name: name || "",
          source,
          status: "SUBSCRIBED",
        },
      })

      // Send welcome email
      await sendPlatformWelcomeEmail({
        email,
        name: name || "",
        platformName,
        platformUrl,
        adminEmail,
      })

      revalidatePath('/')
      return {
        success: true,
        message: "Successfully subscribed! Check your email for a welcome message.",
      }
    }
  } catch (error) {
    console.error("Platform newsletter subscription error:", error)
    return {
      success: false,
      message: "An error occurred. Please try again later.",
    }
  }
}

// Helper function to send platform welcome email
async function sendPlatformWelcomeEmail({
  email,
  name,
  platformName,
  platformUrl,
  adminEmail,
}: {
  email: string
  name: string
  platformName: string
  platformUrl: string
  adminEmail: string
}) {
  try {
    const template = getPlatformWelcomeTemplate({
      name: name || undefined,
      platformName,
      platformUrl
    })

    // Use simplified platform notification sender
    const result = await sendPlatformNotificationEmail({
      userEmail: [email],
      subject: template.title,
      content: template.content.html,
      adminEmail,
      fromApplication: platformName,
    })

    if (result.success) {
      console.log(`[PLATFORM_WELCOME_EMAIL_SENT] to: ${email}`)
    } else {
      console.warn(`[PLATFORM_WELCOME_EMAIL_FAILED] to: ${email}`, result.error)
      // Don't throw - subscription should succeed even if email fails
    }
  } catch (error) {
    console.error('[PLATFORM_WELCOME_EMAIL_ERROR]', error)
    // Don't throw error - subscription should succeed even if email fails
  }
}

// Helper function to send platform resubscription email
async function sendPlatformResubscriptionEmail({
  email,
  name,
  platformName,
  platformUrl,
  adminEmail,
}: {
  email: string
  name: string
  platformName: string
  platformUrl: string
  adminEmail: string
}) {
  try {
    const template = getPlatformWelcomeTemplate({ // Use same template for now
      name: name || undefined,
      platformName,
      platformUrl
    })

    const result = await sendPlatformNotificationEmail({
      userEmail: [email],
      subject: `Welcome Back to ${platformName}!`,
      content: template.content.html,
      adminEmail,
      fromApplication: platformName,
    })

    if (result.success) {
      console.log(`[PLATFORM_RESUBSCRIBE_EMAIL_SENT] to: ${email}`)
    } else {
      console.warn(`[PLATFORM_RESUBSCRIBE_EMAIL_FAILED] to: ${email}`, result.error)
    }
  } catch (error) {
    console.error('[PLATFORM_RESUBSCRIBE_EMAIL_ERROR]', error)
  }
}