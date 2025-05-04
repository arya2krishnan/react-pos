import AspectRatio from '@mui/joy/AspectRatio';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import CardOverflow from '@mui/joy/CardOverflow';
import Typography from '@mui/joy/Typography';

export interface ItemCardProps  {
    url: string;
    title: string;
    description: string;
    onClick: () => void;
}

export default function ItemCard(props: ItemCardProps) {
  return (
    <Card sx={{ width: 320, maxWidth: '100%'}} variant="solid" color="neutral" invertedColors>
      <CardOverflow>
        <AspectRatio sx={{ minWidth: 200 }}>
          <img
            src={props.url}
            loading="lazy"
            alt=""
          />
        </AspectRatio>
      </CardOverflow>
      <CardContent>
        
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
        <Button variant="soft" size="lg" onClick={props.onClick}>
            {"Add to Cart"}
        </Button>
      </CardOverflow>
    </Card>
  );
}
