// Define CartItem interface locally to avoid dependency issues
export interface CartItem {
  item: {
    id?: string | number;
    name?: string;
    price?: number;
    description?: string;
    imageUrl?: string;
  };
  quantity: number;
  selectedOptions: Record<string, string[]>;
}

// Logo URL for the cafe
const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/cafe-pos-gough.firebasestorage.app/o/site-image%2FCafeGoughSummer.png?alt=media&token=f8575872-f846-4013-a2ba-f84f762d7d73";

/**
 * Generate HTML email for order confirmation
 * @param customerName Customer's name
 * @param orderNumber Order number
 * @param items Items in the order
 * @param totalAmount Total order amount
 * @returns HTML string for the email
 */
export function generateOrderConfirmationEmail(
  customerName: string,
  orderNumber: number,
  items: CartItem[],
  totalAmount: number
): string {
  // Format the items list
  const itemsList = items.map(item => {
    const itemName = item.item.name || 'Unnamed Item';
    const options = Object.entries(item.selectedOptions || {})
      .map(([name, values]) => `${name}: ${(values as string[]).join(', ')}`)
      .join('<br>');
    
    return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${itemName} x ${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${options ? `<small style="color: #666;">${options}</small>` : ''}
        </td>
      </tr>
    `;
  }).join('');

  // Generate the HTML
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Cafe Gough Order</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
          background-color: #f9f9f9; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
          background-color: #fff; 
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .header { 
          text-align: center; 
          padding: 20px 0; 
          border-bottom: 1px solid #eee;
        }
        .logo { 
          max-width: 150px; 
          height: auto; 
        }
        .order-details { 
          padding: 20px 0; 
          border-bottom: 1px solid #eee;
        }
        .items-table { 
          width: 100%; 
          border-collapse: collapse;
        }
        .footer { 
          padding: 20px 0; 
          text-align: center; 
          font-size: 12px; 
          color: #777; 
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${LOGO_URL}" alt="Cafe Gough Logo" class="logo">
          <h1>Thank You for Your Order!</h1>
        </div>
        
        <div class="order-details">
          <p>Hello ${customerName || 'Valued Customer'},</p>
          <p>Your order #${orderNumber} has been received and is being prepared.</p>
          <p>Here's a summary of your order:</p>
          
          <table class="items-table">
            <thead>
              <tr>
                <th style="text-align: left; padding: 10px; border-bottom: 2px solid #eee;">Item</th>
                <th style="text-align: left; padding: 10px; border-bottom: 2px solid #eee;">Options</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
          <p>We'll notify you when your order is ready for pickup!</p>
        </div>
        
        <div class="footer">
          <p>Cafe Gough</p>
          <p>Thank you for supporting our business!</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate HTML email for order ready notification
 * @param customerName Customer's name
 * @param orderNumber Order number
 * @returns HTML string for the email
 */
export function generateOrderReadyEmail(
  customerName: string,
  orderNumber: number
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Cafe Gough Order is Ready!</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
          background-color: #f9f9f9; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
          background-color: #fff; 
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .header { 
          text-align: center; 
          padding: 20px 0; 
          border-bottom: 1px solid #eee;
        }
        .logo { 
          max-width: 150px; 
          height: auto; 
        }
        .content { 
          padding: 20px 0; 
          text-align: center;
        }
        .footer { 
          padding: 20px 0; 
          text-align: center; 
          font-size: 12px; 
          color: #777; 
        }
        .ready-notice {
          font-size: 24px;
          font-weight: bold;
          color: #4CAF50;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${LOGO_URL}" alt="Cafe Gough Logo" class="logo">
          <h1>Your Order is Ready!</h1>
        </div>
        
        <div class="content">
          <p>Hello ${customerName || 'Valued Customer'},</p>
          <div class="ready-notice">
            Your order #${orderNumber} is now ready for pickup!
          </div>
          <p>Please head to the counter to collect your order.</p>
          <p>Thank you for choosing Cafe Gough!</p>
        </div>
        
        <div class="footer">
          <p>Cafe Gough</p>
          <p>Thank you for supporting our business!</p>
        </div>
      </div>
    </body>
    </html>
  `;
} 