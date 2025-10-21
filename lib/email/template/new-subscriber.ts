// // lib/templates/welcomeTemplate.ts
// interface WelcomeTemplateParams {
//   name?: string;
//   email: string;
//   platformName: string;
//   platformUrl?: string | null;
// }

// export const getWelcomeTemplate = ({ name, email, platformName, platformUrl }: WelcomeTemplateParams) => {
//    const safePlatformUrl = platformUrl || undefined;
//   // Conditionally render the Explore button
//   const exploreButton = safePlatformUrl 
//     ? `<a href="${safePlatformUrl}" class="button">Explore</a>`
//     : '';

//   return {
//     title: `Welcome to ${platformName}!`,
//     content: {
//       subject: `Welcome${name ? ` ${name}` : ''} to ${platformName}!`,
//       html: `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <style>
//             body {
//               font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
//               background-color: #ffffff;
//               margin: 0;
//               padding: 0;
//             }
//             .container {
//               max-width: 600px;
//               margin: 0 auto;
//               padding: 24px;
//               background: #ffffff;
//               border-radius: 8px;
//               box-shadow: 0 2px 10px rgba(0,0,0,0.05);
//               text-align: center;
//               color: #111;
//             }
//             .badge {
//               display: inline-block;
//               background: #000;
//               color: #DC2626;
//               padding: 6px 12px;
//               border-radius: 16px;
//               font-size: 12px;
//               font-weight: 600;
//               margin-bottom: 20px;
//             }
//             h1 {
//               font-size: 20px;
//               font-weight: bold;
//               color: #000;
//               margin: 12px 0 6px;
//             }
//             p {
//               font-size: 14px;
//               color: #333;
//               margin: 8px 0;
//               line-height: 1.6;
//             }
//             .button {
//               display: inline-block;
//               background: #000;
//               color: #DC2626;
//               padding: 10px 22px;
//               border-radius: 4px;
//               font-weight: 600;
//               font-size: 14px;
//               margin-top: 20px;
//               text-decoration: none;
//             }
//             .footer {
//               border-top: 1px solid #e5e5e5;
//               padding-top: 12px;
//               color: #999;
//               font-size: 10px;
//               margin-top: 20px;
//               line-height: 1.5;
//             }
//             .highlight {
//               color: #DC2626;
//               text-decoration: underline;
//               font-weight: 600;
//             }
//             .underline {
//               text-decoration: underline;
//               color: #DC2626;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="container">
//             <p class="badge">Welcome Aboard!</p>
//             <h1>Welcome${name ? ` ${name}` : ''} to <span class="underline">${platformName}</span>!</h1>
//             <p>Thank you for subscribing to our newsletter with <strong class="highlight">${email}</strong>.</p>
//             <p>We're thrilled to have you join the <span class="underline">${platformName}</span> community and can't wait to share the latest news and updates with you.</p>
//             ${exploreButton}
//             <div class="footer">
//               <p>You are receiving this email because you subscribed to <span class="underline">${platformName}</span>.</p>
//               <p>Best regards,<br/> <span class="highlight">${platformName} Team</span></p>
//             </div>
//           </div> 
//         </body>
//         </html>
//       `,
//       text: `Welcome${name ? ` ${name}` : ''} to ${platformName}!\n\nThank you for subscribing with ${email}.\n\nWe're thrilled to have you join the ${platformName} community and can't wait to share the latest updates with you.${platformUrl ? `\n\nExplore our platform: ${platformUrl}` : ''}`,
//     }
//   };
// }; 


// lib/templates/welcomeTemplate.ts

interface WelcomeTemplateParams {
  name?: string;
  email: string;
  platformName: string;
  platformUrl: string;
}

export function getWelcomeTemplate({ name, email, platformName, platformUrl }: WelcomeTemplateParams) {
  const subject = `Welcome to ${platformName}!`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #000; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; color: #DC2626;">Welcome Aboard!</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-bottom: 10px;">
          Welcome${name ? ` ${name}` : ''} to <strong>${platformName}</strong>!
        </h2>
        <p style="color: #666; line-height: 1.6;">
          Thank you for subscribing to our newsletter with <strong>${email}</strong>.
        </p>
        <p style="color: #666; line-height: 1.6;">
          We're thrilled to have you join the ${platformName} community and can't wait to share 
          the latest news and updates with you.
        </p>

        <div style="text-align: center; margin: 25px 0;">
          <a href="${platformUrl}" style="background: #000; color: #DC2626; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Explore ${platformName}
          </a>
        </div>

        <p style="color: #666; line-height: 1.6;">
          Get ready for exclusive content, updates, and insights delivered straight to your inbox.
        </p>
      </div>
      <div style="padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e5e5e5;">
        <p>You are receiving this email because you subscribed to <strong>${platformName}</strong>.</p>
        <p>Best regards,<br/><strong>The ${platformName} Team</strong></p>
      </div>
    </div>
  `;

  const text = `
Welcome to ${platformName}!

Welcome${name ? ` ${name}` : ''} to ${platformName}!

Thank you for subscribing with ${email}.

We're thrilled to have you join the ${platformName} community and can't wait to share the latest updates with you.

Explore our platform: ${platformUrl}

Get ready for exclusive content, updates, and insights delivered straight to your inbox.

Best regards,
The ${platformName} Team
  `.trim();

  return {
    title: subject,
    content: { html, text }
  };
}