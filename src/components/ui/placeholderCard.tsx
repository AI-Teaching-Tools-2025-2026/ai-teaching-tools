import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";

export default function PlaceholderCard() {
  return (
    <a href="/dashboard">
      <Card sx={{ maxWidth: 345 }}>
        <CardActionArea>
          <CardMedia
            component="img"
            height="140"
            image="/blueCourseCover.png"
            alt="placeholder alt text"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              Course 1
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Fall 2025
              <br></br>
              Intro to Psychology by Jane Doe
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </a>
  );
}
