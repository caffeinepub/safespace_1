export function convertNanosToDate(nanos: bigint): Date {
  const millis = Number(nanos / BigInt(1000000));
  return new Date(millis);
}

export function convertDateToNanos(date: Date): bigint {
  return BigInt(date.getTime()) * BigInt(1000000);
}

export function formatTimestamp(nanos: bigint): string {
  const date = convertNanosToDate(nanos);
  return date.toLocaleString();
}

export function formatDate(nanos: bigint): string {
  const date = convertNanosToDate(nanos);
  return date.toLocaleDateString();
}

export function formatTime(nanos: bigint): string {
  const date = convertNanosToDate(nanos);
  return date.toLocaleTimeString();
}
