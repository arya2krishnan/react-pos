import { Box, Button, Card, CardContent, CardOverflow, Divider, Stack, Typography } from "@mui/joy";
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
    onQuantityChange?: (index: number, newQuantity: number) => void;
}

export default function Receipt(props: ReceiptProps) {
    const isEmpty = props.items.length === 0;
    const total = props.items.reduce((sum, item) => {
        // Assuming each item has a price property
        return sum + (item.price || 0) * item.quantity;
    }, 0);

    return (
        <Box sx={{ 
            height: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            width: '100%',
        }}>
            <Card 
                variant="solid" 
                color="primary" 
                sx={{ 
                    minHeight: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    borderRadius: 0 
                }}
            >
                <CardOverflow>
                    <CheckoutItemHeader url={props.shopUrl} shopName={props.shopName} />
                </CardOverflow>
                
                <Typography level="h4" sx={{ p: 2, textAlign: 'center', color: 'white' }}>
                    Your Order
                </Typography>
                
                <Divider />
                
                <CardContent sx={{ 
                    flex: 1, 
                    overflow: 'auto', 
                    display: 'flex', 
                    flexDirection: 'column'
                }}>
                    {isEmpty ? (
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            flex: 1,
                            py: 8,
                            color: 'white'
                        }}>
                            <ShoppingCartIcon sx={{ fontSize: 60, mb: 2 }} />
                            <Typography level="body-lg">
                                Your cart is empty
                            </Typography>
                            <Typography level="body-sm">
                                Add items to get started
                            </Typography>
                        </Box>
                    ) : (
                        <CheckoutItemList 
                            key={props.items.length} 
                            items={props.items} 
                            onRemove={props.onRemove}
                            onQuantityChange={props.onQuantityChange}
                        />
                    )}
                </CardContent>
                
                {!isEmpty && (
                    <>
                        <Divider />
                        <Box sx={{ p: 2 }}>
                            {/* <Stack direction="row" justifyContent="space-between" sx={{ mb: 2, color: 'white' }}>
                                <Typography level="title-lg">Total:</Typography>
                                Price display hidden by request
                                <Typography level="title-lg">${total.toFixed(2)}</Typography>
                            </Stack> */}
                            
                            <Stack direction="row" spacing={1} width="100%">
                                <Button 
                                    variant="soft" 
                                    color="neutral" 
                                    onClick={props.onDestroy}
                                    sx={{ flex: 1 }}
                                >
                                    Clear Cart
                                </Button>
                                <Button 
                                    variant="solid" 
                                    color="neutral" 
                                    onClick={props.onClick}
                                    startDecorator={<ShoppingCartIcon />}
                                    sx={{ flex: 2 }}
                                >
                                    Checkout
                                </Button>
                            </Stack>
                        </Box>
                    </>
                )}
            </Card>
        </Box>
    );
}