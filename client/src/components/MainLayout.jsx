import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Box } from "@mui/material";

export default function MainLayout() {
  return (
    <Box sx={{
      minHeight: "100vh",
      background: `
        radial-gradient(1000px 500px at 100% 0%, rgba(16,185,129,0.08), transparent 60%),
        radial-gradient(900px 500px at 0% 10%, rgba(8,145,178,0.06), transparent 60%),
        linear-gradient(180deg, #f8fafc 0%, #f3f4f6 100%)
      `,
    }}>
      <Navbar />
      <Outlet />
    </Box>
  );
}
