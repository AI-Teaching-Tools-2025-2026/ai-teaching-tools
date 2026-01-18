"use client";
import * as React from "react";
import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MenuAppBar() {
  const [auth, setAuth] = React.useState(true);

  return (
    <div className="flex flex-col flex-grow">
      <div className="flex items-center space-x-2 p-2">
        <Switch
          id="login-switch"
          checked={auth}
          onCheckedChange={setAuth}
          aria-label="login switch"
        />
        <Label htmlFor="login-switch">{auth ? "Logout" : "Login"}</Label>
      </div>

      <header className="bg-primary text-primary-foreground">
        <div className="flex items-center px-4 py-2">
          <Button variant="ghost" size="icon" className="mr-2">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Menu</span>
          </Button>

          <h1 className="text-lg font-semibold flex-grow">Photos</h1>

          {auth && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-6 w-6" />
                  <span className="sr-only">Account menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>My account</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>
    </div>
  );
}
