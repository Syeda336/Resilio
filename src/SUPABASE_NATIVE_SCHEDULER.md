# 📧 Supabase Native Email Scheduler (No External Cron!)

## 🎯 **Pure Supabase Solution - No External Services Needed!**

This implementation uses **Supabase's built-in features** to schedule and send emails without any external cron job services.

---

## 🏗️ **Architecture**

### **Option 1: Database Webhooks (Recommended ✅)**

```
Email Queued → Database Trigger → Supabase Webhook → Edge Function → Email Sent
```

**Pros:**
- ✅ No external services needed
- ✅ Real-time processing
- ✅ Native to Supabase
- ✅ Easy to set up

**Cons:**
- ⚠️ Processes on INSERT (not time-based)
- ⚠️ Need workaround for scheduled times

### **Option 2: Supabase Scheduled Functions (Beta)**

```
Schedule → Supabase Function → Process Queue → Email Sent
```

**Pros:**
- ✅ True scheduled execution
- ✅ No database triggers needed

**Cons:**
- ⚠️ Currently in Beta
- ⚠️ Limited availability

### **Option 3: Self-Triggering Edge Function (Smart)**

```
User Action → Queue Email → Trigger Edge Function with Delay → Email Sent at Right Time
```

**Pros:**
- ✅ No cron needed
- ✅ Precise timing

**Cons:**
- ⚠️ Edge function must stay alive (or re-trigger itself)

---

## 🚀 **Implementation: Database Webhooks (Best for Now)**

### **Step 1: Enable Database Webhooks in Supabase**

1. Go to **Supabase Dashboard** → Your Project
2. Click **Database** → **Webhooks** (in sidebar)
3. Click **Create a new hook**
4. Configure:
   - **Name:** `email-queue-processor`
   - **Table:** `email_queue`
   - **Events:** `INSERT`, `UPDATE`
   - **Type:** `HTTP Request`
   - **HTTP Request:**
     - **Method:** POST
     - **URL:** `https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/email-processor`
     - **Headers:** 
       ```json
       {
         "Content-Type": "application/json",
         "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"
       }
       ```
5. Click **Create webhook**

### **Step 2: Create the Processor Edge Function**

File already created: `/supabase/functions/server/email_processor.tsx`

This function:
- Listens for webhook calls
- Checks for emails due NOW
- Sends emails
- Updates status in database

### **Step 3: Deploy the Edge Function**

```bash
# Deploy email processor
supabase functions deploy email-processor --project-ref jcbtczjhqdyuoyctjcbl
```

---

## 🔧 **Alternative: Self-Scheduling System**

A smarter approach that doesn't require webhooks or external cron:

### **How It Works:**

1. **User queues email** for future date/time
2. **Backend calculates delay** (scheduledTime - now)
3. **If delay < 24 hours:** Schedule in-memory with setTimeout
4. **If delay > 24 hours:** Store in DB, check daily

### **Implementation:**

Update `/supabase/functions/server/email_queue.tsx`:

```typescript
export async function enqueueEmail(job: EmailJob) {
  try {
    // Insert into database
    const { data, error } = await supabase
      .from('email_queue')
      .insert({...})
      .select()
      .single();

    // Calculate delay
    const delay = new Date(job.scheduledFor).getTime() - Date.now();
    
    // If email is due within 24 hours, schedule it now
    if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
      scheduleEmailDelivery(data.id, delay);
    }
    
    return { success: true, jobId: data.id };
  } catch (error: any) {
    console.error('❌ Error enqueueing email:', error);
    throw error;
  }
}

// In-memory scheduler
const scheduledJobs = new Map<string, any>();

function scheduleEmailDelivery(emailId: string, delayMs: number) {
  console.log(`⏰ Scheduling email ${emailId} for delivery in ${delayMs}ms`);
  
  const timeoutId = setTimeout(async () => {
    try {
      await sendQueuedEmail(emailId);
      scheduledJobs.delete(emailId);
    } catch (error) {
      console.error(`Failed to send scheduled email ${emailId}:`, error);
    }
  }, delayMs);
  
  scheduledJobs.set(emailId, timeoutId);
}

async function sendQueuedEmail(emailId: string) {
  // Fetch email from database
  const { data: email } = await supabase
    .from('email_queue')
    .select('*')
    .eq('id', emailId)
    .single();
  
  if (!email || email.status !== 'pending') return;
  
  // Send email based on type
  // ... (same logic as email_processor.tsx)
}
```

