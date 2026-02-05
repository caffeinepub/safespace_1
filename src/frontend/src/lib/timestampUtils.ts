/**
 * Unified timestamp conversion utilities for mood tracking
 * Ensures accurate conversion between local times and Internet Computer nanosecond timestamps
 * 
 * Key principles:
 * - When saving: Convert local date/time to UTC timestamp (nanoseconds)
 * - When displaying: Convert UTC timestamp back to local date/time
 * - Use BigInt arithmetic to prevent precision loss
 */

/**
 * Converts a local Date object to IC timestamp (nanoseconds in UTC)
 * The Date object represents a local time, and we convert it to UTC milliseconds
 * then to nanoseconds for the IC backend
 */
export const dateToICTimestamp = (date: Date): bigint => {
  // Get UTC milliseconds from the Date object
  // Date.getTime() returns milliseconds since Unix epoch in UTC
  const milliseconds = date.getTime();
  
  // Validate the timestamp is reasonable
  if (milliseconds < 0 || !Number.isFinite(milliseconds)) {
    throw new Error('Invalid date for timestamp conversion');
  }
  
  // Convert to nanoseconds for IC backend using BigInt to prevent precision loss
  const nanoseconds = BigInt(milliseconds) * BigInt(1_000_000);
  
  return nanoseconds;
};

/**
 * Converts IC timestamp (nanoseconds in UTC) to local Date object
 * Ensures accurate conversion without precision loss using BigInt division
 */
export const timestampToLocalDate = (timestamp: bigint): Date => {
  try {
    // Convert nanoseconds to milliseconds using BigInt division
    // This prevents precision loss that could occur with regular division
    const milliseconds = Number(timestamp / BigInt(1_000_000));
    
    // Validate the result is reasonable
    if (!Number.isFinite(milliseconds) || milliseconds < 0) {
      console.error('Invalid timestamp conversion:', timestamp);
      return new Date(0); // Return epoch as fallback
    }
    
    // Create Date object - this will automatically convert UTC to local time for display
    const date = new Date(milliseconds);
    
    // Additional validation
    if (isNaN(date.getTime())) {
      console.error('Invalid date from timestamp:', timestamp);
      return new Date(0);
    }
    
    return date;
  } catch (error) {
    console.error('Error converting timestamp:', timestamp, error);
    return new Date(0);
  }
};

/**
 * Converts IC timestamp (nanoseconds) to milliseconds
 * Uses BigInt division to prevent precision loss
 */
export const icTimestampToMilliseconds = (timestamp: bigint): number => {
  // Divide nanoseconds by 1,000,000 to get milliseconds
  const milliseconds = Number(timestamp / BigInt(1_000_000));
  
  // Validate result
  if (!Number.isFinite(milliseconds) || milliseconds < 0) {
    console.error('Invalid timestamp conversion:', timestamp);
    return 0;
  }
  
  return milliseconds;
};

/**
 * Gets local date key (YYYY-MM-DD format) from IC timestamp
 * Used for grouping moods by date in local timezone
 */
export const getLocalDateKey = (timestamp: bigint): string => {
  const date = timestampToLocalDate(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Gets normalized local date (midnight) from IC timestamp
 * Used for day-based comparisons in local timezone
 */
export const getLocalDateNormalized = (timestamp: bigint): Date => {
  const date = timestampToLocalDate(timestamp);
  // Create a new date at midnight local time to normalize for day comparison
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
};

/**
 * Creates a Date object at noon local time for the given date
 * This ensures consistent timestamp generation across different times of day
 * The resulting Date will have getTime() return UTC milliseconds
 */
export const createNoonLocalDate = (date: Date): Date => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // Create new Date at noon local time (12:00:00.000)
  // This constructor interprets the values as local time
  return new Date(year, month, day, 12, 0, 0, 0);
};

/**
 * Validates timestamp consistency across conversion
 * Returns true if the timestamp converts correctly to the expected date
 */
export const validateTimestamp = (timestamp: bigint, expectedDate?: Date): boolean => {
  try {
    const convertedDate = timestampToLocalDate(timestamp);
    
    if (!expectedDate) {
      // Just check if conversion produces valid date
      return !isNaN(convertedDate.getTime());
    }
    
    // Check if dates match (same day in local timezone)
    return (
      convertedDate.getFullYear() === expectedDate.getFullYear() &&
      convertedDate.getMonth() === expectedDate.getMonth() &&
      convertedDate.getDate() === expectedDate.getDate()
    );
  } catch (error) {
    console.error('Timestamp validation failed:', error);
    return false;
  }
};

/**
 * Formats a timestamp for display with local date and time
 */
export const formatTimestamp = (timestamp: bigint): string => {
  const date = timestampToLocalDate(timestamp);
  return date.toLocaleDateString([], { 
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Validates that a timestamp is within a reasonable range
 */
export const isValidTimestampRange = (timestamp: bigint): boolean => {
  const milliseconds = icTimestampToMilliseconds(timestamp);
  const date = new Date(milliseconds);
  
  // Check if date is between year 2000 and 2100
  const year = date.getFullYear();
  return year >= 2000 && year <= 2100 && !isNaN(date.getTime());
};

// Export alias for backward compatibility
export const convertNanosToDate = timestampToLocalDate;
