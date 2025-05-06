import { Box, Chip, CircularProgress, Tooltip } from '@mui/joy';
import StorefrontIcon from '@mui/icons-material/Storefront';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { useEffect, useState } from 'react';
import { apiService } from '../../services/api';

interface StoreStatusIndicatorProps {
  position?: 'top-left' | 'top-right' | 'navbar';
}

export default function StoreStatusIndicator({ position = 'top-left' }: StoreStatusIndicatorProps) {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoreStatus = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiService.getShopStatus();
        
        if (response.success && response.data) {
          setIsOpen(response.data.isOpen);
        } else {
          setError(response.error || 'Failed to fetch store status');
        }
      } catch (err) {
        setError('Error checking store status');
        console.error('Error fetching store status:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreStatus();
    
    // Poll for status updates every 30 seconds
    const intervalId = setInterval(fetchStoreStatus, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Position styling
  const positionStyles = {
    'top-left': {
      position: 'fixed',
      top: 16,
      left: 16,
      zIndex: 1100
    },
    'top-right': {
      position: 'fixed',
      top: 16,
      right: 16,
      zIndex: 1100
    },
    'navbar': {
      position: 'static',
      zIndex: 1
    }
  };

  if (error) {
    return (
      <Tooltip title={`Error: ${error}`} placement="bottom">
        <Chip
          sx={positionStyles[position]}
          color="danger"
          variant="solid"
          size="lg"
        >
          Status Error
        </Chip>
      </Tooltip>
    );
  }

  if (isLoading) {
    return (
      <Box sx={positionStyles[position]}>
        <CircularProgress size="sm" />
      </Box>
    );
  }

  return (
    <Tooltip 
      title={isOpen ? "Store is currently open" : "Store is currently closed"} 
      placement="bottom"
    >
      <Chip
        sx={positionStyles[position]}
        color={isOpen ? "success" : "danger"}
        variant="solid"
        size="lg"
        startDecorator={
          isOpen ? <StorefrontIcon /> : <StorefrontOutlinedIcon />
        }
      >
        {isOpen ? "Open" : "Closed"}
      </Chip>
    </Tooltip>
  );
} 