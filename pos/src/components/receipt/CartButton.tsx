import * as React from 'react';
import Box from '@mui/joy/Box';
import Drawer from '@mui/joy/Drawer';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Button } from '@mui/joy';
import Receipt from './Receipt';
import { CheckoutItemCardProps } from './CheckoutItems/CheckoutItemCard';

export interface CartButtonProps {
    shopUrl: string;
    shopName: string;
    items: CheckoutItemCardProps[];
    onClick: () => void;
    onRemove: (index: number) => void;
    onDestroy: () => void;
    onQuantityChange?: (index: number, newQuantity: number) => void;
}

export default function CartButton(props: CartButtonProps) {
  const [open, setOpen] = React.useState(false);
  const itemCount = props.items.length;

  // Prevent body scroll when cart is open
  React.useEffect(() => {
    if (open) {
      // Store original body styles
      const originalStyle = window.getComputedStyle(document.body);
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
      
      return () => {
        document.body.style.overflow = originalStyle.overflow;
        document.body.style.paddingRight = originalStyle.paddingRight;
      };
    }
  }, [open]);

  const toggleDrawer =
    (inOpen: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      setOpen(inOpen);
    };

  return (
    <Box>
      <Button 
        variant="soft" 
        color="neutral" 
        size='lg' 
        onClick={() => setOpen(true)} 
        startDecorator={<ShoppingCartIcon />}
      >
        {itemCount > 0 ? `Cart (${itemCount})` : 'Cart'}
      </Button>
      
      <Drawer 
        anchor="right"
        size="md"
        variant="plain"
        open={open}
        onClose={toggleDrawer(false)}
        slotProps={{
          content: {
            sx: {
              bgcolor: 'background.body',
              p: 0,
              width: { xs: '100%', sm: 400 },
              // Prevent scroll events from bubbling to parent
              overflow: 'hidden',
              // Ensure proper touch handling on mobile
              touchAction: 'pan-y',
            }
          },
          backdrop: {
            sx: {
              // Prevent backdrop from capturing scroll events
              pointerEvents: 'auto',
            }
          }
        }}
        // Prevent scroll events from propagating to background
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onScroll={(e) => e.stopPropagation()}
      >
        <Receipt 
          shopUrl={props.shopUrl} 
          shopName={props.shopName} 
          items={props.items} 
          onClick={() => {
            props.onClick();
            setOpen(false);
          }}
          onRemove={props.onRemove}
          onDestroy={props.onDestroy}
          onQuantityChange={props.onQuantityChange}
          onClose={() => setOpen(false)}
        />
      </Drawer>
    </Box>
  );
}