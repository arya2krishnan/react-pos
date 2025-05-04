// Simple placeholder for text message service
// In production, you would integrate with Twilio or another SMS provider

export default async function sendText(phoneNumber: string, message: string): Promise<boolean> {
  console.log(`Sending text to ${phoneNumber}: ${message}`);
  
  // Simulate successful text sending
  return true;
} 