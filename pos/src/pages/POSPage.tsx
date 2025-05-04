import { Container, Typography, Alert, CircularProgress, Box } from '@mui/joy';
import { itemsData } from '../data/items';
import ItemGrid from '../components/Items/ItemGrid';
import CartButton from '../components/receipt/CartButton';
import { useCartStore } from '../store/cartStore';
import { useState } from 'react';
import UserInput from '../components/UserComponent/UserInput';
import OrderNumber from '../components/UserComponent/OrderNumber';
import DonationPrompt from '../components/UserComponent/DonationPrompt';
import { apiService, OrderData } from '../services/api';

export default function POSPage() {
  const cartItems = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  // State for user input modal
  const [isUserInputOpen, setIsUserInputOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [textOptIn, setTextOptIn] = useState(false);
  
  // State for donation prompt
  const [isDonationPromptOpen, setIsDonationPromptOpen] = useState(false);
  
  // State for order number display
  const [isOrderNumberOpen, setIsOrderNumberOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState(0);
  
  // State for loading and errors
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleOpenUserInput = () => {
    setIsUserInputOpen(true);
  };

  const handleCloseUserInput = () => {
    setIsUserInputOpen(false);
  };

  const handleOpenDonationPrompt = () => {
    setIsDonationPromptOpen(true);
  };

  const handleCloseDonationPrompt = () => {
    setIsDonationPromptOpen(false);
  };

  const handleCloseOrderNumber = () => {
    setIsOrderNumberOpen(false);
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    updateQuantity(index, newQuantity);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty. Please add items to checkout.");
      return;
    }
    
    // Open user input modal
    handleOpenUserInput();
  };

  const handleUserSubmit = async (name: string, phone: string, optIn: boolean) => {
    setUserName(name);
    setUserPhone(phone);
    setTextOptIn(optIn);
    
    // After user input, show the donation prompt
    handleCloseDonationPrompt();
    handleOpenDonationPrompt();
  };

  const handleDonationResponse = async (donated: boolean) => {
    // Close the donation prompt
    handleCloseDonationPrompt();
    
    // Now proceed with order processing
    await processOrder(donated);
  };

  const processOrder = async (donated: boolean) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Generate a random order number between 100 and 999
      const generatedOrderNumber = Math.floor(Math.random() * 900) + 100;
      setOrderNumber(generatedOrderNumber);
      
      const totalAmount = getTotalPrice();
      
      // Create order data for API
      const orderData: OrderData = {
        orderNumber: generatedOrderNumber,
        customerName: userName,
        customerPhone: userPhone,
        textOptIn: textOptIn,
        items: cartItems,
        totalAmount: totalAmount,
        orderDate: new Date().toISOString(),
        donation: {
          donated: donated,
          amount: donated ? totalAmount : undefined
        }
      };
      
      // Submit order to API
      const response = await apiService.submitOrder(orderData);
      
      if (response.success) {
        // Show the order number
        setIsOrderNumberOpen(true);
        
        // Clear the cart
        clearCart();
      } else {
        setErrorMessage(response.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      setErrorMessage('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const checkoutItems = cartItems.map((cartItem, index) => ({
    url: cartItem.item.imageUrl,
    title: cartItem.item.title,
    options: Object.entries(cartItem.selectedOptions).flatMap(([optionName, values]) => 
      values.map(value => `${optionName}: ${value}`)
    ),
    quantity: cartItem.quantity,
    price: cartItem.item.price,
    onRemove: () => removeItem(index),
  }));

  return (
    <Container maxWidth="xl" sx={{ p: 2, pt: 10, pb: 4 }}>
      {errorMessage && (
        <Alert color="danger" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}
      
      <Typography level="h1" sx={{ 
        mb: 3, 
        textAlign: 'center',
        bgcolor: 'primary.main',
        color: 'white',
        py: 2,
        borderRadius: 'sm'
      }}>
        Point of Sale
      </Typography>
      
      <ItemGrid items={itemsData} />
      
      <CartButton 
        shopName="My Shop"
        shopUrl="https://cdn-icons-png.flaticon.com/512/1356/1356594.png"
        items={checkoutItems}
        onClick={handleCheckout}
        onRemove={removeItem}
        onDestroy={clearCart}
        onQuantityChange={handleQuantityChange}
      />
      
      {/* User Input Modal */}
      <UserInput 
        isOpen={isUserInputOpen} 
        name={userName}
        phone={userPhone}
        onClick={handleUserSubmit}
        onClose={handleCloseUserInput}
      />
      
      {/* Donation Prompt */}
      <DonationPrompt 
        isOpen={isDonationPromptOpen}
        amount={getTotalPrice()}
        onClose={handleCloseDonationPrompt}
        onDonate={handleDonationResponse}
      />
      
      {/* Order Number Display */}
      <OrderNumber 
        open={isOrderNumberOpen}
        onClose={handleCloseOrderNumber}
        name={userName}
        orderNumber={orderNumber}
      />
    </Container>
  );
} 