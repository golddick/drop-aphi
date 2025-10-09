'use server';

import { checkUsageLimit, incrementUsage } from '@/lib/checkAndUpdateUsage';
import { database } from '../database';
import { createEmail } from '@/actions/email/emails';
import { transporter } from './utils';
import { EmailStatus, RecipientStatus } from '../generated/prisma';

const BATCH_SIZE = 20;
const BATCH_DELAY_MS = 1000;
const MAX_RETRIES = 5;

interface SendEmailParams {
  userEmail?: string[];
  subject: string;
  content: string;
  emailId?: string;
  campaign?: string | null;
  newsLetterOwnerId: string;
  contentJson: string;
  adminEmail: string;
  trackOpens?: boolean;
  trackClicks?: boolean;
  fromApplication: string;
  emailTitle?: string;
  previewText?: string;
  builderData?: any;
  elements?: any[];
  createTemplate?: boolean;
  templateName?: string;
  userId: string;
  builderMode?: 'visual' | 'code';
}

// Function to get all subscribers for a newsletter owner
const getSubscribers = async (newsLetterOwnerId: string) => {
  try {
    const subscribers = await database.subscriber.findMany({
      where: {
        newsLetterOwnerId,
        status: "SUBSCRIBED", 
      },
      select: {
        email: true,
        name: true,
      },
    });

    return subscribers.map(sub => sub.email);
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    throw new Error('Failed to fetch subscribers');
  }
};

// Function to check if email with same subject already exists
const findExistingEmailBySubject = async (subject: string, userId: string) => {
  try {
    const existingEmail = await database.email.findFirst({
      where: {
        emailSubject: subject,
        userId: userId,
      },
      select: {
        id: true,
        status: true,
      },
    });
    return existingEmail;
  } catch (error) {
    console.error('Error checking existing email:', error);
    return null;
  }
};

// Function to create EmailRecipient records in bulk
const createEmailRecipients = async (emailId: string, recipientEmails: string[]) => {
  try {
    const recipientData = recipientEmails.map(email => ({
      emailId,
      recipientEmail: email,
      status: RecipientStatus.PENDING,
    }));

    // Using createMany for better performance with large lists
    const result = await database.emailRecipient.createMany({
      data: recipientData,
      skipDuplicates: true, // Skip if recipient already exists for this email
    });

    console.log(`Created ${result.count} email recipient records for email ${emailId}`);
    return result.count;
  } catch (error) {
    console.error('Error creating email recipients:', error);
    throw new Error('Failed to create email recipient records');
  }
};

// Function to update EmailRecipient status
const updateEmailRecipientStatus = async (
  emailId: string, 
  recipientEmail: string, 
  status: RecipientStatus,
  additionalData: any = {}
) => {
  try {
    const updateData: any = {
      status,
      ...additionalData
    };

    // Set timestamp based on status
    if (status === RecipientStatus.SENT) {
      updateData.sentAt = new Date();
    } else if (status === RecipientStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    } else if (status === RecipientStatus.OPENED) {
      updateData.openedAt = new Date();
    } else if (status === RecipientStatus.CLICKED) {
      updateData.clickedAt = new Date();
    } else if (status === RecipientStatus.BOUNCED) {
      updateData.bouncedAt = new Date();
    } else if (status === RecipientStatus.UNSUBSCRIBED) {
      updateData.unsubscribeAt = new Date();
    }

    await database.emailRecipient.update({
      where: {
        emailId_recipientEmail: {
          emailId,
          recipientEmail,
        },
      },
      data: updateData,
    });
  } catch (error) {
    console.error(`Error updating recipient status for ${recipientEmail}:`, error);
  }
};

