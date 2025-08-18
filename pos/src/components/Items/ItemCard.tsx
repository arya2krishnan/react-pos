import AspectRatio from '@mui/joy/AspectRatio';
import Button from '@mui/joy/Button';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import CardOverflow from '@mui/joy/CardOverflow';
import Typography from '@mui/joy/Typography';
import Chip from '@mui/joy/Chip';

export interface ItemCardProps {
    url: string;
    title: string;
    description: string;
    onClick: () => void;
    soldOut?: boolean;
}

export default function ItemCard(props: ItemCardProps) {
  return (
    <Card 
      sx={{ 
        width: '100%', 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.2s ease-in-out',
        ...(props.soldOut ? {} : {
          '&:hover': {
            transform: 'scale(1.02)'
          }
        })
      }} 
      variant="solid" 
      color="neutral" 
      invertedColors
    >
      <CardOverflow>
        <Box sx={{ position: 'relative' }}>
          <AspectRatio ratio="4/3" sx={{ minWidth: '100%' }}>
            <img
              src={props.url}
              loading="lazy"
              alt={props.title}
              style={{ 
                objectFit: 'cover',
                filter: props.soldOut ? 'grayscale(100%)' : 'none'
              }}
            />
          </AspectRatio>
          {props.soldOut && (
            <Chip 
              size="sm" 
              variant="solid" 
              color="primary" 
              sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)', 
                zIndex: 2,
                backgroundColor: 'primary.500',
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              Sold Out
            </Chip>
          )}
        </Box>
      </CardOverflow>
      <CardContent sx={{ flex: 1 }}>
        <Typography
          level="title-lg"
          color="neutral"
          textColor="text.primary"
          sx={{ fontWeight: 'md' }}
        >
          {props.title}
        </Typography>
        <Typography level="body-xs">{props.description}</Typography>
      </CardContent>
      <CardOverflow>
        <Button 
          variant="soft" 
          size="lg" 
          onClick={props.onClick} 
          disabled={props.soldOut}
          sx={{ width: '100%' }}
        >
          {props.soldOut ? 'Sold Out' : 'Add to Cart'}
        </Button>
      </CardOverflow>
    </Card>
  );
}
