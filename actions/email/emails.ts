'use server';

import { getServerAuth } from '@/lib/auth/getauth';
import { database } from '@/lib/database';
import { sendTestMail } from '@/lib/email/sendTestMail';
import { ElementType, EmailStatus, EmailType, Prisma } from '@/lib/generated/prisma';
import { CreateEmailSchema, type CreateEmailInput } from '@/lib/validations/email-schema';
import { revalidatePath } from 'next/cache';
import { z, ZodError } from 'zod'


export async function createEmail(data: CreateEmailInput) {
  try {
    // Validate authentication
    const user = await getServerAuth();
    if (!user?.id) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Validate input data
    const validatedData = CreateEmailSchema.parse(data);

    // Check if email subject already exists for this user
    const existingEmail = await database.email.findFirst({
      where: {
        emailSubject: validatedData.emailSubject, 
        userId: user.userId,
      },
    });

    if (existingEmail) {
      return {
        success: false,
        error: 'An email with this title already exists',
      };
    }

    // Determine status based on scheduling
    let status: EmailStatus = EmailStatus.DRAFT;
    if (validatedData.scheduleDate) {
      status = EmailStatus.SCHEDULED;
    }

    // Create email transaction
    const result = await database.$transaction(async (tx) => {
      let templateId: string | null = validatedData.templateUsed || null;
      let campaignId: string | null = validatedData.campaignId || null;

      // NEW: Create or find campaign based on email title
      if (!campaignId) {
        // Generate campaign name from email title
        const campaignName = `${validatedData.title}`;
        
        // Check if campaign already exists for this user
        const existingCampaign = await tx.campaign.findFirst({
          where: {
            name: campaignName,
            userId: user.userId,
          },
        });

        if (existingCampaign) {
          campaignId = existingCampaign.id;
        } else {
          // Create new campaign
          const newCampaign = await tx.campaign.create({
            data: {
              name: campaignName,
              userId: user.userId,
              description: `Campaign for email: ${validatedData.title}`,
              type: validatedData.emailType || 'NEWSLETTER',
              status: 'ACTIVE',
              emailsSent: 0,
              recipients: 0,
            },
          });
          campaignId = newCampaign.id;
        }
      }

      // NEW LOGIC: Only create template if:
      // 1. No template is explicitly used
      // 2. User wants to create template from email
      // 3. Email is created in drag & drop mode (not code mode)
      if (!validatedData.templateUsed && 
          validatedData.createTemplateFromEmail && 
          validatedData.builderMode === 'visual') {
        
        const templateName = `Template from: ${validatedData.title}`;
        
        // Check if template name already exists for this user
        const existingTemplate = await tx.emailTemplate.findFirst({
          where: {
            name: templateName,
            userId: user.userId,
          },
        });

        if (!existingTemplate) {
          const newTemplate = await tx.emailTemplate.create({
            data: {
              name: templateName,
              description: `Template created from email: ${validatedData.title}`,
              category: 'User Templates',
              tags: ['user-generated'],
              elements: validatedData.elements || [],
              subject: validatedData.emailSubject,
              isPublic: false,
              userId: user.userId,
            },
          });
          templateId = newTemplate.id;
        } else {
          // Use existing template if name conflict
          templateId = existingTemplate.id;
        }
      }
      // If in code mode, explicitly set templateId to null even if createTemplateFromEmail is true
      else if (validatedData.builderMode === 'code') {
        templateId = null;
      }

      // 1. Create the main email record
      const email = await tx.email.create({
        data: {
          title: validatedData.title,
          content: validatedData.content,
          emailSubject: validatedData.emailSubject,
          previewText: validatedData.previewText,
          builderData: validatedData.builderData,
          builderMode: validatedData.builderMode,
          templateUsed: templateId,
          status,
          emailType: validatedData.emailType as EmailType,
          trackOpens: validatedData.trackOpens,
          trackClicks: validatedData.trackClicks,
          enableUnsubscribe: validatedData.enableUnsubscribe,
          scheduleDate: validatedData.scheduleDate ? new Date(validatedData.scheduleDate) : null,
          scheduleTime: validatedData.scheduleTime || null,
          userId: user.userId,
          newsLetterOwnerId: user.userId,
          campaignId: campaignId, // Link to the campaign
        },
      });

      // 2. Create email attachments (images) if provided
      if (validatedData.attachments && validatedData.attachments.length > 0) {
        const emailAttachments = validatedData.attachments.map((attachment) => ({
          emailId: email.id,
          url: attachment.url,
          mimeType: attachment.fileType,
          filename: attachment.filename,
          fileSize: attachment.fileSize,
        }));

        await tx.emailAttachment.createMany({
          data: emailAttachments,
        });
      }

      // 3. Create email elements
      if (validatedData.elements && validatedData.elements.length > 0) {
        const emailElements = validatedData.elements.map((element, index) => ({
          emailId: email.id,
          elementId: element.id,
          type: element.type as ElementType,
          content: element.content || null,
          properties: element.properties || {},
          sortOrder: index,
        }));

        await tx.emailElement.createMany({
          data: emailElements,
        });
      }

      // 4. Create email analytics record
      await tx.emailAnalytics.create({
        data: {
          emailId: email.id,
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
          forwardCount: 0,
        },
      });

      // 5. If template was used (either provided or newly created), increment its usage count
      if (templateId) {
        await tx.emailTemplate.update({
          where: { id: templateId },
          data: {
            usageCount: {
              increment: 1,
            },
          },
        });
      }

      return {
        email,
        templateId,
        campaignId,
      };
    });

    // Revalidate the relevant paths
    revalidatePath('/dashboard/emails');
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/campaigns'); // Add campaigns page
    if (result.templateId) {
      revalidatePath('/dashboard/templates');
    }

    return {
      success: true,
      data: {
        id: result.email.id,
        emailSubject:result.email.emailSubject,
        title: result.email.title,
        status: result.email.status,
        createdAt: result.email.createdAt,
        templateId: result.templateId,
        campaignId: result.campaignId,
      },
    };
  } catch (error) {
    console.error('Error creating email:', error);

    if (error instanceof ZodError) {
      error.issues.forEach((issue) => {
        console.log(issue.path, issue.message)
      })
    }

    return {
      success: false,
      error: 'Failed to create email. Please try again.',
    };
  }
}

