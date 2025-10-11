// app/api/track/click/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { RecipientStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  // Extract searchParams at the top level
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  
  const emailId = searchParams.get('emailId');
  const email = searchParams.get('email');
  const urlParam = searchParams.get('url');
  const trackingId = searchParams.get('tid');

  try {
    // Validate required parameters
    if (!emailId || !email || !urlParam) {
      return new NextResponse('Missing parameters', { status: 400 });
    }

    // Decode parameters
    const decodedEmail = decodeURIComponent(email);
    const decodedUrl = decodeURIComponent(urlParam);
    const userIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';

    // Validate URL to prevent open redirects
    let redirectUrl: string;
    try {
      const parsedUrl = new URL(decodedUrl);
      
      // Allow only http/https protocols for security
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid URL protocol');
      }
      
      redirectUrl = parsedUrl.toString();
    } catch (error) {
      console.error('[EMAIL_CLICK_TRACKING_INVALID_URL]', { decodedUrl, error });
      return new NextResponse('Invalid URL', { status: 400 });
    }

    // Record the click event using transaction
    await database.$transaction(async (tx) => {
      // Get current email data
      const emailRecord = await tx.email.findUnique({
        where: { id: emailId },
        select: { 
          clickCount: true,
          lastClicked: true,
          clickedByEmails: true,
          clickedByIps: true
        },
      });

      if (!emailRecord) {
        throw new Error('Email not found');
      }

      // Check if this is the first click from this email
      const isFirstClick = !emailRecord.clickedByEmails.includes(decodedEmail);
      const isFirstIpClick = !emailRecord.clickedByIps.includes(userIp);

      // Update email click metrics
      await tx.email.update({
        where: { id: emailId },
        data: {
          clickCount: (emailRecord.clickCount || 0) + 1,
          lastClicked: new Date(),
          clickedByEmails: {
            set: Array.from(new Set([...emailRecord.clickedByEmails, decodedEmail]))
          },
          clickedByIps: {
            set: Array.from(new Set([...emailRecord.clickedByIps, userIp]))
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
          status: RecipientStatus.CLICKED,
          clickedAt: new Date(),
        },
        create: {
          emailId,
          recipientEmail: decodedEmail,
          status: RecipientStatus.CLICKED,
          clickedAt: new Date(),
        },
      });

      // Create ClickedLink record
      await tx.clickedLink.create({
        data: {
          emailId,
          url: redirectUrl,
          clickedBy: decodedEmail,
          clickedAt: new Date(),
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
            totalClicks: { increment: 1 },
            uniqueClicks: isFirstClick ? { increment: 1 } : analytics.uniqueClicks,
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
            totalClicks: 1,
            uniqueClicks: 1,
            totalRecipients: emailData?.recipients || 0,
            deliveredCount: emailData?.recipients || 0,
            totalOpens: 0,
            uniqueOpens: 0,
            deliveryRate: 100,
            openRate: 0,
            clickRate: emailData?.recipients ? (1 / emailData.recipients) * 100 : 0,
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
        },
      });

      const analytics = await tx.emailAnalytics.findUnique({
        where: { emailId },
      });

      if (emailWithData && analytics && emailWithData.recipients > 0) {
        const clickRate = (analytics.uniqueClicks / emailWithData.recipients) * 100;
        
        await tx.emailAnalytics.update({
          where: { emailId },
          data: {
            clickRate: Math.round(clickRate * 100) / 100,
          },
        });
      }
    });

    console.log(`[EMAIL_CLICK_TRACKED] Email: ${emailId}, Recipient: ${decodedEmail}, URL: ${redirectUrl}`);

    // Redirect to the original URL
    return NextResponse.redirect(redirectUrl, 302);
  } catch (error) {
    console.error('[EMAIL_CLICK_TRACKING_ERROR]', error);
    
    // If we have a URL, still redirect even on tracking error
    if (urlParam) {
      try {
        const decodedUrl = decodeURIComponent(urlParam);
        const parsedUrl = new URL(decodedUrl);
        
        if (['http:', 'https:'].includes(parsedUrl.protocol)) {
          return NextResponse.redirect(decodedUrl, 302);
        }
      } catch (redirectError) {
        console.error('[EMAIL_CLICK_REDIRECT_FALLBACK_ERROR]', redirectError);
      }
    }

    return new NextResponse('Tracking error', { status: 500 });
  }
}