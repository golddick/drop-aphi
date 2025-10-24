


// lib/email/sendPlatformNotification.ts

import { transporter } from './utils';
import type { SentMessageInfo } from 'nodemailer';

interface SendPlatformNotificationEmailParams {
  userEmail: string[];
  subject: string;
  content: string;
  adminEmail: string;
  fromApplication: string;
  trackOpens?: boolean;
  trackClicks?: boolean;
  enableUnsubscribe?: boolean;
}

interface EmailResult {
  email: string;
  success: boolean;
  messageId?: string;
  error?: unknown;
}

export const sendPlatformNotificationEmail = async (params: SendPlatformNotificationEmailParams) => {
  const {
    userEmail,
    subject,
    content,
    trackOpens = true,
    trackClicks = true,
    enableUnsubscribe = true,
  } = params;

  const domain = process.env.NEXT_PUBLIC_WEBSITE_URL! || 'https://drop-aphi.vercel.app';
  const trackingId = `Driop-aphi_platform_${Date.now()}`;

  try {
    // Validate required fields
    if (!userEmail?.length) {
      throw new Error('Recipient emails are required');
    }
    if (!subject?.trim()) {
      throw new Error('Email subject is required');
    }
    if (!content?.trim()) {
      throw new Error('Email content is required');
    }

    // Verify SMTP connection
    const smtpAvailable = await transporter.verify().catch((err) => {
      console.error("SMTP verification failed:", err);
      return false;
    });
    
    if (!smtpAvailable) {
      console.warn("SMTP server unavailable, email will not be sent");
      return {
        success: false,
        error: "Email server unavailable",
        trackingId,
      };
    }

    const results = await Promise.allSettled(
      userEmail.map(async (email): Promise<EmailResult> => {
        try {
          let enhancedContent = content;

          // Add tracking and unsubscribe links
          if (trackClicks) {
            enhancedContent = enhancedContent.replace(
              /href="([^"]+)"/g,
              (_, url) => {
                // Don't track unsubscribe links
                if (url.includes('unsubscribe') || url.includes('UNSUBSCRIBE_URL')) {
                  return `href="${domain}/api/platform/unsubscribe?email=${encodeURIComponent(email)}"`;
                }
                return `href="${domain}/api/platform/track-platform-mail/click?email=${encodeURIComponent(email)}&url=${encodeURIComponent(url)}&tid=${trackingId}"`;
              }
            );
          }

          // Replace unsubscribe placeholder
          enhancedContent = enhancedContent.replace(
            /\[UNSUBSCRIBE_URL\]/g,
            `${domain}/api/platform/unsubscribe?email=${encodeURIComponent(email)}`
          );

          // Add open tracking
          if (trackOpens) {
            enhancedContent += `<img src="${domain}/api/platform/track-platform-mail/open?email=${encodeURIComponent(email)}&tid=${trackingId}" width="1" height="1" style="display:none" alt="" />`;
          }

          // Use a more professional from address
          const fromName = "Drop-aphi";
          const fromEmail = process.env.SMTP_USER;

          if (!fromEmail) {
            throw new Error('SMTP_USER environment variable is not set');
          }

          const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to: email,
            subject: subject,
            html: enhancedContent,
            headers: {
              'X-Tracking-ID': trackingId,
              'X-Priority': '3',
              'X-Mailer': 'Drop-aphi Platform',
              ...(enableUnsubscribe && {
                'List-Unsubscribe': `<${domain}/api/platform/unsubscribe?email=${encodeURIComponent(email)}>`,
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
              })
            },
            priority: 'normal' as const,
          };

          const result: SentMessageInfo = await transporter.sendMail(mailOptions);
          
          console.log(`Email sent to ${email}:`, result.messageId);
          return { 
            email, 
            success: true, 
            messageId: result.messageId 
          };
        } catch (error) {
          console.error(`Failed to send platform email to ${email}:`, error);
          return { 
            email, 
            success: false, 
            error 
          };
        }
      })
    );

    // Process results with proper typing
    const successfulResults: EmailResult[] = [];
    const failedResults: EmailResult[] = [];

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          successfulResults.push(result.value);
        } else {
          failedResults.push(result.value);
        }
      } else {
        failedResults.push({
          email: 'unknown',
          success: false,
          error: result.reason
        });
      }
    });

    console.log(`[PLATFORM_EMAIL_STATS] Total: ${userEmail.length}, Successful: ${successfulResults.length}, Failed: ${failedResults.length}`);

    return {
      success: successfulResults.length > 0,
      trackingId,
      stats: {
        total: userEmail.length,
        successful: successfulResults.length,
        failed: failedResults.length,
        failedEmails: failedResults.map(f => f.email)
      },
    };
  } catch (error) {
    console.error('[PLATFORM_NOTIFICATION_SEND_ERROR]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Platform notification send failed',
      trackingId,
    };
  }
};