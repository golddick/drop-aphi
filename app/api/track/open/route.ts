// app/api/track/open/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { RecipientStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  // Extract searchParams at the top level
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  
  const emailId = searchParams.get('emailId');
  const email = searchParams.get('email');
  const trackingId = searchParams.get('tid');

  try {
    // Validate required parameters
    if (!emailId || !email) {
      return new NextResponse(null, { status: 400 });
    }

    // Decode email
    const decodedEmail = decodeURIComponent(email);
    const userIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';

    // Record the open event using transaction
    await database.$transaction(async (tx) => {
      // Get current email data
      const emailRecord = await tx.email.findUnique({
        where: { id: emailId },
        select: { 
          openCount: true,
          lastOpened: true,
          openedByEmails: true,
          openedByIps: true
        },
      });

      if (!emailRecord) {
        throw new Error('Email not found');
      }

      // Check if this is the first open from this email
      const isFirstOpen = !emailRecord.openedByEmails.includes(decodedEmail);
      const isFirstIpOpen = !emailRecord.openedByIps.includes(userIp);

      // Update email open metrics
      await tx.email.update({
        where: { id: emailId },
        data: {
          openCount: (emailRecord.openCount || 0) + 1,
          lastOpened: new Date(),
          openedByEmails: {
            set: Array.from(new Set([...emailRecord.openedByEmails, decodedEmail]))
          },
          openedByIps: {
            set: Array.from(new Set([...emailRecord.openedByIps, userIp]))
          },
        },
      });

      // Update EmailRecipient status
      await tx.emailRecipient.upsert({
        where: {
          emailId_recipientEmail: {
            emailId,
            recipientEmail: decodedEmail,
          },
        },
        update: {
          status: RecipientStatus.OPENED,
          openedAt: new Date(),
        },
        create: {
          emailId,
          recipientEmail: decodedEmail,
          status: RecipientStatus.OPENED,
          openedAt: new Date(),
        },
      });

      // Update email analytics
      const analytics = await tx.emailAnalytics.findUnique({
        where: { emailId },
      });

      if (analytics) {
        await tx.emailAnalytics.update({
          where: { emailId },
          data: {
            totalOpens: { increment: 1 },
            uniqueOpens: isFirstOpen ? { increment: 1 } : analytics.uniqueOpens,
            // Rates will be recalculated separately
          },
        });
      } else {
        // Get total recipients for rate calculation
        const emailData = await tx.email.findUnique({
          where: { id: emailId },
          select: { recipients: true }
        });

        await tx.emailAnalytics.create({
          data: {
            emailId,
            totalOpens: 1,
            uniqueOpens: 1,
            totalRecipients: emailData?.recipients || 0,
            deliveredCount: emailData?.recipients || 0,
            totalClicks: 0,
            uniqueClicks: 0,
            deliveryRate: 100, // Assuming all were delivered
            openRate: emailData?.recipients ? (1 / emailData.recipients) * 100 : 0,
            clickRate: 0,
            bounceRate: 0,
            unsubscribeCount: 0,
            spamReportCount: 0,
            forwardCount: 0,
          },
        });
      }
    });

    // Recalculate rates after transaction
    await database.$transaction(async (tx) => {
      const emailWithData = await tx.email.findUnique({
        where: { id: emailId },
        select: {
          recipients: true,
          openCount: true,
        },
      });

      const analytics = await tx.emailAnalytics.findUnique({
        where: { emailId },
      });

      if (emailWithData && analytics && emailWithData.recipients > 0) {
        const openRate = (analytics.uniqueOpens / emailWithData.recipients) * 100;
        
        await tx.emailAnalytics.update({
          where: { emailId },
          data: {
            openRate: Math.round(openRate * 100) / 100,
          },
        });
      }
    });

    console.log(`[EMAIL_OPEN_TRACKED] Email: ${emailId}, Recipient: ${decodedEmail}, IP: ${userIp}`);

    // Return a 1x1 transparent PNG
    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64'
    );

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('[EMAIL_OPEN_TRACKING_ERROR]', error);
    
    // Still return the tracking pixel even on error
    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64'
    );

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}