**Problem with this approach:**
- ❌ Edge Functions have max execution time (doesn't work for long delays)
- ❌ Function restarts lose in-memory timers

---

## ✅ **Recommended Solution: Hybrid Approach**

Combine database webhooks + periodic check:

### **1. Database Function (Runs every minute automatically)**

Create this in **Supabase SQL Editor**:

```sql
-- Create a function to process due emails
CREATE OR REPLACE FUNCTION process_due_emails()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_email record;
  v_count int := 0;
BEGIN
  -- Get emails that are due now
  FOR v_email IN 
    SELECT * FROM email_queue
    WHERE status = 'pending'
    AND scheduled_for <= now()
    ORDER BY scheduled_for ASC
    LIMIT 10
  LOOP
    -- Mark as processing
    UPDATE email_queue
    SET status = 'processing'
    WHERE id = v_email.id;
    
    -- Call edge function via pg_net (HTTP request)
    PERFORM net.http_post(
      url := 'https://jcbtczjhqdyuoyctjcbl.supabase.co/functions/v1/make-server-40d4d8fd/email/send-single',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('request.jwt.claims', true)::json->>'sub'
      ),
      body := to_jsonb(v_email)
    );
    
    v_count := v_count + 1;
  END LOOP;
  
  RAISE NOTICE 'Processed % emails', v_count;
END;
$$;
```

### **2. Create Periodic Trigger**

Use a "heartbeat" table that updates every minute:

```sql
-- Create heartbeat table
CREATE TABLE IF NOT EXISTS email_heartbeat (
  id serial PRIMARY KEY,
  last_beat timestamptz DEFAULT now()
);

-- Insert initial row
INSERT INTO email_heartbeat (last_beat) VALUES (now());

-- Create function to update heartbeat and process emails
CREATE OR REPLACE FUNCTION heartbeat_and_process()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update heartbeat
  NEW.last_beat := now();
  
  -- Process due emails
  PERFORM process_due_emails();
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER trigger_heartbeat_process
  BEFORE UPDATE ON email_heartbeat
  FOR EACH ROW
  EXECUTE FUNCTION heartbeat_and_process();
```

### **3. Auto-Update Heartbeat (Client-Side)**

Add this to `/App.tsx`:

```typescript
// Auto-trigger email processing every 5 minutes
useEffect(() => {
  const interval = setInterval(async () => {
    try {
      // Update heartbeat to trigger email processing
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/heartbeat`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        }
      );
      console.log('📧 Email processing triggered');
    } catch (error) {
      console.error('Heartbeat error:', error);
    }
  }, 5 * 60 * 1000); // Every 5 minutes

  return () => clearInterval(interval);
}, []);
```

---

## 🎯 **SIMPLEST SOLUTION: Frontend Polling**

The easiest way without any setup:

### **Add to `/App.tsx`:**

```typescript
// Automatically check and process emails every 5 minutes
useEffect(() => {
  const processEmails = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/email/process-queue`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        }
      );
      
      const result = await response.json();
      if (result.sent > 0) {
        console.log(`📧 Processed ${result.sent} emails`);
      }
    } catch (error) {
      console.error('Email processing error:', error);
    }
  };
  
  // Process immediately on load
  if (accessToken) {
    processEmails();
  }
  
  // Then every 5 minutes
  const interval = setInterval(() => {
    if (accessToken) {
      processEmails();
    }
  }, 5 * 60 * 1000);
  
  return () => clearInterval(interval);
}, [accessToken]);
```

**Pros:**
- ✅ No setup required
- ✅ Works immediately
- ✅ No database changes needed

**Cons:**
- ⚠️ Only works when user has app open
- ⚠️ Multiple users = multiple triggers (but that's fine, idempotent)

---

## 🏆 **Final Recommendation**

Use **Frontend Polling** for now because:

1. ✅ **Zero setup** - Just add code to App.tsx
2. ✅ **Works immediately** - No Supabase config needed
3. ✅ **Reliable** - As long as ANY user has app open, emails process
4. ✅ **Simple** - Easy to understand and debug

Later, you can upgrade to:
- Database Webhooks (when available)
- Supabase Scheduled Functions (when out of beta)
- External cron (if needed)

---

## 📝 **Implementation Steps**

1. ✅ Email queue system already implemented
2. ✅ Backend endpoints already use queue
3. ✅ Email processor function already exists
4. ⚠️ **Next:** Add frontend polling to `/App.tsx`
5. ✅ **Done!** No external services needed!

---

**Implementation Time:** 5 minutes (just update App.tsx)  
**External Dependencies:** None!  
**Maintenance:** Zero  
**Cost:** Free  
**Reliability:** High (works when any user is online)

---

**Status:** ✅ Ready to implement  
**Recommended:** Frontend Polling Approach
