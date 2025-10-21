export interface ResubscribeTemplateProps {
  name: string;
  platformName: string;
  platformUrl: string;
}

export function resubscribeTemplate({ name, platformName, platformUrl }: ResubscribeTemplateProps) {
  const subject = `Welcome Back to ${platformName}!`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #000; color: white; padding: 20px; text-align: center;">
        <h1>Welcome Back!</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2>Hello ${name},</h2>
        <p>We're thrilled to have you back with us at <strong>${platformName}</strong>!</p>
        <p>Your subscription has been successfully reactivated.</p>
        <p style="text-align: center;">
          <a href="${platformUrl}" style="background: #000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Visit ${platformName}
          </a>
        </p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
      </div>
    </div>
  `;

  const text = `
Welcome Back to ${platformName}!

Hello ${name},

We're thrilled to have you back with us! Your subscription has been reactivated.

Visit us at: ${platformUrl}

If you have any questions, feel free to reach out to our support team.

  `;

  return {
    title: subject,
    content: { html, text }
  };
}