'use server'

import { sendPlatformNotificationEmail } from '@/lib/email/sendPlatformNotification'
import { getServerAuth } from '../auth/getauth'
import { formatEmailContent } from './template/platform-email-template'

interface SendEmailParams {
  userEmail: string
  subject: string
  content: string
}

export async function sendUserEmail({ userEmail, subject, content }: SendEmailParams) {
  try {
    // Get user info directly from server
    const user = await getServerAuth()
    if (!user) throw new Error("You must be logged in to send emails")
    
    // Check if user is SUPERADMIN
    if (user.role !== "SUPERADMIN") {
      throw new Error("Unauthorized: You must be an admin to send emails")
    }

    // Validate required fields
    if (!userEmail || !subject || !content) {
      throw new Error("All fields are required: user email, subject, and content")
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userEmail)) {
      throw new Error("Invalid email address format")
    }

    const result = await sendPlatformNotificationEmail({
      userEmail: [userEmail], // Convert to array as expected by the function
      subject,
      content: formatEmailContent(content),
      adminEmail: user.email || 'admin@drop-aphi.com',
      fromApplication: 'Drop-Aphi',
      trackOpens: true,
      trackClicks: true,
      enableUnsubscribe: true
    })

    if (!result.success) {
      throw new Error(result.error || 'Failed to send email')
    }

    return {
      success: true,
      message: `Email sent successfully to ${userEmail}`,
      trackingId: result.trackingId,
      stats: result.stats
    }
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to send email')
  }
}

// Helper function to format the email content with proper HTML
