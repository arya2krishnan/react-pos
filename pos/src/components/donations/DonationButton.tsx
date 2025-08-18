import { useState } from 'react';
import { Button, Drawer, Box, Typography, IconButton, Stack } from '@mui/joy';
import CloseIcon from '@mui/icons-material/Close';

export default function DonationButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="solid"
        color="success"
        size="lg"
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          borderRadius: 'xl',
          zIndex: 1100,
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          minWidth: 200,
          height: 70,
          px: 3,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          bgcolor: 'success.600',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          textTransform: 'none',
          '&:hover': {
            bgcolor: 'success.700',
            transform: 'scale(1.05)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
          },
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            overflow: 'hidden',
            flexShrink: 0,
            border: '2px solid rgba(255,255,255,0.3)',
          }}
        >
          <img
            src="https://firebasestorage.googleapis.com/v0/b/cafe-pos-gough.firebasestorage.app/o/site-image%2FsnoopyMoney.jpg?alt=media&token=8f672bc8-1607-45d8-9392-38d22bb49b19"
            alt="Snoopy with money"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>
        <Box sx={{ textAlign: 'left', lineHeight: 1.2 }}>
          <Typography
            sx={{
              fontWeight: 'bold',
              color: 'white',
              fontSize: '1.1rem',
              lineHeight: 1.2,
            }}
          >
            Leave a tip :)
          </Typography>
        </Box>
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
            <Typography level="h4">Leave a Tip 💝</Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <img
                src="https://firebasestorage.googleapis.com/v0/b/cafe-pos-gough.firebasestorage.app/o/site-image%2FsnoopyMoney.jpg?alt=media&token=8f672bc8-1607-45d8-9392-38d22bb49b19"
                alt="Snoopy with money"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Box>
            <Typography level="body-lg" sx={{ color: 'text.secondary' }}>
              Thanks for visiting Cafe Gough! Your tip helps us keep the coffee flowing and the smiles coming.
            </Typography>
          </Box>

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
                alt="Tip QR Code"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            </Box>
            
            <Typography level="body-sm" sx={{ textAlign: 'center', color: 'text.secondary' }}>
              Scan the QR code above to leave a tip via Venmo
            </Typography>
            
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