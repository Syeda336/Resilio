import { motion } from 'motion/react';
import { Heart, Sparkles } from 'lucide-react';

interface CareBuddyCharacterProps {
  isThinking?: boolean;
  mood?: 'happy' | 'listening' | 'caring' | 'excited' | 'sad' | 'worried' | 'calm' | 'curious' | 'surprised' | 'playful' | 'confident' | 'grateful' | 'mad' | 'furious' | 'angry' | 'fear' | 'neutral' | 'disgust' | 'tension' | 'anxious' | 'depressed' | 
  // New positive/neutral
  'joy' | 'contentment' | 'relaxation' | 'satisfaction' | 'interest' | 'thoughtful' | 'attentive' | 'focused' | 'emotional-balance' | 'serious' |
  // New mild negative
  'slight-concern' | 'mild-fatigue' | 'confusion' | 'indifference' |
  // New sadness variants
  'hopelessness' | 'grief' | 'crying' | 'loneliness' | 'despair' | 'tearfulness' |
  // New anxiety variants
  'nervousness' | 'panic' | 'restlessness' | 'apprehensive' | 'hypervigilance' | 'overwhelm' | 'pressure' |
  // New anger variants
  'irritation' | 'frustration' | 'aggression' | 'rage' | 'impatience' | 'crazy' | 'burnout' |
  // New severe negative
  'emotional-numbness' | 'flat-affect' | 'shame' | 'guilt' | 'emptiness' | 'blank-expression' | 'worthlessness' | 'exhaust' | 'mental-overload';
}

