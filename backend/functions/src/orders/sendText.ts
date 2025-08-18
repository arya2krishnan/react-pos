// Text message service using Twilio API
// This implementation uses Twilio's SMS API for reliable text message delivery

import { defineSecret } from 'firebase-functions/params';
import twilio from 'twilio';

// Define secrets from Firebase parameters
const twilioAccountSid = defineSecret('TWILIO_ACCOUNT_SID');
const twilioAuthToken = defineSecret('TWILIO_AUTH_TOKEN');
const twilioPhoneNumber = defineSecret('TWILIO_PHONE_NUMBER');

// Response status codes that can be used by the frontend
export enum TextStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  ERROR = 'error'
}

export interface TextResponse {
  success: boolean;
  status: TextStatus;
  message: string;
  messageSid?: string;
  error?: string;
}

/**
 * Sends a text message using Twilio SMS API
 * @param phoneNumber The phone number to send the text to
 * @param message The message content to send
 * @returns Promise that resolves with the text response
 */
async function sendText(phoneNumber: string, message: string): Promise<TextResponse> {
  try {
    // Get Twilio credentials from Firebase secrets
    let accountSid: string;
    let authToken: string;
    let fromNumber: string;
    
    try {
      accountSid = twilioAccountSid.value();
      authToken = twilioAuthToken.value();
      fromNumber = twilioPhoneNumber.value();
      
      if (!accountSid || !authToken || !fromNumber) {
        throw new Error('Missing Twilio credentials');
      }
      
      console.log('Successfully retrieved Twilio credentials!');
    } catch (secretError) {
      console.error('Error retrieving Twilio credentials from secrets:', secretError);
      return {
        success: false,
        status: TextStatus.ERROR,
        message: 'System configuration error. Please contact support.',
        error: 'Twilio credentials not properly configured in Firebase'
      };
    }
    
    // Format the phone number (ensure it starts with +1 for US numbers)
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    if (!formattedPhone || formattedPhone.length < 10) {
      return {
        success: false,
        status: TextStatus.ERROR,
        message: 'Invalid phone number format. Please enter a valid phone number.'
      };
    }
    
    console.log(`Sending text message to ${formattedPhone} via Twilio`);
    
    // Initialize Twilio client
    const client = twilio(accountSid, authToken);
    
    // Send SMS using Twilio
    const twilioMessage = await client.messages.create({
      body: message,
      to: formattedPhone,
      from: fromNumber
    });
    
    console.log(`Twilio message sent successfully! SID: ${twilioMessage.sid}`);
    console.log(`Message status: ${twilioMessage.status}`);
    
    return {
      success: true,
      status: TextStatus.SUCCESS,
      message: 'Text message sent successfully',
      messageSid: twilioMessage.sid
    };
    
  } catch (error) {
    console.error('Error in sendText:', error);
    
    // Handle specific Twilio errors
    if (error instanceof Error) {
      if (error.message.includes('not a valid phone number')) {
        return {
          success: false,
          status: TextStatus.ERROR,
          message: 'Invalid phone number format. Please enter a valid phone number.',
          error: error.message
        };
      } else if (error.message.includes('authentication')) {
        return {
          success: false,
          status: TextStatus.ERROR,
          message: 'Authentication error. Please contact support.',
          error: error.message
        };
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        return {
          success: false,
          status: TextStatus.ERROR,
          message: 'Message quota exceeded. Please try again later.',
          error: error.message
        };
      }
    }
    
    return {
      success: false,
      status: TextStatus.FAILED,
      message: 'An unexpected error occurred while sending the text message. Please call to place your order.',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Helper function to format a phone number for Twilio
 * Ensures proper E.164 format (+1XXXXXXXXXX for US numbers)
 */
function formatPhoneNumber(phoneNumber: string): string {
  // Remove any non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // If it's a 10-digit US number, add +1 prefix
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  
  // If it's an 11-digit number starting with 1, add + prefix
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  
  // If it already has a + prefix, return as is
  if (phoneNumber.startsWith('+')) {
    return phoneNumber.replace(/\s/g, ''); // Remove spaces
  }
  
  // Return the cleaned number (let Twilio handle validation)
  return cleaned;
}

export default sendText; 