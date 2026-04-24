// Supabase Email Module with SMTP (Gmail/SendGrid)
// Replaces Resend API with standard SMTP

// Email sending using fetch to SMTP relay
// Note: Deno doesn't have built-in SMTP, so we'll use a simple approach

export async function sendEmailViaSMTP(
  to: string,
  subject: string,
  html: string,
  from?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Get SMTP credentials from environment
    const smtpHost = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com';
    const smtpPort = Deno.env.get('SMTP_PORT') || '587';
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPassword = Deno.env.get('SMTP_PASSWORD');
    const smtpFrom = from || Deno.env.get('SMTP_FROM') || 'noreply@resilio.app';

    // Check if SMTP is configured
    if (!smtpUser || !smtpPassword) {
      console.error('❌ SMTP not configured. Please set SMTP_USER and SMTP_PASSWORD');
      throw new Error('SMTP credentials not configured');
    }

    console.log(`📧 Sending email via SMTP to: ${to}`);
    console.log(`📤 From: ${smtpFrom}`);
    console.log(`📬 Subject: ${subject}`);
    console.log(`🔌 SMTP Server: ${smtpHost}:${smtpPort}`);

    // For Deno, we'll use a third-party SMTP library
    // Import denomailer (SMTP client for Deno)
    const { SMTPClient } = await import('https://deno.land/x/denomailer@1.6.0/mod.ts');

    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: parseInt(smtpPort),
        tls: smtpPort === '465',
        auth: {
          username: smtpUser,
          password: smtpPassword,
        },
      },
    });

    // Send email
    await client.send({
      from: smtpFrom,
      to: to,
      subject: subject,
      content: 'auto',
      html: html,
    });

    await client.close();

    console.log(`✅ Email sent successfully via SMTP to: ${to}`);

    return {
      success: true,
      messageId: `smtp-${Date.now()}`,
    };
  } catch (error: any) {
    console.error('❌ SMTP Error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Future Message Email
export async function sendFutureMessageEmail(
  userEmail?: string,
  message?: string,
  scheduledDate?: string,
  userName?: string
) {
  console.log('📧 Sending future message email to:', userEmail);

  const subject = `📬 Future Self Message - Scheduled for ${scheduledDate}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">📬 Future Self Message</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Scheduled for ${scheduledDate}</p>
      </div>
      
      <div style="background-color: white; padding: 30px; margin-top: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        ${userName ? `<p style="color: #4b5563; font-size: 16px;">Hi ${userName},</p>` : ''}
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          You've scheduled a message to yourself! Here's what you wrote:
        </p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px;">
          <p style="color: #1f2937; font-size: 16px; line-height: 1.8; white-space: pre-wrap; margin: 0;">
            ${message}
          </p>
        </div>
        
        <div style="background-color: #ecfdf5; border: 1px solid #10b981; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p style="color: #047857; margin: 0; font-size: 14px;">
            ✅ This message will remind you on <strong>${scheduledDate}</strong>
          </p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 14px;">
        <p>Sent from Resilio - Your Personal Journal</p>
      </div>
    </div>
  `;

  const result = await sendEmailViaSMTP(userEmail || '', subject, html);

  if (!result.success) {
    throw new Error(result.error || 'Failed to send email');
  }

  return { success: true, mode: 'sent', data: result };
}

// Reminder Email
export async function sendReminderEmail(
  userEmail?: string,
  task?: string,
  scheduledDate?: string,
  scheduledTime?: string,
  userName?: string
) {
  console.log('📧 Sending reminder email to:', userEmail);

  const subject = `⏰ Reminder - ${task}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">⏰ Personal Reminder</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Don't forget!</p>
      </div>
      
      <div style="background-color: white; padding: 30px; margin-top: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        ${userName ? `<p style="color: #4b5563; font-size: 16px;">Hi ${userName},</p>` : ''}
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          You have a reminder set for:
        </p>
        
        <div style="background-color: #fff7ed; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 5px;">
          <p style="color: #1f2937; font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">
            ${task}
          </p>
          <p style="color: #78716c; font-size: 14px; margin: 0;">
            📅 Date: ${scheduledDate}<br/>
            🕐 Time: ${scheduledTime}
          </p>
        </div>
        
        <div style="background-color: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p style="color: #1e40af; margin: 0; font-size: 14px;">
            💡 This is a confirmation that your reminder has been set successfully!
          </p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 14px;">
        <p>Sent from Resilio - Your Personal Journal</p>
      </div>
    </div>
  `;

  const result = await sendEmailViaSMTP(userEmail || '', subject, html);

  if (!result.success) {
    throw new Error(result.error || 'Failed to send email');
  }

  return { success: true, mode: 'sent', data: result };
}

// Password Reset Email
export async function sendPasswordResetEmail(
  userEmail: string,
  resetLink: string,
  userName?: string
) {
  console.log('📧 Sending password reset email to:', userEmail);

  const subject = '🔒 Reset Your Password - Resilio';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🔒 Reset Your Password</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Secure your account</p>
      </div>
      
      <div style="background-color: white; padding: 30px; margin-top: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        ${userName ? `<p style="color: #4b5563; font-size: 16px;">Hi ${userName},</p>` : '<p style="color: #4b5563; font-size: 16px;">Hi there,</p>'}
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          We received a request to reset your password for your Resilio account. If you didn't make this request, you can safely ignore this email.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.3);">
            Reset Password
          </a>
        </div>
        
        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p style="color: #92400e; margin: 0; font-size: 14px;">
            ⚠️ <strong>Security Note:</strong> This link will expire in 24 hours for your security.
          </p>
        </div>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            If the button above doesn't work, copy and paste this link into your browser:
          </p>
          <p style="color: #8b5cf6; font-size: 13px; word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 5px;">
            ${resetLink}
          </p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 14px;">
        <p>Sent from Resilio - Your Personal Journal</p>
        <p style="margin-top: 10px; font-size: 12px;">
          If you didn't request this password reset, please ignore this email or contact support if you have concerns.
        </p>
      </div>
    </div>
  `;

  const result = await sendEmailViaSMTP(userEmail, subject, html);

  if (!result.success) {
    throw new Error(result.error || 'Failed to send email');
  }

  return { success: true, mode: 'sent', data: result };
}
