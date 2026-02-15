import { ConversationStage } from './types';

export const responseTemplates: Record<ConversationStage, string[]> = {
  intake: [
    "I'm here to listen. What's on your mind today?",
    "Thank you for sharing. How are you feeling right now?",
    "I appreciate you opening up. Can you tell me more about what brought you here?",
  ],
  reflective: [
    "It sounds like you're feeling [emotion]. Is that right?",
    "I hear that this has been [difficult/challenging] for you.",
    "What you're describing sounds really [adjective].",
  ],
  regulation: [
    "Let's take a moment to breathe together. Would that be okay?",
    "Sometimes it helps to ground ourselves. Can you name 5 things you can see right now?",
    "Your feelings are valid. Let's work through this together.",
  ],
  psychoeducation: [
    "Many people experience similar feelings. You're not alone in this.",
    "What you're describing is a common response to stress.",
    "It's helpful to understand that emotions come in waves.",
  ],
  goals: [
    "What would you like to work towards?",
    "What does feeling better look like for you?",
    "Let's think about small steps you could take.",
  ],
  coping: [
    "What has helped you in the past when you've felt this way?",
    "Let's explore some strategies that might work for you.",
    "Have you tried any coping techniques before?",
  ],
  progress: [
    "How have things been since we last talked?",
    "I notice you've been working on [goal]. How is that going?",
    "What progress have you noticed, even if it's small?",
  ],
  crisis: [
    "I'm concerned about your safety. Are you in immediate danger?",
    "Please reach out to a crisis helpline: 988 (US) or your local emergency services.",
    "Your life matters. Please talk to someone who can help right away.",
  ],
  referral: [
    "It might be helpful to speak with a licensed therapist.",
    "I encourage you to reach out to a mental health professional.",
    "A trained counselor can provide more specialized support.",
  ],
};

export function getTemplate(stage: ConversationStage): string {
  const templates = responseTemplates[stage];
  return templates[Math.floor(Math.random() * templates.length)];
}
