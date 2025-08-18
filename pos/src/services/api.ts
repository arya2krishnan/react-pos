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

export interface ItemData {
  id?: string | number;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  options?: Record<string, unknown>;
  title?: string; // For compatibility with existing code
  category?: string; // Add category field
  soldOut?: boolean; // Add sold out status
  displayOrder?: number; // Add display order for sorting
}

export interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ShopStatusResponse {
  isOpen: boolean;
}

const API_BASE_URL = 'https://api-2ya6yhttpq-uc.a.run.app';

export const apiService = {
  /**
   * Get the current shop status (open or closed)
   */
  getShopStatus: async (): Promise<ApiResponse<ShopStatusResponse>> => {
    try {
      console.log('Fetching shop status from API');
      const response = await fetch(`${API_BASE_URL}/shop-status`);
      console.log('Shop status response:', response);
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch {
          errorText = 'Could not get error text';
        }
        console.error('Server error response:', errorText);
        throw new Error(`Failed to fetch shop status: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Shop status raw data:', data);
      
      // Ensure we have a boolean value for isOpen
      const isOpen = !!data.isOpen;
      console.log('Shop is currently:', isOpen ? 'OPEN' : 'CLOSED');
      
      return {
        success: true,
        data: {
          isOpen
        }
      };
    } catch (error) {
      console.error('API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch shop status'
      };
    }
  },
  
  /**
   * Toggle the shop's open/closed status
   */
  toggleShopStatus: async (isOpen: boolean): Promise<ApiResponse<ShopStatusResponse>> => {
    try {
      console.log(`Setting shop status to: ${isOpen ? 'open' : 'closed'}`);
      const response = await fetch(`${API_BASE_URL}/open-shop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isOpen }),
      });
      console.log('Toggle shop status response:', response);
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch {
          errorText = 'Could not get error text';
        }
        console.error('Server error response:', errorText);
        throw new Error(`Failed to toggle shop status: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Toggle shop status raw data:', data);
      
      // Ensure we have a boolean value for isOpen
      const newStatus = !!data.isOpen;
      console.log('Shop is now:', newStatus ? 'OPEN' : 'CLOSED');
      
      return {
        success: true,
        data: {
          isOpen: newStatus
        }
      };
    } catch (error) {
      console.error('API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to toggle shop status'
      };
    }
  },

  /**
   * Get all items from the backend
   */
  getItems: async (): Promise<ApiResponse<ItemData[]>> => {
    try {
      console.log('Fetching items from API');
      const response = await fetch(`${API_BASE_URL}/items`);
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch {
          errorText = 'Could not get error text';
        }
        console.error('Server error response:', errorText);
        throw new Error(`Failed to fetch items: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Items retrieved from API:', data);
      
      // Transform the data to match the expected format in the frontend
      const transformedItems = data.map((item: {
        id?: string | number;
        name: string;
        description?: string;
        imageUrl?: string;
        price: number;
        category?: string;
        soldOut?: boolean;
        displayOrder?: number;
        options?: Array<{
          name: string;
          values: string[];
          isMultiple: boolean;
        }>;
      }) => ({
        id: item.id,
        title: item.name, // Map name to title for compatibility
        name: item.name,
        description: item.description || '',
        imageUrl: item.imageUrl || '',
        price: item.price,
        category: item.category || 'misc', // Include category with default to 'misc'
        soldOut: item.soldOut ?? false, // Default to false if not present
        displayOrder: item.displayOrder ?? 999, // Include displayOrder with default to 999
        options: Array.isArray(item.options) ? item.options : [],
      }));
      
      return {
        success: true,
        data: transformedItems
      };
    } catch (error) {
      console.error('API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch items'
      };
    }
  },

  /**
   * Submit an order to the backend
   */
  submitOrder: async (orderData: OrderData): Promise<ApiResponse<OrderData>> => {
    try {
      console.log('Submitting order to API:', orderData.orderNumber);
      // In a production app, you would use the actual API
      const response = await fetch(`${API_BASE_URL}/new-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      const data = await response.json();
      console.log('Order submitted to API response:', data);

      if (!response.ok) {
        const errorMsg = data.error || 'Failed to submit order';
        console.error('Error from server:', errorMsg);
        throw new Error(errorMsg);
      }
      
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit order. Please try again.'
      };
    }
  },
  
  /**
   * Get order history from the backend
   */
  getOrders: async (): Promise<ApiResponse<OrderData[]>> => {
    try {
      // In a production app, you would use the actual API
      // const response = await fetch(`${API_BASE_URL}/orders.json`);
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
  },

  /**
   * Get unfinished orders from the backend
   */
  getUnfinishedOrders: async (): Promise<ApiResponse<OrderData[]>> => {
    try {
      console.log('Fetching unfinished orders from API');
      const response = await fetch(`${API_BASE_URL}/unfinished-orders`);
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch {
          errorText = 'Could not get error text';
        }
        console.error('Server error response:', errorText);
        throw new Error(`Failed to fetch unfinished orders: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Unfinished orders retrieved from API:', data);
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch unfinished orders'
      };
    }
  },
  
  /**
   * Mark an order as finished
   */
  finishOrder: async (orderId: string): Promise<ApiResponse<{ message: string, textOptIn?: boolean, textError?: boolean }>> => {
    try {
      console.log('Marking order as finished:', orderId);
      const response = await fetch(`${API_BASE_URL}/finish-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch {
          errorText = 'Could not get error text';
        }
        console.error('Server error response:', errorText);
        throw new Error(`Failed to finish order: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Finish order response:', data);
      
      return {
        success: true,
        data: {
          message: data.message,
          textOptIn: data.textOptIn,
          textError: data.textError
        }
      };
    } catch (error) {
      console.error('API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to finish order'
      };
    }
  },

  /**
   * Delete an order
   */
  deleteOrder: async (orderId: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      console.log('Deleting order:', orderId);
      const response = await fetch(`${API_BASE_URL}/delete-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch {
          errorText = 'Could not get error text';
        }
        console.error('Server error response:', errorText);
        throw new Error(`Failed to delete order: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Delete order response:', data);
      
      return {
        success: true,
        data: {
          message: data.message
        }
      };
    } catch (error) {
      console.error('API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete order'
      };
    }
  },

  /**
   * Create a new item without image
   */
  createItem: async (itemData: string): Promise<ApiResponse<ItemData>> => {
    try {
      // Parse the JSON string to an object
      const parsedItemData = JSON.parse(itemData) as ItemData;
      console.log('Parsed item data:', parsedItemData);
      
      // Remove any undefined values from the object
      const cleanedItemData = Object.fromEntries(
        Object.entries(parsedItemData).filter(([, v]) => v !== undefined)
      );
      
      console.log('Cleaned item data:', cleanedItemData);
      
      // Send the request to the create-item endpoint with JSON data only
      console.log('Sending request to:', `${API_BASE_URL}/create-item`);
      const response = await fetch(`${API_BASE_URL}/create-item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedItemData),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries([...response.headers.entries()]));
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch {
          errorText = 'Could not get error text';
        }
        console.error('Server error response:', errorText);
        throw new Error(`Failed to create item: ${response.status} ${errorText}`);
      }
      
      let responseData;
      try {
        responseData = await response.json();
        console.log('Server response data:', responseData);
      } catch (jsonError) {
        console.error('Error parsing response JSON:', jsonError);
        const responseText = await response.text();
        console.log('Raw response text:', responseText);
        throw new Error('Invalid response format from server');
      }
      
      return {
        success: true,
        data: responseData.item || responseData.data || responseData
      };
    } catch (error) {
      console.error('API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create item'
      };
    }
  },
  
  /**
   * Upload an image for an item using base64 encoding instead of multipart form-data
   */
  uploadItemImageBase64: async (itemId: string, image: File): Promise<ApiResponse<{imageUrl: string}>> => {
    let retryCount = 0;
    const maxRetries = 2;
    
    const uploadWithRetry = async (): Promise<ApiResponse<{imageUrl: string}>> => {
      try {
        // Verify the input parameters
        if (!itemId) {
          console.error('Missing itemId parameter');
          throw new Error('Item ID is required');
        }
        
        if (!image) {
          console.error('Missing image file parameter');
          throw new Error('Image file is required');
        }
        
        // Log input parameters for debugging
        console.log('Base64 upload parameters:', {
          itemId,
          fileName: image.name,
          fileType: image.type,
          fileSize: image.size,
          retryCount
        });
        
        // Verify the image type
        if (!image.type.startsWith('image/')) {
          console.error('Invalid file type:', image.type);
          throw new Error('Only image files are allowed');
        }
        
        // Check file size
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (image.size > maxSize) {
          console.error('File too large:', image.size);
          throw new Error(`Image size exceeds limit of ${maxSize / 1024 / 1024}MB`);
        }
        
        // Convert File to base64
        console.log('Converting file to base64...');
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (e) => {
            console.error('FileReader error:', e);
            reject(new Error('Failed to read file'));
          };
          reader.readAsDataURL(image);
        });
        
        if (!base64Data) {
          console.error('Failed to convert file to base64');
          throw new Error('Failed to convert file to base64');
        }
        
        console.log('File converted to base64, length:', base64Data.length);
        
        // Compress the image if it's over 1MB
        const finalBase64Data = base64Data;
        if (image.size > 1024 * 1024) {
          console.log('Large image detected, compressing...');
          // We'll keep the original for now, but in a production app
          // you could add image compression here
        }
        
        // Prepare the API URL
        const apiUrl = `${API_BASE_URL}/base64-upload/${itemId}`;
        console.log('Sending request to:', apiUrl);
        
        // Prepare the request body
        const requestBody = {
          base64Data: finalBase64Data,
          filename: image.name,
          mimeType: image.type
        };
        
        // Send the base64 data to the server with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
        
        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
          });
          
          // Clear the timeout
          clearTimeout(timeoutId);
  
          console.log("Base64 upload response status:", response.status);
          console.log("Response headers:", Object.fromEntries([...response.headers.entries()]));
          
          if (!response.ok) {
            let errorText = '';
            try {
              errorText = await response.text();
              console.error('Error response text:', errorText);
            } catch (textError) {
              console.error('Could not read error response text:', textError);
              errorText = 'Could not get error text';
            }
            
            throw new Error(`Failed to upload image: ${response.status} ${errorText}`);
          }
          
          let responseData;
          try {
            responseData = await response.json();
            console.log('Base64 image upload response data:', responseData);
          } catch (jsonError) {
            console.error('Error parsing response JSON:', jsonError);
            const responseText = await response.text();
            console.log('Raw response text:', responseText);
            throw new Error('Invalid response format from server');
          }
          
          if (!responseData.imageUrl) {
            console.error('Missing imageUrl in response:', responseData);
            throw new Error('Server response missing image URL');
          }
          
          return {
            success: true,
            data: {
              imageUrl: responseData.imageUrl
            }
          };
        } catch (fetchError: unknown) {
          // Clear the timeout if it's a fetch error
          clearTimeout(timeoutId);
          
          if (fetchError instanceof Error && fetchError.name === 'AbortError') {
            console.error('Request timed out after 60 seconds');
            throw new Error('Request timed out after 60 seconds');
          }
          
          throw fetchError;
        }
      } catch (error) {
        console.error(`API error (attempt ${retryCount+1}/${maxRetries+1}):`, error);
        
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying upload (attempt ${retryCount+1}/${maxRetries+1})...`);
          // Wait a bit before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          return uploadWithRetry();
        }
        
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to upload image'
        };
      }
    };
    
    return uploadWithRetry();
  },

  /**
   * Update item status (sold out/available)
   */
  updateItemStatus: async (itemId: string, soldOut: boolean): Promise<ApiResponse<{ message: string, itemId: string, soldOut: boolean }>> => {
    try {
      console.log(`Updating item ${itemId} status to ${soldOut ? 'sold out' : 'available'}`);
      const response = await fetch(`${API_BASE_URL}/items/${itemId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ soldOut }),
      });
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch {
          errorText = 'Could not get error text';
        }
        console.error('Server error response:', errorText);
        throw new Error(`Failed to update item status: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Update item status response:', data);
      
      return {
        success: true,
        data: {
          message: data.message,
          itemId: data.itemId,
          soldOut: data.soldOut
        }
      };
    } catch (error) {
      console.error('API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update item status'
      };
    }
  },

  /**
   * Delete an item
   */
  deleteItem: async (itemId: string): Promise<ApiResponse<{ message: string, itemId: string }>> => {
    try {
      console.log(`Deleting item: ${itemId}`);
      const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch {
          errorText = 'Could not get error text';
        }
        console.error('Server error response:', errorText);
        throw new Error(`Failed to delete item: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Delete item response:', data);
      
      return {
        success: true,
        data: {
          message: data.message,
          itemId: data.itemId
        }
      };
    } catch (error) {
      console.error('API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete item'
      };
    }
  },

  /**
   * Update item category
   */
  updateItemCategory: async (itemId: string, category: string): Promise<ApiResponse<{ message: string, itemId: string, category: string }>> => {
    try {
      console.log(`Updating item ${itemId} category to ${category}`);
      const response = await fetch(`${API_BASE_URL}/items/${itemId}/category`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category }),
      });
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch {
          errorText = 'Could not get error text';
        }
        console.error('Server error response:', errorText);
        throw new Error(`Failed to update item category: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Update item category response:', data);
      
      return {
        success: true,
        data: {
          message: data.message,
          itemId: data.itemId,
          category: data.category
        }
      };
    } catch (error) {
      console.error('API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update item category'
      };
    }
  },

  /**
   * Update item display order
   */
  updateItemDisplayOrder: async (itemId: string, displayOrder: number): Promise<ApiResponse<{ message: string, itemId: string, displayOrder: number }>> => {
    try {
      console.log(`Updating item ${itemId} display order to ${displayOrder}`);
      const response = await fetch(`${API_BASE_URL}/items/${itemId}/display-order`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ displayOrder }),
      });
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch {
          errorText = 'Could not get error text';
        }
        console.error('Server error response:', errorText);
        throw new Error(`Failed to update item display order: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Update item display order response:', data);
      
      return {
        success: true,
        data: {
          message: data.message,
          itemId: data.itemId,
          displayOrder: data.displayOrder
        }
      };
    } catch (error) {
      console.error('API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update item display order'
      };
    }
  }
}; 