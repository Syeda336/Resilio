// SMTP Email using Nodemailer - Use your own email account!
// Works with Gmail, Outlook, Yahoo, or any SMTP server

export async function sendFutureMessageEmail(
  userEmail?: string,
  message?: string,
  scheduledDate?: string,
  userName?: string
) {
  console.log('📧 Sending future message email to:', userEmail);
  
  // Check if SMTP is configured
  const smtpHost = Deno.env.get('SMTP_HOST');
  const smtpPort = Deno.env.get('SMTP_PORT');
  const smtpUser = Deno.env.get('SMTP_USER');
  const smtpPassword = Deno.env.get('SMTP_PASSWORD');
  const smtpFrom = Deno.env.get('SMTP_FROM') || smtpUser;
  
  // If not configured, fallback to console logging
  if (!smtpHost || !smtpUser || !smtpPassword) {
    console.log('⚠️ SMTP not configured - Email will be logged only');
    console.log('📧 ===== FUTURE MESSAGE EMAIL =====');
    console.log(`📬 To: ${userEmail}`);
    console.log(`👤 Name: ${userName || 'User'}`);
    console.log(`📅 Scheduled Date: ${scheduledDate}`);
    console.log(`💌 Message: ${message}`);
    console.log('=====================================');
    
    return { 
      success: true, 
      mode: 'console-log', 
      data: { id: `demo-${Date.now()}` } 
    };
  }

  try {
    // Import nodemailer
    const nodemailer = await import('npm:nodemailer@6.9.7');
    
    // Create transporter
    const transporter = nodemailer.default.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort || '587'),
      secure: smtpPort === '465', // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"Resilio" <${smtpFrom}>`,
      to: userEmail,
      subject: `📬 Message from Your Past Self (${scheduledDate})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">📬 Message from Your Past Self</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Scheduled for: ${scheduledDate}</p>
          </div>
          
          <div style="background-color: white; padding: 30px; margin-top: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            ${userName ? `<p style="color: #4b5563; font-size: 16px;">Hi ${userName},</p>` : ''}
            
            <div style="background-color: #ecfdf5; border: 1px solid #10b981; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="color: #047857; margin: 0; font-size: 14px;">
                ⏰ <strong>Scheduled Time:</strong> ${scheduledDate}
              </p>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              You scheduled this message to yourself. Here's what past you wanted to tell you:
            </p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px;">
              <p style="color: #1f2937; font-size: 16px; line-height: 1.8; white-space: pre-wrap; margin: 0;">
                ${message}
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              💜 This message was delivered at the time you scheduled it.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 14px;">
            <p>Sent from Resilio - Your Personal Journal</p>
          </div>
        </div>
      `,
    });

    console.log('✅ Email sent successfully to:', userEmail);
    console.log('📬 Message ID:', info.messageId);
    return { success: true, mode: 'sent', data: { messageId: info.messageId } };
  } catch (error: any) {
    console.error('❌ Error sending email via SMTP:', error);
    throw error;
  }
}

