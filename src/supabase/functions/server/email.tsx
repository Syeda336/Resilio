import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Export email functions
export async function sendFutureMessageEmail(userEmail? : string, message: string, scheduledDate: string, userName?: string) {
  console.log('📧 Sending future message email to:', userEmail);
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer re_3Uqxhhrc_Ky85M8UfgoVupVtAfLLxSRra',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to: userEmail, // Use the provided email address
      subject: `📬 Future Self Message - Scheduled for ${scheduledDate}`,
      html: `
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
      `,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('❌ Resend API Error Response:', data);
    throw new Error(data.message || `Resend API error: ${response.status}`);
  }

  console.log('✅ Email sent successfully via Resend to:', userEmail);
  console.log('📬 Email ID:', data.id);
  return { success: true, mode: 'sent', data };
}

export async function sendReminderEmail(userEmail? : string, task: string, scheduledDate: string, scheduledTime: string, userName?: string) {
  console.log('📧 Sending reminder email to:', userEmail);
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer re_3Uqxhhrc_Ky85M8UfgoVupVtAfLLxSRra',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to: userEmail, // Use the provided email address
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
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('❌ Resend API Error Response:', data);
    throw new Error(data.message || `Resend API error: ${response.status}`);
  }

  console.log('✅ Email sent successfully via Resend to:', userEmail);
  console.log('📬 Email ID:', data.id);
  return { success: true, mode: 'sent', data };
}

export async function sendPasswordResetEmail(userEmail: string, resetLink: string, userName?: string) {
  console.log('📧 Sending password reset email to:', userEmail);
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer re_3Uqxhhrc_Ky85M8UfgoVupVtAfLLxSRra',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
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
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('❌ Resend API Error Response:', data);
    throw new Error(data.message || `Resend API error: ${response.status}`);
  }

  console.log('✅ Password reset email sent successfully via Resend to:', userEmail);
  console.log('📬 Email ID:', data.id);
  return { success: true, mode: 'sent', data };
}

// Send diet food items email
export async function sendDietEmail(
  userEmail?: string,
  foodItems?: Array<{ name: string; calories: number; category: string }>,
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
  
  // Create food items list HTML
  const foodListHtml = foodItems?.map(item => 
    `<li style="padding: 10px; background-color: #f9fafb; margin: 5px 0; border-radius: 5px;">
      <strong>${item.name}</strong> - ${item.calories} cal (${item.category})
    </li>`
  ).join('');
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer re_3Uqxhhrc_Ky85M8UfgoVupVtAfLLxSRra',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
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
                <tr>
                  <td style="padding: 8px; color: #4b5563;">Total Fats:</td>
                  <td style="padding: 8px; text-align: right; font-weight: bold; color: #1f2937;">${totalFats?.toFixed(1)}g</td>
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
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('❌ Resend API Error Response:', data);
    throw new Error(data.message || `Resend API error: ${response.status}`);
  }

  console.log('✅ Diet email sent successfully via Resend to:', userEmail);
  console.log('📬 Email ID:', data.id);
  return { success: true, mode: 'sent', data };
}

// Send meal plan email
export async function sendMealEmail(
  userEmail?: string,
  mealType?: string,
  mealDescription?: string,
  mealItems?: string,
  scheduledDate?: string,
  scheduledTime?: string,
  userName?: string
) {
  console.log('📧 Sending meal email to:', userEmail);
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer re_3Uqxhhrc_Ky85M8UfgoVupVtAfLLxSRra',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
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
              <h3 style="color: #1f2937; margin: 0 0 15px 0;">🍽️ Meal Plan:</h3>
              <p style="color: #4b5563; margin: 0; line-height: 1.6; white-space: pre-wrap;">
                ${mealDescription}
              </p>
            </div>
            
            ${mealItems ? `
              <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #059669; margin: 0 0 15px 0;">📋 Food Items:</h3>
                <p style="color: #4b5563; margin: 0; line-height: 1.6; white-space: pre-wrap;">
                  ${mealItems}
                </p>
              </div>
            ` : ''}

            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="color: #4b5563; margin: 0; font-size: 14px;">
                📅 <strong>Scheduled for:</strong> ${new Date(scheduledDate + 'T' + scheduledTime).toLocaleString()}
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
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('❌ Resend API Error Response:', data);
    throw new Error(data.message || `Resend API error: ${response.status}`);
  }

  console.log('✅ Meal email sent successfully via Resend to:', userEmail);
  console.log('📬 Email ID:', data.id);
  return { success: true, mode: 'sent', data };
}