export const sendEmail = async (params: SendEmailParams) => {
  const {
    userEmail,
    subject,
    content,
    emailId,
    campaign,
    fromApplication,
    newsLetterOwnerId,
    adminEmail,
    trackOpens = true,
    trackClicks = true,
    emailTitle,
    previewText,
    builderData,
    elements = [],
    createTemplate = false,
    userId,
    builderMode = 'visual',
  } = params;

  const domain = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://thenews.africa';
  const startTime = Date.now();
  const trackingId = `trk_${Date.now()}`;

  try {
    if (!newsLetterOwnerId || !adminEmail || !userId) {
      throw new Error('Missing required fields: newsLetterOwnerId, adminEmail, and userId are required');
    }

    // Step 1: Check if email exists, if not create it
    let finalEmailId: string;

    if (!emailId) {
      // Check if email with same subject already exists
      const existingEmail = await findExistingEmailBySubject(subject, userId);
      
      if (existingEmail) {
        console.log(`Email with subject "${subject}" already exists with ID: ${existingEmail.id}`);
        finalEmailId = existingEmail.id;
        
        // Update the existing email content if needed
        await database.email.update({
          where: { id: finalEmailId },
          data: {
            content: content,
            previewText: previewText || subject,
            builderData: builderData || {},
            elements: {
              set: elements.map(element => ({
                ...element,
                type: element.type.toUpperCase()
              }))
            },
          },
        });
      } else {
        // Prepare data for createEmail
        const createEmailData = {
          title: emailTitle || subject,
          content: content,
          emailSubject: subject,
          previewText: previewText || subject,
          elements: elements.map(element => ({
            ...element,
            type: element.type.toUpperCase()
          })),
          builderData: builderData || {},
          builderMode: builderMode,
          emailType: 'NEWSLETTER' as const,
          trackOpens: trackOpens,
          trackClicks: trackClicks,
          enableUnsubscribe: true,
          createTemplateFromEmail: createTemplate && builderMode === 'visual',
          campaignId: campaign || undefined,
        };

        // Create new email record using your existing createEmail function
        const createResult = await createEmail(createEmailData);

        if (!createResult.success || !createResult.data?.id) {
          throw new Error(createResult.error || 'Failed to create email record - no ID returned');
        }

        finalEmailId = createResult.data.id;
        console.log(`Created new email record with ID: ${finalEmailId}`);
      }
    } else {
      // Verify email exists and belongs to the user
      const existingEmail = await database.email.findUnique({
        where: { 
          id: emailId,
          userId: userId
        },
      });

      if (!existingEmail) {
        throw new Error('Email record not found or access denied');
      }

      finalEmailId = emailId;

      // Update the email content if needed
      await database.email.update({
        where: { id: finalEmailId },
        data: {
          emailSubject: subject,
          content: content,
          previewText: previewText || existingEmail.previewText,
          builderData: builderData || existingEmail.builderData,
        },
      });
    }

    // Step 2: Get subscribers if userEmail is not provided
    let recipientEmails: string[] = [];
    
    if (userEmail && userEmail.length > 0) {
      recipientEmails = userEmail;
    } else {
      recipientEmails = await getSubscribers(newsLetterOwnerId);
    }

    if (recipientEmails.length === 0) {
      throw new Error('No recipients found. Please add subscribers or provide email addresses.');
    }

    console.log(`Sending to ${recipientEmails.length} recipients`);

    // Step 3: Create EmailRecipient records for all recipients
    await createEmailRecipients(finalEmailId, recipientEmails);

    // Step 4: Check usage limit
    const usageCheck = await checkUsageLimit(newsLetterOwnerId, 'emailsSent');
    if (!usageCheck.success) throw new Error(usageCheck.message);

    // Step 5: Verify SMTP connection
    const smtpAvailable = await transporter.verify().catch((err) => {
      console.error('SMTP verification failed:', err);
      return false;
    });
    if (!smtpAvailable) throw new Error('Email server unavailable');

    // Step 6: Update email status to SENDING
    await database.email.update({
      where: { id: finalEmailId },
      data: {
        status: EmailStatus.SENDING,
        sentAt: new Date(),
      },
    });

    // Step 7: Send emails in batches
    const batches = Array.from(
      { length: Math.ceil(recipientEmails.length / BATCH_SIZE) },
      (_, i) => recipientEmails.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE)
    );

    let totalAccepted = 0;
    let totalRejected = 0;
    let lastMessageId = '';
    const failedEmails: string[] = [];

    for (const [batchIndex, batch] of batches.entries()) {
      console.log(`Processing batch ${batchIndex + 1}/${batches.length}`);

      const batchResults = await Promise.allSettled(
        batch.map(async (email) => {
          let retries = 0;
          let lastError: Error | null = null;

          while (retries <= MAX_RETRIES) {
            try {
              let enhancedContent = content;

              // Add tracking for clicks
              if (trackClicks) {
                enhancedContent = enhancedContent.replace(
                  /href="([^"]+)"/g,
                  (_, url) =>
                    `href="${domain}/api/track/click?emailId=${finalEmailId}&email=${encodeURIComponent(
                      email
                    )}&url=${encodeURIComponent(url)}&tid=${trackingId}"`
                );
              }

              // Add tracking for opens
              if (trackOpens) { 
                enhancedContent += `<img src="${domain}/api/track/open?emailId=${finalEmailId}&email=${encodeURIComponent(
                  email
                )}&tid=${trackingId}" width="1" height="1" style="display:none" />`;
              }

              // Add copyright
              enhancedContent += `
                <div style="text-align:center;margin-top:20px;font-size:12px;color:#666;">
                  <p>
                    © 2025 <a href="https://thenews.africa" 
                              style="color:#666;text-decoration:underline;"
                              target="_blank">Drop-Aphi</a>. 
                    All rights reserved.
                  </p>
                </div>
              `;

              // Add unsubscribe link
              enhancedContent += `
                <div style="text-align:center;margin-top:30px;font-size:12px;color:#666;">
                  <a href="${domain}/api/unsubscribe?email=${encodeURIComponent(
                email
              )}&ownerId=${newsLetterOwnerId}${
                campaign ? `&campaignID=${encodeURIComponent(campaign)}` : ''
              }"
                    style="color:#666;text-decoration:underline;">
                    Unsubscribe
                  </a>
                </div>
              `;

              const fromName = fromApplication.charAt(0).toUpperCase() + 
                             fromApplication.slice(1).toLowerCase();

              // Create headers using Record format (more compatible)
              const headers: Record<string, string> = {
                'X-Email-ID': finalEmailId,
                'X-Tracking-ID': trackingId,
                'X-NewsLetter-Owner-ID': newsLetterOwnerId,
                'List-Unsubscribe': `<${domain}/api/unsubscribe?email=${encodeURIComponent(
                  email
                )}&ownerId=${newsLetterOwnerId}${
                  campaign ? `&campaignId=${encodeURIComponent(campaign)}` : ''
                }>`
              };

              if (campaign) {
                headers['X-Campaign-ID'] = campaign;
              }

              const result = await transporter.sendMail({
                from: `${fromName} <${process.env.SMTP_USER}>`,
                to: email,
                subject,
                html: enhancedContent,
                headers: headers
              });

              if (!result.messageId) {
                throw new Error('No messageId returned from email server');
              }

              // Update EmailRecipient status to SENT
              await updateEmailRecipientStatus(finalEmailId, email, RecipientStatus.SENT);

              return { email, success: true, messageId: result.messageId };
            } catch (error) {
              lastError = error as Error;
              retries++;
              if (retries <= MAX_RETRIES) {
                await new Promise((res) => setTimeout(res, 1000 * retries));
              }
            }
          }

          // If we reach here, all retries failed
          await updateEmailRecipientStatus(
            finalEmailId, 
            email, 
            RecipientStatus.FAILED,
            { bounceReason: lastError?.message || 'Failed after retries' }
          );
          
          throw lastError || new Error('Failed after retries');
        })
      );

      // Process batch results
      batchResults.forEach((result, index) => {
        const email = batch[index];
        if (result.status === 'fulfilled' && result.value.success) {
          totalAccepted++;
          lastMessageId = result.value.messageId;
        } else {
          totalRejected++;
          failedEmails.push(email);
          console.error(
            `Failed to send to ${email}:`,
            result.status === 'rejected' ? result.reason : 'Unknown error'
          );
        }
      });

      // Delay between batches (except for the last batch)
      if (batchIndex < batches.length - 1) {
        await new Promise((res) => setTimeout(res, BATCH_DELAY_MS));
      }
    }

    if (!lastMessageId) {
      throw new Error('No emails were successfully sent - no messageId available');
    }

    // Step 8: Update final status and statistics
    await database.$transaction(async (tx) => {
      await tx.email.update({
        where: { id: finalEmailId },
        data: {
          status: EmailStatus.SENT,
          sentAt: new Date(),
          messageId: lastMessageId,
          recipients: totalAccepted,
          emailsSentCount: { increment: 1 },
        },
      });

      if (campaign) {
        await tx.campaign.update({
          where: { id: campaign },
          data: {
            emailsSent: { increment: 1 },
            recipients: { increment: totalAccepted },
            lastSentAt: new Date(),
          },
        });
      }

      // Update email analytics
      await tx.emailAnalytics.upsert({
        where: { emailId: finalEmailId },
        update: {
          totalRecipients: totalAccepted,
          deliveredCount: totalAccepted,
          deliveryRate: (totalAccepted / recipientEmails.length) * 100,
        },
        create: {
          emailId: finalEmailId,
          totalRecipients: totalAccepted,
          deliveredCount: totalAccepted,
          deliveryRate: (totalAccepted / recipientEmails.length) * 100,
          totalOpens: 0,
          uniqueOpens: 0,
          totalClicks: 0,
          uniqueClicks: 0,
          openRate: 0,
          clickRate: 0,
          bounceRate: 0,
          unsubscribeCount: 0,
          spamReportCount: 0,
          forwardCount: 0,
        },
      });
    });

    // Update usage
    await incrementUsage(newsLetterOwnerId, 'emailsSent', totalAccepted);

    return {
      success: true,
      emailId: finalEmailId,
      messageId: lastMessageId,
      trackingId,
      stats: {
        total: recipientEmails.length,
        accepted: totalAccepted,
        rejected: totalRejected,
        failedRecipients: failedEmails.length ? failedEmails : undefined,
        batches: batches.length,
        timeTaken: Date.now() - startTime,
      },
    };
  } catch (error) {
    console.error('[EMAIL_SEND_ERROR]', error);

    // Update email status to FAILED if we have an emailId
    if (params.emailId) {
      await database.email.update({
        where: { id: params.emailId },
        data: { status: EmailStatus.FAILED },
      });
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Email send failed',
    };
  }
};

