// Simple placeholder for text message service
// In production, you would integrate with Twilio or another SMS provider

import { defineSecret } from 'firebase-functions/params';
import axios from 'axios';
import * as querystring from 'querystring';

// Define the secret from Firebase parameters
// This will be accessible in the deployed environment
const textbeltApiKey = defineSecret('TEXTBELT_API_KEY');

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
    // Get the API key from Firebase secrets
    let apiKey: string;
    try {
      apiKey = textbeltApiKey.value();
      if (!apiKey) {
        throw new Error('API key is empty');
      }
    } catch (secretError) {
      console.error('Error retrieving TextBelt API key from secrets:', secretError);
      throw new Error('TextBelt API key not properly configured in Firebase');
    }
    
    console.log(`Sending text message to ${phoneNumber}`);
    
    // Format the phone number (remove any non-digit characters)
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Use form data format for Textbelt (not JSON)
    const formData = {
      phone: formattedPhone,
      message: message,
      key: apiKey
    };
    
    console.log('Sending text with payload:', {
      phone: formattedPhone,
      message: message,
      key: '[REDACTED]' // Don't log actual API key
    });
    
    // Send text using Textbelt API with proper form encoding
    const response = await axios.post(
      'https://textbelt.com/text',
      querystring.stringify(formData),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
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