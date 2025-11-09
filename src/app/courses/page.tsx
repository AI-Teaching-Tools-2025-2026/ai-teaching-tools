import { Container, Typography } from "@mui/material";
import PlaceholderCard from "@/components/ui/placeholderCard";

export default function CoursesPage() {
  return (
    <Container>
      <Typography 
        variant="h1"
        sx={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '2rem', textAlign: 'center' }}
      >
        Courses Page
      </Typography>

    <PlaceholderCard />

    </Container>
  );
}