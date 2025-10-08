


'use server';

import { database } from "@/lib/database";
import { sendNotificationEmail } from "@/lib/email/notificationEmail.sender";
import { newPostNotificationTemplate } from "@/lib/email/template/new-post";
import { NotificationCategory, NotificationPriority, NotificationStatus, NotificationType } from "@/lib/generated/prisma";



interface NotifyParams {
  post: {
    id: string;
    slug: string;
    title: string;
    subtitle?: string | null;
    excerpt?: string | null;
    featuredImage?: string | null;
    author: string;
    authorId: string;
  };
  adminEmail: string;
  fromApplication: string;
  platformPostUrl: string;
}

export async function notifySubscribersAboutNewPost({
  post,
  adminEmail,
  fromApplication,
  platformPostUrl
}: NotifyParams) {
  try {
    // 1. Fetch subscribers
    const subscribers = await database.subscriber.findMany({
      where: { newsLetterOwnerId: post.authorId },
      select: { email: true },
    });

    if (!subscribers.length) {
      return { success: true, message: 'No subscribers found.' };
    }

    const userEmails = subscribers.map((s) => s.email);

    // 2. Get or create one template notification for NEW_BLOG
    let notificationTemplate = await database.emailNotification.findFirst({
      where: {
        userId: post.authorId,
        category: NotificationCategory.NEW_BLOG,
        type: NotificationType.EMAIL,
      },
    });

    if (!notificationTemplate) {
      const defaultHtml = newPostNotificationTemplate({
        author: '[Author]',
        title: '[Title]',
        subtitle: '[Subtitle]',
        excerpt: '[Excerpt]',
        featuredImage: '[FeaturedImage]',
        url: '[Url]',
        platform: '[Platform]',
        HostPlatformUrl: '[HostPlatformUrl]',
        HostPlatform: '[HostPlatform]',
      });

      notificationTemplate = await database.emailNotification.create({
        data: {
          userId: post.authorId,
          type: NotificationType.EMAIL,
          category: NotificationCategory.NEW_BLOG,
          priority: NotificationPriority.LOW,
          htmlContent: defaultHtml.content.html,
          title: 'New Blog Post: [Title]',
          content: {
            subject: defaultHtml.title,
            html: defaultHtml.content.html,
            text: 'A new blog post is live: [Title] by [Author]',
          },
          textContent: 'A new blog post is live: [Title] by [Author]',
          status: NotificationStatus.DRAFT,
        },
      });
    }

    // 3. Use the template to create personalized content (but do NOT overwrite template content in DB)
    const templateContent = {
      subject: notificationTemplate.title,
      html: notificationTemplate.htmlContent,
      text: notificationTemplate.textContent,
    };

    const personalizedContent = {
      ...templateContent,
      html: (templateContent.html || '')
        .replace(/\[Author\]/g, post.author)
        .replace(/\[Title\]/g, post.title)
        .replace(/\[Subtitle\]/g, post.subtitle || '')
        .replace(/\[Excerpt\]/g, post.excerpt || '')
        .replace(/\[FeaturedImage\]/g, post.featuredImage || '')
        .replace(/\[Url\]/g,    ` ${platformPostUrl}/blog${post.slug}`   || `${process.env.NEXT_PUBLIC_WEBSITE_URL}/blog/${post.slug}`)
        .replace(/\[Platform\]/g, fromApplication)
        .replace(/\[HostPlatformUrl\]/g,  ` ${platformPostUrl}/blog`   ||`${process.env.NEXT_PUBLIC_WEBSITE_URL}/blog`)
        .replace(/\[HostPlatform\]/g,  `${fromApplication}` || `${process.env.NEXT_PUBLIC_PLATFORM || 'Drop-Aphi'}`),
      text: (templateContent.text || '')
        .replace(/\[Author\]/g, post.author)
        .replace(/\[Title\]/g, post.title),
      subject: (templateContent.subject || `New Blog Post: ${post.title}`).replace(/\[Title\]/g, post.title),
    };

    // 4. Update template metadata (increment recipients, update last sent info, but don't overwrite content)
    await database.emailNotification.update({
      where: { id: notificationTemplate.id },
      data: {
        metadata: {
          lastSentPostId: post.id,
          lastSentPostTitle: post.title,
          totalRecipients: userEmails.length,
        },
      },
    });

    // 5. Send bulk email using the personalized content (but template in DB stays generic)
    const result = await sendNotificationEmail({
      userEmail: userEmails,
      subject: personalizedContent.subject,
      content: personalizedContent.html,
      emailId: notificationTemplate.id,
      newsLetterOwnerId: post.authorId,
      contentJson: JSON.stringify(personalizedContent),
      adminEmail,
      fromApplication,
      trackOpens: true,
      trackClicks: true,
      enableUnsubscribe: true,
      isBulk: true,
    });

    // 6. Update status
    await database.emailNotification.update({
      where: { id: notificationTemplate.id }, 
      data: {
        status: result.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
        sentAt: new Date(),
      },
    });

    return result;
  } catch (error) {
    console.error('[NOTIFY_SUBSCRIBERS_ERROR]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to notify subscribers',
    };
  }
}








