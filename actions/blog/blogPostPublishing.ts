// lib/blogPostPublishing.ts
'use server';

import { checkUsageLimit, incrementUsage } from '@/lib/checkAndUpdateUsage';
import { notifySubscribersAboutNewPost } from './notify';
import { database } from '@/lib/database';

// Checks limits before publish
export async function ensurePublishingAllowed(userId: string) {
  const usageCheck = await checkUsageLimit(userId, 'blogPostsCreated');
  if (!usageCheck.success) {
    return {
      success: false,
      error: usageCheck.message ?? "You've reached your monthly blog post limit"
    };
  }
  return { success: true };
}

// Handles post-publish actions
export async function handlePostPublishActions(post: any, userId: string, adminEmail:string) {
  await incrementUsage(userId, 'blogPostsCreated', 1);


  const platformName = post.membership?.SenderName || post.membership?.userName || 'Drop-Aphi';
  const platformPostUrl = `${post.membership.website || 'https://dropaphi.com'}}`;

  
  await notifySubscribersAboutNewPost({
    post,
    adminEmail:adminEmail,
    fromApplication: platformName,
    platformPostUrl:platformPostUrl,
  });
}
