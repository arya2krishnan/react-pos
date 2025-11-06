import { Typography, Alert, CircularProgress, Box } from '@mui/joy';
import ItemGrid from '../components/Items/ItemGrid';
import CartButton from '../components/receipt/CartButton';
import { useCartStore } from '../store/cartStore';
import { useEffect, useState, useCallback } from 'react';
import UserInput from '../components/UserComponent/UserInput';
import OrderNumber from '../components/UserComponent/OrderNumber';
import DonationPrompt from '../components/UserComponent/DonationPrompt';
import { apiService, OrderData, ItemData } from '../services/api';
import StoreStatusIndicator from '../components/common/StoreStatusIndicator';
import NavigationBar from '../components/common/NavigationBar';
import { DonationButton } from '../components/donations';

export default function POSPage() {
  const cartItems = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  // State for items
  const [items, setItems] = useState<ItemData[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState('');

  // State for user input modal
  const [isUserInputOpen, setIsUserInputOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [textOptIn, setTextOptIn] = useState(true);
  
  // State for donation prompt
  const [isDonationPromptOpen, setIsDonationPromptOpen] = useState(false);
  
  // State for order number display
  const [isOrderNumberOpen, setIsOrderNumberOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState(0);
  
  // State for loading and errors
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Create checkout items for the cart
  const checkoutItems = cartItems.map((cartItem, index) => ({
    url: cartItem.item.imageUrl || '',
    title: cartItem.item.title || cartItem.item.name || 'No Name',
    options: Object.entries(cartItem.selectedOptions).flatMap(([optionName, values]) => 
      values.map(value => `${optionName}: ${value}`)
    ),
    quantity: cartItem.quantity,
    price: cartItem.item.price,
    onRemove: () => removeItem(index),
  }));

  // Extract fetchItems as a callback to reuse it
  const fetchItems = useCallback(async () => {
    setItemsLoading(true);
    setItemsError('');
    
    try {
      const response = await apiService.getItems();
      
      if (response.success && response.data) {
        setItems(response.data);
      } else {
        setItemsError(response.error || 'Failed to fetch items');
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      setItemsError('An unexpected error occurred while fetching items');
    } finally {
      setItemsLoading(false);
    }
  }, []);

  // Fetch items from the API when the component mounts
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleOpenUserInput = () => {
    setIsUserInputOpen(true);
  };

  const handleCloseUserInput = () => {
    setIsUserInputOpen(false);
  };

  const handleCloseDonationPrompt = () => {
    setIsDonationPromptOpen(false);
  };

  const handleCloseOrderNumber = () => {
    setIsOrderNumberOpen(false);
    // Clear user information when the order number snackbar closes
    setUserName('');
    setUserPhone('');
    setTextOptIn(true);
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    updateQuantity(index, newQuantity);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty. Please add items to checkout.");
      return;
    }
    
    // Check if the store is open before proceeding
    try {
      setIsLoading(true);
      const shopStatusResponse = await apiService.getShopStatus();
      
      if (!shopStatusResponse.success || !shopStatusResponse.data) {
        setErrorMessage("Unable to verify shop status. Please try again.");
        setIsLoading(false);
        return;
      }
      
      const isShopOpen = shopStatusResponse.data.isOpen;
      
      if (!isShopOpen) {
        alert("Sorry, the store is currently closed. Please come back later.");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(false);
      // If the store is open, proceed with checkout
      handleOpenUserInput();
    } catch (error) {
      console.error("Error checking shop status:", error);
      setErrorMessage("Unable to verify shop status. Please try again.");
      setIsLoading(false);
    }
  };

  const handleUserSubmit = async (name: string, phone: string, optIn: boolean) => {
    console.log('User information received:', { name, phone, optIn });
    setUserName(name);
    setUserPhone(phone);
    setTextOptIn(optIn);
    
    // Use a timeout to ensure state has updated before processing
    setTimeout(() => {
      // Process the order with direct values rather than state
      processOrder(name, phone, optIn);
    }, 100);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDonationResponse = async (_donated: boolean) => {
    // Close the donation prompt
    handleCloseDonationPrompt();
    
    // Now proceed with order processing
    await processOrder(userName, userPhone, textOptIn);
  };

  const processOrder = async (customerName = userName, customerPhone = userPhone, textOptInValue = textOptIn) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      console.log('Processing order with user information:', { 
        userName: customerName, 
        userPhone: customerPhone,
        textOptIn: textOptInValue 
      });
      
      // Validate customer information again as a safeguard
      if (!customerName.trim() && !customerPhone.trim()) {
        setErrorMessage('Customer name or phone number is required.');
        setIsLoading(false);
        return;
      }
      
      // Check if the store is still open
      const shopStatusResponse = await apiService.getShopStatus();
      if (!shopStatusResponse.success || !shopStatusResponse.data || !shopStatusResponse.data.isOpen) {
        alert("Sorry, the store has closed. Your order cannot be processed at this time.");
        setIsLoading(false);
        return;
      }
      
      // Generate a random order number between 100 and 999
      const generatedOrderNumber = Math.floor(Math.random() * 900) + 100;
      setOrderNumber(generatedOrderNumber);
      
      const totalAmount = getTotalPrice();
      
      // Create order data for API
      const orderData: OrderData = {
        orderNumber: generatedOrderNumber,
        customerName: customerName,
        customerPhone: customerPhone,
        textOptIn: textOptInValue,
        items: cartItems,
        totalAmount: totalAmount,
        orderDate: new Date().toISOString(),
        donation: {
          donated: false,  // Always set to false for now
          amount: 0  // Always set to 0 for now
        }
      };
      
      console.log('Submitting order to API with data:', orderData);
      
      // Submit order to API
      const response = await apiService.submitOrder(orderData);
      
      if (response.success) {
        // First show the order number - this needs the name to be available
        setIsOrderNumberOpen(true);
        
        // Then refetch items to get the latest inventory
        await fetchItems();
        
        // Clear the cart
        clearCart();
        
        // Note: User information will be cleared when the order number snackbar is closed
      } else {
        // Show the specific error message from the API
        setErrorMessage(response.error || 'Failed to place order');
        
        // If it's a validation error related to customer info, reopen the user input dialog
        if (response.error && (
            response.error.includes('customer name') || 
            response.error.includes('phone number')
        )) {
          setIsUserInputOpen(true);
        }
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      setErrorMessage('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Navigation bar */}
      <NavigationBar />
      
      {/* Main content */}
      <Box sx={{ 
        pt: '64px', // Space for the navbar
        pb: 4, 
        px: { xs: 2, md: 1 }, 
        minHeight: 'calc(100vh - 64px)',
        bgcolor: 'background.body',
        maxWidth: '100vw'
      }}>
        <Box sx={{ px: { xs: 1, md: 1 } }}>
          {/* Status and title row */}
          <Box sx={{ 
            position: 'relative',
            display: 'flex', 
            flexDirection: 'row',
            justifyContent: 'center', 
            alignItems: 'center', 
            mt: 2,
            mb: 3,
            gap: 2
          }}>
            {/* Logo */}
            <img 
              src="https://firebasestorage.googleapis.com/v0/b/cafe-pos-gough.firebasestorage.app/o/site-image%2Fv4.png?alt=media&token=cbd71b5d-399a-4802-8850-e9dfd3019026"
              alt="Cafe Gough Logo"
              style={{ 
                width: '80px', 
                height: '80px',
                objectFit: 'contain'
              }}
            />
            <Typography 
              level="h2" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontFamily: '"Varela Round", sans-serif',
                textTransform: 'uppercase'
              }}
            >
              Cafe Gough
            </Typography>
            
            {/* Position the status indicator absolutely */}
            <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
              <StoreStatusIndicator position="navbar" />
            </Box>
          </Box>

          {itemsError && (
            <Alert color="danger" sx={{ mb: 2 }}>
              {itemsError}
            </Alert>
          )}

          {errorMessage && (
            <Alert color="danger" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Item grid */}
          {itemsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <ItemGrid items={items} />
          )}

          {/* Modified CartButton positioning */}
          <Box sx={{ position: 'relative', height: 0, zIndex: 1050 }}>
            <Box sx={{ position: 'fixed', top: 64, right: 16 }}>
              <CartButton 
                shopName="Cafe Gough"
                shopUrl="https://firebasestorage.googleapis.com/v0/b/cafe-pos-gough.firebasestorage.app/o/site-image%2Fv4.png?alt=media&token=cbd71b5d-399a-4802-8850-e9dfd3019026"
                items={checkoutItems}
                onClick={handleCheckout}
                onRemove={removeItem}
                onDestroy={clearCart}
                onQuantityChange={handleQuantityChange}
              />
            </Box>
          </Box>

          {/* Modals and popups */}
          <UserInput
            isOpen={isUserInputOpen}
            name={userName}
            phone={userPhone}
            onClick={handleUserSubmit}
            onClose={handleCloseUserInput}
          />

          <DonationPrompt 
            isOpen={isDonationPromptOpen}
            amount={getTotalPrice()}
            onClose={handleCloseDonationPrompt}
            onDonate={handleDonationResponse}
          />

          <OrderNumber
            open={isOrderNumberOpen}
            onClose={handleCloseOrderNumber}
            name={userName}
            orderNumber={orderNumber}
          />
        </Box>
      </Box>
      
      {/* Donation Button - only visible on POS page */}
      <DonationButton />
    </>
  );
} 