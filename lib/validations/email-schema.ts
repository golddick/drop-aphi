// // lib/validations/email-schema.ts
import { z } from 'zod';

export const EmailElementSchema = z.object({
  id: z.string(),
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'BUTTON', 'SOCIAL', 'DIVIDER', 'COLUMNS']),
  content: z.string().optional(),
  properties: z.record(z.string(), z.any()).optional(), // ✅ fixed
});





// lib/validations/email-schema.ts
export const CreateEmailSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  emailSubject: z.string().min(1, "Subject is required").max(255),
  builderMode: z.enum(['visual', 'code']).default('visual'),
  content: z.string().min(1, "HTML content is required")
    .refine((content) => {
      // Basic HTML validation - allow both full documents and body content
      if (content.includes('<html') && !content.includes('</html>')) {
        return false; // Invalid HTML structure
      }
      return true;
    }, "Invalid HTML structure"),
  previewText: z.string().max(150).optional(),
  elements: z.array(EmailElementSchema).min(1, "At least one element is required"),
  builderData: z.record(z.string(), z.any()).optional(),
  templateUsed: z.string().optional(),
  emailType: z.enum(['BROADCAST', 'TRANSACTIONAL', 'NEWSLETTER', 'CAMPAIGN', 'AUTOMATION', 'TEST']).default('NEWSLETTER'),
  campaignId: z.string().optional(),
  trackOpens: z.boolean().default(true),
  trackClicks: z.boolean().default(true),
  enableUnsubscribe: z.boolean().default(true),
  scheduleDate: z.string().datetime().optional(),
  scheduleTime: z.string().optional(),
  createTemplateFromEmail: z.boolean().optional().default(false),
    attachments: z.array(z.object({
    url: z.string(),
    fileType: z.string(),
    filename: z.string(),
    fileSize: z.number(),
  })).optional(), // Add this line
});

export type CreateEmailInput = z.infer<typeof CreateEmailSchema>;