// Updated helper function for the frontend component
export const prepareAndSendEmail = async (sendParams: SendEmailParams) => {
  // If emailId is not provided, check if email with same subject exists
  if (!sendParams.emailId) {
    const existingEmail = await findExistingEmailBySubject(sendParams.subject, sendParams.userId);
    
    if (existingEmail) {
      console.log(`Using existing email with subject "${sendParams.subject}" - ID: ${existingEmail.id}`);
      sendParams.emailId = existingEmail.id;
    } else {
      // Prepare data for createEmail
      const createEmailData = {
        title: sendParams.emailTitle || sendParams.subject,
        content: sendParams.content,
        builderMode: sendParams.builderMode || 'visual',
        emailSubject: sendParams.subject,
        previewText: sendParams.previewText || sendParams.emailTitle || sendParams.subject,
        elements: (sendParams.elements || []).map(element => ({
          ...element,
          type: element.type.toUpperCase()
        })),
        builderData: sendParams.builderData || {},
        emailType: 'NEWSLETTER' as const,
        trackOpens: sendParams.trackOpens ?? true,
        trackClicks: sendParams.trackClicks ?? true,
        enableUnsubscribe: true,
        createTemplateFromEmail: (sendParams.createTemplate ?? false) && (sendParams.builderMode === 'visual'),
        campaignId: sendParams.campaign || undefined,
      };

      const createResult = await createEmail(createEmailData);
      
      if (!createResult.success || !createResult.data?.id) {
        return {
          success: false,
          error: createResult.error || 'Failed to create email record - no ID returned',
        };
      }

      // Update sendParams with the new emailId
      sendParams.emailId = createResult.data.id;
    }
  }

  // Now send the email
  return await sendEmail(sendParams);
};















