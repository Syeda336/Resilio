import { projectId, publicAnonKey } from './supabase/info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd`;

// Helper function to get auth headers
const getHeaders = () => {
  const accessToken = localStorage.getItem('resilio_access_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken || publicAnonKey}`,
  };
};

export interface GameSession {
  id: string;
  gameName: string;
  gameType: string;
  startedAt: string;
  completedAt?: string;
  score?: number;
  duration?: number;
}

export const gamesAPI = {
  async startGame(gameName: string): Promise<GameSession> {
    const session: GameSession = {
      id: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      gameName,
      gameType: gameName,
      startedAt: new Date().toISOString(),
    };

    const response = await fetch(`${SERVER_URL}/game-sessions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(session),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to save game session: ${error}`);
    }

    return session;
  },

  async create(session: GameSession): Promise<void> {
    const response = await fetch(`${SERVER_URL}/game-sessions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(session),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to save game session: ${error}`);
    }
  },

  async getAll(): Promise<GameSession[]> {
    const response = await fetch(`${SERVER_URL}/game-sessions`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch game sessions: ${error}`);
    }

    const data = await response.json();
    return data.gameSessions || [];
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${SERVER_URL}/game-sessions/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete game session: ${error}`);
    }
  },
};