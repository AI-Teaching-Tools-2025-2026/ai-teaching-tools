"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";

// TODO: Add form validation and error handling
// TODO: Put the styles in a separate file / create new components for styled TextFields (depending on theme)
export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    // clear previous field errors
    setAuthError("");
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
        {
          username: username,
          password: password,
        },
        { withCredentials: true },
      );

      console.log(response.data);

      router.push("/courses");
    } catch (error: any) {
      if (error.response) {
        const detail = error.response.data?.detail ?? "";
        // Detect username or password related failures by inspecting status or message text
        const usernameFail =
          error.response.status === 404 ||
          /username|user not found|no account|does not exist|invalid user/i.test(
            detail,
          );
        const passwordFail =
          error.response.status === 401 ||
          /password|incorrect|invalid password/i.test(detail);

        if (usernameFail || passwordFail) {
          // show a single generic message when either field fails
          setAuthError("The username or password is incorrect.");
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
      onSubmit={(e) => {
        e.preventDefault();
        handleLogin();
      }}
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
            if (authError) setAuthError("");
          }}
          disabled={isLoading}
          aria-invalid={!!authError}
          className={
            authError
              ? "border-destructive focus-visible:ring-1 focus-visible:ring-destructive"
              : ""
          }
        />
      </div>

      <div className="grid w-full max-w-sm gap-1.5">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (authError) setAuthError("");
          }}
          disabled={isLoading}
          aria-invalid={!!authError}
          className={
            authError
              ? "border-destructive focus-visible:ring-1 focus-visible:ring-destructive"
              : ""
          }
        />
        {authError && (
          <div className="text-destructive text-sm mt-1">
            <span className="font-bold">{authError}</span>
          </div>
        )}
      </div>

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
            Logging in...
          </span>
        ) : (
          "Log in"
        )}
      </Button>
    </form>
  );
}
