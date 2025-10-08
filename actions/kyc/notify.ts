'use server';

import { database } from '@/lib/database';
import { sendNotificationEmail } from '@/lib/email/notificationEmail.sender';
import { NotificationCategory, NotificationPriority, NotificationStatus, NotificationType } from '@/lib/generated/prisma';


interface NotifyKycParams {
  kycApplication: {
    id: string;
    userId: string;
    user: {
      email: string;
        fullName: string,
        imageUrl?: string | null,
    };
    status: string;
    reviewedBy: string | null;
    reviewedTime: Date | null;
  };
  adminEmail: string;
  fromApplication: string;
}

export async function notifyUserAboutKycStatus({
  kycApplication,
  adminEmail,
  fromApplication,
}: NotifyKycParams) {
  try {
    // 1. Get user email (single recipient for KYC notifications)
    const userEmail = kycApplication.user.email;
    const userName = `${kycApplication.user.fullName} `;

    // 2. Get or create template notification for KYC
    let notificationTemplate = await database.emailNotification.findFirst({
      where: {
        userId: kycApplication.userId,
        category: NotificationCategory.KYC_APPROVAL,
        type: NotificationType.EMAIL,
      },
    });

    if (!notificationTemplate) {
      // Create default KYC notification template
      const defaultTemplate = getDefaultKycTemplate(kycApplication.status);
      
      notificationTemplate = await database.emailNotification.create({
        data: {
          userId: kycApplication.userId,
          type: NotificationType.SYSTEM,
          category: NotificationCategory.KYC_APPROVAL,
          priority: kycApplication.status === 'APPROVED' 
            ? NotificationPriority.HIGH 
            : NotificationPriority.MEDIUM,
          title: defaultTemplate.title,
          content: defaultTemplate.content,
          textContent: defaultTemplate.content.text,
          htmlContent: defaultTemplate.content.html,
          status: NotificationStatus.DRAFT,
        },
      });
    }

    // 3. Personalize content (DO NOT overwrite template in DB)
    const templateContent = {
      subject: notificationTemplate.title || 'KYC Application Update',
      html: notificationTemplate.htmlContent|| '',
      text: notificationTemplate.textContent || '',
    };

    const personalizedContent = personalizeKycContent(
      templateContent,
      userName,
      kycApplication,
      fromApplication
    );

    // 4. Update template metadata
    await database.emailNotification.update({
      where: { id: notificationTemplate.id },
      data: {
        metadata: {
          lastKycId: kycApplication.id,
          lastKycStatus: kycApplication.status,
          reviewedBy: kycApplication.reviewedBy,
          reviewedTime: kycApplication.reviewedTime,
        },
      },
    });

    // 5. Send email notification
    const result = await sendNotificationEmail({
      userEmail: [userEmail], // Array with single email
      subject: personalizedContent.subject,
      content: personalizedContent.html,
      emailId: notificationTemplate.id,
      newsLetterOwnerId: kycApplication.userId,
      contentJson: JSON.stringify(personalizedContent),
      adminEmail,
      fromApplication,
      trackOpens: true,
      trackClicks: true,
      enableUnsubscribe: false, // KYC notifications shouldn't have unsubscribe
      isBulk: false, // Single recipient
    });

    // 6. Update notification status
    await database.emailNotification.update({
      where: { id: notificationTemplate.id },
      data: {
        status: result.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
        sentAt: new Date(),
        type: NotificationType.SYSTEM,
      },
    });

    return result;
  } catch (error) {
    console.error('[KYC_NOTIFICATION_ERROR]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send KYC notification',
    };
  }
}

// Default KYC template generator
function getDefaultKycTemplate(status: string) {
  const isApproved = status === 'APPROVED';
  
  const baseContent = {
    subject: isApproved 
      ? 'Your KYC Application Has Been Approved - [KYC ID]'
      : 'Update on Your KYC Application - [KYC ID]',
    text: isApproved
      ? `Dear [User Name],

We are pleased to inform you that your KYC application (ID: [KYC ID]) has been approved.

Application Details:
- KYC ID: [KYC ID]
- Status: APPROVED
- Reviewed By: [Reviewer Name]
- Review Date: [Review Date]

Your account now has full access to all platform features.

Best regards,
[Platform] Team`
      : `Dear [User Name],

Your KYC application (ID: [KYC ID]) requires additional attention.

Application Details:
- KYC ID: [KYC ID]
- Status: [Status]
- Reviewed By: [Reviewer Name]
- Review Date: [Review Date]

Please check your account for more details or contact support.

Best regards,
[Platform] Team`,
    html: isApproved
      ? `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KYC Application Approved</title>
</head>
<body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">KYC Application Approved</h2>
        <p>Dear [User Name],</p>
        
        <p>We are pleased to inform you that your KYC application has been approved.</p>
        
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="color: #374151; margin-top: 0;">Application Details:</h3>
            <p><strong>KYC ID:</strong> [KYC ID]</p>
            <p><strong>Status:</strong> APPROVED</p>
            <p><strong>Reviewed By:</strong> [Reviewer Name]</p>
            <p><strong>Review Date:</strong> [Review Date]</p>
        </div>
        
        <p>Your account now has full access to all platform features.</p>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            Best regards,<br>
            [Platform] Team
        </p>
    </div>
</body>
</html>`
      : `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KYC Application Update</title>
</head>
<body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">KYC Application Update</h2>
        <p>Dear [User Name],</p>
        
        <p>Your KYC application requires additional attention.</p>
        
        <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="color: #374151; margin-top: 0;">Application Details:</h3>
            <p><strong>KYC ID:</strong> [KYC ID]</p>
            <p><strong>Status:</strong> [Status]</p>
            <p><strong>Reviewed By:</strong> [Reviewer Name]</p>
            <p><strong>Review Date:</strong> [Review Date]</p>
        </div>
        
        <p>Please check your account for more details or contact our support team.</p>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            Best regards,<br>
            [Platform] Team
        </p>
    </div>
</body>
</html>`
  };

  return {
    title: baseContent.subject,
    content: baseContent,
  };
}

// Personalize KYC content
function personalizeKycContent(
  template: { subject: string; html?: string; text?: string },
  userName: string,
  kycApplication: any,
  fromApplication: string
) {
  const reviewDate = kycApplication.reviewedTime 
    ? new Date(kycApplication.reviewedTime).toLocaleDateString()
    : new Date().toLocaleDateString();

  return {
    subject: template.subject.replace(/\[KYC ID\]/g, kycApplication.id),
    html: (template.html || '')
      .replace(/\[User Name\]/g, userName)
      .replace(/\[KYC ID\]/g, kycApplication.id)
      .replace(/\[Status\]/g, kycApplication.status)
      .replace(/\[Reviewer Name\]/g, kycApplication.reviewedBy || 'DROPAPHI TEAM')
      .replace(/\[Review Date\]/g, reviewDate)
      .replace(/\[Platform\]/g, fromApplication),
    text: (template.text || '')
      .replace(/\[User Name\]/g, userName)
      .replace(/\[KYC ID\]/g, kycApplication.id)
      .replace(/\[Status\]/g, kycApplication.status)
      .replace(/\[Reviewer Name\]/g, kycApplication.reviewedBy || 'DROPAPHI TEAM')
      .replace(/\[Review Date\]/g, reviewDate)
      .replace(/\[Platform\]/g, fromApplication),
  };
}

