



'use server'

import { database } from "../database"
import { sendNotificationEmail } from "./notificationEmail.sender"



export const sendConfirmationEmail = async ({
  userEmail,
  newsLetterOwnerId,
  emailTemplateId,
  notificationTemplateContent,
  adminEmail,
  fromApplication
}: {
  userEmail: string
  newsLetterOwnerId: string
  emailTemplateId: string
  notificationTemplateContent: {
    subject: string
    html?: string
    text?: string
  }
  adminEmail: string
  fromApplication: string
}) => {
  try {
    // Get email template for metadata purposes
    const emailTemplate = await database.emailNotification.findUnique({
      where: { id: emailTemplateId },
    })

    if (!emailTemplate) {
      throw new Error('Email template not found')
    }

    // Send email using personalized content 
    const result = await sendNotificationEmail({
      userEmail: [userEmail],
      subject: notificationTemplateContent.subject || `Welcome to ${ fromApplication}`,
      content: notificationTemplateContent.html ?? '',
      contentJson: JSON.stringify(notificationTemplateContent.html),
      emailId: emailTemplateId,
      newsLetterOwnerId,
      adminEmail,
      fromApplication,
    })
 
    if (!result.success) {
      throw new Error(result.error || 'Failed to send confirmation email')
    }

    return { success: true }
  } catch (error) {
    console.error('[SEND_CONFIRMATION_ERROR]', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send confirmation',
    }
  }
}









