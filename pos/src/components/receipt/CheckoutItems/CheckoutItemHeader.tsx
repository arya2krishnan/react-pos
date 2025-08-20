import { Box, Card, CardContent, Stack} from '@mui/joy';
import {  Typography } from '@mui/material';

export interface CheckoutItemHeaderProps {
    shopName: string; 
    url: string;     
}

export default function CheckoutItemHeader(props: CheckoutItemHeaderProps) {
    return (
        <Card variant="solid" color="primary" invertedColors >
            <CardContent sx={{ 
                p: { xs: 0.5, md: 2 },
                // Much more compact for mobile landscape
                '@media (orientation: landscape) and (max-height: 600px)': {
                    p: 0.5,
                }
            }}>
                <Stack direction="column" spacing={{ xs: 0.25, md: 1 }} alignItems="center">
                <Box
                    component="img"
                    src={props.url} 
                    alt="" 
                    sx={{ 
                        width: '50px', 
                        height: '50px',
                        '@media (min-width: 768px)': {
                            width: '75px',
                            height: '75px'
                        },
                        '@media (min-width: 1200px)': {
                            width: '100px',
                            height: '100px'
                        },
                        '@media (orientation: landscape) and (max-height: 600px)': {
                            width: '30px',
                            height: '30px'
                        }
                    }} 
                />
                <Typography 
                    variant="h5" 
                    component="h2"
                    sx={{ 
                        fontSize: { xs: '0.9rem', md: '1.5rem' },
                        lineHeight: { xs: 1.1, md: 1.4 },
                        // Even smaller for landscape
                        '@media (orientation: landscape) and (max-height: 600px)': {
                            fontSize: '0.8rem',
                            lineHeight: 1.0,
                        }
                    }}
                >
                    {props.shopName}
                </Typography>
                </Stack>
            </CardContent>
        </Card>
    );
}