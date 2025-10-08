// lib/templates/welcomeTemplate.ts
interface WelcomeTemplateParams {
  name?: string;
  email: string;
  platformName: string;
  platformUrl?: string | null;
}

export const getWelcomeTemplate = ({ name, email, platformName, platformUrl }: WelcomeTemplateParams) => {
   const safePlatformUrl = platformUrl || undefined;
  // Conditionally render the Explore button
  const exploreButton = safePlatformUrl 
    ? `<a href="${safePlatformUrl}" class="button">Explore</a>`
    : '';

  return {
    title: `Welcome to ${platformName}!`,
    content: {
      subject: `Welcome${name ? ` ${name}` : ''} to ${platformName}!`,
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
            }
            p {
              font-size: 14px;
              color: #333;
              margin: 8px 0;
              line-height: 1.6;
            }
            .button {
              display: inline-block;
              background: #000;
              color: #DC2626;
              padding: 10px 22px;
              border-radius: 4px;
              font-weight: 600;
              font-size: 14px;
              margin-top: 20px;
              text-decoration: none;
            }
            .footer {
              border-top: 1px solid #e5e5e5;
              padding-top: 12px;
              color: #999;
              font-size: 10px;
              margin-top: 20px;
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
          </style>
        </head>
        <body>
          <div class="container">
            <p class="badge">Welcome Aboard!</p>
            <h1>Welcome${name ? ` ${name}` : ''} to <span class="underline">${platformName}</span>!</h1>
            <p>Thank you for subscribing to our newsletter with <strong class="highlight">${email}</strong>.</p>
            <p>We're thrilled to have you join the <span class="underline">${platformName}</span> community and can't wait to share the latest news and updates with you.</p>
            ${exploreButton}
            <div class="footer">
              <p>You are receiving this email because you subscribed to <span class="underline">${platformName}</span>.</p>
              <p>Best regards,<br/> <span class="highlight">${platformName} Team</span></p>
            </div>
          </div> 
        </body>
        </html>
      `,
      text: `Welcome${name ? ` ${name}` : ''} to ${platformName}!\n\nThank you for subscribing with ${email}.\n\nWe're thrilled to have you join the ${platformName} community and can't wait to share the latest updates with you.${platformUrl ? `\n\nExplore our platform: ${platformUrl}` : ''}`,
    }
  };
};