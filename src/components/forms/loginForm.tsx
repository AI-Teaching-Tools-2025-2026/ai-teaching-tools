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
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/auth/login",
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
        alert(error.response.data.detail);
      } else {
        alert("An error occurred. Try again.");
      }
    }
  };

  return (
    <form
      className="flex flex-col items-center gap-4 mt-8"
      onSubmit={(e) => {
        e.preventDefault();
        handleLogin();
      }}
    >
      <div className="grid w-full max-w-sm gap-1.5">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="grid w-full max-w-sm gap-1.5">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <Button type="submit" className="mt-2">
        Log in
      </Button>
    </form>
  );
}
