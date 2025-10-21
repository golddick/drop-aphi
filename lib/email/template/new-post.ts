// lib/templates/newPostTemplate.ts

interface NewPostTemplateParams {
  author: string;
  platform: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  url: string;
  platformUrl: string;
  platformName: string;
  featuredImage?: string | null;
}

export function newPostNotificationTemplate({
  author,
  title,
  subtitle,
  excerpt,
  url,
  featuredImage,
  platform,
  platformUrl,
  platformName
}: NewPostTemplateParams) {
  const subject = `New Post: ${title}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #000; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; color: #DC2626;">New Blog Post Alert!</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-bottom: 10px;">Hey there!</h2>
        <p style="color: #666; line-height: 1.6;">
          A new blog post has just been published by <strong>${platform}</strong>. 
          Here's a sneak peek of what's inside:
        </p>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DC2626;">
          <h3 style="color: #000; margin: 0 0 8px 0; font-size: 18px;">${title}</h3>
          ${subtitle ? `<p style="color: #666; margin: 0 0 12px 0; font-style: italic;">${subtitle}</p>` : ''}
          <p style="color: #888; margin: 0 0 8px 0; font-size: 14px;">
            By <strong>${author}</strong>
          </p>
          ${excerpt ? `<p style="color: #333; margin: 12px 0 0 0; line-height: 1.5;">${excerpt}</p>` : ''}
        </div>

        ${featuredImage ? `
          <div style="text-align: center; margin: 20px 0;">
            <img src="${featuredImage}" alt="${title}" style="max-width: 100%; max-height: 200px; border-radius: 6px;" />
          </div>
        ` : ''}

        <div style="text-align: center; margin: 25px 0;">
          <a href="${url}" style="background: #000; color: #DC2626; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Read Full Post
          </a>
        </div>

        <div style="text-align: center; margin-top: 20px;">
          <a href="${platformUrl}" style="color: #000; text-decoration: underline;">
            Explore more on ${platformName}
          </a>
        </div>
      </div>
      <div style="padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e5e5e5;">
        <p>You are receiving this email because you subscribed to updates from <strong>${platform}</strong>.</p>
      </div>
    </div>
  `;

  const text = `
New Blog Post Alert!

Hey there! A new blog post has just been published by ${platform}. Here's a sneak peek of what's inside:

Title: ${title}
${subtitle ? `Subtitle: ${subtitle}\n` : ''}
Author: ${author}
${excerpt ? `Excerpt: ${excerpt}\n` : ''}

Read the full post: ${url}

Explore more on ${platformName}: ${platformUrl}

You are receiving this email because you subscribed to updates from ${platform}.
  `.trim();

  return {
    title: subject,
    content: { html, text }
  };
}