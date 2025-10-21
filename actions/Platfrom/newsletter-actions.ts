










// // app/actions/platform-newsletter-actions.ts

// 'use server'

// import { database } from "@/lib/database"
// import { z } from "zod"
// import { sendPlatformNotificationEmail } from '@/lib/email/sendPlatformNotification'
// import { validateEmail } from '@/lib/ZeroBounceApi'
// import { revalidatePath } from 'next/cache'

// const subscribeSchema = z.object({
//   email: z.string().email("Please enter a valid email address"),
//   name: z.string().optional(),
//   source: z.string().optional().default("platform_newsletter"),
// })

// export type SubscribeState = {
//   success?: boolean
//   message?: string
//   errors?: {
//     email?: string[]
//   }
// }

// // Platform welcome email template
// function getPlatformWelcomeTemplate({ 
//   name,
//   platformName = "Drop-aphi",
//   platformUrl = "https://drop-aphi.vercel.app"
// }: {
//   name?: string
//   platformName?: string
//   platformUrl?: string
// }) {
//   const greeting = name ? `Hello ${name},` : "Hello,"
  
//   return {
//     title: `Welcome to ${platformName} Platform Updates!`,
//     content: {
//       html: `
//         <!DOCTYPE html>
//         <html>
//         <head>
//             <meta charset="utf-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <title>Welcome to ${platformName}</title>
//             <style>
//                 body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//                 .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//                 .header { background: linear-gradient(135deg, #f59e0b, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
//                 .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
//                 .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #f59e0b; }
//                 .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
//                 .button { background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
//             </style>
//         </head>
//         <body>
//             <div class="container">
//                 <div class="header">
//                     <h1>🚀 Welcome to ${platformName}!</h1>
//                     <p>Your journey to better email infrastructure starts here</p>
//                 </div>
//                 <div class="content">
//                     <p>${greeting}</p>
//                     <p>Thank you for subscribing to ${platformName} platform updates! We're excited to have you on board.</p>
                    
//                     <h3>What to expect:</h3>
//                     <div class="feature">
//                         <strong>📈 Platform Updates</strong>
//                         <p>Get notified about new features, API improvements, and platform enhancements.</p>
//                     </div>
//                     <div class="feature">
//                         <strong>💡 Best Practices</strong>
//                         <p>Learn how to make the most of our APIs with code examples and tutorials.</p>
//                     </div>
//                     <div class="feature">
//                         <strong>🚀 Performance Tips</strong>
//                         <p>Optimize your email delivery and improve engagement rates.</p>
//                     </div>
//                     <div class="feature">
//                         <strong>🔧 Developer Resources</strong>
//                         <p>Access to documentation updates, SDK releases, and integration guides.</p>
//                     </div>
                    
//                     <p>We're committed to helping you build amazing email experiences for your users.</p>
                    
//                     <a href="${platformUrl}" class="button">Explore ${platformName}</a>
                    
//                     <p>If you have any questions, feel free to reach out to our support team.</p>
                    
//                     <p>Best regards,<br>The ${platformName} Team</p>
//                 </div>
//             </div>
//         </body>
//         </html>
//       `,
//       text: `
// Welcome to ${platformName} Platform Updates!

// ${greeting}

// Thank you for subscribing to ${platformName} platform updates! We're excited to have you on board.

// What to expect:

// 📈 Platform Updates
// Get notified about new features, API improvements, and platform enhancements.

// 💡 Best Practices
// Learn how to make the most of our APIs with code examples and tutorials.

// 🚀 Performance Tips
// Optimize your email delivery and improve engagement rates.

// 🔧 Developer Resources
// Access to documentation updates, SDK releases, and integration guides.

// We're committed to helping you build amazing email experiences for your users.

// Explore ${platformName}: ${platformUrl}

// If you have any questions, feel free to reach out to our support team.

// Best regards,
// The ${platformName} Team

//       `
//     }
//   }
// }

