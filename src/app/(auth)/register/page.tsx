import { Container, Typography } from "@mui/material";
import RegisterForm from "@/components/forms/registerForm";

export default function registerPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mt-8 text-center">
        Register
      </h1>

      <RegisterForm />
    </div>
  );
}
