// app/api/platform/unsubscribe/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_WEBSITE_URL}/unsubscribe-error?message=Email required`
      );
    }

    // Find the platform subscriber
    const subscriber = await database.platformSubscriber.findUnique({
      where: { email },
    });

    if (!subscriber) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_WEBSITE_URL}/unsubscribe-error?message=Subscriber not found`
      );
    }

    if (subscriber.status === 'UNSUBSCRIBED') {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_WEBSITE_URL}/unsubscribe-already`
      );
    }

    // Update subscriber status to unsubscribed
    await database.platformSubscriber.update({
      where: { email },
      data: {
        status: 'UNSUBSCRIBED',
        unsubscribedAt: new Date(),
        unsubscribeSource: 'platform_link',
      },
    });

    // Log the unsubscribe event
    await database.platformEmailEvent.create({
      data: {
        email,
        eventType: 'UNSUBSCRIBE',
        trackingId: 'unsubscribe_link',
        userAgent: request.headers.get('user-agent') || 'unknown',
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        timestamp: new Date(),
      },
    });

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_WEBSITE_URL}/unsubscribe-success?email=${encodeURIComponent(email)}`
    );
  } catch (error) {
    console.error('[PLATFORM_UNSUBSCRIBE_ERROR]', error);
    
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_WEBSITE_URL}/unsubscribe-error?message=An error occurred`
    );
  }
}

// Handle POST requests for form submissions
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find and update the subscriber
    const subscriber = await database.platformSubscriber.findUnique({
      where: { email },
    });

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    if (subscriber.status === 'UNSUBSCRIBED') {
      return NextResponse.json(
        { message: 'Already unsubscribed' },
        { status: 200 }
      );
    }

    // Update subscriber status
    await database.platformSubscriber.update({
      where: { email },
      data: {
        status: 'UNSUBSCRIBED',
        unsubscribedAt: new Date(),
        unsubscribeSource: 'platform_form',
      },
    });

    // Log the unsubscribe event
    await database.platformEmailEvent.create({
      data: {
        email,
        eventType: 'UNSUBSCRIBE',
        trackingId: 'unsubscribe_form',
        userAgent: request.headers.get('user-agent') || 'unknown',
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from platform updates',
      email,
    });
  } catch (error) {
    console.error('[PLATFORM_UNSUBSCRIBE_POST_ERROR]', error);
    
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}