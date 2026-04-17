"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import SettingsForm from "@/components/forms/settingsForm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Settings, LogOut, User, Pencil } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [user, setUser] = useState<{
    username: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/user`,
          { withCredentials: true } 
        );

        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user", err);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`,
        {},
        { withCredentials: true },
      );

      router.push("/"); 
    } catch (error: any) {
      console.error("Logout failed", error);
      alert("Logout failed. Try again.");
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{ background: "var(--800, #262626)" }}
    >
      <div className="flex items-center justify-between w-full p-4">
        <h1 className="text-xl font-bold text-neutral-50">AI Teaching Tools</h1>

        <div className="flex items-center gap-2">
          {/* Settings */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <div
                className="cursor-pointer text-neutral-200 hover:text-neutral-50 hover:bg-neutral-500 rounded-full p-2"
                onClick={() => setIsSheetOpen(true)}
              >
                <Settings className="h-5 w-5" />
              </div>
            </SheetTrigger>

            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
                <SheetDescription>
                  Update your account information.
                </SheetDescription>
              </SheetHeader>
              <div className="px-4">
                <SettingsForm
                  user={user}
                  onClose={() => setIsSheetOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* User Account Dropdown */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <div className="cursor-pointer rounded-full hover:bg-neutral-500 p-1">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-neutral-600 text-neutral-50">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-neutral-800 border-neutral-600"
            >
              <div className="flex flex-col items-center p-3 m-2 gap-2">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-neutral-600 text-neutral-50">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm">Hi, {user ? user.username : "Loading..."}</p>
                <p className="text-sm"> {user ? user.email : ""}</p>
              </div>
              <DropdownMenuSeparator className="bg-neutral-600" />
              <DropdownMenuItem 
                className="text-neutral-50 focus:bg-neutral-600 focus:text-neutral-50 cursor-pointer"
                onClick={() => setIsSheetOpen(true)}
              >
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-neutral-600" />
              <DropdownMenuItem
                className="text-neutral-50 focus:bg-neutral-600 focus:text-neutral-50 cursor-pointer"
                onClick={handleLogout}
              >
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
