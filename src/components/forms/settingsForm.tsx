"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Pencil, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Props = {
  user: {
    username: string;
    email: string;
  } | null;
  onClose: () => void;
};

export default function SettingsForm({ user, onClose }: Props) {
    const [username, setUsername] = useState(user?.username || "");
    const [email, setEmail] = useState(user?.email || "");
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [errors, setErrors] = useState<string[]>([]);
    const [editingUsername, setEditingUsername] = useState(false);
    const [editingEmail, setEditingEmail] = useState(false);

    const hasChanges =
        username !== (user?.username || "") ||
        email !== (user?.email || "") ||
        newPassword !== "";

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

    const validateEmail = (email: string) => {
        const messages: string[] = [];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
        messages.push("Please enter a valid email address.");
        }
        return messages;
    };

    const handleSave = async () => {
        const emailErrors = validateEmail(email);
        let passwordErrors: string[] = [];

        if (showPasswordFields && newPassword) {
            passwordErrors = validatePassword(newPassword);
        }

        const allErrors = [...emailErrors, ...passwordErrors];

        if (allErrors.length > 0) {
            setErrors(allErrors);
            return;
        }

        console.log({
            username,
            email,
            currentPassword,
            newPassword,
        });

        onClose();
  };

    return (
        <div className="flex flex-col gap-2 border rounded-md p-4">
            <div>
                <div className="flex justify-center my-4">
                    <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-neutral-600 text-neutral-50">
                            <User className="h-5 w-5" />
                        </AvatarFallback>
                    </Avatar>
                </div>
            
                {/* Username */}
                <div className="flex flex-col gap-2">
                    <Label>Username</Label>
                    <div className="flex gap-2">
                        <Input
                            value={username}
                            disabled={!editingUsername}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer"
                            onClick={() => setEditingUsername((prev) => !prev)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2 mt-4">
                    <Label>Email</Label>
                    <div className="flex gap-2">
                        <Input
                            value={email}
                            disabled={!editingEmail}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer"
                            onClick={() => setEditingEmail((prev) => !prev)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-2 mt-4">
                    <Label>Password</Label>
                    {!showPasswordFields ? (
                        <Button
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => setShowPasswordFields(true)}>
                            Change password
                        </Button>
                    ) : (
                        <div className="flex flex-col gap-2">
                        <PasswordInput
                            placeholder="Current password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <PasswordInput
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        </div>
                    )}
                </div>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
                <div className="text-destructive text-sm mt-2">
                {errors.map((err, i) => (
                    <div key={i}>
                    • <span className="font-bold">{err}</span>
                    </div>
                ))}
                </div>
            )}

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 mt-6 mb-2">
                <Button variant="outline" className="cursor-pointer" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={handleSave} className="cursor-pointer" disabled={!hasChanges}>
                    Save Changes
                </Button>
            </div>

            {/* DELETE */}
            <div className="border-t pt-4">
                <Button variant="destructive" className="cursor-pointer w-full">
                    Delete Account
                </Button>
            </div>
        </div>
    );
}