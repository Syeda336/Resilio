import { useState, useEffect } from 'react';
import { Trash2, Calendar, Clock, RefreshCw } from 'lucide-react';
import { diaryAPI } from '../utils/api';
import { dashboardRefresh } from '../utils/dashboardRefresh';
import { autoFixDatabase } from '../utils/autoFixDatabase';

interface DiaryEntry {
  id: string;
  content: string;
  mood: string;
  date: string;
  time: string;
  userId?: string;
}

export function EntriesList() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEntries();
    
    // Subscribe to dashboard refresh events
    const unsubscribe = dashboardRefresh.subscribe(() => {
      console.log('🔄 EntriesList received refresh event');
      loadEntries();
    });
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      loadEntries();
    }, 10000);
    
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const loadEntries = async () => {
    console.log('📖 EntriesList: Loading entries...');
    setLoading(true);
    setError(null);
    
    try {
      const data = await diaryAPI.getAll();
      console.log('📖 EntriesList: Loaded', data?.length || 0, 'entries');
      
      // Ensure we have an array
      if (Array.isArray(data)) {
        // Remove any potential duplicates based on ID
        const uniqueEntries = Array.from(
          new Map(data.map(entry => [entry.id, entry])).values()
        );
        setEntries(uniqueEntries);
        console.log('📖 EntriesList: Set', uniqueEntries.length, 'unique entries');
      } else {
        console.warn('📖 EntriesList: Received non-array data:', data);
        setEntries([]);
      }
    } catch (error: any) {
      console.error('❌ EntriesList: Error loading entries:', error);
      
      // If error is about schema cache, try auto-fix
      if (error.message?.includes('schema cache') || error.message?.includes('diary_entries')) {
        console.log('🔧 Attempting auto-fix for database schema...');
        const fixed = await autoFixDatabase();
        
        if (fixed) {
          console.log('✅ Auto-fix succeeded, retrying load...');
          // Wait 2 seconds and retry
          await new Promise(resolve => setTimeout(resolve, 2000));
          try {
            const retryData = await diaryAPI.getAll();
            if (Array.isArray(retryData)) {
              const uniqueEntries = Array.from(
                new Map(retryData.map(entry => [entry.id, entry])).values()
              );
              setEntries(uniqueEntries);
              return; // Success!
            }
          } catch (retryError) {
            console.error('❌ Retry failed after auto-fix:', retryError);
          }
        }
      }
      
      setError(error.message || 'Failed to load entries');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      try {
        await diaryAPI.delete(id);
        setEntries(entries.filter(entry => entry.id !== id));
        console.log('✅ Entry deleted:', id);
        // Trigger refresh
        dashboardRefresh.trigger();
      } catch (error) {
        console.error('❌ Error deleting entry:', error);
        alert('Failed to delete entry. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-black text-center flex-1">Previous Entries</h2>
        <button
          onClick={loadEntries}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black border-2 border-gray-300 hover:border-blue-500 transition-all rounded-lg disabled:opacity-50"
          title="Refresh entries"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 p-4 rounded-xl text-center">
          <p className="text-red-600">⚠️ {error}</p>
          <button 
            onClick={loadEntries}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {loading && !error ? (
        <div className="text-center py-12 text-gray-600">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Loading entries...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          <p>No entries yet. Start writing your first journal entry!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-slate-600 text-sm text-center">
            Showing {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </p>
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white border-2 border-gray-200 p-6 hover:border-gray-300 transition-all rounded-xl"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{entry.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{entry.time}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="flex items-center gap-1 px-3 py-1 bg-white text-red-600 border-2 border-red-600 hover:bg-red-600 hover:text-white transition-all rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>

              {entry.mood && (
                <div className="mb-3 inline-block px-3 py-1 bg-gray-100 text-black border border-gray-300 rounded-lg">
                  Mood: {entry.mood}
                </div>
              )}

              <div className="text-black whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: entry.content }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}