// 'use server';

// import { checkUsageLimit, incrementUsage } from '@/lib/checkAndUpdateUsage';
// import { database } from '../database';
// import { createEmail } from '@/actions/email/emails';
// import { transporter } from './utils';
// import { EmailStatus, RecipientStatus } from '../generated/prisma';

// const BATCH_SIZE = 20;
// const BATCH_DELAY_MS = 1000;
// const MAX_RETRIES = 5;

// interface SendEmailParams {
//   userEmail?: string[];
//   subject: string;
//   content: string;
//   emailId?: string;
//   campaign?: string | null;
//   newsLetterOwnerId: string;
//   contentJson: string;
//   adminEmail: string;
//   trackOpens?: boolean;
//   trackClicks?: boolean;
//   fromApplication: string;
//   emailTitle?: string;
//   previewText?: string;
//   builderData?: Record<string, unknown>;
//   elements?: Array<Record<string, unknown>>;
//   createTemplate?: boolean;
//   templateName?: string;
//   userId: string;
//   builderMode?: 'visual' | 'code';
// }

// // Function to get all subscribers for a newsletter owner
// const getSubscribers = async (newsLetterOwnerId: string): Promise<string[]> => {
//   try {
//     const subscribers = await database.subscriber.findMany({
//       where: {
//         newsLetterOwnerId,
//         status: "SUBSCRIBED", 
//       },
//       select: {
//         email: true,
//         name: true,
//       },
//     });

