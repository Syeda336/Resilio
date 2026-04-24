import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Mail, Server, Clock } from 'lucide-react';
import { projectId } from '../utils/supabase/info';

interface HealthStatus {
  status: string;
  timestamp: string;
  environment: {
    SMTP_PASSWORD_SET: boolean;
    CRON_API_KEY_SET: boolean;
    SUPABASE_URL_SET: boolean;
  };
}

interface QueueStatus {
  success: boolean;
  currentTime: string;
  summary: {
    total: number;
    pending: number;
    dueNow: number;
    upcoming: number;
    sent: number;
    failed: number;
  };
}

export function EmailHealthChecker() {
  const [checking, setChecking] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [queue, setQueue] = useState<QueueStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setChecking(true);
    setError(null);

    try {
      // Check server health
      const healthResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/health`
      );
      const healthData = await healthResponse.json();
      setHealth(healthData);

      // Check email queue
      const queueResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/email/queue/status`
      );
      const queueData = await queueResponse.json();
      setQueue(queueData);
    } catch (err: any) {
      setError(err.message || 'Failed to check email system');
    } finally {
      setChecking(false);
    }
  };

  const getStatusIcon = (isHealthy: boolean) => {
    return isHealthy ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  const isHealthy = health?.environment.SMTP_PASSWORD_SET && health?.environment.SUPABASE_URL_SET;

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Mail className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-800">Email System Health</h3>
        </div>
        <button
          onClick={checkHealth}
          disabled={checking}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {checking ? 'Checking...' : 'Check Status'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {health && (
        <>
          {/* Overall Status */}
          <div className={`mb-4 p-4 rounded-lg border-2 ${
            isHealthy 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {isHealthy ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              <span className={`font-bold text-lg ${
                isHealthy ? 'text-green-800' : 'text-red-800'
              }`}>
                {isHealthy ? '✅ Email System Ready' : '❌ Email System Not Configured'}
              </span>
            </div>
            {!isHealthy && (
              <p className="text-sm text-red-700 ml-8">
                SMTP configuration is missing. Please add SMTP secrets to Supabase Edge Functions.
              </p>
            )}
          </div>

          {/* Server Configuration */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-5 h-5 text-gray-600" />
              <h4 className="font-semibold text-gray-800">Server Configuration</h4>
            </div>
            <div className="space-y-2 ml-7">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">SMTP Password</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(health.environment.SMTP_PASSWORD_SET)}
                  <span className="text-sm font-medium">
                    {health.environment.SMTP_PASSWORD_SET ? 'Configured' : 'Not Set'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Cron API Key</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(health.environment.CRON_API_KEY_SET)}
                  <span className="text-sm font-medium">
                    {health.environment.CRON_API_KEY_SET ? 'Configured' : 'Optional'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Supabase URL</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(health.environment.SUPABASE_URL_SET)}
                  <span className="text-sm font-medium">
                    {health.environment.SUPABASE_URL_SET ? 'Configured' : 'Not Set'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Email Queue Status */}
          {queue && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-gray-600" />
                <h4 className="font-semibold text-gray-800">Email Queue</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 ml-7">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">{queue.summary.total}</div>
                  <div className="text-xs text-blue-600">Total</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-700">{queue.summary.pending}</div>
                  <div className="text-xs text-yellow-600">Pending</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-700">{queue.summary.dueNow}</div>
                  <div className="text-xs text-orange-600">Due Now</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-700">{queue.summary.upcoming}</div>
                  <div className="text-xs text-purple-600">Upcoming</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-700">{queue.summary.sent}</div>
                  <div className="text-xs text-green-600">Sent</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-700">{queue.summary.failed}</div>
                  <div className="text-xs text-red-600">Failed</div>
                </div>
              </div>
              <div className="mt-3 ml-7 text-xs text-gray-500">
                Last checked: {new Date(queue.currentTime).toLocaleString()}
              </div>
            </div>
          )}

          {/* Action Required Warning */}
          {!isHealthy && (
            <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-800 mb-2">Action Required</p>
                  <p className="text-sm text-yellow-700 mb-2">
                    To enable email notifications:
                  </p>
                  <ol className="text-sm text-yellow-700 space-y-1 ml-4 list-decimal">
                    <li>Go to Supabase Dashboard → Edge Functions → server → Settings</li>
                    <li>Add these secrets:
                      <ul className="ml-4 mt-1 list-disc">
                        <li>SMTP_HOST = smtp.gmail.com</li>
                        <li>SMTP_PORT = 587</li>
                        <li>SMTP_USER = your-email@gmail.com</li>
                        <li>SMTP_PASSWORD = your-gmail-app-password</li>
                        <li>SMTP_FROM = your-email@gmail.com</li>
                      </ul>
                    </li>
                    <li>Get Gmail App Password from: https://myaccount.google.com/apppasswords</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!health && !checking && (
        <div className="text-center py-8 text-gray-500">
          <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Click "Check Status" to verify email system</p>
        </div>
      )}
    </div>
  );
}
