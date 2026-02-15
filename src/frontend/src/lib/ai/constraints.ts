export function validateResponse(response: string): boolean {
  const lowerResponse = response.toLowerCase();
  
  // No diagnosis
  if (lowerResponse.includes('you have') && (lowerResponse.includes('disorder') || lowerResponse.includes('condition'))) {
    return false;
  }
  
  // No therapy claims
  if (lowerResponse.includes('i can cure') || lowerResponse.includes('i will fix')) {
    return false;
  }
  
  return true;
}