function toInputJson(value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  return value === null ? Prisma.JsonNull : (value as Prisma.InputJsonValue)
}

export async function duplicateEmail(emailId: string) {
  try {
    const user = await getServerAuth();
    if (!user?.id) {
      return { success: false, error: 'Authentication required' };
    }

    const originalEmail = await database.email.findFirst({
      where: {
        id: emailId,
        userId: user.userId,
      },
      include: {
        elements: true,
      },
    });

    if (!originalEmail) {
      return { success: false, error: 'Email not found' };
    }

    const duplicatedEmail = await database.$transaction(async (tx) => {
      // Create new email with "Copy of" prefix
      const newEmail = await tx.email.create({
        data: {
          title: `Copy of ${originalEmail.title}`,
          content: originalEmail.content,
          emailSubject: originalEmail.emailSubject,
          previewText: originalEmail.previewText,
          builderData: toInputJson(originalEmail.builderData),
          templateUsed: originalEmail.templateUsed,
          status: EmailStatus.DRAFT,
          emailType: originalEmail.emailType,
          trackOpens: originalEmail.trackOpens,
          trackClicks: originalEmail.trackClicks,
          enableUnsubscribe: originalEmail.enableUnsubscribe,
          userId: user.id,
          newsLetterOwnerId: user.id,
          campaignId: originalEmail.campaignId,
        },
      });

      // Duplicate email elements
      if (originalEmail.elements.length > 0) {
        const newElements = originalEmail.elements.map(element => ({
          emailId: newEmail.id,
          elementId: `${element.type.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: element.type,
          content: element.content,
          properties: toInputJson(element.properties),
          sortOrder: element.sortOrder,
        }));

        await tx.emailElement.createMany({
          data: newElements,
        });
      }

      // Create analytics record
      await tx.emailAnalytics.create({
        data: {
          emailId: newEmail.id,
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
          forwardCount: 0,
        },
      });

      return newEmail;
    });

    revalidatePath('/dashboard/emails');

    return {
      success: true,
      data: {
        id: duplicatedEmail.id,
        title: duplicatedEmail.title,
        status: duplicatedEmail.status,
      },
    };
  } catch (error) {
    console.error('Error duplicating email:', error);
    return {
      success: false,
      error: 'Failed to duplicate email',
    };
  }
}

export async function updateEmailStatus(emailId: string, status: EmailStatus) {
  try {
    const user = await getServerAuth();
    if (!user?.id) {
      return { success: false, error: 'Authentication required' };
    }

    const email = await database.email.update({
      where: {
        id: emailId,
        userId: user.userId,
      },
      data: {
        status,
        sentAt: status === EmailStatus.SENT ? new Date() : undefined,
      },
    });

    revalidatePath('/dashboard/emails');
    revalidatePath(`/dashboard/emails/${emailId}`);

    return { success: true, data: email };
  } catch (error) {
    console.error('Error updating email status:', error);
    return { success: false, error: 'Failed to update email status' };
  }
}

export async function deleteEmail(emailId: string) {
  try {
    const user = await getServerAuth();
    if (!user?.id) {
      return { success: false, error: 'Authentication required' };
    }

    // Using transaction to ensure all related records are deleted
    await database.$transaction(async (tx) => {
      // Delete related records first due to foreign key constraints
      await tx.emailElement.deleteMany({
        where: { emailId },
      });

      await tx.emailAnalytics.deleteMany({
        where: { emailId },
      });

      await tx.emailRecipient.deleteMany({
        where: { emailId },
      });

      await tx.emailAttachment.deleteMany({
        where: { emailId },
      });

      await tx.clickedLink.deleteMany({
        where: { emailId },
      });

      // Finally delete the email
      await tx.email.delete({
        where: {
          id: emailId,
          userId: user.userId,
        },
      });
    });

    revalidatePath('/dashboard/emails');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error deleting email:', error);
    return { success: false, error: 'Failed to delete email' };
  }
}






export async function getTemplates() {
  try {
    const templates = await database.emailTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return { success: true, data: templates }
  } catch (error) {
    return { success: false, error: "Failed to fetch templates" }
  }
}

export async function deleteTemplate(id: string) {
  try {
    await database.emailTemplate.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete template" }
  }
}

export async function sendTestEmail(data: {
  to: string
  subject: string
  htmlContent: string
  title: string
  previewText?: string
}) {
  try {
    await sendTestMail(data)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to send test email" }
  }
}












