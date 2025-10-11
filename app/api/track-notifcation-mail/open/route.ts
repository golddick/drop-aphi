// app/api/track-notification-mail/open/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('notificationId');
    const email = searchParams.get('email');
    const trackingId = searchParams.get('tid');

    // Validate required parameters 
    if (!notificationId || !email) {
      return new NextResponse(null, { status: 400 });
    }

    // Decode email
    const decodedEmail = decodeURIComponent(email);

    // Record the open event using transaction
    await database.$transaction(async (tx) => {
      // Get current notification data
      const notification = await tx.emailNotification.findUnique({
        where: { id: notificationId },
        select: { 
          openCount: true,
          openedByEmails: true,
          lastOpened: true 
        },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      // Update notification open metrics
      await tx.emailNotification.update({
        where: { id: notificationId },
        data: {
          openCount: (notification.openCount || 0) + 1,
          openedByEmails: {
            set: Array.from(new Set([...notification.openedByEmails, decodedEmail]))
          },
          lastOpened: new Date(),
        },
      });
    });

    console.log(`[OPEN_TRACKED] Notification: ${notificationId}, Email: ${decodedEmail}`);

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
    console.error('[OPEN_TRACKING_ERROR]', error);
    
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