//     return subscribers.map(sub => sub.email);
//   } catch (error) {
//     console.error('Error fetching subscribers:', error);
//     throw new Error('Failed to fetch subscribers');
//   }
// };

// // Function to check if email with same subject already exists
// const findExistingEmailBySubject = async (subject: string, userId: string) => {
//   try {
//     const existingEmail = await database.email.findFirst({
//       where: {
//         emailSubject: subject,
//         userId: userId,
//       },
//       select: {
//         id: true,
//         status: true,
//       },
//     });
//     return existingEmail;
//   } catch (error) {
//     console.error('Error checking existing email:', error);
//     return null;
//   }
// };

// // Function to create EmailRecipient records in bulk
// const createEmailRecipients = async (emailId: string, recipientEmails: string[]): Promise<number> => {
//   try {
//     const recipientData = recipientEmails.map(email => ({
//       emailId,
//       recipientEmail: email,
//       status: RecipientStatus.PENDING,
//     }));

//     // Using createMany for better performance with large lists
//     const result = await database.emailRecipient.createMany({
//       data: recipientData,
//       skipDuplicates: true, // Skip if recipient already exists for this email
//     });

//     console.log(`Created ${result.count} email recipient records for email ${emailId}`);
//     return result.count;
//   } catch (error) {
//     console.error('Error creating email recipients:', error);
//     throw new Error('Failed to create email recipient records');
//   }
// };

// // Function to update EmailRecipient status
// const updateEmailRecipientStatus = async (
//   emailId: string, 
//   recipientEmail: string, 
//   status: RecipientStatus,
//   additionalData: Record<string, unknown> = {}
// ): Promise<void> => {
//   try {
//     const updateData: Record<string, unknown> = {
//       status,
//       ...additionalData
//     };

//     // Set timestamp based on status
//     const now = new Date();
//     if (status === RecipientStatus.SENT) {
//       updateData.sentAt = now;
//     } else if (status === RecipientStatus.DELIVERED) {
//       updateData.deliveredAt = now;
//     } else if (status === RecipientStatus.OPENED) {
//       updateData.openedAt = now;
//     } else if (status === RecipientStatus.CLICKED) {
//       updateData.clickedAt = now;
//     } else if (status === RecipientStatus.BOUNCED) {
//       updateData.bouncedAt = now;
//     } else if (status === RecipientStatus.UNSUBSCRIBED) {
//       updateData.unsubscribeAt = now;
//     }

//     await database.emailRecipient.update({
//       where: {
//         emailId_recipientEmail: {
//           emailId,
//           recipientEmail,
//         },
//       },
//       data: updateData,
//     });
//   } catch (error) {
//     console.error(`Error updating recipient status for ${recipientEmail}:`, error);
//   }
// };

// interface SendEmailResult {
//   success: boolean;
//   emailId?: string;
//   messageId?: string;
//   trackingId?: string;
//   stats?: {
//     total: number;
//     accepted: number;
//     rejected: number;
//     failedRecipients?: string[];
//     batches: number;
//     timeTaken: number;
//   };
//   error?: string;
// }

// export const sendEmail = async (params: SendEmailParams): Promise<SendEmailResult> => {
//   const {
//     userEmail,
//     subject,
//     content,
//     emailId,
//     campaign,
//     fromApplication,
//     newsLetterOwnerId,
//     contentJson,
//     adminEmail,
//     trackOpens = true,
//     trackClicks = true,
//     emailTitle,
//     previewText,
//     builderData,
//     elements = [],
//     createTemplate = false,
//     templateName,
//     userId,
//     builderMode = 'visual',
//   } = params;

//   const domain = 'https://denews-xi.vercel.app/';
//   const startTime = Date.now();
//   const trackingId = `trk_${Date.now()}`;

//   try {
//     if (!newsLetterOwnerId || !adminEmail || !userId) {
//       throw new Error('Missing required fields: newsLetterOwnerId, adminEmail, and userId are required');
//     }

//     // Step 1: Check if email exists, if not create it
//     let finalEmailId: string;