export async function sendReminderEmail(
  userEmail?: string,
  task?: string,
  scheduledDate?: string,
  scheduledTime?: string,
  userName?: string
) {
  console.log('📧 Sending reminder email to:', userEmail);
  
  // Check if SMTP is configured
  const smtpHost = Deno.env.get('SMTP_HOST');
  const smtpPort = Deno.env.get('SMTP_PORT');
  const smtpUser = Deno.env.get('SMTP_USER');
  const smtpPassword = Deno.env.get('SMTP_PASSWORD');
  const smtpFrom = Deno.env.get('SMTP_FROM') || smtpUser;
  
  // If not configured, fallback to console logging
  if (!smtpHost || !smtpUser || !smtpPassword) {
    console.log('⚠️ SMTP not configured - Email will be logged only');
    console.log('📧 ===== REMINDER EMAIL =====');
    console.log(`📬 To: ${userEmail}`);
    console.log(`👤 Name: ${userName || 'User'}`);
    console.log(`⏰ Task: ${task}`);
    console.log(`📅 Date: ${scheduledDate}`);
    console.log(`🕐 Time: ${scheduledTime}`);
    console.log('============================');
    
    return { 
      success: true, 
      mode: 'console-log', 
      data: { id: `demo-${Date.now()}` } 
    };
  }

  try {
    // Import nodemailer
    const nodemailer = await import('npm:nodemailer@6.9.7');
    
    // Create transporter
    const transporter = nodemailer.default.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort || '587'),
      secure: smtpPort === '465', // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"Resilio" <${smtpFrom}>`,
      to: userEmail,
      subject: `⏰ Reminder - ${task}`,
      html: `
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
      `,
    });

    console.log('✅ Email sent successfully to:', userEmail);
    console.log('📬 Message ID:', info.messageId);
    return { success: true, mode: 'sent', data: { messageId: info.messageId } };
  } catch (error: any) {
    console.error('❌ Error sending email via SMTP:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(
  userEmail: string,
  resetLink: string,
  userName?: string
) {
  console.log('📧 Sending password reset email to:', userEmail);
  
  // Check if SMTP is configured
  const smtpHost = Deno.env.get('SMTP_HOST');
  const smtpPort = Deno.env.get('SMTP_PORT');
  const smtpUser = Deno.env.get('SMTP_USER');
  const smtpPassword = Deno.env.get('SMTP_PASSWORD');
  const smtpFrom = Deno.env.get('SMTP_FROM') || smtpUser;
  
  // If not configured, fallback to console logging
  if (!smtpHost || !smtpUser || !smtpPassword) {
    console.log('⚠️ SMTP not configured - Email will be logged only');
    console.log('📧 ===== PASSWORD RESET EMAIL =====');
    console.log(`📬 To: ${userEmail}`);
    console.log(`👤 Name: ${userName || 'User'}`);
    console.log(`🔗 Reset Link: ${resetLink}`);
    console.log('===================================');
    
    return { 
      success: true, 
      mode: 'console-log', 
      data: { id: `demo-${Date.now()}` } 
    };
  }

  try {
    // Import nodemailer
    const nodemailer = await import('npm:nodemailer@6.9.7');
    
    // Create transporter
    const transporter = nodemailer.default.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort || '587'),
      secure: smtpPort === '465', // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"Resilio" <${smtpFrom}>`,
      to: userEmail,
      subject: '🔒 Reset Your Password - Resilio',
      html: `
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
      `,
    });

    console.log('✅ Email sent successfully to:', userEmail);
    console.log('📬 Message ID:', info.messageId);
    return { success: true, mode: 'sent', data: { messageId: info.messageId } };
  } catch (error: any) {
    console.error('❌ Error sending email via SMTP:', error);
    throw error;
  }
}

