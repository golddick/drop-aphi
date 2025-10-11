// app/api/track-notification-mail/click/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';

export async function GET(request: NextRequest) {
  // Extract searchParams at the top level so it's accessible in catch block
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  
  const notificationId = searchParams.get('notificationId');
  const email = searchParams.get('email');
  const urlParam = searchParams.get('url'); // Renamed to avoid conflict
  const trackingId = searchParams.get('tid');

  try {
    // Validate required parameters
    if (!notificationId || !email || !urlParam) {
      return new NextResponse('Missing parameters', { status: 400 });
    }

    // Decode parameters
    const decodedEmail = decodeURIComponent(email);
    const decodedUrl = decodeURIComponent(urlParam);

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
      console.error('[CLICK_TRACKING_INVALID_URL]', { decodedUrl, error });
      return new NextResponse('Invalid URL', { status: 400 });
    }

    // Record the click event using transaction
    await database.$transaction(async (tx) => {
      // Get current notification data
      const notification = await tx.emailNotification.findUnique({
        where: { id: notificationId },
        select: { 
          clickCount: true,
          clickedByEmails: true,
          lastClicked: true 
        },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      // Update notification click metrics
      await tx.emailNotification.update({
        where: { id: notificationId },
        data: {
          clickCount: (notification.clickCount || 0) + 1,
          clickedByEmails: {
            set: Array.from(new Set([...notification.clickedByEmails, decodedEmail]))
          },
          lastClicked: new Date(),
        },
      });

      // Create click link record
      await tx.notificationEmailClickedLink.create({
        data: {
          notificationEmailId: notificationId,
          url: redirectUrl,
          clickedBy: decodedEmail,
          clickedAt: new Date(),
        },
      });
    });

    console.log(`[CLICK_TRACKED] Notification: ${notificationId}, Email: ${decodedEmail}, URL: ${redirectUrl}`);

    // Redirect to the original URL
    return NextResponse.redirect(redirectUrl, 302);
  } catch (error) {
    console.error('[CLICK_TRACKING_ERROR]', error);
    
    // If we have a URL, still redirect even on tracking error
    if (urlParam) {
      try {
        const decodedUrl = decodeURIComponent(urlParam);
        const parsedUrl = new URL(decodedUrl);
        
        if (['http:', 'https:'].includes(parsedUrl.protocol)) {
          return NextResponse.redirect(decodedUrl, 302);
        }
      } catch (redirectError) {
        console.error('[CLICK_REDIRECT_FALLBACK_ERROR]', redirectError);
      }
    }

    return new NextResponse('Tracking error', { status: 500 });
  }
}