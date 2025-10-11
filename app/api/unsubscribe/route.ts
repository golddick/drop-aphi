// app/api/unsubscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { RecipientStatus } from '@prisma/client';
import { getServerAuth } from '@/lib/auth/getauth';
import { corsOptions, withCors } from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return corsOptions(request);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const ownerId = searchParams.get('ownerId');
    const campaignId = searchParams.get('campaignId');
    const reason = searchParams.get('reason');
    const source = searchParams.get('source') || 'email_link';

    // Validate required parameters
    if (!email || !ownerId) {
      return withCors(
        { 
          error: 'Missing required parameters: email and ownerId are required',
          code: 'MISSING_PARAMETERS'
        }, 
        request, 
        400
      );
    }

    // Decode email
    const decodedEmail = decodeURIComponent(email);

    // Verify the newsletter owner exists
    const newsletterOwner = await database.user.findUnique({
      where: { 
        userId: ownerId,
        subscriptionStatus: 'ACTIVE'
      },
      select: {
        userId: true,
        SenderName: true,
      },
    });

    if (!newsletterOwner) {
      return withCors(
        { 
          error: 'Newsletter owner not found or inactive',
          code: 'OWNER_NOT_FOUND'
        }, 
        request, 
        404
      );
    }

    // Process unsubscribe in transaction
    await database.$transaction(async (tx) => {
      // 1. Update subscriber status to UNSUBSCRIBED
      const subscriber = await tx.subscriber.updateMany({
        where: {
          email: decodedEmail,
          newsLetterOwnerId: ownerId,
          status: { in: ['SUBSCRIBED'] }
        },
        data: {
          status: 'UNSUBSCRIBED',
          unsubscribedAt: new Date(),
          unsubscribeReason: reason || 'User initiated',
          unsubscribeSource: source,
        },
      });

      // 2. Update all pending/sent email recipients for this email to UNSUBSCRIBED
      await tx.emailRecipient.updateMany({
        where: {
          recipientEmail: decodedEmail,
          email: {
            newsLetterOwnerId: ownerId
          },
          status: { in: ['PENDING', 'SENT', 'DELIVERED'] }
        },
        data: {
          status: RecipientStatus.UNSUBSCRIBED,
          unsubscribeAt: new Date(),
        },
      });

      // 3. Create unsubscribe record for analytics
      await tx.unsubscribeEvent.create({
        data: {
          email: decodedEmail,
          newsLetterOwnerId: ownerId,
          campaignId: campaignId || null,
          reason: reason || 'User initiated',
          source: source,
          userAgent: request.headers.get('user-agent') || undefined,
          ipAddress: request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown',
        },
      });

      // 4. Update email analytics for the owner
      const activeEmails = await tx.email.findMany({
        where: {
          newsLetterOwnerId: ownerId,
          status: 'SENT',
        },
        select: {
          id: true,
        },
      });

      // Increment unsubscribe count for each email's analytics
      for (const emailRecord of activeEmails) {
        await tx.emailAnalytics.upsert({
          where: { emailId: emailRecord.id },
          update: {
            unsubscribeCount: { increment: 1 },
          },
          create: {
            emailId: emailRecord.id,
            unsubscribeCount: 1,
            totalRecipients: 0,
            deliveredCount: 0,
            totalOpens: 0,
            uniqueOpens: 0,
            totalClicks: 0,
            uniqueClicks: 0,
            deliveryRate: 0,
            openRate: 0,
            clickRate: 0,
            bounceRate: 0,
            spamReportCount: 0,
            forwardCount: 0,
          },
        });
      }
    });

    console.log(`[UNSUBSCRIBE_SUCCESS] Email: ${decodedEmail}, Owner: ${ownerId}, Campaign: ${campaignId || 'N/A'}`);

    // Return success HTML page
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Unsubscribe Successful</title>
          <style>
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  margin: 0;
                  padding: 0;
                  min-height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
              }
              .container {
                  background: white;
                  border-radius: 12px;
                  padding: 40px;
                  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                  text-align: center;
                  max-width: 500px;
                  width: 90%;
              }
              .success-icon {
                  font-size: 64px;
                  color: #10B981;
                  margin-bottom: 20px;
              }
              h1 {
                  color: #1F2937;
                  margin-bottom: 16px;
                  font-size: 28px;
              }
              p {
                  color: #6B7280;
                  line-height: 1.6;
                  margin-bottom: 24px;
                  font-size: 16px;
              }
              .info-box {
                  background: #F3F4F6;
                  border-radius: 8px;
                  padding: 16px;
                  margin: 20px 0;
                  text-align: left;
              }
              .info-box p {
                  margin: 8px 0;
                  color: #4B5563;
                  font-size: 14px;
              }
              .button {
                  background: #3B82F6;
                  color: white;
                  border: none;
                  padding: 12px 24px;
                  border-radius: 6px;
                  font-size: 16px;
                  cursor: pointer;
                  text-decoration: none;
                  display: inline-block;
                  transition: background 0.2s;
              }
              .button:hover {
                  background: #2563EB;
              }
              .footer {
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 1px solid #E5E7EB;
                  color: #9CA3AF;
                  font-size: 14px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="success-icon">✓</div>
              <h1>You're Unsubscribed</h1>
              <p>You have been successfully unsubscribed from all future emails from <strong>${newsletterOwner.SenderName }</strong>.</p>
              
              <div class="info-box">
                  <p><strong>Email:</strong> ${decodedEmail}</p>
                  <p><strong>Newsletter:</strong> ${newsletterOwner.SenderName }</p>
                  ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
                  <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>

              <p style="font-size: 14px; color: #6B7280;">
                  You will no longer receive any marketing emails from this sender. 
                  This may take up to 24 hours to process fully.
              </p>

              <a href="/" class="button">Return to Website</a>
              
              <div class="footer">
                  <p>© ${new Date().getFullYear()} Drop-Aphi. All rights reserved.</p>
              </div>
          </div>

          <script>
              // Track unsubscribe completion
              setTimeout(() => {
                  if (typeof gtag !== 'undefined') {
                      gtag('event', 'unsubscribe', {
                          'event_category': 'email',
                          'event_label': '${decodedEmail}'
                      });
                  }
              }, 1000);
          </script>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('[UNSUBSCRIBE_ERROR]', error);

    // Error HTML page
    const errorHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Unsubscribe Error</title>
          <style>
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                  margin: 0;
                  padding: 0;
                  min-height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
              }
              .container {
                  background: white;
                  border-radius: 12px;
                  padding: 40px;
                  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                  text-align: center;
                  max-width: 500px;
                  width: 90%;
              }
              .error-icon {
                  font-size: 64px;
                  color: #EF4444;
                  margin-bottom: 20px;
              }
              h1 {
                  color: #1F2937;
                  margin-bottom: 16px;
              }
              p {
                  color: #6B7280;
                  line-height: 1.6;
                  margin-bottom: 24px;
              }
              .button {
                  background: #3B82F6;
                  color: white;
                  border: none;
                  padding: 12px 24px;
                  border-radius: 6px;
                  font-size: 16px;
                  cursor: pointer;
                  text-decoration: none;
                  display: inline-block;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="error-icon">⚠️</div>
              <h1>Unsubscribe Error</h1>
              <p>We encountered an error while processing your unsubscribe request. Please try again later or contact support.</p>
              <a href="/" class="button">Return to Website</a>
          </div>
      </body>
      </html>
    `;

    return new NextResponse(errorHtml, {
      status: 500,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerAuth();
    if (!user) {
      return withCors({ error: 'Unauthorized' }, request, 401);
    }

    const body = await request.json();
    const { email, reason, source = 'api' } = body;

    if (!email) {
      return withCors(
        { error: 'Email is required', code: 'EMAIL_REQUIRED' },
        request,
        400
      );
    }

    // Process unsubscribe for authenticated user (owner unsubscribing someone)
    await database.$transaction(async (tx) => {
      // Update subscriber status
      await tx.subscriber.updateMany({
        where: {
          email: email,
          newsLetterOwnerId: user.userId,
          status: { in: ['SUBSCRIBED'] }
        },
        data: {
          status: 'UNSUBSCRIBED',
          unsubscribedAt: new Date(),
          unsubscribeReason: reason || 'Owner initiated',
          unsubscribeSource: source,
        },
      });

      // Update email recipients
      await tx.emailRecipient.updateMany({
        where: {
          recipientEmail: email,
          email: {
            newsLetterOwnerId: user.userId
          },
          status: { in: ['PENDING', 'SENT', 'DELIVERED'] }
        },
        data: {
          status: RecipientStatus.UNSUBSCRIBED,
          unsubscribeAt: new Date(),
        },
      });

      // Create unsubscribe event
      await tx.unsubscribeEvent.create({
        data: {
          email: email,
          newsLetterOwnerId: user.userId,
          reason: reason || 'Owner initiated',
          source: source,
          userAgent: request.headers.get('user-agent') || undefined,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });
    });

    return withCors(
      { 
        success: true, 
        message: 'Subscriber unsubscribed successfully',
        email: email
      },
      request,
      200
    );

  } catch (error) {
    console.error('[UNSUBSCRIBE_API_ERROR]', error);
    return withCors(
      { error: 'Failed to unsubscribe subscriber', code: 'UNSUBSCRIBE_FAILED' },
      request,
      500
    );
  }
}