import { Card, CardContent, Stack} from '@mui/joy';
import {  Typography } from '@mui/material';

export interface CheckoutItemHeaderProps {
    shopName: string; 
    url: string;     
}

export default function CheckoutItemHeader(props: CheckoutItemHeaderProps) {
    return (
        <Card variant="solid" color="primary" invertedColors >
            <CardContent >
                <Stack direction="column" spacing={0.5} alignItems="center">
                <img src={props.url} alt="" style={{ width: '100px', height: '100px' }} />
                <Typography variant="h5" component="h2">
                    {props.shopName}
                </Typography>
                </Stack>
            </CardContent>
        </Card>
    );
}