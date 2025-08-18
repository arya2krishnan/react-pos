# Twilio SMS Setup Guide

## Overview
Your React POS system has been updated to use Twilio for sending SMS notifications instead of email. This provides more reliable text message delivery to customers when their orders are ready.

## What Changed
- ✅ Removed email functionality from order creation and completion
- ✅ Added Twilio SMS integration for order notifications
- ✅ Updated phone number formatting to E.164 format (+1XXXXXXXXXX)
- ✅ Improved error handling for SMS delivery

## Firebase Secrets Configuration

You need to set up three Firebase secrets for Twilio integration:

### 1. Get Your Twilio Credentials
1. Log into your [Twilio Console](https://console.twilio.com/)
2. Find your **Account SID** (starts with "AC...")
3. Find your **Auth Token** (or generate a new one)
4. Note your **Twilio Phone Number** (the number you'll be sending from)

### 2. Set Firebase Secrets
Run these commands in your terminal from the project root:

```bash
# Set Twilio Account SID
firebase functions:secrets:set TWILIO_ACCOUNT_SID

# Set Twilio Auth Token  
firebase functions:secrets:set TWILIO_AUTH_TOKEN

# Set Twilio Phone Number
firebase functions:secrets:set TWILIO_PHONE_NUMBER
```

When prompted, enter your Twilio credentials:
- **TWILIO_ACCOUNT_SID**: Your Twilio Account SID (e.g., AC1234567890abcdef...)
- **TWILIO_AUTH_TOKEN**: Your Twilio Auth Token
- **TWILIO_PHONE_NUMBER**: Your Twilio phone number in E.164 format (e.g., +15551234567)

### 3. Deploy the Updated Functions
```bash
cd backend/functions
npm run deploy
```

## How It Works

### Order Creation
- Customers can still provide their phone number when placing orders
- No email is required or sent during order creation
- Orders are stored in Firestore with phone number and text opt-in preference

### Order Completion
- When an order is marked as finished, the system checks if:
  - Customer opted in for text notifications (`textOptIn: true`)
  - Customer provided a phone number
- If both conditions are met, a text message is sent via Twilio
- Message format: `"CAFE GOUGH: Hello [Name]! Your order [OrderNumber] is ready! Head to the counter to pick it up!"`

### Phone Number Formatting
The system automatically formats phone numbers to E.164 format:
- `(555) 123-4567` → `+15551234567`
- `555-123-4567` → `+15551234567`
- `5551234567` → `+15551234567`

## Error Handling

The system handles various error scenarios:
- **Invalid phone numbers**: Returns user-friendly error message
- **Authentication errors**: Logs error and returns appropriate message
- **Quota exceeded**: Informs user to try again later
- **Network issues**: Graceful fallback with error logging

## Testing

To test the SMS functionality:
1. Create an order with a valid phone number and `textOptIn: true`
2. Mark the order as finished in the admin interface
3. Check your phone for the notification message
4. Verify the message appears in your Twilio console logs

## Cost Considerations

- Twilio charges per SMS sent (typically $0.0075 per message in the US)
- Monitor your Twilio usage in the console
- Consider setting up usage alerts to avoid unexpected charges

## Troubleshooting

### Common Issues:
1. **"Authentication error"**: Check your Account SID and Auth Token
2. **"Invalid phone number"**: Ensure phone numbers are in valid US format
3. **"Message not received"**: Check Twilio console for delivery status
4. **"Quota exceeded"**: Check your Twilio account limits

### Debug Steps:
1. Check Firebase Functions logs: `firebase functions:log`
2. Verify secrets are set: `firebase functions:secrets:access`
3. Test Twilio credentials in Twilio console
4. Ensure your Twilio phone number is active and verified

## Next Steps

After setup:
1. Test with a real order to ensure SMS delivery works
2. Monitor your Twilio usage and costs
3. Consider adding SMS templates for different message types
4. Set up webhook notifications for delivery status updates (optional)