//     if (!emailId) {
//       // Check if email with same subject already exists
//       const existingEmail = await findExistingEmailBySubject(subject, userId);
      
//       if (existingEmail) {
//         console.log(`Email with subject "${subject}" already exists with ID: ${existingEmail.id}`);
//         finalEmailId = existingEmail.id;
        
//         // Update the existing email content if needed
//         await database.email.update({
//           where: { id: finalEmailId },
//           data: {
//             content: content,
//             previewText: previewText || subject,
//             builderData: builderData || {},
//             elements: elements.map(element => ({
//               ...element,
//               type: (element.type as string).toUpperCase()
//             })),
//           },
//         });
//       } else {
//         // Prepare data for createEmail
//         const createEmailData = {
//           title: emailTitle || subject,
//           content: content,
//           emailSubject: subject,
//           previewText: previewText || subject,
//           elements: elements.map((element: any, idx: number) => ({
//             id: element.id ?? `${Date.now()}_${idx}`,
//             type: (element.type as string).toUpperCase(),
//             content: element.content ?? '',
//             properties: element.properties ?? {},
//           })),
//           builderData: builderData || {},
//           builderMode: builderMode,
//           emailType: 'NEWSLETTER' as const,
//           trackOpens: trackOpens,
//           trackClicks: trackClicks,
//           enableUnsubscribe: true,
//           createTemplateFromEmail: createTemplate && builderMode === 'visual',
//           campaignId: campaign || undefined,
//         };

//         // Create new email record using your existing createEmail function
//         const createResult = await createEmail(createEmailData);

//         if (!createResult.success || !createResult.data?.id) {
//           throw new Error(createResult.error || 'Failed to create email record - no ID returned');
//         }

//         finalEmailId = createResult.data.id;
//         console.log(`Created new email record with ID: ${finalEmailId}`);
//       }
//     } else {
//       // Verify email exists and belongs to the user
//       const existingEmail = await database.email.findUnique({
//         where: { 
//           id: emailId,
//           userId: userId
//         },
//       });

//       if (!existingEmail) {
//         throw new Error('Email record not found or access denied');
//       }

//       finalEmailId = emailId;

//       // Update the email content if needed
//       await database.email.update({
//         where: { id: finalEmailId },
//         data: {
//           emailSubject: subject,
//           content: content,
//           previewText: previewText || existingEmail.previewText,
//           builderData: builderData || existingEmail.builderData,
//         },
//       });
//     }

//     // Step 2: Get subscribers if userEmail is not provided
//     let recipientEmails: string[] = [];
    
//     if (userEmail && userEmail.length > 0) {
//       recipientEmails = userEmail;
//     } else {
//       recipientEmails = await getSubscribers(newsLetterOwnerId);
//     }

//     if (recipientEmails.length === 0) {
//       throw new Error('No recipients found. Please add subscribers or provide email addresses.');
//     }

//     console.log(`Sending to ${recipientEmails.length} recipients`);

//     // Step 3: Create EmailRecipient records for all recipients
//     await createEmailRecipients(finalEmailId, recipientEmails);

//     // Step 4: Check usage limit
//     const usageCheck = await checkUsageLimit(newsLetterOwnerId, 'emailsSent');
//     if (!usageCheck.success) throw new Error(usageCheck.message);

//     // Step 5: Verify SMTP connection
//     const smtpAvailable = await transporter.verify().catch((err) => {
//       console.error('SMTP verification failed:', err);
//       return false;
//     });
//     if (!smtpAvailable) throw new Error('Email server unavailable');

//     // Step 6: Update email status to SENDING
//     await database.email.update({
//       where: { id: finalEmailId },
//       data: {
//         status: EmailStatus.SENDING,
//         sentAt: new Date(),
//       },
//     });

//     // Step 7: Send emails in batches
//     const batches = Array.from(
//       { length: Math.ceil(recipientEmails.length / BATCH_SIZE) },
//       (_, i) => recipientEmails.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE)
//     );

//     let totalAccepted = 0;
//     let totalRejected = 0;
//     let lastMessageId = '';
//     const failedEmails: string[] = [];

//     for (const [batchIndex, batch] of batches.entries()) {
//       console.log(`Processing batch ${batchIndex + 1}/${batches.length}`);

//       const batchResults = await Promise.allSettled(
//         batch.map(async (email) => {
//           let retries = 0;
//           let lastError: Error | null = null;

