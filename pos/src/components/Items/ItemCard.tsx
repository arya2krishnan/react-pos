import AspectRatio from '@mui/joy/AspectRatio';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import CardOverflow from '@mui/joy/CardOverflow';
import Typography from '@mui/joy/Typography';

export interface ItemCardProps {
    url: string;
    title: string;
    description: string;
    onClick: () => void;
}

export default function ItemCard(props: ItemCardProps) {
  return (
    <Card 
      sx={{ 
        width: '100%', 
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }} 
      variant="solid" 
      color="neutral" 
      invertedColors
    >
      <CardOverflow>
        <AspectRatio ratio="4/3" sx={{ minWidth: '100%' }}>
          <img
            src={props.url}
            loading="lazy"
            alt={props.title}
            style={{ objectFit: 'cover' }}
          />
        </AspectRatio>
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
        <Button variant="soft" size="lg" onClick={props.onClick} sx={{ width: '100%' }}>
          Add to Cart
        </Button>
      </CardOverflow>
    </Card>
  );
}
