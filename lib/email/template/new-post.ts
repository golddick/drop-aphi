// lib/templates/newPostTemplate.ts
import { formatString } from "@/lib/utils";

interface NewPostTemplateParams {
  author: string;
  platform: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  url: string;
  HostPlatformUrl: string;
  HostPlatform: string;
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
  HostPlatformUrl,
  HostPlatform
}: NewPostTemplateParams) {
  return {
    title: `New Post: ${title}`,
    content: {
      subject: `New Post Alert: ${title} - ${platform}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background-color: #ffffff;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 24px;
              background: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
              text-align: center;
              color: #111;
            }
            .badge {
              display: inline-block;
              background: #000;
              color: #DC2626;
              padding: 6px 12px;
              border-radius: 16px;
              font-size: 12px;
              font-weight: 600;
              margin-bottom: 20px;
            }
            h1 {
              font-size: 20px;
              font-weight: bold;
              color: #000;
              margin: 12px 0 6px;
              line-height: 1.3;
            }
            h2 {
              font-size: 15px;
              color: #555;
              font-weight: 300;
              margin: 0 0 12px;
              line-height: 1.4;
            }
            p {
              font-size: 14px;
              color: #333;
              margin: 8px 0;
              line-height: 1.6;
            }
            .author {
              color: #777;
              font-size: 13px;
              margin: 0 0 16px;
            }
            .excerpt {
              background: #FBF8E9;
              border-left: 4px solid #DC2626;
              border-radius: 4px;
              padding: 12px;
              margin-bottom: 16px;
              display: inline-block;
              text-align: left;
              max-width: 90%;
            }
            .excerpt p {
              color: #333;
              font-size: 14px;
              line-height: 1.5;
              margin: 0;
            }
            .button {
              display: inline-block;
              background: #000;
              color: #DC2626;
              padding: 10px 22px;
              border-radius: 4px;
              text-decoration: none;
              font-weight: 600;
              font-size: 14px;
              text-align: center;
              margin-bottom: 20px;
            }
            .platform-link {
              margin: 20px 0;
              color: #555;
              font-size: 13px;
            }
            .platform-link a {
              color: #000;
              font-weight: 500;
              text-decoration: underline;
            }
            .footer {
              border-top: 1px solid #e5e5e5;
              padding-top: 12px;
              color: #999;
              font-size: 10px;
              line-height: 1.5;
            }
            .highlight {
              color: #DC2626;
              text-decoration: underline;
              font-weight: 600;
            }
            .underline {
              text-decoration: underline;
              color: #DC2626;
            }
            .featured-image {
              max-width: 100%;
              max-height: 200px;
              margin: 0 auto 16px;
              border-radius: 6px;
              object-fit: cover;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <p class="badge">New Blog Post Alert!</p>
            
            <p style="font-size: 14px; color: #333; margin: 0 0 12px; line-height: 1.5;">
              Hey there! A new blog post has just been published by <strong class="highlight">${platform}</strong>. 
              Here's a sneak peek of what's inside:
            </p>

            <h1>${title}</h1>

            ${subtitle ? `<h2>${subtitle}</h2>` : ''}

            <p class="author">
              Author <span style="color: #000; font-weight: 600;">${author}</span>
            </p>

            ${featuredImage ? `
              <div style="text-align: center; margin-bottom: 16px;">
                <img src="${featuredImage}" alt="${title}" class="featured-image" />
              </div>
            ` : ''}

            ${excerpt ? `
              <div class="excerpt">
                <p>${excerpt}</p>
              </div>
            ` : ''}

            <div>
              <a href="${url}" class="button">Read Full Post</a>
            </div>

            <div class="platform-link">
              <a href="${HostPlatformUrl}">Explore more on ${HostPlatform}</a>
            </div>

            <div class="footer">
              <p>You are receiving this email because you subscribed to updates from <span class="underline">${platform}</span>.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
New Blog Post Alert!

Hey there! A new blog post has just been published by ${platform}. Here's a sneak peek of what's inside:

Title: ${title}
${subtitle ? `Subtitle: ${subtitle}\n` : ''}
Author: ${author}
${excerpt ? `Excerpt: ${excerpt}\n` : ''}

Read the full post: ${url}

Explore more on ${HostPlatform}: ${HostPlatformUrl}

You are receiving this email because you subscribed to updates from ${platform}.
      `.trim()
    }
  };
}