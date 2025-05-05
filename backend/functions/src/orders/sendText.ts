// Simple placeholder for text message service
// In production, you would integrate with Twilio or another SMS provider

import * as functions from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';
import axios from 'axios';

// Define the secret (this should be set with the Firebase CLI)
const twilioApiKey = defineSecret('TWILIO_APIKEY');

interface TextbeltResponse {
  success: boolean;
  quotaRemaining?: number;
  textId?: string;
  error?: string;
}

/**
 * Sends a text message using the Textbelt API
 * @param phoneNumber The phone number to send the text to
 * @param message The message content to send
 * @returns Promise that resolves with the Textbelt response
 */
async function sendText(phoneNumber: string, message: string): Promise<TextbeltResponse> {
  try {
    // Get the API key from the defined secret
    const apiKey = twilioApiKey.value();
    
    if (!apiKey) {
      console.error('Textbelt API key not configured in Firebase environment');
      throw new Error('Text messaging service not properly configured');
    }
    
    console.log(`Sending text message to ${phoneNumber}`);
    
    // Format the phone number (remove any non-digit characters)
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Send text using Textbelt API
    const response = await axios.post('https://textbelt.com/text', {
      phone: formattedPhone,
      message: message,
      key: apiKey,
    });
    
    const data = response.data as TextbeltResponse;
    
    console.log(`Text message ${data.success ? 'sent successfully' : 'failed'}`, data);
    
    if (data.quotaRemaining !== undefined) {
      console.log(`Remaining text message quota: ${data.quotaRemaining}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error sending text message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Helper function to format a phone number for texting
 * Removes non-digit characters and ensures valid format
 */
function formatPhoneNumber(phoneNumber: string): string {
  // Remove any non-digit characters
  return phoneNumber.replace(/\D/g, '');
}

export default sendText; 