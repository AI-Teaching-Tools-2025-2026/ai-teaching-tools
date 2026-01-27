"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Settings, LogOut, User } from "lucide-react";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-muted text-foreground border-b border-border">
      <div className="flex items-center justify-between px-6 py-3">
        <h1 className="text-xl font-bold">AI Teaching Tools</h1>
        
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative cursor-pointer">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>

          {/* User Account Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2 cursor-pointer">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>DT</AvatarFallback>
                </Avatar>
                <span className="sr-only">Account menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
