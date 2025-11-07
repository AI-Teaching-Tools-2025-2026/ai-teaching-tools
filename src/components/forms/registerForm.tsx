'use client';
import { useState } from 'react';
import Button from "@mui/material/Button";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

// TODO: Move inline sx styling into theme or styled components
export default function RegisterForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<string[]>([]);

    // Validate password and return an array of unmet requirements
    const validatePassword = (pw: string) => {
        const messages: string[] = [];
        if (pw.length < 8) messages.push("Password must be at least 8 characters long.");
        if (!/\d/.test(pw)) messages.push("Password must contain at least one number.");
        if (!/[A-Z]/.test(pw)) messages.push("Password must contain at least one uppercase letter.");
        return messages;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const passwordErrors = validatePassword(password);
        if (password !== confirmPassword) {
            passwordErrors.push("Passwords do not match.");
        }

        if (passwordErrors.length > 0) {
            setErrors(passwordErrors);
            return;
        }

        setErrors([]);
        console.log("Registered:", { username, password });
        window.location.href = "/login"; // TODO: Replace with API call
    };

    const textFieldStyle = {
        '& .MuiOutlinedInput-root': {
            backgroundColor: 'transparent',
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.9)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,1)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,1)',
            },
        },
        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.9)' },
        '& input::placeholder': { color: 'rgba(255,255,255,0.7)' },
        input: { color: '#ffffff' },
        '& .MuiInputBase-input': { color: '#ffffff' },
    };

    return (
        <Box
            component="form"
            noValidate
            autoComplete="off"
            onSubmit={handleSubmit}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                '& .MuiTextField-root': { m: 1, width: '25ch' },
                marginTop: 4,
            }}
        >
            <TextField
                id="username"
                label="Username"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={textFieldStyle}
            />

            <TextField
                id="password"
                label="Password"
                type="password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={textFieldStyle}
            />

            <TextField
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={textFieldStyle}
            />

            {errors.length > 0 && (
                <Box
                    sx={{
                        color: 'red',
                        mt: 1,
                        textAlign: 'left',
                        fontSize: '0.875rem',
                        width: '25ch',
                    }}
                >
                    {errors.map((err, index) => (
                        <div key={index}>• {err}</div>
                    ))}
                </Box>
            )}

            <Button
                type="submit"
                variant="contained"
                sx={{ mt: 2 }}
            >
                Register
            </Button>
        </Box>
    );
}
