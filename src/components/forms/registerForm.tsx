"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";

// TODO: Move inline sx styling into theme or styled components
export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const router = useRouter();

  // whether any of the current validation errors relate to the password field
  const passwordHasError = errors.some((err) => /password/i.test(err));

  // Validate password and return an array of unmet requirements
  const validatePassword = (pw: string) => {
    const messages: string[] = [];
    if (pw.length < 8)
      messages.push("Password must be at least 8 characters long.");
    if (!/\d/.test(pw))
      messages.push("Password must contain at least one number.");
    if (!/[A-Z]/.test(pw))
      messages.push("Password must contain at least one uppercase letter.");
    return messages;
  };

  // Validate email
  const validateEmail = (email: string) => {
    const messages: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      messages.push("Please enter a valid email address.");
    }
    return messages;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordErrors = validatePassword(password);
    const emailErrors = validateEmail(email);

    if (password !== confirmPassword) {
      passwordErrors.push("Passwords do not match.");
    }

    const allErrors = [...passwordErrors, ...emailErrors]; //combine password and email errors

    if (allErrors.length > 0) {
      setErrors(allErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`,
        {
          username,
          email,
          password,
        },
      );

      console.log(response.data); // e.g. { message: "User created successfully!" }

      setErrors([]);
      router.push("/login");
    } catch (error: any) {
      if (error.response) {
        const detail = error.response.data?.detail ?? "";
        // If the server indicates the username is already taken, show inline username error
        const usernameTaken =
          error.response.status === 409 ||
          /username.*(exists|taken|already|in use)|already exists|user.*exists/i.test(
            detail,
          );

        if (usernameTaken) {
          setUsernameError("Username already exists");
          // clear generic errors to avoid duplication
          setErrors([]);
        } else {
          alert(detail);
        }
      } else {
        alert("An error occurred. Try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className="flex flex-col items-center gap-4 mt-8"
      onSubmit={handleSubmit}
      aria-busy={isLoading}
    >
      <div className="grid w-full max-w-sm gap-1.5">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (usernameError) setUsernameError("");
          }}
          disabled={isLoading}
          aria-invalid={!!usernameError}
          className={
            usernameError
              ? "border-destructive focus-visible:ring-1 focus-visible:ring-destructive"
              : ""
          }
        />
        {usernameError && (
          <div className="text-destructive text-sm mt-1">
            <span className="font-bold">{usernameError}</span>
          </div>
        )}
      </div>

      <div className="grid w-full max-w-sm gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="grid w-full max-w-sm gap-1.5">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={passwordHasError}
          className={
            passwordHasError
              ? "border-destructive focus-visible:ring-1 focus-visible:ring-destructive"
              : ""
          }
          disabled={isLoading}
        />
      </div>

      <div className="grid w-full max-w-sm gap-1.5">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <PasswordInput
          id="confirmPassword"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {errors.length > 0 && (
        <div className="text-destructive text-sm mt-1 text-left w-full max-w-sm">
          {errors.map((err, index) => (
            <div key={index}>
              • <span className="font-bold">{err}</span>
            </div>
          ))}
        </div>
      )}

      <Button type="submit" className="mt-2" disabled={isLoading}>
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            Registering...
          </span>
        ) : (
          "Register"
        )}
      </Button>
    </form>
  );
}
