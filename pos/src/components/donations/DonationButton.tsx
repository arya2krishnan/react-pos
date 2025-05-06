import { useState } from 'react';
import { Button, Drawer, Box, Typography, IconButton, Stack } from '@mui/joy';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';

export default function DonationButton() {
  const [open, setOpen] = useState(false);

  const donateButtonText = "Donate <3";

  return (
    <>
      <Button
        variant="soft"
        color="success"
        size="sm"
        startDecorator={<FavoriteIcon />}
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          borderRadius: 'md',
          zIndex: 1100,
        }}
      >
        {donateButtonText}
      </Button>

      <Drawer
        anchor="top"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          '--Drawer-horizontalSize': '100%',
          '--Drawer-verticalSize': 'auto',
        }}
      >
        <Box
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: 500,
            mx: 'auto',
            width: '100%',
          }}
        >
          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', mb: 2 }}>
            <Typography level="h4">Support Us</Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Typography level="body-md" mb={2}>
            Your donation helps us continue providing great service. Any amount is greatly appreciated. 
            We really hope you enjoyed your drink and service at our cafe today! Thank you!
          </Typography>

          <Stack alignItems="center" spacing={2}>
            <Box 
              sx={{ 
                border: '1px solid', 
                borderColor: 'divider',
                p: 2,
                borderRadius: 'sm',
                width: 200,
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.level1',
                mb: 2
              }}
            >
              <img src="https://firebasestorage.googleapis.com/v0/b/cafe-pos-gough.firebasestorage.app/o/site-image%2FIMG_1596.jpg?alt=media&token=f018a9cd-e83c-4bfe-9ab0-9103f8efea99"
                alt="Donation QR Code"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            </Box>
            
            <Button 
              variant="solid" 
              color="primary" 
              onClick={() => setOpen(false)}
              sx={{ minWidth: 150 }}
            >
              Close
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
} 