import { useState, useEffect } from 'react';
import { X, RefreshCw, AlertTriangle } from 'lucide-react';

export function CacheClearBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    // Check if cache has been cleared with new version
    const cacheCleared = localStorage.getItem('cache_cleared_v3');
    const appVersion = localStorage.getItem('app_version');
    const lastCleared = cacheCleared ? parseInt(cacheCleared) : 0;
    const hoursSinceCleared = (Date.now() - lastCleared) / (1000 * 60 * 60);

    // Show banner if cache hasn't been cleared in the last hour OR version mismatch
    if (hoursSinceCleared > 1 || appVersion !== '2.0-no-wasm') {
      setIsVisible(true);
    }
  }, []);

  const handleClearCache = async () => {
    setIsClearing(true);
    
    try {
      console.log('🧹 Manual cache clear initiated...');
      
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('✅ Cleared', cacheNames.length, 'caches');
      }

      // Unregister service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
        console.log('✅ Unregistered', registrations.length, 'service workers');
      }

      // Mark cache as cleared with new version
      localStorage.setItem('cache_cleared_v3', Date.now().toString());
      localStorage.setItem('app_version', '2.0-no-wasm');
      
      // Show success message
      alert('✅ Cache cleared successfully!\n\nThe page will now reload to apply changes.');
      
      // Force hard reload with cache bypass
      window.location.reload();
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('⚠️ Automatic cache clearing failed.\n\nPlease manually clear cache:\n• Press Ctrl+Shift+R (Windows/Linux)\n• Press Cmd+Shift+R (Mac)\n• Or press F12, right-click refresh, select "Empty Cache and Hard Reload"');
    } finally {
      setIsClearing(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('cache_cleared_v3', Date.now().toString());
    localStorage.setItem('app_version', '2.0-no-wasm');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1">
            <AlertTriangle className="w-6 h-6 flex-shrink-0 animate-pulse" />
            <div>
              <p className="font-bold text-lg">⚠️ Action Required: Clear Browser Cache</p>
              <p className="text-sm">
                WebAssembly error detected. Please clear your cache to fix this issue.
                <span className="hidden sm:inline"> Press <strong>Ctrl+Shift+R</strong> (Windows) or <strong>Cmd+Shift+R</strong> (Mac) now.</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearCache}
              disabled={isClearing}
              className="flex items-center gap-2 px-6 py-3 bg-white text-red-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-lg"
            >
              <RefreshCw className={`w-5 h-5 ${isClearing ? 'animate-spin' : ''}`} />
              <span>{isClearing ? 'Clearing...' : 'Clear Cache Now'}</span>
            </button>
            
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-red-700 transition-colors"
              title="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}