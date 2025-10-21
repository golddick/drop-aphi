// app/api/track-platform-mail/click/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const url = searchParams.get('url');
    const tid = searchParams.get('tid');

    if (!email || !url) {
      return new NextResponse('Email and URL required', { status: 400 });
    }

    // Decode the original URL
    const originalUrl = decodeURIComponent(url);

    // Log the click event
    await database.platformEmailEvent.create({
      data: {
        email,
        eventType: 'CLICK',
        trackingId: tid || 'unknown',
        metadata: {
          originalUrl,
          decodedUrl: originalUrl,
        },
        userAgent: request.headers.get('user-agent') || 'unknown',
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        timestamp: new Date(),
      },
    });

    // Redirect to the original URL
    return NextResponse.redirect(originalUrl);
  } catch (error) {
    console.error('[PLATFORM_CLICK_TRACKING_ERROR]', error);
    
    // If redirect fails, show an error page or redirect to platform home
    return NextResponse.redirect(
      process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://drop-aphi.vercel.app'
    );
  }
}