// // Platform resubscription email template
// function getPlatformResubscribeTemplate({ 
//   name,
//   platformName = "Drop-aphi",
//   platformUrl = "https://drop-aphi.vercel.app"
// }: {
//   name?: string
//   platformName?: string
//   platformUrl?: string
// }) {
//   const greeting = name ? `Welcome back ${name}!` : "Welcome back!"
  
//   return {
//     title: `Welcome Back to ${platformName}!`,
//     content: {
//       html: `
//         <!DOCTYPE html>
//         <html>
//         <head>
//             <meta charset="utf-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <title>Welcome Back to ${platformName}</title>
//             <style>
//                 body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//                 .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//                 .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
//                 .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
//                 .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #10b981; }
//                 .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
//                 .button { background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
//             </style>
//         </head>
//         <body>
//             <div class="container">
//                 <div class="header">
//                     <h1>🎉 Welcome Back!</h1>
//                     <p>We're thrilled to have you back with ${platformName}</p>
//                 </div>
//                 <div class="content">
//                     <p>${greeting}</p>
//                     <p>You've been successfully resubscribed to ${platformName} platform updates. We've missed you!</p>
                    
//                     <h3>Here's what you've missed:</h3>
//                     <div class="feature">
//                         <strong>🆕 New Features</strong>
//                         <p>Check out the latest platform enhancements and API improvements.</p>
//                     </div>
//                     <div class="feature">
//                         <strong>📚 Updated Documentation</strong>
//                         <p>Explore our improved documentation with better examples and guides.</p>
//                     </div>
//                     <div class="feature">
//                         <strong>🚀 Performance Upgrades</strong>
//                         <p>We've made significant improvements to email delivery speeds.</p>
//                     </div>
                    
//                     <p>We're constantly working to make ${platformName} better for developers like you.</p>
                    
//                     <a href="${platformUrl}/whats-new" class="button">See What's New</a>
                    
//                     <p>Thank you for giving us another chance to serve you better!</p>
                    
//                     <p>Best regards,<br>The ${platformName} Team</p>
//                 </div>
//             </div>
//         </body>
//         </html>
//       `,
//       text: `
// Welcome Back to ${platformName}!

// ${greeting}

// You've been successfully resubscribed to ${platformName} platform updates. We've missed you!

// Here's what you've missed:

// 🆕 New Features
// Check out the latest platform enhancements and API improvements.

// 📚 Updated Documentation
// Explore our improved documentation with better examples and guides.

// 🚀 Performance Upgrades
// We've made significant improvements to email delivery speeds.

// We're constantly working to make ${platformName} better for developers like you.

// See What's New: ${platformUrl}/whats-new

// Thank you for giving us another chance to serve you better!

// Best regards,
// The ${platformName} Team

// ---
//       `
//     }
//   }
// }

// export async function subscribeToPlatformNewsletter(
//   prevState: SubscribeState,
//   formData: FormData
// ): Promise<SubscribeState> {
//   try {
//     // Validate form data
//     const validatedFields = subscribeSchema.safeParse({
//       email: formData.get("email"),
//       name: formData.get("name"),
//       source: formData.get("source"),
//     })

//     if (!validatedFields.success) {
//       return {
//         success: false,
//         errors: validatedFields.error.flatten().fieldErrors,
//       }
//     }

//     const { email, name, source } = validatedFields.data

//     // Validate email with ZeroBounce
//     const validation = await validateEmail({ email })
//     if (validation.status === 'invalid') {
//       return {
//         success: false,
//         message: "Please enter a valid email address.",
//       }
//     }

//     // Check if email already exists
//     const existingSubscriber = await database.platformSubscriber.findUnique({
//       where: { email },
//     })

//     const platformName = "Drop-aphi"
//     const platformUrl = "https://drop-aphi.vercel.app"
//     const adminEmail = "platform@drop-aphi.com"

//     if (existingSubscriber) {
//       if (existingSubscriber.status === "SUBSCRIBED") {
//         return {
//           success: false,
//           message: "This email is already subscribed to our platform updates.",
//         }
//       } else {
//         // Reactivate unsubscribed user - FIXED: Handle null name properly
//         const updatedSubscriber = await database.platformSubscriber.update({
//           where: { email },
//           data: {
//             status: "SUBSCRIBED",
//             name: name ?? existingSubscriber.name, // Use nullish coalescing
//             source: source || existingSubscriber.source,
//             updatedAt: new Date(),
//           },
//         })

