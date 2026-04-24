/**
 * Dedicated Email Processor Edge Function
 * This runs independently and processes the email queue
 * Can be invoked by Supabase Database Webhooks or Scheduled Functions
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js';
import { sendFutureMessageEmail, sendReminderEmail, sendDietEmail, sendMealEmail } from './email_nodemailer.tsx';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  try {
    console.log('🔄 Email Processor Started');
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const now = new Date();
    
    // Get ALL pending emails that are due (no time window restriction)
    // Emails will be sent regardless of how late they are
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', now.toISOString()) // Just check if scheduled time has passed
      .order('scheduled_for', { ascending: true })
      .limit(50);

    if (fetchError) {
      console.error('❌ Error fetching pending emails:', fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      console.log('✅ No pending emails to process');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No pending emails',
        processed: 0
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`📧 Found ${pendingEmails.length} pending emails to process`);

    let sentCount = 0;
    let failedCount = 0;

    for (const email of pendingEmails) {
      try {
        // Mark as processing
        await supabase
          .from('email_queue')
          .update({ status: 'processing' })
          .eq('id', email.id);

        console.log(`📤 Processing email: ${email.id} (${email.email_type})`);

        // Send email based on type
        let result;
        if (email.email_type === 'future_message') {
          const scheduledDate = email.metadata?.scheduledDate || new Date(email.scheduled_for).toLocaleDateString();
          result = await sendFutureMessageEmail(
            email.user_email,
            email.message_content,
            scheduledDate,
            email.user_name || 'there'
          );
        } else if (email.email_type === 'reminder') {
          const scheduledDate = email.metadata?.scheduledDate || new Date(email.scheduled_for).toLocaleDateString();
          const scheduledTime = email.metadata?.scheduledTime || new Date(email.scheduled_for).toLocaleTimeString();
          result = await sendReminderEmail(
            email.user_email,
            email.message_content,
            scheduledDate,
            scheduledTime,
            email.user_name || 'there'
          );
        } else if (email.email_type === 'diet_plan') {
          const metadata = email.metadata || {};
          result = await sendDietEmail(
            email.user_email,
            metadata.foodItems || [],
            metadata.totalCalories || 0,
            metadata.totalProtein || 0,
            metadata.totalCarbs || 0,
            metadata.totalFats || 0,
            metadata.scheduledDate || '',
            metadata.scheduledTime || '',
            metadata.timeline || '',
            email.user_name || 'there'
          );
        } else if (email.email_type === 'meal_plan') {
          const metadata = email.metadata || {};
          result = await sendMealEmail(
            email.user_email,
            metadata.mealType || 'Meal',
            metadata.mealDescription || '',
            metadata.mealItems || '',
            metadata.scheduledDate || '',
            metadata.scheduledTime || '',
            email.user_name || 'there'
          );
        } else {
          throw new Error(`Unknown email type: ${email.email_type}`);
        }

        // Mark as sent
        await supabase
          .from('email_queue')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', email.id);

        sentCount++;
        console.log(`✅ Email sent: ${email.id}`);
      } catch (error: any) {
        // Mark as failed
        await supabase
          .from('email_queue')
          .update({ 
            status: 'failed',
            error_message: error.message,
            retry_count: (email.retry_count || 0) + 1
          })
          .eq('id', email.id);

        failedCount++;
        console.error(`❌ Failed to send email ${email.id}:`, error.message);
      }
    }

    console.log(`✅ Processing complete: ${sentCount} sent, ${failedCount} failed`);

    return new Response(JSON.stringify({
      success: true,
      processed: pendingEmails.length,
      sent: sentCount,
      failed: failedCount,
      message: `Processed ${pendingEmails.length} emails: ${sentCount} sent, ${failedCount} failed`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('❌ Email processor error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});