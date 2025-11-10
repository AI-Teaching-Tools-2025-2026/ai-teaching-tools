"use client";
import {
  Drawer,
  Toolbar,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";

const drawerList = [
  "Dashboard",
  "Grades",
  "Quiz Builder",
  "Assignment Builder",
  "Question Banks",
];

export default function SideNavbar() {
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 240,
          boxSizing: "border-box",
          bgcolor: "gray",
          color: "white",
        },
      }}
    >
      <Toolbar />

      <Divider />
      <List>
        {drawerList.map((text) => (
          <ListItemButton key={text} sx={{ pl: 2, py: 2 }}>
            <ListItemText primary={text} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