// Send diet food items email
export async function sendDietEmail(
  userEmail?: string,
  foodItems?: Array<{ name: string; calories: number; category: string; protein?: number; carbs?: number }>,
  totalCalories?: number,
  totalProtein?: number,
  totalCarbs?: number,
  totalFats?: number,
  scheduledDate?: string,
  scheduledTime?: string,
  timeline?: string,
  userName?: string
) {
  console.log('📧 Sending diet email to:', userEmail);
  
  // Check if SMTP is configured
  const smtpHost = Deno.env.get('SMTP_HOST');
  const smtpPort = Deno.env.get('SMTP_PORT');
  const smtpUser = Deno.env.get('SMTP_USER');
  const smtpPassword = Deno.env.get('SMTP_PASSWORD');
  const smtpFrom = Deno.env.get('SMTP_FROM') || smtpUser;
  
  // If not configured, fallback to console logging
  if (!smtpHost || !smtpUser || !smtpPassword) {
    console.log('⚠️ SMTP not configured - Email will be logged only');
    console.log('📧 ===== DIET EMAIL =====');
    console.log(`📬 To: ${userEmail}`);
    console.log(`👤 Name: ${userName || 'User'}`);
    console.log(`🍎 Food Items: ${JSON.stringify(foodItems)}`);
    console.log(`📊 Total Calories: ${totalCalories}`);
    console.log(`📅 Date: ${scheduledDate}`);
    console.log(`🕐 Time: ${scheduledTime}`);
    console.log('========================');
    
    return { 
      success: true, 
      mode: 'console-log', 
      data: { id: `demo-${Date.now()}` } 
    };
  }

  try {
    // Import nodemailer
    const nodemailer = await import('npm:nodemailer@6.9.7');
    
    // Create transporter
    const transporter = nodemailer.default.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort || '587'),
      secure: smtpPort === '465',
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    // Create food items list HTML
    const foodListHtml = foodItems?.map(item => 
      `<li style="padding: 12px; background-color: #f9fafb; margin: 5px 0; border-radius: 5px; border-left: 3px solid #10b981;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #1f2937; font-size: 15px;">${item.name}</strong>
          <span style="color: #059669; font-size: 13px; font-weight: 600;">${item.category}</span>
        </div>
        <div style="margin-top: 8px; display: flex; gap: 15px; font-size: 13px;">
          <span style="color: #f97316; font-weight: 600;">🔥 ${item.calories} cal</span>
          <span style="color: #3b82f6; font-weight: 600;">💪 ${item.protein || 0}g protein</span>
          <span style="color: #8b5cf6; font-weight: 600;">🌾 ${item.carbs || 0}g carbs</span>
        </div>
      </li>`
    ).join('');

    // Send email
    const info = await transporter.sendMail({
      from: `"Resilio" <${smtpFrom}>`,
      to: userEmail,
      subject: `🍎 Food Reminder: ${foodItems?.length} items scheduled`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🍎 Food Reminder</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Time to eat healthy!</p>
          </div>
          
          <div style="background-color: white; padding: 30px; margin-top: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            ${userName ? `<p style="color: #4b5563; font-size: 16px;">Hi ${userName},</p>` : ''}
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Time to have your scheduled food items!
            </p>
            
            <div style="background-color: #ecfdf5; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 5px;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0;">📋 Scheduled Items:</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                ${foodListHtml}
              </ul>
            </div>
            
            <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin: 0 0 15px 0;">📊 Nutritional Summary</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; color: #4b5563;">Total Calories:</td>
                  <td style="padding: 8px; text-align: right; font-weight: bold; color: #1f2937;">${totalCalories} kcal</td>
                </tr>
                <tr>
                  <td style="padding: 8px; color: #4b5563;">Total Protein:</td>
                  <td style="padding: 8px; text-align: right; font-weight: bold; color: #1f2937;">${totalProtein?.toFixed(1)}g</td>
                </tr>
                <tr>
                  <td style="padding: 8px; color: #4b5563;">Total Carbs:</td>
                  <td style="padding: 8px; text-align: right; font-weight: bold; color: #1f2937;">${totalCarbs?.toFixed(1)}g</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="color: #4b5563; margin: 0; font-size: 14px;">
                📅 <strong>Scheduled for:</strong> ${scheduledDate} at ${scheduledTime}<br/>
                ⏰ <strong>Duration:</strong> ${timeline}
              </p>
            </div>
            
            <p style="color: #4b5563; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              Stay healthy! 🍎
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 5px 0;">With care,</p>
            <p style="margin: 5px 0; font-weight: bold;">Resilio - Your Personal Journal</p>
          </div>
        </div>
      `,
    });

    console.log('✅ Diet email sent successfully to:', userEmail);
    console.log('📬 Message ID:', info.messageId);
    return { success: true, mode: 'sent', data: { messageId: info.messageId } };
  } catch (error: any) {
    console.error('❌ Error sending diet email via SMTP:', error);
    throw error;
  }
}

// Send meal plan email
export async function sendMealEmail(
  userEmail?: string,
  mealType?: string,
  mealDescription?: string,
  mealItems?: string,
  scheduledDate?: string,
  scheduledTime?: string,
  userName?: string,
  createdAt?: string
) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 sendMealEmail() FUNCTION CALLED!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Parameters received:');
  console.log('  userEmail:', userEmail);
  console.log('  mealType:', mealType);
  console.log('  mealDescription:', mealDescription);
  console.log('  mealItems:', mealItems);
  console.log('  scheduledDate:', scheduledDate);
  console.log('  scheduledTime:', scheduledTime);
  console.log('  userName:', userName);
  console.log('  createdAt:', createdAt);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Check if SMTP is configured
  const smtpHost = Deno.env.get('SMTP_HOST');
  const smtpPort = Deno.env.get('SMTP_PORT');
  const smtpUser = Deno.env.get('SMTP_USER');
  const smtpPassword = Deno.env.get('SMTP_PASSWORD');
  const smtpFrom = Deno.env.get('SMTP_FROM') || smtpUser;
  
  // If not configured, fallback to console logging
  if (!smtpHost || !smtpUser || !smtpPassword) {
    console.log('⚠️ SMTP not configured - Email will be logged only');
    console.log('📧 ===== MEAL EMAIL =====');
    console.log(`📬 To: ${userEmail}`);
    console.log(`👤 Name: ${userName || 'User'}`);
    console.log(`🍽️ Meal Type: ${mealType}`);
    console.log(`📝 Description: ${mealDescription}`);
    console.log(`📋 Food Items: ${mealItems}`);
    console.log(`📅 Date: ${scheduledDate}`);
    console.log(`🕐 Time: ${scheduledTime}`);
    console.log(`⏰ Created At: ${createdAt}`);
    console.log('========================');
    
    return { 
      success: true, 
      mode: 'console-log', 
      data: { id: `demo-${Date.now()}` } 
    };
  }

  try {
    // Import nodemailer
    const nodemailer = await import('npm:nodemailer@6.9.7');
    
    // Create transporter
    const transporter = nodemailer.default.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort || '587'),
      secure: smtpPort === '465',
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    // Format created date
    const createdDate = createdAt ? new Date(createdAt).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) : 'N/A';

    // Send email
    const info = await transporter.sendMail({
      from: `"Resilio" <${smtpFrom}>`,
      to: userEmail,
      subject: `🍽️ ${mealType} Reminder`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🍽️ ${mealType} Time!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Enjoy your meal</p>
          </div>
          
          <div style="background-color: white; padding: 30px; margin-top: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            ${userName ? `<p style="color: #4b5563; font-size: 16px;">Hi ${userName},</p>` : ''}
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              It's time for your ${mealType}!
            </p>
            
            <div style="background-color: #f5f3ff; padding: 20px; border-left: 4px solid #8b5cf6; margin: 20px 0; border-radius: 5px;">
              <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">🍽️ Meal Type</h3>
              <p style="color: #4b5563; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">
                ${mealType}
              </p>
              <h3 style="color: #1f2937; margin: 15px 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">📝 Description</h3>
              <p style="color: #4b5563; margin: 0; line-height: 1.6; white-space: pre-wrap;">
                ${mealDescription}
              </p>
            </div>
            
            ${mealItems ? `
              <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                <h3 style="color: #059669; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">📋 Food Items</h3>
                <p style="color: #4b5563; margin: 0; line-height: 1.8; white-space: pre-wrap;">
                  ${mealItems}
                </p>
              </div>
            ` : ''}

            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="color: #4b5563; margin: 0; font-size: 14px;">
                ⏰ <strong>Created on:</strong> ${createdDate}
              </p>
            </div>
            
            <p style="color: #4b5563; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              Enjoy your meal! 🍽️
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 5px 0;">With care,</p>
            <p style="margin: 5px 0; font-weight: bold;">Resilio - Your Personal Journal</p>
          </div>
        </div>
      `,
    });

    console.log('✅ Meal email sent successfully to:', userEmail);
    console.log('📬 Message ID:', info.messageId);
    return { success: true, mode: 'sent', data: { messageId: info.messageId } };
  } catch (error: any) {
    console.error('❌ Error sending meal email via SMTP:', error);
    throw error;
  }
}