//           while (retries <= MAX_RETRIES) {
//             try {
//               let enhancedContent = content;

//               // Add tracking for clicks
//               if (trackClicks) {
//                 enhancedContent = enhancedContent.replace(
//                   /href="([^"]+)"/g,
//                   (_, url) =>
//                     `href="${domain}/api/track/click?emailId=${finalEmailId}&email=${encodeURIComponent(
//                       email
//                     )}&url=${encodeURIComponent(url)}&tid=${trackingId}"`
//                 );
//               }

//               // Add tracking for opens
//               if (trackOpens) { 
//                 enhancedContent += `<img src="${domain}/api/track/open?emailId=${finalEmailId}&email=${encodeURIComponent(
//                   email
//                 )}&tid=${trackingId}" width="1" height="1" style="display:none" />`;
//               }

//               // Add copyright
//               enhancedContent += `
//                 <div style="text-align:center;margin-top:20px;font-size:12px;color:#666;">
//                   <p>
//                     © 2025 <a href="https://thenews.africa" 
//                               style="color:#666;text-decoration:underline;"
//                               target="_blank">Drop-Aphi</a>. 
//                     All rights reserved.
//                   </p>
//                 </div>
//               `;

//               // Add unsubscribe link
//               enhancedContent += `
//                 <div style="text-align:center;margin-top:30px;font-size:12px;color:#666;">
//                   <a href="${domain}/api/unsubscribe?email=${encodeURIComponent(
//                 email
//               )}&ownerId=${newsLetterOwnerId}${
//                 campaign ? `&campaignID=${encodeURIComponent(campaign)}` : ''
//               }"
//                     style="color:#666;text-decoration:underline;">
//                     Unsubscribe
//                   </a>
//                 </div>
//               `;

//               const fromName = fromApplication.charAt(0).toUpperCase() + 
//                              fromApplication.slice(1).toLowerCase();

//               // Create headers using Record format (more compatible)
//               const headers: Record<string, string> = {
//                 'X-Email-ID': finalEmailId,
//                 'X-Tracking-ID': trackingId,
//                 'X-NewsLetter-Owner-ID': newsLetterOwnerId,
//                 'List-Unsubscribe': `<${domain}/api/unsubscribe?email=${encodeURIComponent(
//                   email
//                 )}&ownerId=${newsLetterOwnerId}${
//                   campaign ? `&campaignId=${encodeURIComponent(campaign)}` : ''
//                 }>`
//               };

//               if (campaign) {
//                 headers['X-Campaign-ID'] = campaign;
//               }

//               const result = await transporter.sendMail({
//                 from: `${fromName} <${process.env.SMTP_USER}>`,
//                 to: email,
//                 subject,
//                 html: enhancedContent,
//                 headers: headers
//               });

//               if (!result.messageId) {
//                 throw new Error('No messageId returned from email server');
//               }

//               // Update EmailRecipient status to SENT
//               await updateEmailRecipientStatus(finalEmailId, email, RecipientStatus.SENT);

//               return { email, success: true, messageId: result.messageId };
//             } catch (error) {
//               lastError = error as Error;
//               retries++;
//               if (retries <= MAX_RETRIES) {
//                 await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
//               }
//             }
//           }

//           // If we reach here, all retries failed
//           await updateEmailRecipientStatus(
//             finalEmailId, 
//             email, 
//             RecipientStatus.FAILED,
//             { bounceReason: lastError?.message || 'Failed after retries' }
//           );
          
//           throw lastError || new Error('Failed after retries');
//         })
//       );

//       // Process batch results
//       batchResults.forEach((result, index) => {
//         const email = batch[index];
//         if (result.status === 'fulfilled' && result.value.success) {
//           totalAccepted++;
//           lastMessageId = result.value.messageId;
//         } else {
//           totalRejected++;
//           failedEmails.push(email);
//           console.error(
//             `Failed to send to ${email}:`,
//             result.status === 'rejected' ? result.reason : 'Unknown error'
//           );
//         }
//       });

//       // Delay between batches (except for the last batch)
//       if (batchIndex < batches.length - 1) {
//         await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
//       }
//     }

//     if (!lastMessageId) {
//       throw new Error('No emails were successfully sent - no messageId available');
//     }

