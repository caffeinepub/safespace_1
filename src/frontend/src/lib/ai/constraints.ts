// AI Constraints - Response validation and safety checks

import { ResponseConstraints } from './types';

export const DEFAULT_CONSTRAINTS: ResponseConstraints = {
  noDiagnosis: true,
  noTherapyClaims: true,
  reflectiveFirst: true,
  permissionBeforeTechniques: true,
  implicitBoundaries: true,
  crisisSafeMode: false,
};

export const CRISIS_CONSTRAINTS: ResponseConstraints = {
  ...DEFAULT_CONSTRAINTS,
  crisisSafeMode: true,
  implicitBoundaries: false, // More explicit in crisis
};

// Validate that response follows constraints
export function validateResponse(response: string, constraints: ResponseConstraints): boolean {
  const lowerResponse = response.toLowerCase();

  // Check for diagnosis language
  if (constraints.noDiagnosis) {
    const diagnosisTerms = ['diagnosed', 'disorder', 'condition', 'illness', 'disease'];
    if (diagnosisTerms.some(term => lowerResponse.includes(term))) {
      return false;
    }
  }

  // Check for therapy claims
  if (constraints.noTherapyClaims) {
    const therapyTerms = ['i am a therapist', 'as your therapist', 'therapy session'];
    if (therapyTerms.some(term => lowerResponse.includes(term))) {
      return false;
    }
  }

  return true;
}

// Ensure reflective language is present
export function hasReflectiveLanguage(response: string): boolean {
  const reflectivePhrases = [
    'it sounds like', 'it seems', 'i hear', 'that feels', 'you mentioned',
    'what i\'m hearing', 'it appears', 'you\'re experiencing'
  ];
  
  const lowerResponse = response.toLowerCase();
  return reflectivePhrases.some(phrase => lowerResponse.includes(phrase));
}

// Check if permission is asked before offering techniques
export function asksPermission(response: string): boolean {
  const permissionPhrases = [
    'would you like', 'would it help', 'can i share', 'may i suggest',
    'are you open to', 'would you be interested', 'if you\'re comfortable'
  ];
  
  const lowerResponse = response.toLowerCase();
  return permissionPhrases.some(phrase => lowerResponse.includes(phrase));
}
