import * as React from 'react';
import Box from '@mui/joy/Box';
import Drawer from '@mui/joy/Drawer';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Button, Stack } from '@mui/joy';
import Receipt from './Receipt';
import { CheckoutItemCardProps } from './CheckoutItems/CheckoutItemCard';

export interface CartButtonProps {
    shopUrl: string;
    shopName: string;
    items: CheckoutItemCardProps[];
    onClick: () => void;
    onRemove: (index: number) => void;
    onDestroy: () => void;
}

export default function CartButton(props: CartButtonProps) {
  const [open, setOpen] = React.useState(false);

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

    console.log(props.items);

  return (
    <Box sx={{ display: 'flex' }}>
      <Button variant="soft" color="neutral" size='lg' onClick={() => setOpen(true)} startDecorator={<ShoppingCartIcon />}>
        {props.items.length > 0 ? props.items.length : 'Cart'}
      </Button>
      <Drawer 
        anchor="left"
        color="primary"
        size="md"
        variant="solid"
        open={open} 
        onClose={toggleDrawer(false)}
        >
        <Stack alignItems="center">
        <Box
          role="presentation"
        >
            <Receipt 
            shopUrl={props.shopUrl} 
            shopName={props.shopName} 
            items={props.items} 
            onClick={ () => {
                props.onClick();
                setOpen(false);
                }
            }
            onRemove={props.onRemove}
            onDestroy={props.onDestroy}
              />
        </Box>
        </Stack>
      </Drawer>
    </Box>
  );
}