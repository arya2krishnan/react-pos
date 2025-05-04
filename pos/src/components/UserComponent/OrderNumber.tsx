import Snackbar from '@mui/joy/Snackbar';
import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';

export interface OrderNumberProps {
    open: boolean;
    onClose: () => void;
    name: string;
    orderNumber: number;
}

export default function OrderNumber(props: OrderNumberProps) {
  return (
      <Snackbar
        autoHideDuration={5000}
        variant="solid"
        color="primary"
        size="lg"
        invertedColors
        open={props.open}
        onClose={props.onClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={(theme) => ({
          background: `linear-gradient(45deg, ${theme.palette.primary[600]} 30%, ${theme.palette.primary[500]} 90%})`,
        })}
      >
          <Stack spacing={2} sx={{width:'100%'}}>
            <Typography level="title-lg">You are Order No. {props.orderNumber}</Typography>
            <Typography>
              Thank you for your order, {props.name}!
            </Typography>
            <Button 
                variant="solid" 
                color="primary" 
                onClick={props.onClose} 
                startDecorator={<DoNotDisturbIcon />} 
                sx={{ width: '100%' }}
            >
                Close
            </Button>
          </Stack>
      </Snackbar>
  );
}