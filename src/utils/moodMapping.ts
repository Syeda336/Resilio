// Mood to numeric value mapping (1-5 scale)
// Based on the mood hierarchy in the app

export const MOOD_VALUES: Record<string, number> = {
  // Level 5 - Very Happy (Top tier)
  'happy': 5,
  'excited': 5,
  'grateful': 5,
  
  // Level 4 - Good/Positive (Upper tier)
  'peaceful': 4,
  'calm': 4,
  'content': 4,
  'thoughtful': 4,
  'hopeful': 4,
  'loved': 4,
  'energetic': 4,
  'relaxed': 4,
  
  // Level 3 - Neutral (Middle)
  'neutral': 3,
  
  // Level 2 - Low/Negative (Lower tier)
  'tired': 2,
  'stressed': 2,
  'anxious': 2,
  'frustrated': 2,
  'sad': 2,
  
  // Level 1 - Very Low (Bottom tier)
  'overwhelmed': 1,
  'angry': 1,
  'lonely': 1,
};

/**
 * Get numeric mood value from mood string
 * @param mood - Mood string (e.g., "Happy 😊" or "happy")
 * @returns Numeric value 1-5, or 3 (neutral) if not found
 */
export function getMoodValue(mood: string): number {
  if (!mood) return 3; // Default to neutral
  
  // Extract mood name from string like "Happy 😊"
  const moodName = mood.toLowerCase().split(' ')[0].trim();
  
  return MOOD_VALUES[moodName] ?? 3; // Default to neutral if not found
}

/**
 * Get mood level name from numeric value
 */
export function getMoodLevelName(value: number): string {
  if (value >= 4.5) return 'Very Happy';
  if (value >= 3.5) return 'Good';
  if (value >= 2.5) return 'Neutral';
  if (value >= 1.5) return 'Low';
  return 'Very Low';
}

/**
 * Get color for mood value
 */
export function getMoodColor(value: number): string {
  if (value >= 4.5) return '#10b981'; // green
  if (value >= 3.5) return '#3b82f6'; // blue
  if (value >= 2.5) return '#f59e0b'; // yellow
  if (value >= 1.5) return '#ef4444'; // red
  return '#991b1b'; // dark red
}

/**
 * Calculate average mood from array of mood values
 */
export function calculateAverageMood(moods: number[]): number {
  if (moods.length === 0) return 3;
  const sum = moods.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / moods.length) * 10) / 10; // Round to 1 decimal
}
