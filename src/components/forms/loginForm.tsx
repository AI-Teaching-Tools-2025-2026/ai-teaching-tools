'use client';
import Button from "@mui/material/Button";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

// TODO: Add form validation and error handling
// TODO: Put the styles in a separate file / create new components for styled TextFields (depending on theme)
export default function LoginForm() {
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
            />

            <Button
                type="submit" variant="contained" sx={{ mt: 2 }}
                // TODO: API Implementation (hard coded redirect for now)
                href="dashboard"
            >
                Sign in
            </Button>
        </Box>
    );
}
