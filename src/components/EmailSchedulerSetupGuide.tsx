import React, { useState } from 'react';
import { X, CheckCircle, Clock, Database, Mail, Copy, Check, ExternalLink, AlertCircle } from 'lucide-react';

interface EmailSchedulerSetupGuideProps {
  onClose: () => void;
}

export function EmailSchedulerSetupGuide({ onClose }: EmailSchedulerSetupGuideProps) {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [copiedSimpleSQL, setCopiedSimpleSQL] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [setupMode, setSetupMode] = useState<'simple' | 'secure'>('simple');

  const projectId = 'jcbtczjhqdyuoyctjcbl';
  
  const sqlCode = `-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Grant permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Create email scheduler (REPLACE ${apiKey || 'YOUR_CRON_API_KEY'}!)
SELECT cron.schedule(
    'resilio-email-scheduler',
    '*/5 * * * *',
    $$
    SELECT net.http_post(
        url := 'https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=${apiKey || 'YOUR_CRON_API_KEY'}',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := '{}'::jsonb
    ) as request_id;
    $$
);

-- Verify
SELECT * FROM cron.job;`;

  const simpleSQLCode = `-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Grant permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Create email scheduler (REPLACE ${apiKey || 'YOUR_CRON_API_KEY'}!)
SELECT cron.schedule(
    'resilio-email-scheduler',
    '*/5 * * * *',
    $$
    SELECT net.http_post(
        url := 'https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/cron/check-scheduled-emails?api_key=${apiKey || 'YOUR_CRON_API_KEY'}',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := '{}'::jsonb
    ) as request_id;
    $$
);

-- Verify
SELECT * FROM cron.job;`;

  const verifySQL = `SELECT 
    start_time, 
    status, 
    return_message 
FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 5;`;

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">⚡ Email Scheduler Setup</h2>
              <p className="text-purple-100">No external cron needed - Pure Supabase solution!</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="size-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <CheckCircle className="size-8 text-green-600 mb-2" />
              <h3 className="font-semibold text-green-900 mb-1">Automatic</h3>
              <p className="text-sm text-green-700">Runs 24/7 inside Supabase</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Clock className="size-8 text-blue-600 mb-2" />
              <h3 className="font-semibold text-blue-900 mb-1">Every 5 Minutes</h3>
              <p className="text-sm text-blue-700">Emails delivered on time</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <Database className="size-8 text-purple-600 mb-2" />
              <h3 className="font-semibold text-purple-900 mb-1">No External Service</h3>
              <p className="text-sm text-purple-700">Pure PostgreSQL pg_cron</p>
            </div>
          </div>

          {/* Step 1 */}
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-600 text-white size-8 rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900">Get Your CRON_API_KEY</h3>
            </div>
            
            <ol className="space-y-2 mb-4 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="font-semibold min-w-[24px]">1.</span>
                <span>Open <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline inline-flex items-center gap-1">
                  Supabase Dashboard <ExternalLink className="size-3" />
                </a></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold min-w-[24px]">2.</span>
                <span>Navigate: <code className="bg-white px-2 py-1 rounded text-sm border">Edge Functions → make-server-40d4d8fd → Settings → Secrets</code></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold min-w-[24px]">3.</span>
                <span>Find <code className="bg-white px-2 py-1 rounded text-sm border font-semibold">CRON_API_KEY</code> and copy its value</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold min-w-[24px]">4.</span>
                <span>
                  <strong>If it doesn't exist:</strong> Click "Add new secret" → 
                  Name: <code className="bg-white px-2 py-1 rounded text-sm border">CRON_API_KEY</code> → 
                  Value: <code className="bg-white px-2 py-1 rounded text-sm border">resilio-cron-2026-secure</code>
                </span>
              </li>
            </ol>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Paste Your API Key Here (Optional - helps generate SQL):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="resilio-cron-2026-secure"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {apiKey && (
                  <button
                    onClick={() => copyToClipboard(apiKey, setCopiedKey)}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2"
                  >
                    {copiedKey ? (
                      <>
                        <Check className="size-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="size-4" />
                        Copy
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-600 text-white size-8 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900">Run SQL Setup</h3>
            </div>

            <ol className="space-y-2 mb-4 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="font-semibold min-w-[24px]">1.</span>
                <span>Go to: <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline inline-flex items-center gap-1">
                  Supabase Dashboard <ExternalLink className="size-3" />
                </a> → <code className="bg-white px-2 py-1 rounded text-sm border">SQL Editor</code></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold min-w-[24px]">2.</span>
                <span>Click <strong>"New Query"</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold min-w-[24px]">3.</span>
                <span>Copy the SQL code below and paste it</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold min-w-[24px]">4.</span>
                <span>
                  {apiKey ? (
                    <span className="text-green-600 font-semibold">✓ API key already included!</span>
                  ) : (
                    <span className="text-amber-600 font-semibold">⚠️ Replace YOUR_CRON_API_KEY with your actual key</span>
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold min-w-[24px]">5.</span>
                <span>Click <strong>"Run"</strong></span>
              </li>
            </ol>

            <div className="bg-gray-900 rounded-lg p-4 relative">
              <button
                onClick={() => copyToClipboard(sqlCode, setCopiedSQL)}
                className="absolute top-4 right-4 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                {copiedSQL ? (
                  <>
                    <Check className="size-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="size-4" />
                    Copy SQL
                  </>
                )}
              </button>
              <pre className="text-green-400 text-sm overflow-x-auto pr-24">
                <code>{sqlCode}</code>
              </pre>
            </div>
          </div>

          {/* Step 3 */}
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-600 text-white size-8 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900">Verify It's Working</h3>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-gray-700 mb-2">
                  <strong>Step 1:</strong> Check if job was created (run immediately in SQL Editor):
                </p>
                <div className="bg-gray-900 rounded-lg p-3">
                  <code className="text-green-400 text-sm">SELECT * FROM cron.job;</code>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Expected: You should see <code className="bg-white px-2 py-1 rounded border">resilio-email-scheduler</code> with <code className="bg-white px-2 py-1 rounded border">active = true</code>
                </p>
              </div>

              <div>
                <p className="text-gray-700 mb-2">
                  <strong>Step 2:</strong> After 5-10 minutes, check run history:
                </p>
                <div className="bg-gray-900 rounded-lg p-3">
                  <code className="text-green-400 text-sm whitespace-pre-wrap">{verifySQL}</code>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Expected: Multiple rows with <code className="bg-white px-2 py-1 rounded border">status = succeeded</code>
                </p>
              </div>

              <div>
                <p className="text-gray-700 mb-2">
                  <strong>Step 3:</strong> Check Edge Function Logs:
                </p>
                <ol className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Go to: Dashboard → Edge Functions → make-server-40d4d8fd → Logs</li>
                  <li>• Look for: <code className="bg-white px-2 py-1 rounded border">✅ External cron authenticated</code></li>
                  <li>• And: <code className="bg-white px-2 py-1 rounded border">🔄 Processing pending emails...</code></li>
                </ol>
              </div>
            </div>
          </div>

          {/* Success */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <Mail className="size-12 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-green-900 mb-2">
                  🎉 You're All Set!
                </h3>
                <p className="text-green-800 mb-3">
                  Your email scheduler is now running automatically inside Supabase! Emails will be processed every 5 minutes, 24/7.
                </p>
                <ul className="space-y-1 text-sm text-green-700">
                  <li>✓ No external cron service needed</li>
                  <li>✓ Completely automatic</li>
                  <li>✓ Frontend polling still works as backup</li>
                  <li>✓ Check status in SQL Editor anytime</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Management Commands */}
          <details className="border border-gray-200 rounded-lg p-4 bg-white">
            <summary className="font-semibold text-gray-900 cursor-pointer hover:text-purple-600">
              🔧 Management Commands (Optional)
            </summary>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="font-semibold text-gray-700">Delete Cron Job:</p>
                <code className="block bg-gray-900 text-green-400 p-2 rounded mt-1">
                  SELECT cron.unschedule('resilio-email-scheduler');
                </code>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Change to Every Minute:</p>
                <code className="block bg-gray-900 text-green-400 p-2 rounded mt-1 whitespace-pre-wrap">
{`SELECT cron.unschedule('resilio-email-scheduler');
SELECT cron.schedule('resilio-email-scheduler', '* * * * *', $$...$$ );`}
                </code>
              </div>
              <div>
                <p className="font-semibold text-gray-700">View All Runs:</p>
                <code className="block bg-gray-900 text-green-400 p-2 rounded mt-1">
                  SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
                </code>
              </div>
            </div>
          </details>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Got It! Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}