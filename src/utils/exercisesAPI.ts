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

export interface ExerciseSession {
  id: string;
  exerciseName: string;
  exerciseType: string;
  duration: string;
  difficulty: string;
  startedAt: string;
  completedAt?: string;
  completed: boolean;
}

export const exercisesAPI = {
  async startExercise(exerciseId: string): Promise<string> {
    const session: ExerciseSession = {
      id: `exercise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      exerciseName: exerciseId,
      exerciseType: exerciseId,
      duration: '',
      difficulty: '',
      startedAt: new Date().toISOString(),
      completed: false,
    };

    const response = await fetch(`${SERVER_URL}/exercise-sessions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(session),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to save exercise session: ${error}`);
    }

    return session.id;
  },

  async create(session: ExerciseSession): Promise<void> {
    const response = await fetch(`${SERVER_URL}/exercise-sessions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(session),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to save exercise session: ${error}`);
    }
  },

  async update(id: string, updates: Partial<ExerciseSession>): Promise<void> {
    const response = await fetch(`${SERVER_URL}/exercise-sessions/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update exercise session: ${error}`);
    }
  },

  async getAll(): Promise<ExerciseSession[]> {
    const response = await fetch(`${SERVER_URL}/exercise-sessions`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch exercise sessions: ${error}`);
    }

    const data = await response.json();
    return data.exerciseSessions || [];
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${SERVER_URL}/exercise-sessions/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete exercise session: ${error}`);
    }
  },
};