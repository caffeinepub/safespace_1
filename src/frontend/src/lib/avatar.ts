export function getUserInitials(name?: string): string {
  if (!name || name.trim() === '') {
    return 'U';
  }

  const parts = name.trim().split(/\s+/);
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
