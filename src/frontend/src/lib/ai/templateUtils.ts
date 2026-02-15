export function adaptTemplate(template: string, userMessage: string): string {
  // Simple template adaptation - replace placeholders
  let adapted = template;
  
  // Extract emotion from user message (simple keyword matching)
  const emotions = ['sad', 'happy', 'anxious', 'angry', 'stressed', 'lonely', 'hopeful'];
  for (const emotion of emotions) {
    if (userMessage.toLowerCase().includes(emotion)) {
      adapted = adapted.replace('[emotion]', emotion);
      break;
    }
  }
  
  // Replace other placeholders with generic terms
  adapted = adapted.replace('[difficult/challenging]', 'challenging');
  adapted = adapted.replace('[adjective]', 'significant');
  adapted = adapted.replace('[goal]', 'your goals');
  
  return adapted;
}
