// Simple Email System - No External Dependencies
// Logs to console for testing, can be upgraded later

export async function sendFutureMessageEmail(
  userEmail?: string,
  message?: string,
  scheduledDate?: string,
  userName?: string
) {
  console.log('\n📧 ===== FUTURE MESSAGE EMAIL =====');
  console.log(`📬 To: ${userEmail || 'No email provided'}`);
  console.log(`👤 Name: ${userName || 'User'}`);
  console.log(`📅 Scheduled Date: ${scheduledDate}`);
  console.log(`💌 Message Preview: ${message?.substring(0, 100)}${message && message.length > 100 ? '...' : ''}`);
  console.log('=====================================\n');
  
  return { 
    success: true, 
    mode: 'console-log',
    message: 'Email logged to console (demo mode)',
    emailId: `demo-${Date.now()}`
  };
}

export async function sendReminderEmail(
  userEmail?: string,
  task?: string,
  scheduledDate?: string,
  scheduledTime?: string,
  userName?: string
) {
  console.log('\n📧 ===== REMINDER EMAIL =====');
  console.log(`📬 To: ${userEmail || 'No email provided'}`);
  console.log(`👤 Name: ${userName || 'User'}`);
  console.log(`⏰ Task: ${task}`);
  console.log(`📅 Date: ${scheduledDate}`);
  console.log(`🕐 Time: ${scheduledTime}`);
  console.log('============================\n');
  
  return { 
    success: true, 
    mode: 'console-log',
    message: 'Email logged to console (demo mode)',
    emailId: `demo-${Date.now()}`
  };
}

export async function sendPasswordResetEmail(
  userEmail: string,
  resetLink: string,
  userName?: string
) {
  console.log('\n📧 ===== PASSWORD RESET EMAIL =====');
  console.log(`📬 To: ${userEmail}`);
  console.log(`👤 Name: ${userName || 'User'}`);
  console.log(`🔗 Reset Link: ${resetLink}`);
  console.log('===================================\n');
  
  return { 
    success: true, 
    mode: 'console-log',
    message: 'Email logged to console (demo mode)',
    emailId: `demo-${Date.now()}`
  };
}
