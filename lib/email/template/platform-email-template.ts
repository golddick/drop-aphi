export function formatEmailContent(content: string, options?: {
  title?: string
  showLogo?: boolean
  logoUrl?: string
  platformName?: string
}): string {
  const {
    title = "Important Message from Drop-Aphi Administration",
    showLogo = true,
    logoUrl = "https://deg9tan1ik.ufs.sh/f/1WGKJuv35CFknEJDItdIbBj2kfEa4NDxc9vt57KhpiuGQ8ZL", // Replace with your actual logo URL
    platformName = "Drop-aphi"
  } = options || {}

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #000000;
          margin: 0;
          padding: 0;
          background-color: #f8f9fa;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid #e5e7eb;
        }
        .header {
          background: #ffffff;
          padding: 32px 40px 24px;
          text-align: left;
          border-bottom: 1px solid #f3f4f6;
        }
        .logo-container {
          display: ${showLogo ? 'flex' : 'none'};
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .logo {
          height: 40px;
          width: auto;
        }
        .platform-name {
          font-size: 24px;
          font-weight: 700;
          color: #000000;
          margin: 0;
        }
        .title {
          font-size: 20px;
          font-weight: 600;
          color: #000000;
          margin: 8px 0 0;
        }
        .content {
          padding: 40px;
          line-height: 1.7;
        }
        .message {
          background: #f8f9fa;
          padding: 24px;
          border-radius: 8px;
          border-left: 4px solid #dc2626;
          margin: 0 0 24px;
        }
        .message-content {
          color: #000000;
          font-size: 15px;
          line-height: 1.6;
        }
        .footer {
          text-align: center;
          padding: 32px 40px;
          color: #6b7280;
          font-size: 14px;
          background: #f9fafb;
          border-top: 1px solid #f3f4f6;
        }
        .unsubscribe {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
        .unsubscribe-link {
          color: #6b7280;
          text-decoration: none;
          font-size: 13px;
        }
        .unsubscribe-link:hover {
          color: #374151;
          text-decoration: underline;
        }
        .support {
          margin-top: 16px;
          font-size: 13px;
        }
        .support-link {
          color: #dc2626;
          text-decoration: none;
        }
        .copyright {
          margin-top: 16px;
          font-size: 12px;
          color: #9ca3af;
        }
        @media (max-width: 600px) {
          .container {
            margin: 0;
            border-radius: 0;
            border: none;
          }
          .header {
            padding: 24px 20px 20px;
          }
          .content {
            padding: 24px 20px;
          }
          .footer {
            padding: 24px 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-container">
            <img src="${logoUrl}" alt="${platformName}" class="logo" />
          </div>
          <h2 class="title">${title}</h2>
        </div>
        
        <div class="content">
          <div class="message">
            <div class="message-content">
              ${content.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <p style="color: #000000; margin: 0; font-size: 14px;">
            If you have any questions, please don't hesitate to contact our support team.
          </p>
        </div>
        
        <div class="footer">
          <p style="margin: 0 0 8px; color: #6b7280;">
            This is an important message from the ${platformName} administration team.
          </p>
          <p style="margin: 0; color: #6b7280;">
            Please do not reply to this email.
          </p>
          
          <div class="unsubscribe">
            <a href="[UNSUBSCRIBE_URL]" class="unsubscribe-link">
              Unsubscribe from these notifications
            </a>
          </div>
          
          <div class="support">
            <a href="mailto:support@drop-aphi.com" class="support-link">
              Contact Support
            </a>
          </div>
          
          <div class="copyright">
            © 2025 ${platformName}. All rights reserved.
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

export function getPlatformWelcomeTemplate({ 
  name,
  platformName = "Drop-aphi",
  platformUrl = "https://drop-aphi.vercel.app",
  logoUrl = "https://deg9tan1ik.ufs.sh/f/1WGKJuv35CFknEJDItdIbBj2kfEa4NDxc9vt57KhpiuGQ8ZL"
}: {
  name?: string
  platformName?: string
  platformUrl?: string
  logoUrl?: string
}) {
  const greeting = name ? `Hello ${name},` : "Hello,"
  const userName = name || 'there'
  
  return {
    title: `Welcome to ${platformName} - Platform Updates`,
    content: {
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to ${platformName}</title>
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                    line-height: 1.6; 
                    color: #000000; 
                    margin: 0;
                    padding: 0;
                    background-color: #f8f9fa;
                }
                .container { 
                    max-width: 600px; 
                    margin: 0 auto; 
                    background: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                    border: 1px solid #e5e7eb;
                }
                .header { 
                    background: #ffffff; 
                    padding: 32px 40px 24px;
                    text-align: left;
                    border-bottom: 1px solid #f3f4f6;
                }
                .logo-container {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 16px;
                }
                .logo {
                    height: 40px;
                    width: auto;
                }
                .platform-name {
                    font-size: 24px;
                    font-weight: 700;
                    color: #000000;
                    margin: 0;
                }
                .welcome-title {
                    font-size: 28px;
                    font-weight: 700;
                    color: #000000;
                    margin: 0 0 8px;
                }
                .welcome-subtitle {
                    font-size: 16px;
                    color: #6b7280;
                    margin: 0;
                }
                .content { 
                    padding: 40px; 
                    line-height: 1.7;
                    color: #000000;
                }
                .feature { 
                    background: #f8f9fa; 
                    padding: 20px; 
                    margin: 16px 0; 
                    border-radius: 8px; 
                    border-left: 4px solid #dc2626;
                }
                .footer { 
                    text-align: center; 
                    padding: 32px 40px; 
                    color: #6b7280; 
                    font-size: 14px; 
                    background: #f9fafb;
                    border-top: 1px solid #f3f4f6;
                }
                .button { 
                    background: #dc2626; 
                    color: #ffffff; 
                    padding: 14px 32px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    display: inline-block; 
                    margin: 24px 0; 
                    font-weight: 600;
                    font-size: 16px;
                    border: none;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .button:hover {
                    background: #b91c1c;
                }
                .greeting {
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 20px;
                    color: #000000;
                }
                .unsubscribe {
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                }
                .unsubscribe-link {
                    color: #6b7280;
                    text-decoration: none;
                    font-size: 13px;
                }
                .unsubscribe-link:hover {
                    color: #374151;
                    text-decoration: underline;
                }
                .copyright {
                    margin-top: 16px;
                    font-size: 12px;
                    color: #9ca3af;
                }
                @media (max-width: 600px) {
                    .container {
                        margin: 0;
                        border-radius: 0;
                        border: none;
                    }
                    .header {
                        padding: 24px 20px 20px;
                    }
                    .content {
                        padding: 24px 20px;
                    }
                    .footer {
                        padding: 24px 20px;
                    }
                    .welcome-title {
                        font-size: 24px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo-container">
                        <img src="${logoUrl}" alt="${platformName}" class="logo" />
                    </div>
                    <h2 class="welcome-title">🚀 Welcome to ${platformName}</h2>
                    <p class="welcome-subtitle">Your journey to better email infrastructure starts here</p>
                </div>
                <div class="content">
                    <div class="greeting">${greeting}</div>
                    
                    <p>Thank you for subscribing to ${platformName} platform updates! We're excited to have you on board as we build the future of email infrastructure.</p>
                    
                    <h3 style="color: #000000; margin-top: 30px; margin-bottom: 16px;">Here's what you can expect:</h3>
                    
                    <div class="feature">
                        <strong style="color: #000000; display: block; margin-bottom: 8px;">📈 Platform Updates & New Features</strong>
                        <p style="margin: 0; color: #000000;">Be the first to know about new API features, performance improvements, and platform enhancements.</p>
                    </div>
                    
                    <div class="feature">
                        <strong style="color: #000000; display: block; margin-bottom: 8px;">💡 Developer Tips & Best Practices</strong>
                        <p style="margin: 0; color: #000000;">Learn how to optimize your email delivery and implement best practices with code examples.</p>
                    </div>
                    
                    <div class="feature">
                        <strong style="color: #000000; display: block; margin-bottom: 8px;">🔧 Technical Guides & Documentation</strong>
                        <p style="margin: 0; color: #000000;">Get access to updated documentation, integration guides, and technical deep dives.</p>
                    </div>
                    
                    <p style="margin-top: 24px;">We're committed to helping you build amazing email experiences for your users with reliable, scalable infrastructure.</p>
                    
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${platformUrl}" class="button">Explore ${platformName}</a>
                    </div>
                    
                    <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
                    
                    <p style="margin-top: 32px;">
                        Best regards,<br>
                        <strong style="color: #000000;">The ${platformName} Team</strong>
                    </p>
                </div>
                <div class="footer">
                    <p style="margin: 0 0 8px; color: #6b7280;">
                        © 2025 ${platformName}. All rights reserved.
                    </p>
                    <p style="margin: 0; color: #6b7280;">
                        <a href="${platformUrl}" style="color: #6b7280; text-decoration: underline;">${platformUrl}</a>
                    </p>
                    
                    <div class="unsubscribe">
                        <a href="[UNSUBSCRIBE_URL]" class="unsubscribe-link">
                            Unsubscribe from these updates
                        </a>
                    </div>
                    
                    <div class="copyright">
                        You're receiving this email because you subscribed to platform updates.
                    </div>
                </div>
            </div>
        </body>
        </html>
      `,
      text: `
Welcome to ${platformName} - Platform Updates

${greeting}

Thank you for subscribing to ${platformName} platform updates! We're excited to have you on board as we build the future of email infrastructure.

Here's what you can expect:

📈 Platform Updates & New Features
Be the first to know about new API features, performance improvements, and platform enhancements.

💡 Developer Tips & Best Practices
Learn how to optimize your email delivery and implement best practices with code examples.

🔧 Technical Guides & Documentation
Get access to updated documentation, integration guides, and technical deep dives.

We're committed to helping you build amazing email experiences for your users with reliable, scalable infrastructure.

Explore ${platformName}: ${platformUrl}

If you have any questions or need help getting started, don't hesitate to reach out to our support team.

Best regards,
The ${platformName} Team

---
© 2025 ${platformName}. All rights reserved.
${platformUrl}

You're receiving this email because you subscribed to platform updates.
Unsubscribe: [UNSUBSCRIBE_URL]
      `
    }
  }
}