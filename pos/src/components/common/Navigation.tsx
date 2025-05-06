import { Box, Button, ButtonGroup } from '@mui/joy';
import { Link, useLocation } from 'react-router-dom';
import StoreIcon from '@mui/icons-material/Store';
import ListAltIcon from '@mui/icons-material/ListAlt';

export default function Navigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
      <ButtonGroup variant="outlined" aria-label="page navigation">
        <Button 
          component={Link} 
          to="/pos"
          startDecorator={<StoreIcon />}
          variant={currentPath === '/pos' ? 'solid' : 'outlined'}
        >
          POS
        </Button>
        <Button 
          component={Link} 
          to="/orders"
          startDecorator={<ListAltIcon />}
          variant={currentPath === '/orders' ? 'solid' : 'outlined'}
        >
          Orders
        </Button>
      </ButtonGroup>
    </Box>
  );
} 