import { CartItem } from '../store/cartStore';

export interface OrderData {
  id?: number;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  textOptIn: boolean;
  items: CartItem[];
  totalAmount: number;
  orderDate: string;
  donation: {
    donated: boolean;
    amount?: number;
  };
}

export interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  error?: string;
}

// In a real app, you'd use an actual API endpoint
// const API_URL = 'https://api.example.com/orders';

export const apiService = {
  /**
   * Submit an order to the backend
   */
  submitOrder: async (orderData: OrderData): Promise<ApiResponse<OrderData>> => {
    try {
      // In a production app, you would use the actual API
      // const response = await fetch(`${API_URL}`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(orderData),
      // });
      // const data = await response.json();
      
      // For demonstration, we'll simulate a successful API call
      console.log('Order submitted to API:', orderData);
      
      // Simulate server processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        data: {
          ...orderData,
          id: Math.floor(Math.random() * 1000), // Simulate server-generated ID
        }
      };
    } catch (error) {
      console.error('API error:', error);
      return {
        success: false,
        error: 'Failed to submit order. Please try again.'
      };
    }
  },
  
  /**
   * Get order history from the backend
   */
  getOrders: async (): Promise<ApiResponse<OrderData[]>> => {
    try {
      // In a production app, you would use the actual API
      // const response = await fetch(`${API_URL}`);
      // const data = await response.json();
      
      // For demonstration, we'll return an empty array
      return {
        success: true,
        data: []
      };
    } catch (error) {
      console.error('API error:', error);
      return {
        success: false,
        error: 'Failed to fetch orders. Please try again.'
      };
    }
  }
}; 