//         // Send resubscription welcome email - FIXED: Handle null name
//         await sendPlatformResubscriptionEmail({
//           email,
//           name: name ?? existingSubscriber.name ?? undefined, // Convert null to undefined
//           platformName,
//           platformUrl,
//           adminEmail,
//         })

//         revalidatePath('/')
//         return {
//           success: true,
//           message: "Welcome back! You've been resubscribed to platform updates.",
//         }
//       }
//     } else {
//       // Create new subscriber
//       const subscriber = await database.platformSubscriber.create({
//         data: {
//           email,
//           name: name || email.split('@')[0],
//           source,
//           status: "SUBSCRIBED",
//         },
//       })

//       // Send welcome email
//       await sendPlatformWelcomeEmail({
//         email,
//         name: name || email.split('@')[0], // Ensure name is undefined if not provided
//         platformName,
//         platformUrl,
//         adminEmail,
//       })

//       revalidatePath('/')
//       return {
//         success: true,
//         message: "Successfully subscribed to platform updates! Welcome email sent.",
//       }
//     }
//   } catch (error) {
//     console.error("Platform newsletter subscription error:", error)
//     return {
//       success: false,
//       message: "An error occurred. Please try again later.",
//     }
//   }
// }

// // Helper function to send platform welcome email
// async function sendPlatformWelcomeEmail({
//   email,
//   name,
//   platformName,
//   platformUrl,
//   adminEmail,
// }: {
//   email: string
//   name?: string
//   platformName: string
//   platformUrl: string
//   adminEmail: string
// }) {
//   try {
//     const template = getPlatformWelcomeTemplate({
//       name,
//       platformName,
//       platformUrl
//     })

//     // Personalize content with actual email
//     const personalizedHtml = template.content.html.replace(/\[EMAIL\]/g, email)
//     const personalizedText = template.content.text.replace(/\[EMAIL\]/g, email)

//     // Use simplified platform notification sender
//     await sendPlatformNotificationEmail({
//       userEmail: [email],
//       subject: template.title,
//       content: personalizedHtml,
//       adminEmail,
//       fromApplication: platformName,
//     })

//     console.log(`[PLATFORM_WELCOME_EMAIL_SENT] to: ${email}`)
//   } catch (error) {
//     console.error('[PLATFORM_WELCOME_EMAIL_ERROR]', error)
//     // Don't throw error - subscription should succeed even if email fails
//   }
// }

// // Helper function to send platform resubscription email
// async function sendPlatformResubscriptionEmail({
//   email,
//   name,
//   platformName,
//   platformUrl,
//   adminEmail,
// }: {
//   email: string
//   name?: string
//   platformName: string
//   platformUrl: string
//   adminEmail: string
// }) {
//   try {
//     const template = getPlatformResubscribeTemplate({
//       name,
//       platformName,
//       platformUrl
//     })

//     // Personalize content with actual email
//     const personalizedHtml = template.content.html.replace(/\[EMAIL\]/g, email)
//     const personalizedText = template.content.text.replace(/\[EMAIL\]/g, email)

//     await sendPlatformNotificationEmail({
//       userEmail: [email],
//       subject: template.title,
//       content: personalizedHtml,
//       adminEmail,
//       fromApplication: platformName,
//     })

//     console.log(`[PLATFORM_RESUBSCRIBE_EMAIL_SENT] to: ${email}`)
//   } catch (error) {
//     console.error('[PLATFORM_RESUBSCRIBE_EMAIL_ERROR]', error)
//     // Don't throw error - resubscription should succeed even if email fails
//   }
// }




















// app/actions/platform-newsletter-actions.ts

'use server'

