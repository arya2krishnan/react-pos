import { Box, Button, Card, CardContent, CardOverflow, Divider, Stack, Typography, IconButton } from "@mui/joy";
import { CheckoutItemCardProps } from "./CheckoutItems/CheckoutItemCard";
import CheckoutItemHeader from "./CheckoutItems/CheckoutItemHeader";
import CheckoutItemList from "./CheckoutItems/CheckoutItemList";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';

export interface ReceiptProps {
    shopUrl: string;
    shopName: string;
    items: CheckoutItemCardProps[];
    onClick: () => void;
    onRemove: (index: number) => void;
    onDestroy: () => void;
    onQuantityChange?: (index: number, newQuantity: number) => void;
    onClose?: () => void;
}

export default function Receipt(props: ReceiptProps) {
    const isEmpty = props.items.length === 0;
    // const total = props.items.reduce((sum, item) => {
    //     // Assuming each item has a price property
    //     return sum + (item.price || 0) * item.quantity;
    // }, 0);

    return (
        <Box sx={{ 
            height: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            width: '100%',
            // Prevent scroll events from propagating
            overflow: 'hidden',
            // Ensure proper touch handling on mobile
            touchAction: 'pan-y',
            // Better mobile landscape handling
            '@media (orientation: landscape) and (max-height: 600px)': {
                height: '100vh',
            }
        }}
        // Stop propagation of touch and scroll events
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onScroll={(e) => e.stopPropagation()}
        >
            <Card 
                variant="solid" 
                color="primary" 
                sx={{ 
                    minHeight: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    borderRadius: 0,
                    overflow: 'hidden',
                }}
            >
                <CardOverflow>
                    <Box sx={{ position: 'relative' }}>
                        <CheckoutItemHeader url={props.shopUrl} shopName={props.shopName} />
                        {/* Mobile close button */}
                        <IconButton
                            onClick={props.onClose}
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                color: 'white',
                                display: { xs: 'flex', md: 'none' }, // Only show on mobile
                                zIndex: 1,
                                bgcolor: 'rgba(0,0,0,0.3)',
                                '&:hover': {
                                    bgcolor: 'rgba(0,0,0,0.5)',
                                }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </CardOverflow>
                
                <Typography level="h4" sx={{ 
                    p: { xs: 0.5, md: 2 }, 
                    textAlign: 'center', 
                    color: 'white', 
                    fontSize: { xs: '0.9rem', md: '1.25rem' },
                    // Much more compact for landscape
                    '@media (orientation: landscape) and (max-height: 600px)': {
                        p: 0.25,
                        fontSize: '0.8rem',
                    }
                }}>
                    Your Order
                </Typography>
                
                <Divider />
                
                <CardContent sx={{ 
                    flex: 1, 
                    overflow: 'auto', 
                    display: 'flex', 
                    flexDirection: 'column',
                    // Ensure proper scroll containment
                    overscrollBehavior: 'contain',
                    // Prevent scroll chaining
                    scrollBehavior: 'smooth',
                    // Better mobile scroll handling
                    WebkitOverflowScrolling: 'touch',
                    // Stop scroll events from bubbling
                    '&::-webkit-scrollbar': {
                        width: '6px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255,255,255,0.3)',
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: 'transparent',
                    }
                }}
                // Stop propagation of scroll events
                onScroll={(e) => e.stopPropagation()}
                >
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
                        <Box sx={{ 
                            p: { xs: 0.5, md: 2 },
                            // Much more compact for landscape
                            '@media (orientation: landscape) and (max-height: 600px)': {
                                p: 0.5,
                            }
                        }}>
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
                                    sx={{ 
                                        flex: 1,
                                        fontSize: { xs: '0.8rem', md: 'inherit' },
                                        py: { xs: 0.5, md: 1 },
                                        // Even smaller for landscape
                                        '@media (orientation: landscape) and (max-height: 600px)': {
                                            fontSize: '0.7rem',
                                            py: 0.25,
                                        }
                                    }}
                                >
                                    Clear Cart
                                </Button>
                                <Button 
                                    variant="solid" 
                                    color="neutral" 
                                    onClick={props.onClick}
                                    startDecorator={<ShoppingCartIcon />}
                                    sx={{ 
                                        flex: 2,
                                        fontSize: { xs: '0.8rem', md: 'inherit' },
                                        py: { xs: 0.5, md: 1 },
                                        // Even smaller for landscape
                                        '@media (orientation: landscape) and (max-height: 600px)': {
                                            fontSize: '0.7rem',
                                            py: 0.25,
                                        }
                                    }}
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