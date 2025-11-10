import { Container, Typography } from "@mui/material";
import LoginForm from "@/components/forms/loginForm";

export default function LoginPage() {
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
        Login Page
      </Typography>

      <LoginForm />
    </Container>
  );
}
