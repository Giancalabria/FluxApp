import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        bgcolor: "background.default",
      }}
    >
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pb: "calc(64px + env(safe-area-inset-bottom, 0px) + 8px)",
          overflow: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Outlet />
      </Box>
      <BottomNav />
    </Box>
  );
}
