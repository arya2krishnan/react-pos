import { Avatar, Button, ButtonGroup, Card, IconButton, Stack, Typography } from "@mui/joy";
import React from "react";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';



export interface CheckoutItemCardProps {
    url: string;
    title: string;
    options: string[];
    quantity: number;
    price?: number;
    onRemove: () => void;
    onQuantityChange?: (newQuantity: number) => void;
}

export default function CheckoutItemCard(props: CheckoutItemCardProps) {
    const optionsString = props.options.join(', ');
    const [total, setTotal] = React.useState(props.quantity);
    const itemPrice = props.price || 0;
    const totalPrice = (itemPrice * total).toFixed(2);

    React.useEffect(() => {
      setTotal(props.quantity);
    }, [props.quantity]);

    const handleQuantityChange = (newTotal: number) => {
      setTotal(newTotal);
      if (props.onQuantityChange) {
        props.onQuantityChange(newTotal);
      }
    };

  return (
    <Card sx={{ width: '100%', maxWidth: '100%'}} invertedColors>
      <Stack direction="row" spacing={2} alignItems={'center'}>
        <Avatar size='lg' src={props.url} />
        <Stack direction="column" spacing={0.5} sx={{ flex: 1 }}>
          <Typography level="body-sm" color="neutral" textColor="text.primary" sx={{ fontWeight: 'md' }}>
              {props.title}
          </Typography>
          <Typography level="body-xs" color='neutral' textColor={'text.secondary'}>{optionsString}</Typography>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <ButtonGroup size="sm" aria-label="outlined primary button group" color="success">
                <IconButton onClick={() => {
                    if (total > 1) {
                        handleQuantityChange(total - 1);
                    }
                }}>
                    <RemoveIcon />
                </IconButton>
                <Button disabled={true}>{total}</Button>
                <IconButton onClick={() => {
                    handleQuantityChange(total + 1);
                }}>
                    <AddIcon />
                </IconButton>
            </ButtonGroup>
            <Typography level="body-sm" fontWeight="bold">${totalPrice}</Typography>
          </Stack>
        </Stack>
        <IconButton size='sm' color="danger" variant="soft" onClick={props.onRemove}>
            <DeleteIcon />
        </IconButton>
      </Stack>
    </Card>
  );
}