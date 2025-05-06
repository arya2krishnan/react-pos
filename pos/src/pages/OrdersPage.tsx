import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  CircularProgress, 
  Alert,
  Button
} from '@mui/joy';
import { useEffect, useState, useCallback } from 'react';
import { apiService, OrderData } from '../services/api';
import ShopStatusToggle from '../components/common/ShopStatusToggle';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import OrderCard from '../components/OrderItems/OrderCard';
import NavigationBar from '../components/common/NavigationBar';

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<{id: string, number: number} | null>(null);

  // Function to fetch unfinished orders
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check shop status first
      const shopStatusResponse = await apiService.getShopStatus();
      if (shopStatusResponse.success && shopStatusResponse.data) {
        setIsShopOpen(shopStatusResponse.data.isOpen);
      }
      
      // Fetch unfinished orders
      const response = await apiService.getUnfinishedOrders();
      
      if (response.success && response.data) {
        setOrders(response.data);
        setLastUpdated(new Date());
      } else {
        setError(response.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('An unexpected error occurred while fetching orders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set up polling for orders when the shop is open
  useEffect(() => {
    // Initial fetch
    fetchOrders();
    
    // Set up interval for polling when shop is open
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isShopOpen) {
      intervalId = setInterval(() => {
        console.log('Auto-refreshing orders (shop is open)');
        fetchOrders();
      }, 120000); // 2 minutes
    }
    
    // Clean up the interval on unmount or when shop status changes
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isShopOpen, fetchOrders]);

  // Handler for the complete order button (placeholder for now)
  const handleCompleteOrder = async (orderId: string) => {
    console.log('Complete order:', orderId);
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.finishOrder(orderId);
      console.log('Finish order response:', response);
      
      if (response.success) {
        // Check if the text opt-in was missing
        if (response.data && response.data.textOptIn === false) {
          alert('Order marked as complete, but no text message was sent. Please call out the order name!');
        } else if (response.data && response.data.textError) {
          alert('Order marked as complete, but failed to send the text message. Please call out the order name!');
        }
        
        // Only refresh orders if the shop is open
        if (isShopOpen) {
          await fetchOrders();
        }
      } else {
        setError(response.error || 'Failed to complete order');
      }
    } catch (error) {
      console.error('Error completing order:', error);
      setError('An unexpected error occurred while completing the order');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler to open delete confirmation modal
  const handleOpenDeleteModal = (id: string, orderNumber: number) => {
    console.log('Opening delete modal for order:', { id, orderNumber });
    setOrderToDelete({ id, number: orderNumber });
    setDeleteModalOpen(true);
  };

  // Handler to close delete confirmation modal
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setOrderToDelete(null);
  };

  // Handler to delete order
  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    console.log('Attempting to delete order:', orderToDelete);
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.deleteOrder(orderToDelete.id);
      console.log('Delete order response:', response);
      
      if (response.success) {
        // Close the modal
        handleCloseDeleteModal();
        
        // Refresh orders list
        await fetchOrders();
      } else {
        setError(response.error || 'Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      setError('An unexpected error occurred while deleting the order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <NavigationBar />
      <Container maxWidth="xl" sx={{ p: 2, pt: 10, pb: 4 }}>
        {error && (
          <Alert color="danger" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}
        
        <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Typography level="h1" sx={{ 
            textAlign: { xs: 'center', md: 'left' },
            bgcolor: 'primary.main',
            color: 'white',
            py: 2,
            px: 4,
            borderRadius: 'sm',
            width: { xs: '100%', md: 'auto' }
          }}>
            Orders Dashboard
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="solid"
              color="primary"
              startDecorator={<RefreshIcon />}
              onClick={fetchOrders}
              disabled={isLoading}
            >
              Refresh Orders
            </Button>
            <ShopStatusToggle />
          </Box>
        </Box>
        
        {lastUpdated && (
          <Typography level="body-sm" sx={{ mb: 2, textAlign: 'right', color: 'text.secondary' }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Typography>
        )}
        
        {orders.length === 0 && !isLoading ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '50vh'
          }}>
            <Typography level="h2" sx={{ mb: 2 }}>No Unfinished Orders</Typography>
            <Typography level="body-lg">
              {isShopOpen 
                ? "When customers place orders, they'll appear here." 
                : "The shop is currently closed. Open the shop to accept orders."}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ width: '100%' }}>
            <Grid container spacing={3} sx={{ width: '100%', mx: 'auto' }}>
              {orders.map((order) => (
                <Grid 
                  key={order.id || order.orderNumber} 
                  xs={12} sm={6} md={4} lg={3} xl={2}
                  sx={{ 
                    minWidth: { xs: '100%', sm: '300px' },
                    display: 'flex'
                  }}
                >
                  <Box sx={{ width: '100%', height: '100%' }}>
                    <OrderCard
                      order={order}
                      onComplete={(orderId) => handleCompleteOrder(orderId)}
                      onDelete={(id, orderNumber) => handleOpenDeleteModal(id, orderNumber)}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        
        {/* Delete Confirmation Dialog */}
        {deleteModalOpen && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1300
            }}
          >
            <Box
              sx={{
                bgcolor: 'background.surface',
                borderRadius: 'md',
                p: 3,
                maxWidth: 400,
                width: '100%'
              }}
            >
              <Typography level="h2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <DeleteIcon sx={{ color: 'danger.500' }} />
                Delete Order
              </Typography>
              
              <Typography level="body-md" sx={{ mb: 3 }}>
                Are you sure you want to delete Order #{orderToDelete?.number}? This action cannot be undone.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button variant="plain" color="neutral" onClick={handleCloseDeleteModal}>
                  Cancel
                </Button>
                <Button variant="solid" color="danger" onClick={handleDeleteOrder}>
                  Delete Order
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Container>
    </>
  );
} 