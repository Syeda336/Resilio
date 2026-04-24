import { projectId, publicAnonKey } from './supabase/info.tsx';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd`;

// Helper function to get auth headers
const getHeaders = () => {
  const accessToken = localStorage.getItem('resilio_access_token');
  console.log('🔑 Access token present:', !!accessToken, accessToken ? `${accessToken.substring(0, 20)}...` : 'none');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken || publicAnonKey}`,
  };
};

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
};

// Diary Entries API
export const diaryAPI = {
  async getAll() {
    console.log('📖 [diaryAPI.getAll] Starting fetch...');
    const headers = getHeaders();
    console.log('📖 [diaryAPI.getAll] Headers:', { hasAuth: !!headers.Authorization });
    
    try {
      const response = await fetch(`${API_BASE}/entries`, { headers });
      console.log('📖 [diaryAPI.getAll] Response status:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📖 [diaryAPI.getAll] Response data:', { 
        success: data.success, 
        entriesCount: data.entries?.length,
        error: data.error 
      });
      
      if (!data.success) {
        console.error('📖 [diaryAPI.getAll] API returned error:', data.error);
        throw new Error(data.error);
      }
      
      console.log('📖 [diaryAPI.getAll] Returning', data.entries?.length || 0, 'entries');
      return data.entries || [];
    } catch (error) {
      console.error('📖 [diaryAPI.getAll] Fetch failed:', error);
      throw error;
    }
  },

  async create(entry: any) {
    console.log('💾 [diaryAPI.create] Creating entry:', { 
      id: entry.id, 
      mood: entry.mood, 
      date: entry.date, 
      time: entry.time 
    });
    
    const headers = getHeaders();
    console.log('💾 [diaryAPI.create] Headers:', { hasAuth: !!headers.Authorization });
    
    try {
      const response = await fetch(`${API_BASE}/entries`, {
        method: 'POST',
        headers,
        body: JSON.stringify(entry),
      });
      
      console.log('💾 [diaryAPI.create] Response status:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('💾 [diaryAPI.create] Response data:', { 
        success: data.success, 
        error: data.error,
        entryId: data.entry?.id
      });
      
      if (!data.success) {
        console.error('💾 [diaryAPI.create] API returned error:', data.error);
        throw new Error(data.error);
      }
      
      console.log('💾 [diaryAPI.create] Entry created successfully');
      return data.entry;
    } catch (error) {
      console.error('💾 [diaryAPI.create] Create failed:', error);
      throw error;
    }
  },

  async delete(id: string) {
    console.log('🗑️ [diaryAPI.delete] Deleting entry:', id);
    const headers = getHeaders();
    
    try {
      const response = await fetch(`${API_BASE}/entries/${id}`, {
        method: 'DELETE',
        headers,
      });
      
      console.log('🗑️ [diaryAPI.delete] Response status:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('🗑️ [diaryAPI.delete] Response data:', { 
        success: data.success, 
        error: data.error 
      });
      
      if (!data.success) {
        console.error('🗑️ [diaryAPI.delete] API returned error:', data.error);
        throw new Error(data.error);
      }
      
      console.log('🗑️ [diaryAPI.delete] Entry deleted successfully');
      return true;
    } catch (error) {
      console.error('🗑️ [diaryAPI.delete] Delete failed:', error);
      throw error;
    }
  },
};

// Future Messages API
export const futureMessagesAPI = {
  async getAll() {
    const response = await fetch(`${API_BASE}/future-messages`, { headers: getHeaders() });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.messages;
  },

  async create(message: any) {
    try {
      console.log('Creating future message with headers:', getHeaders());
      const response = await fetch(`${API_BASE}/future-messages`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(message),
      });
      
      if (!response.ok) {
        const text = await response.text();
        console.error('❌ Future message creation failed:', response.status, text);
        throw new Error(`Server error ${response.status}: ${text}`);
      }
      
      const data = await response.json();
      console.log('Server response:', data);
      if (!data.success) throw new Error(data.error || 'Unknown error');
      return data.message;
    } catch (error: any) {
      console.error('❌ Error creating future message:', error);
      throw error;
    }
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE}/future-messages/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return true;
  },
};

// Reminders API
export const remindersAPI = {
  async getAll() {
    const response = await fetch(`${API_BASE}/reminders`, { headers: getHeaders() });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.reminders;
  },

  async create(reminder: any) {
    try {
      console.log('Creating reminder with headers:', getHeaders());
      const response = await fetch(`${API_BASE}/reminders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(reminder),
      });
      
      if (!response.ok) {
        const text = await response.text();
        console.error('❌ Reminder creation failed:', response.status, text);
        throw new Error(`Server error ${response.status}: ${text}`);
      }
      
      const data = await response.json();
      console.log('Server response:', data);
      if (!data.success) throw new Error(data.error || 'Unknown error');
      return data.reminder;
    } catch (error: any) {
      console.error('❌ Error creating reminder:', error);
      throw error;
    }
  },

  async update(id: string, updates: any) {
    const response = await fetch(`${API_BASE}/reminders/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.reminder;
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE}/reminders/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return true;
  },
};

// Diet Items API
export const dietItemsAPI = {
  async getAll() {
    const response = await fetch(`${API_BASE}/diet-items`, { headers: getHeaders() });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.dietItems;
  },

  async create(dietItem: any) {
    try {
      console.log('🍽️ [dietItemsAPI] Creating diet item with headers:', {
        hasAuth: !!getHeaders().Authorization,
        dietItem: {
          id: dietItem.id,
          scheduledTime: dietItem.scheduledTime,
          mealType: dietItem.mealType,
        }
      });
      
      const response = await fetch(`${API_BASE}/diet-items`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(dietItem),
      });
      
      if (!response.ok) {
        const text = await response.text();
        console.error('❌ Diet item creation failed:', response.status, text);
        throw new Error(`Server error ${response.status}: ${text}`);
      }
      
      const data = await response.json();
      console.log('✅ [dietItemsAPI] Server response:', data);
      
      if (!data.success) throw new Error(data.error);
      return data;
    } catch (error: any) {
      console.error('❌ Error creating diet item:', error);
      throw error;
    }
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE}/diet-items/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return true;
  },
};