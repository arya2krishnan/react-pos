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
      <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, minWidth: '180px' }}>
        <IconButton 
          onClick={() => navigate('/pos')}
          variant="plain"
          color="neutral"
          size="sm"
        >
          <img 
            src="https://firebasestorage.googleapis.com/v0/b/cafe-pos-gough.firebasestorage.app/o/site-image%2FCafeGoughSpring.png?alt=media&token=027e2fc6-6272-4a1c-abb9-87b30058d361" 
            alt="Cafe Gough Logo"
            style={{ width: '24px', height: '24px' }}
          />
        </IconButton>
        <Typography level="title-lg" sx={{ ml: 1 }}>
          Cafe Gough
        </Typography>
      </Box>
      
      {/* Empty middle space to accommodate the status indicator */}
      <Box sx={{ flexGrow: 1, minWidth: '100px' }} />
      
      <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
        {navigationButtons.map((button) => (
          <Button
            key={button.path}
            variant={location.pathname === button.path ? "solid" : "soft"}
            color={location.pathname === button.path ? "primary" : "neutral"}
            startDecorator={button.icon}
            onClick={() => navigate(button.path)}
            size="sm"
          >
            {button.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default NavigationBar; 