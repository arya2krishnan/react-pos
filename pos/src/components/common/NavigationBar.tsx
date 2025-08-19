import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, IconButton, Typography } from '@mui/joy';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import StorefrontIcon from '@mui/icons-material/Storefront';

type NavigationButton = {
  label: string;
  path: string;
  icon: React.ReactNode;
};

const NavigationBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navigationButtons: NavigationButton[] = [
    { label: 'POS', path: '/pos', icon: <StorefrontIcon /> },
    { label: 'Orders', path: '/orders', icon: <ReceiptIcon /> },
    { label: 'Admin', path: '/admin', icon: <AdminPanelSettingsIcon /> },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        bgcolor: 'background.surface',
        p: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', ml: { xs: 1, md: 2 }, minWidth: { xs: 'auto', md: '180px' } }}>
        <IconButton 
          onClick={() => navigate('/pos')}
          variant="plain"
          color="neutral"
          size="sm"
        >
          <img 
            src="https://firebasestorage.googleapis.com/v0/b/cafe-pos-gough.firebasestorage.app/o/site-image%2FCafeGoughSummer.png?alt=media&token=59189f18-52d0-48c6-a9f6-3dd19622ff35" 
            alt="Cafe Gough Logo"
            style={{ width: '24px', height: '24px' }}
          />
        </IconButton>
        <Typography 
          level="title-lg" 
          sx={{ 
            ml: 1,
            display: { xs: 'none', sm: 'block' } // Hide on very small screens
          }}
        >
          Cafe Gough
        </Typography>
      </Box>
      
      {/* Empty middle space to accommodate the status indicator */}
      <Box sx={{ flexGrow: 1, minWidth: { xs: '20px', md: '100px' } }} />
      
      <Box sx={{ display: 'flex', gap: { xs: 0.5, md: 1 }, mr: { xs: 1, md: 2 } }}>
        {navigationButtons.map((button) => (
          <Button
            key={button.path}
            variant={location.pathname === button.path ? "solid" : "soft"}
            color={location.pathname === button.path ? "primary" : "neutral"}
            startDecorator={button.icon}
            onClick={() => navigate(button.path)}
            size="sm"
            sx={{
              px: { xs: 1, md: 2 },
              minWidth: { xs: 'auto', md: 'auto' }
            }}
          >
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              {button.label}
            </Box>
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default NavigationBar; 