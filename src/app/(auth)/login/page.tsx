import { Container, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

export default function LoginPage() {
  return (
    <Container>
      <Typography 
        variant="h1"
        sx={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '2rem', textAlign: 'center' }}
      >
        Login Page
      </Typography>

      <Box
        component="form"
        sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}
        noValidate
        autoComplete="off"
      >
        <div>
          <TextField
            disabled
            id="outlined-disabled"
            label="Disabled"
            defaultValue="Username"
          />
          <TextField
            id="outlined-password-input"
            label="Password"
            type="password"
            autoComplete="current-password"
          />
        </div>
      </Box>

    </Container>
  );
}