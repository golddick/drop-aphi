


'use server'


import { transporter } from "./utils"


export const SendOTP = async ({
  userEmail,
  otp
}: {
  userEmail: string
  otp: string
}) => {

   const html = `
      <div style="text-align:center;font-family:Arial, sans-serif;padding:20px;">
        <h2 style="text-transform: capitalize;">Drop-Aphi Email Verification Code</h2>
        <h1 style="font-size:24px;letter-spacing:3px;margin:20px 0;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `;

  try {


    // Send email using personalized content 
       await transporter.sendMail({
         from: `Drop-Aphi <${process.env.SMTP_USER}>`,
         to: userEmail,
         subject: "Your Drop-Aphi Verification Code",
         html,
       })
 
    return { success: true, message: "OTP sent successfully" }
  } catch (error) {
    console.error('[SEND_OTP_ERROR]', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send confirmation',
    }
  }
}









