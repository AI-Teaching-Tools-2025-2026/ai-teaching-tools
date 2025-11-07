import { Container, Typography } from "@mui/material";
import RegisterForm from "@/components/forms/registerForm";

export default function registerPage() {
  return (
    <Container>
      <Typography 
        variant="h1"
        sx={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '2rem', textAlign: 'center' }}
      >
        Register Page
      </Typography>

      <RegisterForm />
    </Container>
  );
}