// Send Welcome Email (after signup)
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string
) {
  console.log('📧 Sending welcome email to:', userEmail);

  const smtpHost = Deno.env.get('SMTP_HOST');
  const smtpPort = Deno.env.get('SMTP_PORT');
  const smtpUser = Deno.env.get('SMTP_USER');
  const smtpPassword = Deno.env.get('SMTP_PASSWORD');
  const smtpFrom = Deno.env.get('SMTP_FROM') || smtpUser;

  if (!smtpHost || !smtpUser || !smtpPassword) {
    console.log('⚠️ SMTP not configured - Email will be logged only');
    console.log('📧 ===== WELCOME EMAIL =====');
    console.log(`📬 To: ${userEmail}`);
    console.log(`👤 Name: ${userName}`);
    console.log('===========================');
    return { success: true, mode: 'console-log', data: { id: `demo-${Date.now()}` } };
  }

  try {
    const nodemailer = await import('npm:nodemailer@6.9.7');

    const transporter = nodemailer.default.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort || '587'),
      secure: smtpPort === '465',
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const info = await transporter.sendMail({
      from: `"Resilio" <${smtpFrom}>`,
      to: userEmail,
      subject: '🎉 Welcome to Resilio - Your Personal Wellness Journey Begins!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 32px;">🎉 Welcome to Resilio!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Your Personal Wellness Journey Begins</p>
          </div>

          <div style="background-color: white; padding: 30px; margin-top: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="color: #1f2937; font-size: 18px; margin-bottom: 20px;">Dear <strong>${userName}</strong>,</p>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Welcome to Resilio! We're thrilled to have you join our community.
            </p>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Resilio is your personal companion for mental wellness, self-reflection, and personal growth. We've created a safe, supportive space where you can:
            </p>

            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <ul style="color: #047857; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>✨ Track your daily moods and emotions</li>
                <li>📔 Write private diary entries with rich formatting</li>
                <li>💭 Send messages to your future self</li>
                <li>⏰ Set personal reminders for important tasks</li>
                <li>🍎 Plan and track your diet and nutrition</li>
                <li>🎮 Play mindfulness games and exercises</li>
                <li>💬 Chat with Care Buddy, your AI wellness companion</li>
              </ul>
            </div>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; font-weight: bold;">
              Your account has been successfully created, and you're all set to begin your wellness journey.
            </p>

            <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #1e40af; font-size: 15px; margin: 0 0 10px 0; font-weight: bold;">We recommend starting by:</p>
              <ol style="color: #1e3a8a; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Exploring the Dashboard to see your activity overview</li>
                <li>Creating your first diary entry to capture today's thoughts</li>
                <li>Setting up a future self message for motivation</li>
                <li>Checking out the Mini Games section for stress relief</li>
              </ol>
            </div>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Remember, Resilio is here to support you every step of the way. Your privacy and security are our top priorities - all your data is encrypted and stored securely.
            </p>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              If you have any questions or need assistance, don't hesitate to reach out. We're here to help!
            </p>

            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #92400e; font-size: 14px; margin: 0;">
                <strong>Account Details:</strong><br/>
                📧 Email: ${userEmail}<br/>
                📅 Created: ${currentDate}
              </p>
            </div>

            <p style="color: #047857; font-size: 18px; font-weight: bold; text-align: center; margin: 30px 0 20px 0;">
              Here's to a healthier, happier you! 🌟
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 5px 0;">Warm regards,</p>
            <p style="margin: 5px 0; font-weight: bold;">The Resilio Team</p>
            <p style="margin: 15px 0 5px 0; font-size: 11px;">This email was sent because you created a new account on Resilio.</p>
          </div>
        </div>
      `,
    });

    console.log('✅ Welcome email sent successfully to:', userEmail);
    console.log('📬 Message ID:', info.messageId);
    return { success: true, mode: 'sent', data: { messageId: info.messageId } };
  } catch (error: any) {
    console.error('❌ Error sending welcome email via SMTP:', error);
    throw error;
  }
}

// Send Login Notification Email
export async function sendLoginEmail(
  userEmail: string,
  userName: string,
  loginTime: string
) {
  console.log('📧 Sending login notification email to:', userEmail);

  const smtpHost = Deno.env.get('SMTP_HOST');
  const smtpPort = Deno.env.get('SMTP_PORT');
  const smtpUser = Deno.env.get('SMTP_USER');
  const smtpPassword = Deno.env.get('SMTP_PASSWORD');
  const smtpFrom = Deno.env.get('SMTP_FROM') || smtpUser;

  if (!smtpHost || !smtpUser || !smtpPassword) {
    console.log('⚠️ SMTP not configured - Email will be logged only');
    console.log('📧 ===== LOGIN NOTIFICATION EMAIL =====');
    console.log(`📬 To: ${userEmail}`);
    console.log(`👤 Name: ${userName}`);
    console.log(`🕐 Time: ${loginTime}`);
    console.log('======================================');
    return { success: true, mode: 'console-log', data: { id: `demo-${Date.now()}` } };
  }

  try {
    const nodemailer = await import('npm:nodemailer@6.9.7');

    const transporter = nodemailer.default.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort || '587'),
      secure: smtpPort === '465',
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    const info = await transporter.sendMail({
      from: `"Resilio" <${smtpFrom}>`,
      to: userEmail,
      subject: '🔐 Login Notification - Resilio Account Access',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 40px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 32px;">🔐 Login Detected</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Your Resilio Account Was Accessed</p>
          </div>

          <div style="background-color: white; padding: 30px; margin-top: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="color: #1f2937; font-size: 18px; margin-bottom: 20px;">Dear <strong>${userName}</strong>,</p>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              We noticed you just logged into your Resilio account. <strong>Welcome back!</strong>
            </p>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; font-weight: bold; margin-top: 30px;">
              Your wellness journey continues! Here's what you can do today:
            </p>

            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <ul style="color: #047857; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>✍️ Journal your thoughts and feelings</li>
                <li>📊 Review your mood history and patterns</li>
                <li>📬 Check any scheduled future messages</li>
                <li>⏰ Review your upcoming reminders</li>
                <li>🍎 Update your meal plans and track nutrition</li>
                <li>🎮 Take a mindfulness break with our games</li>
                <li>💬 Chat with Care Buddy for support and guidance</li>
              </ul>
            </div>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              We're glad to have you back and hope you make the most of your time on Resilio today.
            </p>

            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #ef4444;">
              <p style="color: #991b1b; font-size: 15px; margin: 0 0 10px 0; font-weight: bold;">🔒 Security Notice:</p>
              <p style="color: #7f1d1d; font-size: 14px; margin: 0; line-height: 1.6;">
                If this login wasn't you, please secure your account immediately by:
              </p>
              <ul style="color: #7f1d1d; font-size: 14px; line-height: 1.8; margin: 10px 0 0 0; padding-left: 20px;">
                <li>Changing your password</li>
                <li>Reviewing your account activity</li>
                <li>Contacting our support team</li>
              </ul>
            </div>

            <p style="color: #047857; font-size: 18px; font-weight: bold; text-align: center; margin: 30px 0 20px 0;">
              Stay well and take care! 🌟
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 5px 0;">Best regards,</p>
            <p style="margin: 5px 0; font-weight: bold;">The Resilio Team</p>
            <p style="margin: 15px 0 5px 0; font-size: 11px;">This is an automated login notification email.</p>
            <p style="margin: 5px 0; font-size: 11px;">For your security, we notify you of all account logins.</p>
          </div>
        </div>
      `,
    });

    console.log('✅ Login email sent successfully to:', userEmail);
    console.log('📬 Message ID:', info.messageId);
    return { success: true, mode: 'sent', data: { messageId: info.messageId } };
  } catch (error: any) {
    console.error('❌ Error sending login email via SMTP:', error);
    throw error;
  }
}
