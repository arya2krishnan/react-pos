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
    onRemove: () => void;
}

export default function CheckoutItemCard(props: CheckoutItemCardProps) {
    const optionsString = props.options.join(', ');
    const [total, setTotal] = React.useState(props.quantity);
  return (
    <Card sx={{ width: 300, maxWidth: '100%'}} invertedColors>
    <Stack direction="row" spacing={7} alignItems={'center'}>
        <Avatar size='lg' src={props.url} />
        <Stack direction="column" spacing={0.5}>
        <Typography level="body-sm" color="neutral" textColor="text.primary" sx={{ fontWeight: 'md' }}>
            {props.title}
        </Typography>
        <Typography level="body-xs" color='neutral' textColor={'text.secondary'}>{optionsString}</Typography>
        <ButtonGroup size="sm" aria-label="outlined primary button group" color="success">
            <IconButton onClick={() => {
                if (total > 1) {
                    setTotal(total - 1);
                }
            }}>
                <RemoveIcon />
            </IconButton>
            <Button disabled={true}>{total}</Button>
            <IconButton onClick={() => {
                setTotal(total + 1);
            }}>
                <AddIcon />
            </IconButton>
        </ButtonGroup>
        </Stack>
        <IconButton size='sm' color="danger" variant="soft" onClick={props.onRemove}>
            <DeleteIcon />
        </IconButton>
    </Stack>
    </Card>
  );
}