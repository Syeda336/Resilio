// This is the entry point for the Supabase Edge Function
// It imports and starts the main server from the server directory
// FORCE REDEPLOY: 2026-04-11 18:00 - Auto schema fix with table creation
// This deployment will automatically create kv_store_40d4d8fd table

// Import the app from the server directory
import app from '../server/index.tsx';

// Use Deno.serve instead of serve from std library
// This is the standard way for Supabase Edge Functions
Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Cron-API-Key',
      },
    });
  }

  try {
    // Let the Hono app handle all requests
    // Hono will handle auth internally for each route
    const response = await app.fetch(req);
    
    // Ensure CORS headers are present
    const headers = new Headers(response.headers);
    if (!headers.has('Access-Control-Allow-Origin')) {
      headers.set('Access-Control-Allow-Origin', '*');
    }
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers,
    });
  } catch (error: any) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});