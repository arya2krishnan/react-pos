import { Box, Button, Card, CardContent, CardOverflow, Stack } from "@mui/joy";
import { CheckoutItemCardProps } from "./CheckoutItems/CheckoutItemCard";
import CheckoutItemHeader from "./CheckoutItems/CheckoutItemHeader";
import CheckoutItemList from "./CheckoutItems/CheckoutItemList";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

export interface ReceiptProps {
    shopUrl: string;
    shopName: string;
    items: CheckoutItemCardProps[];
    onClick: () => void;
    onRemove: (index: number) => void;
    onDestroy: () => void;
}


export default function Receipt(props: ReceiptProps) {

    return (
        <Box sx={{width: 400, minHeight: 850}}>
            <Card variant="solid" color="primary" sx={{minHeight: 825}}>
                <Stack direction="column" spacing={0.5} alignItems="center">
                <CardOverflow>
                    <CheckoutItemHeader url={props.shopUrl} shopName={props.shopName} />
                </CardOverflow>    
                <CardContent>    
                    <CheckoutItemList key={props.items.length} items={props.items} onRemove={props.onRemove} />
                </CardContent>
                </Stack>
                <Box sx={{ flexGrow: 1 }} />
                <CardOverflow>
                    <Button variant="soft" size="lg" onClick={() => {
                        props.onClick();
                        props.onDestroy();
                    }} startDecorator={<ShoppingCartIcon />}>
                        {"Checkout"}
                    </Button>
                </CardOverflow>
            </Card>
        </Box>
    );
}