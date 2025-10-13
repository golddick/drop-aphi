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
    const result = await database.$transaction(async (tx) => {
      // Get current email data with campaign info
      const emailRecord = await tx.email.findUnique({
        where: { id: emailId },
        include: {
          campaign: true, // Include campaign to update campaign analytics
        },
      });

      if (!emailRecord) {
        throw new Error('Email not found');
      }

      // Check if this email has already been clicked by this recipient
      const existingRecipient = await tx.emailRecipient.findUnique({
        where: {
          emailId_recipientEmail: {
            emailId,
            recipientEmail: decodedEmail,
          },
        },
        select: {
          status: true,
          clickedAt: true,
        },
      });

      // Check if this specific link has already been clicked by this user
      const existingClick = await tx.clickedLink.findFirst({
        where: {
          emailId,
          clickedBy: decodedEmail,
          url: redirectUrl,
        },
      });

      const isAlreadyClicked = existingClick || existingRecipient?.status === RecipientStatus.CLICKED;

      if (isAlreadyClicked) {
        console.log(`[EMAIL_ALREADY_CLICKED] Email: ${emailId}, Recipient: ${decodedEmail}, URL: ${redirectUrl}`);
        return { alreadyClicked: true, emailRecord, redirectUrl };
      }

      // Get current analytics to check unique clicks
      const analytics = await tx.emailAnalytics.findUnique({
        where: { emailId },
      });

      const currentClickedByEmails = emailRecord.clickedByEmails || [];
      const currentClickedByIps = emailRecord.clickedByIps || [];
      
      const isFirstClickForEmail = !currentClickedByEmails.includes(decodedEmail);
      const isFirstClickForIp = !currentClickedByIps.includes(userIp);

      // Update email click metrics
      const updatedEmail = await tx.email.update({
        where: { id: emailId },
        data: {
          clickCount: (emailRecord.clickCount || 0) + 1,
          lastClicked: new Date(),
          clickedByEmails: {
            set: isFirstClickForEmail 
              ? Array.from(new Set([...currentClickedByEmails, decodedEmail]))
              : currentClickedByEmails
          },
          clickedByIps: {
            set: isFirstClickForIp
              ? Array.from(new Set([...currentClickedByIps, userIp]))
              : currentClickedByIps
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
      if (analytics) {
        await tx.emailAnalytics.update({
          where: { emailId },
          data: {
            totalClicks: { increment: 1 },
            uniqueClicks: isFirstClickForEmail ? { increment: 1 } : undefined,
          },
        });
      } else {
        // Create new analytics record if it doesn't exist
        await tx.emailAnalytics.create({
          data: {
            emailId,
            totalClicks: 1,
            uniqueClicks: 1,
            totalRecipients: emailRecord.recipients || 0,
            deliveredCount: emailRecord.recipients || 0,
            totalOpens: 0,
            uniqueOpens: 0,
            deliveryRate: 100,
            openRate: 0,
            clickRate: emailRecord.recipients ? (1 / emailRecord.recipients) * 100 : 0,
            bounceRate: 0,
            unsubscribeCount: 0,
            spamReportCount: 0,
            forwardCount: 0,
          },
        });
      }

      return { alreadyClicked: false, emailRecord, updatedEmail, redirectUrl };
    });

    // If already clicked, still redirect but don't update analytics again
    if (result.alreadyClicked) {
      console.log(`[EMAIL_CLICK_REDIRECT_ONLY] Email: ${emailId}, Recipient: ${decodedEmail}, URL: ${result.redirectUrl}`);
      return NextResponse.redirect(result.redirectUrl, 302);
    }

    // Recalculate rates and update campaign analytics after transaction
    await database.$transaction(async (tx) => {
      const emailWithData = await tx.email.findUnique({
        where: { id: emailId },
        include: {
          campaign: true,
        },
      });

      if (!emailWithData) return;

      const analytics = await tx.emailAnalytics.findUnique({
        where: { emailId },
      });

      // Update email click rate
      if (emailWithData.recipients && analytics && emailWithData.recipients > 0) {
        const clickRate = Math.min((analytics.uniqueClicks / emailWithData.recipients) * 100, 100);
        
        await tx.emailAnalytics.update({
          where: { emailId },
          data: {
            clickRate: Math.round(clickRate * 100) / 100,
          },
        });

        // Update campaign analytics if email belongs to a campaign
        if (emailWithData.campaign) {
          await updateCampaignAnalytics(tx, emailWithData.campaign.id);
        }
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

// Helper function to update campaign analytics
async function updateCampaignAnalytics(tx: any, campaignId: string) {
  try {
    // Get all emails for this campaign
    const campaignEmails = await tx.email.findMany({
      where: {
        campaignId: campaignId,
        status: 'SENT',
      },
      include: {
        emailAnalytics: true,
      },
    });

    if (campaignEmails.length === 0) return;

    // Calculate campaign-wide metrics
    let totalRecipients = 0;
    let totalUniqueOpens = 0;
    let totalUniqueClicks = 0;
    let totalEmails = campaignEmails.length;

    campaignEmails.forEach((email: any) => {
      totalRecipients += email.recipients || 0;
      totalUniqueOpens += email.emailAnalytics?.uniqueOpens || 0;
      totalUniqueClicks += email.emailAnalytics?.uniqueClicks || 0;
    });

    // Calculate rates (capped at 100%)
    const campaignOpenRate = totalRecipients > 0 
      ? Math.min((totalUniqueOpens / totalRecipients) * 100, 100)
      : 0;
    
    const campaignClickRate = totalRecipients > 0
      ? Math.min((totalUniqueClicks / totalRecipients) * 100, 100)
      : 0;

    // Update campaign with calculated rates
    await tx.campaign.update({
      where: { id: campaignId },
      data: {
        openRate: Math.round(campaignOpenRate * 100) / 100,
        clickRate: Math.round(campaignClickRate * 100) / 100,
        recipients: totalRecipients,
        emailsSent: totalEmails,
        lastSentAt: new Date(),
      },
    });

    console.log(`[CAMPAIGN_ANALYTICS_UPDATED] Campaign: ${campaignId}, OpenRate: ${campaignOpenRate}%, ClickRate: ${campaignClickRate}%`);

  } catch (error) {
    console.error('[CAMPAIGN_ANALYTICS_UPDATE_ERROR]', error);
  }
}