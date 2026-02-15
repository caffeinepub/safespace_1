const nudgeMessages = [
  "You're doing great by being here.",
  "Remember to be kind to yourself.",
  "Every step forward counts.",
  "Your feelings are valid.",
  "Take your time - there's no rush.",
];

export function getRandomNudge(): string {
  return nudgeMessages[Math.floor(Math.random() * nudgeMessages.length)];
}

export function shouldShowNudge(lastNudgeTime: number, exchangeCount: number): boolean {
  const timeSinceLastNudge = Date.now() - lastNudgeTime;
  const minInterval = 5 * 60 * 1000; // 5 minutes
  
  return timeSinceLastNudge > minInterval && exchangeCount > 3;
}
