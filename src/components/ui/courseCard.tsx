"use client";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActionArea,
} from "@mui/material";
import Link from "next/link";

export default function CourseCard() {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea
        component={Link}
        href={"/dashboard"}
      >
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
  );
}
