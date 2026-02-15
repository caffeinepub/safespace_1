import { EmotionData } from './types';

export function detectEmotion(text: string): EmotionData | null {
  const lowerText = text.toLowerCase();
  
  const emotionKeywords: Record<string, string[]> = {
    happy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing'],
    sad: ['sad', 'down', 'depressed', 'unhappy', 'miserable'],
    anxious: ['anxious', 'worried', 'nervous', 'scared', 'afraid'],
    angry: ['angry', 'mad', 'furious', 'annoyed', 'frustrated'],
    calm: ['calm', 'peaceful', 'relaxed', 'serene'],
  };
  
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return {
          emotion,
          confidence: 0.7,
        };
      }
    }
  }
  
  return null;
}
