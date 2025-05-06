import { useEffect, useState, useCallback } from 'react';
import { Button, Box, CircularProgress, Typography, Alert, IconButton, Tooltip } from '@mui/joy';
import StoreIcon from '@mui/icons-material/Store';
import NoStoreIcon from '@mui/icons-material/DoNotDisturbAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import { apiService } from '../../services/api';

export default function ShopStatusToggle() {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Define fetchShopStatus as a useCallback so it can be used in the initial effect
  const fetchShopStatus = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const response = await apiService.getShopStatus();
      console.log('Shop status response in component:', response);
      
      if (response.success && response.data) {
        // Ensure isOpen is a boolean value
        const shopIsOpen = response.data.isOpen === true;
        console.log('Setting shop status in component:', shopIsOpen);
        setIsOpen(shopIsOpen);
        setLastUpdated(new Date());
      } else {
        setError(response.error || 'Failed to fetch shop status');
        // Set default state so the button is still usable
        setIsOpen(false);
      }
    } catch (err) {
      console.error('Error fetching shop status:', err);
      setError('An unexpected error occurred while fetching shop status');
      // Set default state so the button is still usable
      setIsOpen(false);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  // Manual refresh handler
  const handleRefresh = () => {
    fetchShopStatus(true);
  };

  // Fetch the current shop status on component mount
  useEffect(() => {
    fetchShopStatus();
  }, [fetchShopStatus]);

  const handleToggleStatus = async () => {
    if (isOpen === null) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First update the UI immediately for better feedback
      const newStatus = !isOpen;
      setIsOpen(newStatus);
      
      // Then send the API request
      console.log('Toggling shop status to:', newStatus);
      const response = await apiService.toggleShopStatus(newStatus);
      console.log('Toggle response in component:', response);
      
      if (response.success && response.data) {
        // After successful toggle, refetch to ensure we have the latest status
        console.log('Toggle successful, refetching status...');
        await fetchShopStatus(false); // Fetch without showing loading state
      } else {
        setError(response.error || 'Failed to toggle shop status');
        // Revert to previous status on error
        setIsOpen(!newStatus);
      }
    } catch (err) {
      console.error('Error toggling shop status:', err);
      setError('An unexpected error occurred while toggling shop status');
      // Revert to previous status on error
      setIsOpen(!isOpen);
    } finally {
      setIsLoading(false);
    }
  };

  if (isOpen === null && !error) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size="sm" />
        <Typography>Loading shop status...</Typography>
      </Box>
    );
  }

  // Determine the current display status
  const displayStatus = isOpen === true;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {error && (
        <Alert color="danger" sx={{ mb: 1 }}>
          {error}
          <IconButton 
            size="sm" 
            variant="solid" 
            color="danger" 
            onClick={handleRefresh} 
            sx={{ ml: 1 }}
          >
            <RefreshIcon />
          </IconButton>
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          variant="solid"
          color={displayStatus ? 'success' : 'danger'}
          startDecorator={displayStatus ? <StoreIcon /> : <NoStoreIcon />}
          onClick={handleToggleStatus}
          disabled={isLoading}
          sx={{
            position: 'relative',
            fontWeight: 'bold',
            py: 1,
            minWidth: 150,
            flex: 1
          }}
        >
          {isLoading ? (
            <CircularProgress size="sm" sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          ) : (
            displayStatus ? 'STORE OPEN' : 'STORE CLOSED'
          )}
        </Button>
        
        <Tooltip title="Refresh status" placement="top">
          <IconButton 
            size="md" 
            variant="outlined" 
            color="neutral" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {lastUpdated && (
        <Typography level="body-xs" textAlign="right" sx={{ mt: 0.5, opacity: 0.8 }}>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </Typography>
      )}
    </Box>
  );
} 