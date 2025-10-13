// // app/api/track/open/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { database } from '@/lib/database';
// import { RecipientStatus } from '@prisma/client';

// export async function GET(request: NextRequest) {
//   // Extract searchParams at the top level
//   const url = new URL(request.url);
//   const searchParams = url.searchParams;
  
//   const emailId = searchParams.get('emailId');
//   const email = searchParams.get('email');
//   const trackingId = searchParams.get('tid');

//   try {
//     // Validate required parameters
//     if (!emailId || !email) {
//       return new NextResponse(null, { status: 400 });
//     }

//     // Decode email
//     const decodedEmail = decodeURIComponent(email);
//     const userIp = request.headers.get('x-forwarded-for') || 
//                    request.headers.get('x-real-ip') || 
//                    'unknown';

//     // Record the open event using transaction
//     await database.$transaction(async (tx) => {
//       // Get current email data
//       const emailRecord = await tx.email.findUnique({
//         where: { id: emailId },
//         select: { 
//           openCount: true,
//           lastOpened: true,
//           openedByEmails: true,
//           openedByIps: true
//         },
//       });

//       if (!emailRecord) {
//         throw new Error('Email not found');
//       }

//       // Check if this is the first open from this email
//       const isFirstOpen = !emailRecord.openedByEmails.includes(decodedEmail);
//       const isFirstIpOpen = !emailRecord.openedByIps.includes(userIp);

//       // Update email open metrics
//       await tx.email.update({
//         where: { id: emailId },
//         data: {
//           openCount: (emailRecord.openCount || 0) + 1,
//           lastOpened: new Date(),
//           openedByEmails: {
//             set: Array.from(new Set([...emailRecord.openedByEmails, decodedEmail]))
//           },
//           openedByIps: {
//             set: Array.from(new Set([...emailRecord.openedByIps, userIp]))
//           },
//         },
//       });

//       // Update EmailRecipient status
//       await tx.emailRecipient.upsert({
//         where: {
//           emailId_recipientEmail: {
//             emailId,
//             recipientEmail: decodedEmail,
//           },
//         },
//         update: {
//           status: RecipientStatus.OPENED,
//           openedAt: new Date(),
//         },
//         create: {
//           emailId,
//           recipientEmail: decodedEmail,
//           status: RecipientStatus.OPENED,
//           openedAt: new Date(),
//         },
//       });

//       // Update email analytics
//       const analytics = await tx.emailAnalytics.findUnique({
//         where: { emailId },
//       });

//       if (analytics) {
//         await tx.emailAnalytics.update({
//           where: { emailId },
//           data: {
//             totalOpens: { increment: 1 },
//             uniqueOpens: isFirstOpen ? { increment: 1 } : analytics.uniqueOpens,
//             // Rates will be recalculated separately
//           },
//         });
//       } else {
//         // Get total recipients for rate calculation
//         const emailData = await tx.email.findUnique({
//           where: { id: emailId },
//           select: { recipients: true }
//         });

//         await tx.emailAnalytics.create({
//           data: {
//             emailId,
//             totalOpens: 1,
//             uniqueOpens: 1,
//             totalRecipients: emailData?.recipients || 0,
//             deliveredCount: emailData?.recipients || 0,
//             totalClicks: 0,
//             uniqueClicks: 0,
//             deliveryRate: 100, // Assuming all were delivered
//             openRate: emailData?.recipients ? (1 / emailData.recipients) * 100 : 0,
//             clickRate: 0,
//             bounceRate: 0,
//             unsubscribeCount: 0,
//             spamReportCount: 0,
//             forwardCount: 0,
//           },
//         });
//       }
//     });

//     // Recalculate rates after transaction
//     await database.$transaction(async (tx) => {
//       const emailWithData = await tx.email.findUnique({
//         where: { id: emailId },
//         select: {
//           recipients: true,
//           openCount: true,
//         },
//       });

//       const analytics = await tx.emailAnalytics.findUnique({
//         where: { emailId },
//       });

//       if (emailWithData && analytics && emailWithData.recipients > 0) {
//         const openRate = (analytics.uniqueOpens / emailWithData.recipients) * 100;
        
//         await tx.emailAnalytics.update({
//           where: { emailId },
//           data: {
//             openRate: Math.round(openRate * 100) / 100,
//           },
//         });
//       }
//     });

//     console.log(`[EMAIL_OPEN_TRACKED] Email: ${emailId}, Recipient: ${decodedEmail}, IP: ${userIp}`);

//     // Return a 1x1 transparent PNG
//     const buffer = Buffer.from(
//       'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
//       'base64'
//     );

