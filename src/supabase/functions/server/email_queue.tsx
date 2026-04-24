/**
 * Email Queue Manager
 * Manages background email jobs using database queue system
 */

import { createClient } from 'npm:@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration for email queue');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface EmailJob {
  userId: string;
  userEmail: string;
  userName?: string;
  emailType: 'future_message' | 'reminder' | 'diet_plan' | 'meal_plan';
  subject: string;
  messageContent: string;
  scheduledFor: Date;
  metadata?: Record<string, any>;
}

/**
 * Add email to queue for scheduled delivery
 */
export async function enqueueEmail(job: EmailJob) {
  try {
    const scheduledISO = job.scheduledFor.toISOString();
    
    const { data, error } = await supabase
      .from('email_queue')
      .insert({
        user_id: job.userId,
        user_email: job.userEmail,
        user_name: job.userName,
        email_type: job.emailType,
        subject: job.subject,
        message_content: job.messageContent,
        scheduled_for: scheduledISO,
        metadata: job.metadata || {},
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error enqueueing email:', error);
      throw new Error(`Failed to enqueue email: ${error.message}`);
    }

    console.log(`✅ Email queued: ${data.id}`);
    console.log(`   📅 Scheduled for: ${scheduledISO}`);
    console.log(`   📧 Type: ${job.emailType}`);
    console.log(`   👤 To: ${job.userEmail}`);
    
    return { success: true, jobId: data.id };
  } catch (error: any) {
    console.error('❌ Error in enqueueEmail:', error);
    throw error;
  }
}

/**
 * Cancel a scheduled email
 */
export async function cancelEmail(jobId: string) {
  try {
    const { error } = await supabase
      .from('email_queue')
      .delete()
      .eq('id', jobId)
      .in('status', ['pending', 'failed']);

    if (error) {
      console.error('❌ Error canceling email:', error);
      throw new Error(`Failed to cancel email: ${error.message}`);
    }

    console.log(`✅ Email canceled: ${jobId}`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error in cancelEmail:', error);
    throw error;
  }
}

/**
 * Get email queue status for a user
 */
export async function getUserEmailQueue(userId: string) {
  try {
    const { data, error } = await supabase
      .from('email_queue')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_for', { ascending: true });

    if (error) {
      console.error('❌ Error fetching user email queue:', error);
      throw new Error(`Failed to fetch email queue: ${error.message}`);
    }

    return { success: true, emails: data };
  } catch (error: any) {
    console.error('❌ Error in getUserEmailQueue:', error);
    throw error;
  }
}

/**
 * Process pending emails (called by cron or manually)
 */
export async function processPendingEmails() {
  try {
    const now = new Date();
    const nowISO = now.toISOString();
    
    console.log('🔄 Processing pending emails...');
    console.log(`   ⏰ Current time: ${nowISO}`);

    // Get pending emails that are due
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', nowISO)
      .order('scheduled_for', { ascending: true })
      .limit(50);

    if (fetchError) {
      throw new Error(`Failed to fetch pending emails: ${fetchError.message}`);
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      console.log('✅ No pending emails to process');
      
      // Also check if there are any pending emails at all (for debugging)
      const { data: allPending } = await supabase
        .from('email_queue')
        .select('id, scheduled_for, email_type')
        .eq('status', 'pending')
        .order('scheduled_for', { ascending: true })
        .limit(5);
      
      if (allPending && allPending.length > 0) {
        console.log(`   ℹ️ ${allPending.length} pending emails exist but not due yet:`);
        allPending.forEach(e => {
          const scheduledDate = new Date(e.scheduled_for);
          const diffMs = scheduledDate.getTime() - now.getTime();
          const diffMins = Math.round(diffMs / 60000);
          console.log(`      - ${e.email_type} scheduled for ${e.scheduled_for} (${diffMins} minutes from now)`);
        });
      }
      
      return { 
        success: true, 
        processed: 0, 
        sent: 0, 
        failed: 0,
        message: 'No pending emails'
      };
    }

    console.log(`📧 Found ${pendingEmails.length} pending emails to process`);
    pendingEmails.forEach(e => {
      console.log(`   - ${e.email_type} to ${e.user_email} (scheduled: ${e.scheduled_for})`);
    });

    let sentCount = 0;
    let failedCount = 0;

    // Import email functions
    const { sendFutureMessageEmail, sendReminderEmail, sendDietEmail, sendMealEmail } = await import('./email_nodemailer.tsx');

    for (const email of pendingEmails) {
      try {
        console.log(`📤 Processing email ${email.id}...`);
        
        // Mark as processing
        await supabase
          .from('email_queue')
          .update({ status: 'processing' })
          .eq('id', email.id);

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
          
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('🍎 DIET PLAN EMAIL DETECTED!');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('📧 Email ID:', email.id);
          console.log('👤 To:', email.user_email);
          console.log('📋 Metadata:');
          console.log('   mealType:', metadata.mealType);
          console.log('   description:', metadata.description);
          console.log('   foodName:', metadata.foodName);
          console.log('   foodItems (type):', typeof metadata.foodItems);
          console.log('   foodItems (value):', metadata.foodItems);
          console.log('   calories:', metadata.calories);
          console.log('   protein:', metadata.protein);
          console.log('   carbs:', metadata.carbs);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          
          // 🔥🔥🔥 SUPER CRITICAL FIX: Check if this is actually a meal planner item
          // Meal planner items have: calories === 0 AND foodItems as STRING (not array)
          // Food database items have: calories > 0 OR foodItems as array
          const isMealPlannerEmail = (
            metadata.calories === 0 && 
            metadata.foodItems && 
            typeof metadata.foodItems === 'string' &&
            metadata.description
          );
          
          console.log('🔍 DETECTION RESULT:', {
            isMealPlannerEmail,
            reason: isMealPlannerEmail 
              ? 'Has calories=0 + foodItems string + description → MEAL PLANNER'
              : 'Has nutritional data or foodItems array → DIET PLAN'
          });
          
          if (isMealPlannerEmail) {
            console.log('🔥🔥🔥 REDIRECTING TO MEAL EMAIL TEMPLATE! 🔥🔥🔥');
            result = await sendMealEmail(
              email.user_email,
              metadata.mealType || 'Meal',
              metadata.description || '',
              metadata.foodItems || '',
              metadata.scheduledDate || '',
              metadata.scheduledTime || '',
              email.user_name || 'there',
              email.created_at || new Date().toISOString()
            );
          } else {
            console.log('📊 Sending DIET template with nutritional info...');
            // Regular diet_plan with nutritional info
            // 🔥 FIX: Convert single food metadata to array format for email template
            let foodItems = metadata.foodItems || [];
            
            // If no foodItems array but we have individual food data, create array
            if (foodItems.length === 0 && metadata.foodName) {
              foodItems = [{
                name: metadata.foodName,
                calories: metadata.calories || 0,
                protein: metadata.protein || 0,
                carbs: metadata.carbs || 0,
                category: metadata.mealType || 'Custom'
              }];
            }
            
            result = await sendDietEmail(
              email.user_email,
              foodItems,
              metadata.totalCalories || metadata.calories || 0,
              metadata.totalProtein || metadata.protein || 0,
              metadata.totalCarbs || metadata.carbs || 0,
              metadata.totalFats || 0,
              metadata.scheduledDate || '',
              metadata.scheduledTime || '',
              metadata.timeline || 'N/A',
              email.user_name || 'there'
            );
          }
        } else if (email.email_type === 'meal_plan') {
          const metadata = email.metadata || {};
          
          // 🔥🔥🔥 SUPER DETAILED LOGGING
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('🍽️ MEAL PLAN EMAIL DETECTED!');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('📧 Email ID:', email.id);
          console.log('👤 To:', email.user_email);
          console.log('📋 Metadata:');
          console.log('   mealType:', metadata.mealType);
          console.log('   description:', metadata.description);
          console.log('   foodItems:', metadata.foodItems);
          console.log('   scheduledDate:', metadata.scheduledDate);
          console.log('   scheduledTime:', metadata.scheduledTime);
          console.log('   calories:', metadata.calories);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          
          result = await sendMealEmail(
            email.user_email,
            metadata.mealType || 'Meal',
            metadata.description || '',
            metadata.foodItems || '',
            metadata.scheduledDate || '',
            metadata.scheduledTime || '',
            email.user_name || 'there',
            email.created_at || new Date().toISOString()
          );
          
          console.log('✅ sendMealEmail called successfully!');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
        console.log(`✅ Email sent successfully: ${email.id}`);
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

    return {
      success: true,
      processed: pendingEmails.length,
      sent: sentCount,
      failed: failedCount,
      message: `Processed ${pendingEmails.length} emails`
    };
  } catch (error: any) {
    console.error('❌ Error processing pending emails:', error);
    throw error;
  }
}

/**
 * Retry failed emails
 */
export async function retryFailedEmails(maxRetries = 3) {
  try {
    console.log('🔄 Retrying failed emails...');

    // Get failed emails with retry count less than max
    const { data: failedEmails, error } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'failed')
      .lt('retry_count', maxRetries)
      .limit(10);

    if (error) {
      throw new Error(`Failed to fetch failed emails: ${error.message}`);
    }

    if (!failedEmails || failedEmails.length === 0) {
      console.log('✅ No failed emails to retry');
      return { success: true, retried: 0 };
    }

    // Reset status to pending for retry
    const ids = failedEmails.map(e => e.id);
    const { error: updateError } = await supabase
      .from('email_queue')
      .update({ status: 'pending' })
      .in('id', ids);

    if (updateError) {
      throw new Error(`Failed to update failed emails: ${updateError.message}`);
    }

    console.log(`✅ Reset ${failedEmails.length} failed emails to pending for retry`);

    return { success: true, retried: failedEmails.length };
  } catch (error: any) {
    console.error('❌ Error retrying failed emails:', error);
    throw error;
  }
}