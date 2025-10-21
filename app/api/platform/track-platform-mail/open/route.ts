// app/api/track-platform-mail/open/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const tid = searchParams.get('tid');

    if (!email) {
      return new NextResponse('Email required', { status: 400 });
    }

    // Log the open event
    await database.platformEmailEvent.create({
      data: {
        email,
        eventType: 'OPEN',
        trackingId: tid || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        timestamp: new Date(),
      },
    });

    // Return a 1x1 transparent GIF
    const buffer = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/gif',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('[PLATFORM_OPEN_TRACKING_ERROR]', error);
    
    // Still return the GIF even on error to prevent broken images
    const buffer = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/gif',
        'Content-Length': buffer.length.toString(),
      },
    });
  }
}