//     // Step 8: Update final status and statistics
//     await database.$transaction(async (tx) => {
//       await tx.email.update({
//         where: { id: finalEmailId },
//         data: {
//           status: EmailStatus.SENT,
//           sentAt: new Date(),
//           messageId: lastMessageId,
//           recipients: totalAccepted,
//           emailsSentCount: { increment: 1 },
//         },
//       });

//       if (campaign) {
//         await tx.campaign.update({
//           where: { id: campaign },
//           data: {
//             emailsSent: { increment: 1 },
//             recipients: { increment: totalAccepted },
//             lastSentAt: new Date(),
//           },
//         });
//       }

//       // Update email analytics
//       await tx.emailAnalytics.upsert({
//         where: { emailId: finalEmailId },
//         update: {
//           totalRecipients: totalAccepted,
//           deliveredCount: totalAccepted,
//           deliveryRate: (totalAccepted / recipientEmails.length) * 100,
//         },
//         create: {
//           emailId: finalEmailId,
//           totalRecipients: totalAccepted,
//           deliveredCount: totalAccepted,
//           deliveryRate: (totalAccepted / recipientEmails.length) * 100,
//           totalOpens: 0,
//           uniqueOpens: 0,
//           totalClicks: 0,
//           uniqueClicks: 0,
//           openRate: 0,
//           clickRate: 0,
//           bounceRate: 0,
//           unsubscribeCount: 0,
//           spamReportCount: 0,
//           forwardCount: 0,
//         },
//       });
//     });

//     // Update usage
//     await incrementUsage(newsLetterOwnerId, 'emailsSent', totalAccepted);

//     return {
//       success: true,
//       emailId: finalEmailId,
//       messageId: lastMessageId,
//       trackingId,
//       stats: {
//         total: recipientEmails.length,
//         accepted: totalAccepted,
//         rejected: totalRejected,
//         failedRecipients: failedEmails.length > 0 ? failedEmails : undefined,
//         batches: batches.length,
//         timeTaken: Date.now() - startTime,
//       },
//     };
//   } catch (error) {
//     console.error('[EMAIL_SEND_ERROR]', error);

//     // Update email status to FAILED if we have an emailId
//     if (params.emailId) {
//       await database.email.update({
//         where: { id: params.emailId },
//         data: { status: EmailStatus.FAILED },
//       });
//     }

//     return {
//       success: false,
//       error: error instanceof Error ? error.message : 'Email send failed',
//     };
//   }
// };

// // Updated helper function for the frontend component
// export const prepareAndSendEmail = async (sendParams: SendEmailParams): Promise<SendEmailResult> => {
//   // If emailId is not provided, check if email with same subject exists
//   if (!sendParams.emailId) {
//     const existingEmail = await findExistingEmailBySubject(sendParams.subject, sendParams.userId);
    
//     if (existingEmail) {
//       console.log(`Using existing email with subject "${sendParams.subject}" - ID: ${existingEmail.id}`);
//       sendParams.emailId = existingEmail.id;
//       const createEmailData = {
//         title: sendParams.emailTitle || sendParams.subject,
//         content: sendParams.content,
//         builderMode: sendParams.builderMode || 'visual',
//         emailSubject: sendParams.subject,
//         previewText: sendParams.previewText || sendParams.emailTitle || sendParams.subject,
//         elements: (sendParams.elements || []).map((element: any, idx: number) => ({
//           id: element.id ?? `${Date.now()}_${idx}`,
//           type: (element.type as string).toUpperCase(),
//           content: element.content ?? '',
//           properties: element.properties ?? {},
//         })),
//         builderData: sendParams.builderData || {},
//         emailType: 'NEWSLETTER' as const,
//         trackOpens: sendParams.trackOpens ?? true,
//         trackClicks: sendParams.trackClicks ?? true,
//         enableUnsubscribe: true,
//         createTemplateFromEmail: (sendParams.createTemplate ?? false) && (sendParams.builderMode === 'visual'),
//         campaignId: sendParams.campaign || undefined,
//       };
//         campaignId: sendParams.campaign || undefined,
//       };

//       const createResult = await createEmail(createEmailData);
      
//       if (!createResult.success || !createResult.data?.id) {
//         return {
//           success: false,
//           error: createResult.error || 'Failed to create email record - no ID returned',
//         };
//       }

//       // Update sendParams with the new emailId
//       sendParams.emailId = createResult.data.id;
//     }
//   }

//   // Now send the email
//   return await sendEmail(sendParams);
// };