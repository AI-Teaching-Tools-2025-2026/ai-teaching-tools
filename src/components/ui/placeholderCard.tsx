import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';

export default function PlaceholderCard() {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="140"
          image="/placeholder.jpg"
          alt="placeholder alt text"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            Placeholder Title
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Placeholder Text
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
