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
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authService } from "@/services/authService";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Navbar() {
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [user, setUser] = useState<{
    username: string;
    email: string;
  } | null>(null);

  const fetchUser = async () => {
    try {
      const data = await authService.fetchUser();
      setUser(data);
    } catch (err) {
      console.error("Failed to fetch user", err);
      setUser(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const data = await authService.fetchUser();
        if (mounted) setUser(data);
      } catch (err) {
        console.error("Failed to fetch user", err);
        if (mounted) setUser(null);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border"
    >
      <div className="flex items-center justify-between w-full p-4">
        <h1 className="text-xl font-bold text-foreground">AI Teaching Tools</h1>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {/* Settings */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <div
                className="cursor-pointer text-primary hover:bg-accent rounded-full p-2"
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
                  onUpdated={fetchUser}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* User Account Dropdown */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <div className="cursor-pointer rounded-full hover:bg-accent p-1">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56"
            >
              <div className="flex flex-col items-center p-3 m-2 gap-2">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium">
                  Hi, {user ? user.username : "Loading..."}
                </p>
                <p className="text-sm text-muted-foreground"> {user ? user.email : ""}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setIsSheetOpen(true)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                <span>Edit Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
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
