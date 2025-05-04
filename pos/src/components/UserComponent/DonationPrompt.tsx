import { Modal, ModalDialog, DialogTitle, DialogContent, Button, Stack, Box, Typography } from "@mui/joy";
import React from "react";

export interface DonationPromptProps {
  isOpen: boolean;
  amount: number;
  onClose: () => void;
  onDonate: (donated: boolean) => void;
}

export default function DonationPrompt(props: DonationPromptProps) {
  return (
    <Modal open={props.isOpen} onClose={props.onClose}>
      <ModalDialog>
        <DialogTitle>Would you like to make a donation?</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ alignItems: 'center' }}>
            <Typography>
              Would you like to make a donation of ${props.amount.toFixed(2)}?
            </Typography>
            
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
              {/* Placeholder for Venmo QR code */}
              <Typography sx={{ textAlign: 'center' }}>
                Venmo QR Code Placeholder
                <br />
                Scan to donate
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={2} sx={{ width: '100%', justifyContent: 'center' }}>
              <Button 
                variant="outlined" 
                color="neutral" 
                onClick={() => props.onDonate(false)}
              >
                No Thanks
              </Button>
              <Button 
                variant="solid" 
                color="primary" 
                onClick={() => props.onDonate(true)}
              >
                Yes, I'll Donate
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
} 