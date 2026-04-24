import { Context } from 'npm:hono';
import { processPendingEmails, retryFailedEmails } from './email_queue.tsx';

// Check and send scheduled emails (uses email queue system)
export async function checkAndSendScheduledEmails(c: Context) {
  try {
    console.log('🔍 Processing email queue...');
    console.log(`🔑 Environment check - SMTP_PASSWORD: ${Deno.env.get('SMTP_PASSWORD') ? '✅ Set' : '❌ Not set'}`);
    
    // Check if SMTP is configured
    if (!Deno.env.get('SMTP_PASSWORD')) {
      const errorMsg = 'SMTP_PASSWORD not configured. Please set SMTP_PASSWORD in Edge Function secrets.';
      console.error(`❌ ${errorMsg}`);
      return c.json({
        success: false,
        error: errorMsg,
        timestamp: new Date().toISOString(),
      }, 500);
    }
    
    // Process pending emails from queue
    const queueResult = await processPendingEmails();
    console.log(`📊 Queue processed: ${queueResult.sent} sent, ${queueResult.failed} failed`);
    
    // Retry failed emails (max 3 retries)
    const retryResult = await retryFailedEmails(3);
    console.log(`🔄 Retried ${retryResult.retried} failed emails`);
    
    const results = {
      queueProcessed: queueResult.processed,
      queueSent: queueResult.sent,
      queueFailed: queueResult.failed,
      retriedEmails: retryResult.retried,
      message: queueResult.message,
    };

    console.log(`✅ Email queue processing complete`);

    return c.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Scheduler error:', error);
    return c.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, 500);
  }
}
