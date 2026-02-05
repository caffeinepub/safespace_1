// AI Templates - Stage-based response templates

import { ConversationStage } from './types';

export interface TemplateSet {
  responses: string[];
  followUpQuestions?: string[];
}

export const STAGE_TEMPLATES: Record<ConversationStage, TemplateSet> = {
  [ConversationStage.INTAKE_ASSESSMENT]: {
    responses: [
      "I'm glad you reached out. This is a safe space for you to share whatever you're feeling.",
      "Thank you for being here. I'm here to listen and support you, without judgment.",
      "Welcome. I'm here to understand what you're experiencing and how I can best support you.",
    ],
    followUpQuestions: [
      "What's been on your mind lately?",
      "How have you been feeling recently?",
      "What brought you here today?",
    ],
  },

  [ConversationStage.REFLECTIVE_LISTENING]: {
    responses: [
      "It sounds like you've been carrying a lot. Thank you for sharing that with me.",
      "I hear what you're saying. That sounds really difficult.",
      "What you're feeling makes sense given what you're going through.",
      "I appreciate you opening up about this. Your feelings are completely valid.",
      "That sounds heavy. It takes courage to acknowledge these feelings.",
    ],
    followUpQuestions: [
      "Can you tell me more about that?",
      "How long have you been feeling this way?",
      "What does that feel like for you?",
      "Is there anything else you'd like to share about this?",
    ],
  },

  [ConversationStage.EMOTIONAL_REGULATION]: {
    responses: [
      "When emotions feel overwhelming, sometimes small steps can help. Would you like to explore some gentle techniques together?",
      "It's okay to feel what you're feeling. If you're open to it, I can share some ways people find helpful for managing difficult emotions.",
      "You're doing the right thing by acknowledging how you feel. Would it help if I shared some calming approaches?",
    ],
    followUpQuestions: [
      "Would you like to try a simple breathing exercise?",
      "Have you found anything that helps you feel more grounded?",
      "What usually helps you when you're feeling this way?",
    ],
  },

  [ConversationStage.PSYCHOEDUCATION]: {
    responses: [
      "What you're experiencing is a natural response to stress. Our emotions are signals, not flaws.",
      "It's common to feel this way when we're under pressure. Your mind and body are trying to protect you.",
      "These feelings you're describing are your system's way of responding to what's happening around you. It doesn't mean something is wrong with you.",
      "Many people experience similar feelings. Emotions like this are part of being human, especially during challenging times.",
    ],
    followUpQuestions: [
      "Does understanding this change how you see what you're feeling?",
      "What makes the most sense to you about what you're experiencing?",
    ],
  },

  [ConversationStage.GOAL_CLARIFICATION]: {
    responses: [
      "It sounds like you have a sense of what you'd like to change or work toward. That's an important first step.",
      "I hear that you want things to feel different. What would that look like for you?",
      "Understanding what you need is valuable. Let's explore what that might mean for you.",
    ],
    followUpQuestions: [
      "What would feel different if things improved?",
      "What's one small thing that would make a difference?",
      "How would you know things were getting better?",
    ],
  },

  [ConversationStage.COPING_DEVELOPMENT]: {
    responses: [
      "Let's think about what might work for you specifically. Everyone's different, so we can explore what feels right.",
      "Building coping strategies is about finding what fits your life and your needs. What has helped you in the past, even a little?",
      "Small, realistic steps tend to work best. What feels manageable for you right now?",
    ],
    followUpQuestions: [
      "What's one thing you could try this week?",
      "Who in your life could support you with this?",
      "What would make this easier to practice?",
    ],
  },

  [ConversationStage.PROGRESS_REFLECTION]: {
    responses: [
      "I'm noticing that you've been working through some difficult feelings. How does it feel to reflect on where you started?",
      "You've shared a lot today. What stands out to you from our conversation?",
      "It sounds like you're noticing some shifts. That awareness itself is meaningful.",
    ],
    followUpQuestions: [
      "What feels different now compared to when we started talking?",
      "What have you learned about yourself through this?",
      "What would you like to remember from today?",
    ],
  },

  [ConversationStage.CRISIS_GROUNDING]: {
    responses: [
      "I hear that you're in a lot of pain right now. You're not alone in this moment. Let's focus on right now, just this moment.",
      "What you're feeling is overwhelming, and that's real. Right now, you're here, and that matters. Can we take this one breath at a time?",
      "I'm here with you. You reached out, which took strength. Let's focus on getting through this moment together.",
    ],
    followUpQuestions: [
      "Can you name five things you can see around you right now?",
      "Is there someone you trust who you can reach out to?",
      "Can you feel your feet on the ground? Let's focus on that for a moment.",
    ],
  },

  [ConversationStage.REFERRAL_GUIDANCE]: {
    responses: [
      "What you're going through sounds significant. While I'm here to support you, talking with someone trained in this area could be really helpful.",
      "I'm glad you're sharing this with me. It might be valuable to connect with someone who specializes in supporting people through what you're experiencing.",
      "You deserve support that matches what you're going through. Have you considered reaching out to a counselor or therapist?",
    ],
    followUpQuestions: [
      "Would you be open to exploring professional support options?",
      "Is there anything preventing you from reaching out to a counselor?",
      "What would make it easier for you to take that step?",
    ],
  },
};

// Crisis-specific templates with explicit safety language
export const CRISIS_SAFETY_MESSAGES = [
  "If you're in immediate danger, please call emergency services (911) or go to your nearest emergency room.",
  "Crisis support is available 24/7. In the US, you can call or text 988 for the Suicide & Crisis Lifeline.",
  "You don't have to face this alone. Please reach out to someone you trust or a crisis helpline right away.",
];
