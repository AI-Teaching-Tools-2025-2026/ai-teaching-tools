"use client";
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  Container,
  Grid,
} from "@mui/material";
import SideNavbar from "@/components/ui/sideNavbar";
import GradesGrid from "@/components/grades/GradesGrid";

export default function DashboardPage() {
  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: "gray" }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AI Teaching Tools
          </Typography>
          {/* The following can be uncommented once we can check for persistent auth */}
          {/* <Button color="inherit">Account</Button> */}
        </Toolbar>
      </AppBar>

      <SideNavbar />

      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Typography
          variant="h1"
          sx={{
            fontSize: "2rem",
            fontWeight: "bold",
            textAlign: "left",
            ml: 3,
          }}
        >
          Grades
        </Typography>

        {/* Grades table */}
        <Container maxWidth={false} sx={{ mt: 4 }}>
          <GradesGrid />
        </Container>
      </Box>
    </Box>
  );
}