//     return new NextResponse(buffer, {
//       status: 200,
//       headers: {
//         'Content-Type': 'image/png',
//         'Content-Length': buffer.length.toString(),
//         'Cache-Control': 'no-cache, no-store, must-revalidate',
//         'Pragma': 'no-cache',
//         'Expires': '0',
//       },
//     });
//   } catch (error) {
//     console.error('[EMAIL_OPEN_TRACKING_ERROR]', error);
    
//     // Still return the tracking pixel even on error
//     const buffer = Buffer.from(
//       'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
//       'base64'
//     );

//     return new NextResponse(buffer, {
//       status: 200,
//       headers: {
//         'Content-Type': 'image/png',
//         'Content-Length': buffer.length.toString(),
//         'Cache-Control': 'no-cache, no-store, must-revalidate',
//       },
//     });
//   }
// }









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

      // Check if this email has already been opened by this recipient
      const existingRecipient = await tx.emailRecipient.findUnique({
        where: {
          emailId_recipientEmail: {
            emailId,
            recipientEmail: decodedEmail,
          },
        },
        select: {
          status: true,
          openedAt: true,
        },
      });

      // If already opened, don't count again
      if (existingRecipient?.status === RecipientStatus.OPENED) {
        console.log(`[EMAIL_ALREADY_OPENED] Email: ${emailId}, Recipient: ${decodedEmail}`);
        return { alreadyOpened: true, emailRecord };
      }

      // Get current analytics to check unique opens
      const analytics = await tx.emailAnalytics.findUnique({
        where: { emailId },
      });

      const currentOpenedByEmails = emailRecord.openedByEmails || [];
      const currentOpenedByIps = emailRecord.openedByIps || [];
      
      const isFirstOpenForEmail = !currentOpenedByEmails.includes(decodedEmail);
      const isFirstOpenForIp = !currentOpenedByIps.includes(userIp);

      // Update email open metrics
      const updatedEmail = await tx.email.update({
        where: { id: emailId },
        data: {
          openCount: (emailRecord.openCount || 0) + 1,
          lastOpened: new Date(),
          openedByEmails: {
            set: isFirstOpenForEmail 
              ? Array.from(new Set([...currentOpenedByEmails, decodedEmail]))
              : currentOpenedByEmails
          },
          openedByIps: {
            set: isFirstOpenForIp
              ? Array.from(new Set([...currentOpenedByIps, userIp]))
              : currentOpenedByIps
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
      if (analytics) {
        await tx.emailAnalytics.update({
          where: { emailId },
          data: {
            totalOpens: { increment: 1 },
            uniqueOpens: isFirstOpenForEmail ? { increment: 1 } : undefined,
          },
        });
      } else {
        // Create new analytics record if it doesn't exist
        await tx.emailAnalytics.create({
          data: {
            emailId,
            totalOpens: 1,
            uniqueOpens: 1,
            totalRecipients: emailRecord.recipients || 0,
            deliveredCount: emailRecord.recipients || 0,
            totalClicks: 0,
            uniqueClicks: 0,
            deliveryRate: 100,
            openRate: emailRecord.recipients ? (1 / emailRecord.recipients) * 100 : 0,
            clickRate: 0,
            bounceRate: 0,
            unsubscribeCount: 0,
            spamReportCount: 0,
            forwardCount: 0,
          },
        });
      }

      return { alreadyOpened: false, emailRecord, updatedEmail };
    });

    // If already opened, just return the pixel without further processing
    if (result.alreadyOpened) {
      return createTrackingPixel();
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

      // Update email open rate
      if (emailWithData.recipients && analytics && emailWithData.recipients > 0) {
        const openRate = Math.min((analytics.uniqueOpens / emailWithData.recipients) * 100, 100);
        
        await tx.emailAnalytics.update({
          where: { emailId },
          data: {
            openRate: Math.round(openRate * 100) / 100,
          },
        });

        // Update campaign analytics if email belongs to a campaign
        if (emailWithData.campaign) {
          await updateCampaignAnalytics(tx, emailWithData.campaign.id);
        }
      }
    });

    console.log(`[EMAIL_OPEN_TRACKED] Email: ${emailId}, Recipient: ${decodedEmail}, IP: ${userIp}`);

    return createTrackingPixel();

  } catch (error) {
    console.error('[EMAIL_OPEN_TRACKING_ERROR]', error);
    
    // Still return the tracking pixel even on error
    return createTrackingPixel();
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

// Helper function to create tracking pixel
function createTrackingPixel() {
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
}