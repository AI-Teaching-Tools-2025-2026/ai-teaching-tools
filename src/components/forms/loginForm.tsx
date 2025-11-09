'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Button from "@mui/material/Button";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

// TODO: Add form validation and error handling
// TODO: Put the styles in a separate file / create new components for styled TextFields (depending on theme)
export default function LoginForm() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleLogin = async () => {
        try {
            const response = await axios.post("http://127.0.0.1:8000/auth/login", {
                username: username,
                password: password,
            });

            console.log(response.data); // { message: "Login successful!" }

            router.push("/dashboard");

        } catch (error: any) {
            if (error.response) {
                alert(error.response.data.detail); // show backend error message
            } else {
                alert("An error occurred. Try again.");
            }
        }
    };

    return (
        <Box
            component="form"
            noValidate
            autoComplete="off"
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
                sx={{
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: 'transparent',
                        // outline (border) color controls:
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
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.9)' }, // label color
                    // placeholder/sample text color only:
                    '& input::placeholder': { color: 'rgba(255,255,255,0.7)' },
                    // input text color
                    input: { color: '#ffffff' },
                    '& .MuiInputBase-input': { color: '#ffffff' },
                }}
                onChange={(e) => setUsername(e.target.value)}
            />

            <TextField
                id="password"
                label="Password"
                type="password"
                variant="outlined"
                sx={{
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
                    // make typed text white
                    input: { color: '#ffffff' },
                    '& .MuiInputBase-input': { color: '#ffffff' },
                }}
                onChange={(e) => setPassword(e.target.value)}
            />

            <Button
                type="button" variant="contained" sx={{ mt: 2 }}
                onClick={handleLogin}
            >
                Log in
            </Button>
        </Box>
    );
}
