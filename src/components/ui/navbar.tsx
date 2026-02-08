"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Settings, LogOut, User } from "lucide-react";

export default function Navbar() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{ background: "var(--800, #262626)" }}
    >
      <div className="flex items-center justify-between w-full p-4">
        <h1 className="text-xl font-bold text-neutral-50">AI Teaching Tools</h1>

        <div className="flex items-center gap-2">
          {/* Settings */}
          <div className="cursor-pointer text-neutral-200 hover:text-neutral-50 hover:bg-neutral-500 rounded-full p-2">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </div>

          {/* User Account Dropdown */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <div className="cursor-pointer rounded-full hover:bg-neutral-500 p-1">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-neutral-600 text-neutral-50">
                    DT
                  </AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-neutral-800 border-neutral-600"
            >
              <DropdownMenuItem className="text-neutral-50 focus:bg-neutral-600 focus:text-neutral-50">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-50 focus:bg-neutral-600 focus:text-neutral-50">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-neutral-600" />
              <DropdownMenuItem className="text-neutral-50 focus:bg-neutral-600 focus:text-neutral-50">
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
