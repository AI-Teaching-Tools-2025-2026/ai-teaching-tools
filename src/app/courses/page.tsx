import { Container, Typography } from "@mui/material";
import CourseCard from "@/components/ui/courseCard";

export default function CoursesPage() {
  return (
    <Container>
      <Typography
        variant="h1"
        sx={{
          fontSize: "2rem",
          fontWeight: "bold",
          marginTop: "2rem",
          textAlign: "center",
        }}
      >
        Courses Page
      </Typography>

      <CourseCard />
    </Container>
  );
}
