export enum MoodError {
  Availability = 'availability',
  Permission = 'permission',
  Unknown = 'unknown',
}

export function classifyMoodError(error: unknown): MoodError {
  const errorString = error?.toString().toLowerCase() || '';

  // Check for transient availability/connectivity issues
  if (
    errorString.includes('unavailable') ||
    errorString.includes('replica') ||
    errorString.includes('canister') ||
    errorString.includes('connection') ||
    errorString.includes('network') ||
    errorString.includes('timeout')
  ) {
    return MoodError.Availability;
  }

  // Check for permission/authorization issues
  if (
    errorString.includes('unauthorized') ||
    errorString.includes('permission') ||
    errorString.includes('access denied') ||
    errorString.includes('forbidden')
  ) {
    return MoodError.Permission;
  }

  // Default to unknown error
  return MoodError.Unknown;
}
