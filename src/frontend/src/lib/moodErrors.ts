export enum MoodError {
  AVAILABILITY = 'availability',
  PERMISSION = 'permission',
  UNKNOWN = 'unknown',
}

export function classifyMoodError(error: Error): MoodError {
  const message = error.message.toLowerCase();
  
  if (message.includes('unauthorized') || message.includes('permission')) {
    return MoodError.PERMISSION;
  }
  
  if (message.includes('not available') || message.includes('not found')) {
    return MoodError.AVAILABILITY;
  }
  
  return MoodError.UNKNOWN;
}
