// Email service using nodemailer to send emails

import { defineSecret } from 'firebase-functions/params';
import * as nodemailer from 'nodemailer';

// Define secrets from Firebase parameters
const emailPassword = defineSecret('EMAIL_PASSWORD');

// Email sender configuration
const SENDER_EMAIL = 'goughcafe@gmail.com';
const SENDER_NAME = 'Gough Cafe';

// Response status codes
export enum EmailStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  ERROR = 'error'
}

export interface EmailResponse {
  success: boolean;
  status: EmailStatus;
  message: string;
  error?: string;
}

/**
 * Sends an email using nodemailer
 * @param recipientEmail The email address to send to
 * @param subject The email subject line
 * @param message The email content (body)
 * @param htmlMessage Optional HTML formatted message
 * @returns Promise that resolves with the email response
 */
async function sendEmail(
  recipientEmail: string, 
  message: string,
  subject: string = 'CAFE GOUGH ORDER READY',
  htmlMessage?: string
): Promise<EmailResponse> {
  try {
    // Get the email app password from Firebase secrets
    let password: string;
    try {
      password = emailPassword.value();
      
      if (!password) {
        throw new Error('Email password is empty');
      }
      console.log('Successfully retrieved EMAIL_PASSWORD secret! Length:', password.length);
    } catch (secretError) {
      console.error('Error retrieving email password from secrets:', secretError);
      return {
        success: false,
        status: EmailStatus.ERROR,
        message: 'System configuration error. Please contact support.',
        error: 'Email password not properly configured in Firebase'
      };
    }
    
    // Validate email address with a simple regex
    if (!isValidEmail(recipientEmail)) {
      return {
        success: false,
        status: EmailStatus.ERROR,
        message: 'Invalid email address format. Please enter a valid email.'
      };
    }
    
    console.log(`Sending email to ${recipientEmail}`);
    
    // Create email transporter with Gmail app password authentication
    const transporter = nodemailer.createTransport({
      service: 'gmail',  // Using 'gmail' service instead of manual host/port configuration
      auth: {
        user: SENDER_EMAIL,
        pass: password // Using app password instead of regular password
      }
    });

    try {
      // Send the email with improved headers for better deliverability
      const mailOptions: {
        from: string;
        to: string;
        subject: string;
        text: string;
        html?: string;
        headers?: Record<string, string>;
        replyTo?: string;
      } = {
        from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
        to: recipientEmail,
        subject: subject,
        text: message,
        replyTo: SENDER_EMAIL,
        headers: {
          // These headers help improve deliverability
          'X-Priority': '1',
          'Importance': 'high',
          'X-MSMail-Priority': 'High',
          'List-Unsubscribe': `<mailto:${SENDER_EMAIL}?subject=unsubscribe>`,
          'Precedence': 'bulk'
        }
      };
      
      // Add HTML content if provided (recommended for better deliverability)
      if (htmlMessage) {
        mailOptions.html = htmlMessage;
      } else if (message) {
        // Convert plain text to simple HTML if no HTML version provided
        mailOptions.html = message.replace(/\n/g, '<br>');
      }
      
      // Verify connection configuration before sending
      await transporter.verify();
      
      const info = await transporter.sendMail(mailOptions);
      
      console.log(`Email sent successfully to ${recipientEmail}`);
      console.log('Message ID:', info.messageId);
      
      return {
        success: true,
        status: EmailStatus.SUCCESS,
        message: 'Email sent successfully'
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error sending email to ${recipientEmail}:`, errorMsg);
      
      return {
        success: false,
        status: EmailStatus.FAILED,
        message: 'Failed to send email. Please try again later.',
        error: errorMsg
      };
    }
  } catch (error) {
    console.error('Error in sendEmail:', error);
    return {
      success: false,
      status: EmailStatus.ERROR,
      message: 'An unexpected error occurred while sending the email.',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Helper function to validate email format
 * @param email The email to validate
 * @returns boolean indicating if the email format is valid
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default sendEmail;