export function CareBuddyCharacter({ isThinking = false, mood = 'happy' }: CareBuddyCharacterProps) {
  // Get colors based on mood
  const getMoodColors = () => {
    switch (mood) {
      case 'happy':
        return { primary: '#a855f7', secondary: '#ec4899', glow: '#f0abfc' };
      case 'listening':
        return { primary: '#14b8a6', secondary: '#0891b2', glow: '#5eead4' };
      case 'caring':
        return { primary: '#f472b6', secondary: '#fb7185', glow: '#fda4af' };
      case 'excited':
        return { primary: '#8b5cf6', secondary: '#06b6d4', glow: '#c4b5fd' };
      case 'sad':
        return { primary: '#9ca3af', secondary: '#6b7280', glow: '#d1d5db' };
      case 'worried':
        return { primary: '#fbbf24', secondary: '#f59e0b', glow: '#fde047' };
      case 'calm':
        return { primary: '#14b8a6', secondary: '#06b6d4', glow: '#99f6e4' };
      case 'curious':
        return { primary: '#60a5fa', secondary: '#3b82f6', glow: '#bfdbfe' };
      case 'surprised':
        return { primary: '#f59e0b', secondary: '#f97316', glow: '#fcd34d' };
      case 'playful':
        return { primary: '#ec4899', secondary: '#d946ef', glow: '#f0abfc' };
      case 'confident':
        return { primary: '#8b5cf6', secondary: '#a855f7', glow: '#c4b5fd' };
      case 'grateful':
        return { primary: '#10b981', secondary: '#14b8a6', glow: '#6ee7b7' };
      case 'mad':
        return { primary: '#ef4444', secondary: '#dc2626', glow: '#f87171' };
      case 'furious':
        return { primary: '#ef4444', secondary: '#dc2626', glow: '#f87171' };
      case 'angry':
        return { primary: '#ef4444', secondary: '#dc2626', glow: '#f87171' };
      case 'fear':
        return { primary: '#fbbf24', secondary: '#f59e0b', glow: '#fde047' };
      case 'neutral':
        return { primary: '#9ca3af', secondary: '#6b7280', glow: '#d1d5db' };
      case 'disgust':
        return { primary: '#fbbf24', secondary: '#f59e0b', glow: '#fde047' };
      case 'tension':
        return { primary: '#fbbf24', secondary: '#f59e0b', glow: '#fde047' };
      case 'anxious':
        return { primary: '#fbbf24', secondary: '#f59e0b', glow: '#fde047' };
      case 'depressed':
        return { primary: '#9ca3af', secondary: '#6b7280', glow: '#d1d5db' };
      // New positive/neutral moods
      case 'joy':
        return { primary: '#f59e0b', secondary: '#fbbf24', glow: '#fde68a' };
      case 'contentment':
        return { primary: '#10b981', secondary: '#14b8a6', glow: '#a7f3d0' };
      case 'relaxation':
        return { primary: '#14b8a6', secondary: '#06b6d4', glow: '#99f6e4' };
      case 'satisfaction':
        return { primary: '#10b981', secondary: '#059669', glow: '#6ee7b7' };
      case 'interest':
        return { primary: '#3b82f6', secondary: '#60a5fa', glow: '#93c5fd' };
      case 'thoughtful':
        return { primary: '#8b5cf6', secondary: '#a78bfa', glow: '#c4b5fd' };
      case 'attentive':
        return { primary: '#06b6d4', secondary: '#0891b2', glow: '#67e8f9' };
      case 'focused':
        return { primary: '#6366f1', secondary: '#818cf8', glow: '#a5b4fc' };
      case 'emotional-balance':
        return { primary: '#14b8a6', secondary: '#10b981', glow: '#6ee7b7' };
      case 'serious':
        return { primary: '#64748b', secondary: '#475569', glow: '#94a3b8' };
      // New mild negative moods
      case 'slight-concern':
        return { primary: '#f59e0b', secondary: '#d97706', glow: '#fcd34d' };
      case 'mild-fatigue':
        return { primary: '#94a3b8', secondary: '#64748b', glow: '#cbd5e1' };
      case 'confusion':
        return { primary: '#a78bfa', secondary: '#8b5cf6', glow: '#c4b5fd' };
      case 'indifference':
        return { primary: '#9ca3af', secondary: '#6b7280', glow: '#d1d5db' };
      // New sadness variants
      case 'hopelessness':
        return { primary: '#71717a', secondary: '#52525b', glow: '#a1a1aa' };
      case 'grief':
        return { primary: '#6b7280', secondary: '#4b5563', glow: '#9ca3af' };
      case 'crying':
        return { primary: '#60a5fa', secondary: '#3b82f6', glow: '#93c5fd' };
      case 'loneliness':
        return { primary: '#71717a', secondary: '#52525b', glow: '#a1a1aa' };
      case 'despair':
        return { primary: '#52525b', secondary: '#3f3f46', glow: '#71717a' };
      case 'tearfulness':
        return { primary: '#60a5fa', secondary: '#3b82f6', glow: '#93c5fd' };
      // New anxiety variants
      case 'nervousness':
        return { primary: '#fbbf24', secondary: '#f59e0b', glow: '#fde047' };
      case 'panic':
        return { primary: '#f97316', secondary: '#ea580c', glow: '#fb923c' };
      case 'restlessness':
        return { primary: '#f59e0b', secondary: '#d97706', glow: '#fcd34d' };
      case 'apprehensive':
        return { primary: '#fbbf24', secondary: '#f59e0b', glow: '#fde047' };
      case 'hypervigilance':
        return { primary: '#f97316', secondary: '#ea580c', glow: '#fb923c' };
      case 'overwhelm':
        return { primary: '#dc2626', secondary: '#b91c1c', glow: '#ef4444' };
      case 'pressure':
        return { primary: '#fbbf24', secondary: '#f59e0b', glow: '#fde047' };
      // New anger variants
      case 'irritation':
        return { primary: '#f59e0b', secondary: '#d97706', glow: '#fbbf24' };
      case 'frustration':
        return { primary: '#ef4444', secondary: '#dc2626', glow: '#f87171' };
      case 'aggression':
        return { primary: '#dc2626', secondary: '#b91c1c', glow: '#ef4444' };
      case 'rage':
        return { primary: '#b91c1c', secondary: '#991b1b', glow: '#dc2626' };
      case 'impatience':
        return { primary: '#f59e0b', secondary: '#d97706', glow: '#fbbf24' };
      case 'crazy':
        return { primary: '#d946ef', secondary: '#c026d3', glow: '#e879f9' };
      case 'burnout':
        return { primary: '#6b7280', secondary: '#4b5563', glow: '#9ca3af' };
      // New severe negative moods
      case 'emotional-numbness':
        return { primary: '#71717a', secondary: '#52525b', glow: '#a1a1aa' };
      case 'flat-affect':
        return { primary: '#6b7280', secondary: '#4b5563', glow: '#9ca3af' };
      case 'shame':
        return { primary: '#9333ea', secondary: '#7e22ce', glow: '#a855f7' };
      case 'guilt':
        return { primary: '#9333ea', secondary: '#7e22ce', glow: '#a855f7' };
      case 'emptiness':
        return { primary: '#52525b', secondary: '#3f3f46', glow: '#71717a' };
      case 'blank-expression':
        return { primary: '#9ca3af', secondary: '#6b7280', glow: '#d1d5db' };
      case 'worthlessness':
        return { primary: '#52525b', secondary: '#3f3f46', glow: '#71717a' };
      case 'exhaust':
        return { primary: '#78716c', secondary: '#57534e', glow: '#a8a29e' };
      case 'mental-overload':
        return { primary: '#dc2626', secondary: '#b91c1c', glow: '#ef4444' };
      default:
        return { primary: '#a855f7', secondary: '#ec4899', glow: '#f0abfc' };
    }
  };

  const colors = getMoodColors();

  // Get facial expression based on mood
  const getSmilePath = () => {
    switch (mood) {
      case 'sad':
        return {
          default: "M 45 65 Q 60 58 75 65",
          animated: ["M 45 65 Q 60 58 75 65", "M 45 66 Q 60 59 75 66", "M 45 65 Q 60 58 75 65"]
        };
      case 'worried':
        return {
          default: "M 45 62 L 60 62 L 75 62",
          animated: ["M 45 62 L 60 62 L 75 62", "M 45 61 L 60 61 L 75 61", "M 45 62 L 60 62 L 75 62"]
        };
      case 'excited':
        return {
          default: "M 45 58 Q 60 72 75 58",
          animated: ["M 45 58 Q 60 72 75 58", "M 45 56 Q 60 75 75 56", "M 45 58 Q 60 72 75 58"]
        };
      case 'happy':
        return {
          default: "M 45 60 Q 60 70 75 60",
          animated: ["M 45 60 Q 60 70 75 60", "M 45 58 Q 60 72 75 58", "M 45 60 Q 60 70 75 60"]
        };
      case 'calm':
        return {
          default: "M 45 62 Q 60 67 75 62",
          animated: ["M 45 62 Q 60 67 75 62", "M 45 61 Q 60 68 75 61", "M 45 62 Q 60 67 75 62"]
        };
      case 'curious':
        return {
          default: "M 45 62 Q 60 58 75 62",
          animated: ["M 45 62 Q 60 58 75 62", "M 45 63 Q 60 59 75 63", "M 45 62 Q 60 58 75 62"]
        };
      case 'surprised':
        return {
          default: "M 48 62 Q 60 62 72 62",
          animated: ["M 48 62 Q 60 62 72 62", "M 48 64 Q 60 64 72 64", "M 48 62 Q 60 62 72 62"]
        };
      case 'playful':
        return {
          default: "M 45 60 Q 52 68 60 62 Q 68 68 75 60",
          animated: ["M 45 60 Q 52 68 60 62 Q 68 68 75 60", "M 45 58 Q 52 70 60 60 Q 68 70 75 58", "M 45 60 Q 52 68 60 62 Q 68 68 75 60"]
        };
      case 'confident':
        return {
          default: "M 45 60 Q 55 68 65 60",
          animated: ["M 45 60 Q 55 68 65 60", "M 45 58 Q 55 70 65 58", "M 45 60 Q 55 68 65 60"]
        };
      case 'grateful':
        return {
          default: "M 45 60 Q 60 72 75 60",
          animated: ["M 45 60 Q 60 72 75 60", "M 45 59 Q 60 74 75 59", "M 45 60 Q 60 72 75 60"]
        };
      case 'mad':
        return {
          default: "M 45 68 Q 60 63 75 68",
          animated: ["M 45 68 Q 60 63 75 68", "M 45 69 Q 60 64 75 69", "M 45 68 Q 60 63 75 68"]
        };
      case 'furious':
        return {
          default: "M 45 70 Q 60 62 75 70",
          animated: ["M 45 70 Q 60 62 75 70", "M 45 71 Q 60 61 75 71", "M 45 70 Q 60 62 75 70"]
        };
      case 'angry':
        return {
          default: "M 45 67 Q 60 62 75 67",
          animated: ["M 45 67 Q 60 62 75 67", "M 45 68 Q 60 63 75 68", "M 45 67 Q 60 62 75 67"]
        };
      case 'fear':
        return {
          default: "M 47 63 Q 60 63 73 63",
          animated: ["M 47 63 Q 60 63 73 63", "M 47 64 Q 60 64 73 64", "M 47 63 Q 60 63 73 63"]
        };
      case 'neutral':
        return {
          default: "M 45 62 L 75 62",
          animated: ["M 45 62 L 75 62", "M 45 61 L 75 61", "M 45 62 L 75 62"]
        };
      case 'disgust':
        return {
          default: "M 45 65 Q 52 58 60 62 Q 68 58 75 65",
          animated: ["M 45 65 Q 52 58 60 62 Q 68 58 75 65", "M 45 66 Q 52 59 60 63 Q 68 59 75 66", "M 45 65 Q 52 58 60 62 Q 68 58 75 65"]
        };
      case 'tension':
        return {
          default: "M 45 63 L 60 61 L 75 63",
          animated: ["M 45 63 L 60 61 L 75 63", "M 45 64 L 60 62 L 75 64", "M 45 63 L 60 61 L 75 63"]
        };
      case 'anxious':
        return {
          default: "M 45 64 Q 52 60 60 62 Q 68 60 75 64",
          animated: ["M 45 64 Q 52 60 60 62 Q 68 60 75 64", "M 45 65 Q 52 61 60 63 Q 68 61 75 65", "M 45 64 Q 52 60 60 62 Q 68 60 75 64"]
        };
      case 'depressed':
        return {
          default: "M 45 66 Q 60 56 75 66",
          animated: ["M 45 66 Q 60 56 75 66", "M 45 67 Q 60 57 75 67", "M 45 66 Q 60 56 75 66"]
        };
      // New positive/neutral expressions
      case 'joy':
        return {
          default: "M 45 58 Q 60 75 75 58",
          animated: ["M 45 58 Q 60 75 75 58", "M 45 56 Q 60 77 75 56", "M 45 58 Q 60 75 75 58"]
        };
      case 'contentment':
        return {
          default: "M 45 61 Q 60 67 75 61",
          animated: ["M 45 61 Q 60 67 75 61", "M 45 60 Q 60 68 75 60", "M 45 61 Q 60 67 75 61"]
        };
      case 'relaxation':
        return {
          default: "M 45 62 Q 60 65 75 62",
          animated: ["M 45 62 Q 60 65 75 62", "M 45 61 Q 60 66 75 61", "M 45 62 Q 60 65 75 62"]
        };
      case 'satisfaction':
        return {
          default: "M 45 60 Q 60 68 75 60",
          animated: ["M 45 60 Q 60 68 75 60", "M 45 59 Q 60 69 75 59", "M 45 60 Q 60 68 75 60"]
        };
      case 'interest':
        return {
          default: "M 45 63 Q 60 66 75 63",
          animated: ["M 45 63 Q 60 66 75 63", "M 45 62 Q 60 67 75 62", "M 45 63 Q 60 66 75 63"]
        };
      case 'thoughtful':
        return {
          default: "M 45 62 Q 52 60 60 62 Q 68 60 75 62",
          animated: ["M 45 62 Q 52 60 60 62 Q 68 60 75 62", "M 45 63 Q 52 61 60 63 Q 68 61 75 63", "M 45 62 Q 52 60 60 62 Q 68 60 75 62"]
        };
      case 'attentive':
        return {
          default: "M 45 62 L 60 64 L 75 62",
          animated: ["M 45 62 L 60 64 L 75 62", "M 45 61 L 60 63 L 75 61", "M 45 62 L 60 64 L 75 62"]
        };
      case 'focused':
        return {
          default: "M 45 62 L 75 62",
          animated: ["M 45 62 L 75 62", "M 45 61 L 75 61", "M 45 62 L 75 62"]
        };
      case 'emotional-balance':
        return {
          default: "M 45 63 Q 60 65 75 63",
          animated: ["M 45 63 Q 60 65 75 63", "M 45 62 Q 60 64 75 62", "M 45 63 Q 60 65 75 63"]
        };
      case 'serious':
        return {
          default: "M 45 62 L 75 62",
          animated: ["M 45 62 L 75 62", "M 45 63 L 75 63", "M 45 62 L 75 62"]
        };
      // New mild negative expressions
      case 'slight-concern':
        return {
          default: "M 45 63 Q 60 62 75 63",
          animated: ["M 45 63 Q 60 62 75 63", "M 45 64 Q 60 63 75 64", "M 45 63 Q 60 62 75 63"]
        };
      case 'mild-fatigue':
        return {
          default: "M 45 63 Q 60 60 75 63",
          animated: ["M 45 63 Q 60 60 75 63", "M 45 64 Q 60 61 75 64", "M 45 63 Q 60 60 75 63"]
        };
      case 'confusion':
        return {
          default: "M 45 62 Q 52 65 60 62 Q 68 59 75 62",
          animated: ["M 45 62 Q 52 65 60 62 Q 68 59 75 62", "M 45 63 Q 52 66 60 63 Q 68 60 75 63", "M 45 62 Q 52 65 60 62 Q 68 59 75 62"]
        };
      case 'indifference':
        return {
          default: "M 45 61 L 75 61",
          animated: ["M 45 61 L 75 61", "M 45 62 L 75 62", "M 45 61 L 75 61"]
        };
      // New sadness variant expressions
      case 'hopelessness':
        return {
          default: "M 45 67 Q 60 54 75 67",
          animated: ["M 45 67 Q 60 54 75 67", "M 45 68 Q 60 55 75 68", "M 45 67 Q 60 54 75 67"]
        };
      case 'grief':
        return {
          default: "M 45 68 Q 60 55 75 68",
          animated: ["M 45 68 Q 60 55 75 68", "M 45 69 Q 60 56 75 69", "M 45 68 Q 60 55 75 68"]
        };
      case 'crying':
        return {
          default: "M 45 69 Q 60 56 75 69",
          animated: ["M 45 69 Q 60 56 75 69", "M 45 70 Q 60 57 75 70", "M 45 69 Q 60 56 75 69"]
        };
      case 'loneliness':
        return {
          default: "M 45 66 Q 60 57 75 66",
          animated: ["M 45 66 Q 60 57 75 66", "M 45 67 Q 60 58 75 67", "M 45 66 Q 60 57 75 66"]
        };
      case 'despair':
        return {
          default: "M 45 69 Q 60 54 75 69",
          animated: ["M 45 69 Q 60 54 75 69", "M 45 70 Q 60 55 75 70", "M 45 69 Q 60 54 75 69"]
        };
      case 'tearfulness':
        return {
          default: "M 45 68 Q 60 56 75 68",
          animated: ["M 45 68 Q 60 56 75 68", "M 45 69 Q 60 57 75 69", "M 45 68 Q 60 56 75 68"]
        };
      // New anxiety variant expressions
      case 'nervousness':
        return {
          default: "M 45 63 Q 52 61 60 63 Q 68 61 75 63",
          animated: ["M 45 63 Q 52 61 60 63 Q 68 61 75 63", "M 45 64 Q 52 62 60 64 Q 68 62 75 64", "M 45 63 Q 52 61 60 63 Q 68 61 75 63"]
        };
      case 'panic':
        return {
          default: "M 47 64 Q 60 64 73 64",
          animated: ["M 47 64 Q 60 64 73 64", "M 47 65 Q 60 65 73 65", "M 47 64 Q 60 64 73 64"]
        };
      case 'restlessness':
        return {
          default: "M 45 63 L 52 65 L 60 63 L 68 65 L 75 63",
          animated: ["M 45 63 L 52 65 L 60 63 L 68 65 L 75 63", "M 45 64 L 52 66 L 60 64 L 68 66 L 75 64", "M 45 63 L 52 65 L 60 63 L 68 65 L 75 63"]
        };
      case 'apprehensive':
        return {
          default: "M 45 63 Q 60 61 75 63",
          animated: ["M 45 63 Q 60 61 75 63", "M 45 64 Q 60 62 75 64", "M 45 63 Q 60 61 75 63"]
        };
      case 'hypervigilance':
        return {
          default: "M 47 64 L 60 62 L 73 64",
          animated: ["M 47 64 L 60 62 L 73 64", "M 47 65 L 60 63 L 73 65", "M 47 64 L 60 62 L 73 64"]
        };
      case 'overwhelm':
        return {
          default: "M 45 65 Q 52 62 60 64 Q 68 59 75 65",
          animated: ["M 45 65 Q 52 62 60 64 Q 68 59 75 65", "M 45 66 Q 52 63 60 65 Q 68 60 75 66", "M 45 65 Q 52 62 60 64 Q 68 59 75 65"]
        };
      case 'pressure':
        return {
          default: "M 45 64 Q 52 60 60 62 Q 68 60 75 64",
          animated: ["M 45 64 Q 52 60 60 62 Q 68 60 75 64", "M 45 65 Q 52 61 60 63 Q 68 61 75 65", "M 45 64 Q 52 60 60 62 Q 68 60 75 64"]
        };
      // New anger variant expressions
      case 'irritation':
        return {
          default: "M 45 66 Q 60 64 75 66",
          animated: ["M 45 66 Q 60 64 75 66", "M 45 67 Q 60 65 75 67", "M 45 66 Q 60 64 75 66"]
        };
      case 'frustration':
        return {
          default: "M 45 68 Q 60 63 75 68",
          animated: ["M 45 68 Q 60 63 75 68", "M 45 69 Q 60 64 75 69", "M 45 68 Q 60 63 75 68"]
        };
      case 'aggression':
        return {
          default: "M 45 69 Q 60 62 75 69",
          animated: ["M 45 69 Q 60 62 75 69", "M 45 70 Q 60 61 75 70", "M 45 69 Q 60 62 75 69"]
        };
      case 'rage':
        return {
          default: "M 45 71 Q 60 60 75 71",
          animated: ["M 45 71 Q 60 60 75 71", "M 45 72 Q 60 59 75 72", "M 45 71 Q 60 60 75 71"]
        };
      case 'impatience':
        return {
          default: "M 45 65 Q 60 64 75 65",
          animated: ["M 45 65 Q 60 64 75 65", "M 45 66 Q 60 65 75 66", "M 45 65 Q 60 64 75 65"]
        };
      case 'crazy':
        return {
          default: "M 45 60 Q 52 70 60 60 Q 68 70 75 60",
          animated: ["M 45 60 Q 52 70 60 60 Q 68 70 75 60", "M 45 58 Q 52 72 60 58 Q 68 72 75 58", "M 45 60 Q 52 70 60 60 Q 68 70 75 60"]
        };
      case 'burnout':
        return {
          default: "M 45 64 Q 60 59 75 64",
          animated: ["M 45 64 Q 60 59 75 64", "M 45 65 Q 60 60 75 65", "M 45 64 Q 60 59 75 64"]
        };
      // New severe negative expressions
      case 'emotional-numbness':
        return {
          default: "M 45 61 L 75 61",
          animated: ["M 45 61 L 75 61", "M 45 62 L 75 62", "M 45 61 L 75 61"]
        };
      case 'flat-affect':
        return {
          default: "M 45 61 L 75 61",
          animated: ["M 45 61 L 75 61", "M 45 61 L 75 61", "M 45 61 L 75 61"]
        };
      case 'shame':
        return {
          default: "M 45 66 Q 60 58 75 66",
          animated: ["M 45 66 Q 60 58 75 66", "M 45 67 Q 60 59 75 67", "M 45 66 Q 60 58 75 66"]
        };
      case 'guilt':
        return {
          default: "M 45 65 Q 60 58 75 65",
          animated: ["M 45 65 Q 60 58 75 65", "M 45 66 Q 60 59 75 66", "M 45 65 Q 60 58 75 65"]
        };
      case 'emptiness':
        return {
          default: "M 45 62 L 75 62",
          animated: ["M 45 62 L 75 62", "M 45 61 L 75 61", "M 45 62 L 75 62"]
        };
      case 'blank-expression':
        return {
          default: "M 45 61 L 75 61",
          animated: ["M 45 61 L 75 61", "M 45 61 L 75 61", "M 45 61 L 75 61"]
        };
      case 'worthlessness':
        return {
          default: "M 45 68 Q 60 55 75 68",
          animated: ["M 45 68 Q 60 55 75 68", "M 45 69 Q 60 56 75 69", "M 45 68 Q 60 55 75 68"]
        };
      case 'exhaust':
        return {
          default: "M 45 64 Q 60 60 75 64",
          animated: ["M 45 64 Q 60 60 75 64", "M 45 65 Q 60 61 75 65", "M 45 64 Q 60 60 75 64"]
        };
      case 'mental-overload':
        return {
          default: "M 45 66 Q 52 63 60 65 Q 68 60 75 66",
          animated: ["M 45 66 Q 52 63 60 65 Q 68 60 75 66", "M 45 67 Q 52 64 60 66 Q 68 61 75 67", "M 45 66 Q 52 63 60 65 Q 68 60 75 66"]
        };
      default:
        return {
          default: "M 45 60 Q 60 70 75 60",
          animated: ["M 45 60 Q 60 70 75 60", "M 45 58 Q 60 72 75 58", "M 45 60 Q 60 70 75 60"]
        };
    }
  };

  const smilePath = getSmilePath();

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow effect */}
      <motion.div
        className="absolute w-48 h-48 rounded-full blur-3xl opacity-30"
        style={{ background: `radial-gradient(circle, ${colors.glow}, transparent)` }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Character container */}
      <motion.div
        className="relative z-10"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Main character body */}
        <svg width="120" height="140" viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Body - rounded blob shape */}
          <motion.ellipse
            cx="60"
            cy="80"
            rx="45"
            ry="50"
            fill="url(#bodyGradient)"
            animate={{
              rx: isThinking ? [45, 47, 45] : [45, 46, 45],
              ry: isThinking ? [50, 52, 50] : [50, 51, 50],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Face circle - slightly lighter */}
          <motion.circle
            cx="60"
            cy="50"
            r="35"
            fill="url(#faceGradient)"
            animate={{
              scale: isThinking ? [1, 1.02, 1] : 1,
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Cute blush marks */}
          <ellipse cx="35" cy="55" rx="8" ry="5" fill={colors.secondary} opacity="0.3" />
          <ellipse cx="85" cy="55" rx="8" ry="5" fill={colors.secondary} opacity="0.3" />

          {/* Eyes */}
          <motion.g
            animate={{
              scaleY: isThinking ? [1, 0.1, 1, 1, 1] : [1, 0.1, 1, 1, 1, 1, 1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              times: isThinking ? [0, 0.1, 0.2, 1] : [0, 0.05, 0.1, 0.15, 1],
            }}
          >
            {/* Left eye */}
            <ellipse cx="45" cy="45" rx="5" ry="7" fill="#1f2937" />
            <circle cx="46" cy="43" r="2" fill="white" />
            
            {/* Right eye */}
            <ellipse cx="75" cy="45" rx="5" ry="7" fill="#1f2937" />
            <circle cx="76" cy="43" r="2" fill="white" />
          </motion.g>

          {/* Smile */}
          <motion.path
            d={smilePath.default}
            stroke="#1f2937"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            animate={{
              d: isThinking 
                ? ["M 45 60 Q 60 70 75 60", "M 45 62 Q 60 68 75 62", "M 45 60 Q 60 70 75 60"]
                : smilePath.animated,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Cute antenna with sparkle */}
          <motion.g
            animate={{
              rotate: isThinking ? [-5, 5, -5] : [-3, 3, -3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ originX: '60px', originY: '15px' }}
          >
            <line x1="60" y1="15" x2="60" y2="5" stroke={colors.primary} strokeWidth="3" strokeLinecap="round" />
            <circle cx="60" cy="5" r="4" fill={colors.secondary} />
            <circle cx="60" cy="5" r="2" fill="white" opacity="0.8" />
          </motion.g>

          {/* Gradients */}
          <defs>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.primary} />
              <stop offset="100%" stopColor={colors.secondary} />
            </linearGradient>
            <linearGradient id="faceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#f8f9fa" stopOpacity="0.9" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating sparkles */}
        {!isThinking && (
          <>
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{
                y: [0, -10, 0],
                x: [0, 5, 0],
                opacity: [0.5, 1, 0.5],
                scale: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="w-5 h-5 text-purple-400" fill="currentColor" />
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-2"
              animate={{
                y: [0, -8, 0],
                x: [0, -3, 0],
                opacity: [0.4, 0.9, 0.4],
                scale: [0.7, 0.9, 0.7],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            >
              <Heart className="w-4 h-4 text-rose-400" fill="currentColor" />
            </motion.div>
          </>
        )}

        {/* Thinking dots */}
        {isThinking && (
          <motion.div
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-teal-500"
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Character name tag */}
      <motion.div
        className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-lg border border-purple-200"
        animate={{
          y: [0, -3, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <span className="text-xs font-medium bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
          Buddy
        </span>
      </motion.div>
    </div>
  );
}