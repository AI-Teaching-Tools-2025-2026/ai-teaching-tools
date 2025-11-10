"use client";
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  Container,
  Grid,
} from "@mui/material";
import Image from "next/image";
import SideNavbar from "@/components/ui/sideNavbar";

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
          Dashboard Page
        </Typography>

        <Container maxWidth={false} sx={{ mt: 4 }}>
          <Grid container spacing={2} columns={16} sx={{ mt: 2 }}>
            <Grid size={10}>
              <Grid sx={{ bgcolor: "gray" }}>
                <Typography
                  variant="h2"
                  sx={{ p: 2, fontSize: "h5.fontSize", fontWeight: "bold" }}
                >
                  Overview
                </Typography>
                <Image
                  src="/barChartPlaceholder.png"
                  style={{ padding: "2rem" }}
                  width={800}
                  height={400}
                  alt="Bar Chart Placeholder"
                ></Image>
              </Grid>
              <Grid sx={{ bgcolor: "gray", mt: 2 }}>
                <Typography
                  variant="h2"
                  sx={{ p: 2, fontSize: "h5.fontSize", fontWeight: "bold" }}
                >
                  More Data
                </Typography>
                <Image
                  src="/barChartPlaceholder.png"
                  style={{ padding: "2rem" }}
                  width={800}
                  height={400}
                  alt="Bar Chart Placeholder"
                ></Image>
              </Grid>
            </Grid>
            <Grid size={6} sx={{ bgcolor: "gray" }}>
              <Typography
                variant="h2"
                sx={{ p: 2, fontSize: "h5.fontSize", fontWeight: "bold" }}
              >
                Student-Specific Data
              </Typography>
              <Image
                src="/pieChartPlaceholder.png"
                style={{ padding: "2rem" }}
                width={400}
                height={400}
                alt="Pie Chart Placeholder"
              ></Image>
              <Image
                src="/pieChartPlaceholder.png"
                style={{ padding: "2rem" }}
                width={400}
                height={400}
                alt="Pie Chart Placeholder"
              ></Image>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
