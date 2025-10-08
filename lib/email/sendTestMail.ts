// lib/email.ts
import { transporter } from './utils'



export async function sendTestMail(data: {
  to: string
  subject: string
  htmlContent: string
  title: string
  previewText?: string
}) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: data.to,
    subject: data.subject,
    html: data.htmlContent,
    text: data.previewText || `Test email for ${data.title}`,
  }

  return await transporter.sendMail(mailOptions)
}