import { database } from "@/lib/database"
import { z } from "zod"
import { sendPlatformNotificationEmail } from '@/lib/email/sendPlatformNotification'
import { validateEmail } from '@/lib/ZeroBounceApi'
import { revalidatePath } from 'next/cache'

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().optional(),
  source: z.string().optional().default("platform_newsletter"),
})
 
const domain = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://drop-aphi.vercel.app';

export type SubscribeState = {
  success?: boolean
  message?: string
  errors?: {
    email?: string[]
  }
}

// Improved platform welcome email template (less spammy)

function getPlatformWelcomeTemplate({ 
  name,
  platformName = "Drop-aphi",
  platformUrl = domain
}: {
  name?: string
  platformName?: string
  platformUrl?: string
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
                    background-color: #ffffff;
                }
                .container { 
                    max-width: 600px; 
                    margin: 0 auto; 
                    background: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e5e5e5;
                }
                .header { 
                    background: #ffffff; 
                    color: #000000; 
                    padding: 40px 30px; 
                    text-align: center; 
                    border-bottom: 1px solid #e5e5e5;
                }
                .content { 
                    padding: 40px 30px; 
                    line-height: 1.7;
                    color: #000000;
                }
                .feature { 
                    background: #f8f8f8; 
                    padding: 20px; 
                    margin: 15px 0; 
                    border-radius: 6px; 
                    border-left: 4px solid #dc2626; 
                }
                .footer { 
                    text-align: center; 
                    padding: 30px; 
                    color: #666666; 
                    font-size: 14px; 
                    background: #f8f8f8;
                    border-top: 1px solid #e5e5e5;
                }
                .button { 
                    background: #dc2626; 
                    color: #ffffff; 
                    padding: 14px 28px; 
                    text-decoration: none; 
                    border-radius: 6px; 
                    display: inline-block; 
                    margin: 20px 0; 
                    font-weight: 600;
                    font-size: 16px;
                    border: none;
                    cursor: pointer;
                }
                .greeting {
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 20px;
                    color: #000000;
                }
                h1, h2, h3, h4, h5, h6 {
                    color: #000000;
                }
                a {
                    color: #dc2626;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #000000;">🚀 Welcome to ${platformName}</h1>
                    <p style="margin: 10px 0 0; color: #666666; font-size: 16px;">Your journey to better email infrastructure starts here</p>
                </div>
                <div class="content">
                    <div class="greeting">${greeting}</div>
                    
                    <p style="color: #000000;">Thank you for subscribing to ${platformName} platform updates! We're excited to have you on board as we build the future of email infrastructure.</p>
                    
                    <h3 style="color: #000000; margin-top: 30px;">Here's what you can expect:</h3>
                    
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
                    
                    <p style="margin-top: 30px; color: #000000;">We're committed to helping you build amazing email experiences for your users with reliable, scalable infrastructure.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${platformUrl}" class="button" style="color: #ffffff; text-decoration: none;">Explore ${platformName}</a>
                    </div>
                    
                    <p style="color: #000000;">If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
                    
                    <p style="margin-top: 40px; color: #000000;">
                        Best regards,<br>
                        <strong style="color: #000000;">The ${platformName} Team</strong>
                    </p>
                </div>
                <div class="footer">
                    <p style="margin: 0 0 10px; color: #666666;">
                        © 2025 ${platformName}. All rights reserved.<br>
                        <a href="${platformUrl}" style="color: #666666; text-decoration: underline;">${platformUrl}</a>
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #666666;">
                        You're receiving this email because you subscribed to platform updates.<br>
                        <a href="[UNSUBSCRIBE_URL]" style="color: #666666; text-decoration: underline;">Unsubscribe from these updates</a>
                    </p>
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

You're receiving this email because you subscribed to platform updates.
Unsubscribe: [UNSUBSCRIBE_URL]
      `
    }
  }
}


export async function subscribeToPlatformNewsletter(
  prevState: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  try {
    // Validate form data
    const validatedFields = subscribeSchema.safeParse({
      email: formData.get("email"),
      name: formData.get("name") || "", // Ensure name is never null
      source: formData.get("source"),
    })

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { email, name, source } = validatedFields.data

    // Validate email with ZeroBounce
    const validation = await validateEmail({ email })
    if (validation.status === 'invalid') {
      return {
        success: false,
        message: "Please enter a valid email address.",
      }
    }

    // Check if email already exists
    const existingSubscriber = await database.platformSubscriber.findUnique({
      where: { email },
    })

    const platformName = "Drop-aphi"
    const platformUrl = domain
    const adminEmail = "hello@drop-aphi.com" 

    if (existingSubscriber) {
      if (existingSubscriber.status === "SUBSCRIBED") {
        return {
          success: false,
          message: "You're already subscribed to our platform updates!",
        }
      } else {
        // Reactivate unsubscribed user
        const updatedSubscriber = await database.platformSubscriber.update({
          where: { email },
          data: {
            status: "SUBSCRIBED",
            name: name || existingSubscriber.name || "",
            source: source || existingSubscriber.source,
            updatedAt: new Date(),
          },
        })

        // Send resubscription welcome email
        await sendPlatformResubscriptionEmail({
          email,
          name: name || existingSubscriber.name || "",
          platformName,
          platformUrl,
          adminEmail,
        })

        revalidatePath('/')
        return {
          success: true,
          message: "Welcome back! You've been resubscribed to platform updates.",
        }
      }
    } else {
      // Create new subscriber
      const subscriber = await database.platformSubscriber.create({
        data: {
          email,
          name: name || "",
          source,
          status: "SUBSCRIBED",
        },
      })

      // Send welcome email
      await sendPlatformWelcomeEmail({
        email,
        name: name || "",
        platformName,
        platformUrl,
        adminEmail,
      })

      revalidatePath('/')
      return {
        success: true,
        message: "Successfully subscribed! Check your email for a welcome message.",
      }
    }
  } catch (error) {
    console.error("Platform newsletter subscription error:", error)
    return {
      success: false,
      message: "An error occurred. Please try again later.",
    }
  }
}

// Helper function to send platform welcome email
async function sendPlatformWelcomeEmail({
  email,
  name,
  platformName,
  platformUrl,
  adminEmail,
}: {
  email: string
  name: string
  platformName: string
  platformUrl: string
  adminEmail: string
}) {
  try {
    const template = getPlatformWelcomeTemplate({
      name: name || undefined,
      platformName,
      platformUrl
    })

    // Use simplified platform notification sender
    const result = await sendPlatformNotificationEmail({
      userEmail: [email],
      subject: template.title,
      content: template.content.html,
      adminEmail,
      fromApplication: platformName,
    })

    if (result.success) {
      console.log(`[PLATFORM_WELCOME_EMAIL_SENT] to: ${email}`)
    } else {
      console.warn(`[PLATFORM_WELCOME_EMAIL_FAILED] to: ${email}`, result.error)
      // Don't throw - subscription should succeed even if email fails
    }
  } catch (error) {
    console.error('[PLATFORM_WELCOME_EMAIL_ERROR]', error)
    // Don't throw error - subscription should succeed even if email fails
  }
}

// Helper function to send platform resubscription email
async function sendPlatformResubscriptionEmail({
  email,
  name,
  platformName,
  platformUrl,
  adminEmail,
}: {
  email: string
  name: string
  platformName: string
  platformUrl: string
  adminEmail: string
}) {
  try {
    const template = getPlatformWelcomeTemplate({ // Use same template for now
      name: name || undefined,
      platformName,
      platformUrl
    })

    const result = await sendPlatformNotificationEmail({
      userEmail: [email],
      subject: `Welcome Back to ${platformName}!`,
      content: template.content.html,
      adminEmail,
      fromApplication: platformName,
    })

    if (result.success) {
      console.log(`[PLATFORM_RESUBSCRIBE_EMAIL_SENT] to: ${email}`)
    } else {
      console.warn(`[PLATFORM_RESUBSCRIBE_EMAIL_FAILED] to: ${email}`, result.error)
    }
  } catch (error) {
    console.error('[PLATFORM_RESUBSCRIBE_EMAIL_ERROR]', error)
  }
}