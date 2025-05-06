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
            }
          }
        }}
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
        />
      </Drawer>
    </Box>
  );
}