import { transporter } from "./utils";



export async function send3rdPartyOTPEmail(to: string, subject: string, html: string , appName:string) {



  try {
    const info = await transporter.sendMail({
      from: `${appName} <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent:", info.messageId);
    return { success: true };
  } catch (err) {
    console.error("Error sending email:", err);
    return { success: false, error: "EMAIL_SEND_FAILED" };
  }
}
