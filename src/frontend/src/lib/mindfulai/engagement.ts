export function calculateEngagement(exchangeCount: number): number {
  // Simple engagement calculation: 0-100 based on exchange count
  const maxExchanges = 20;
  const engagement = Math.min(100, (exchangeCount / maxExchanges) * 100);
  return Math.round(engagement);
}
