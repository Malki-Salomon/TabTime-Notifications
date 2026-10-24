import { AppBar, Toolbar, Typography, Button, Box, Avatar, IconButton, Tooltip, Stack } from "@mui/material";
import MedicationLiquidIcon from "@mui/icons-material/MedicationLiquid";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser } from "../features/auth/authSlice";
import { NavLink, useNavigate } from "react-router-dom";
import { useNotification } from "../hooks/useNotification";
import { useState } from "react";
import ProfileDialog from "./ProfileDialog";

const navBtnSx = ({ isActive }) => ({
  px: 2.2, py: 1, borderRadius: 999, textDecoration: "none",
  fontWeight: 600, fontSize: 14.5,
  color: isActive ? "#047857" : "#475569",
  background: isActive ? "rgba(16,185,129,.12)" : "transparent",
  transition: "all .25s ease",
  "&:hover": { background: "rgba(16,185,129,.08)", color: "#047857" },
});

export function BrandLogo({ size = "md" }) {
  const fs = size === "lg" ? 26 : 22;
  const ms = size === "lg" ? 40 : 36;
  return (
    <Box className="brand-logo" sx={{ fontSize: fs }}>
      <Box className="brand-mark" sx={{ width: ms, height: ms }}>
        <MedicationLiquidIcon sx={{ fontSize: ms * 0.6 }} />
      </Box>
      <Box component="span">
        <span className="brand-med">Med</span>
        <span className="brand-remind">Remind</span>
      </Box>
    </Box>
  );
}

export default function Navbar() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { subscribe } = useNotification();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  const handleEnableNotifications = async () => {
    try { await subscribe(); alert("התראות הופעלו בהצלחה"); }
    catch (e) { alert(`לא ניתן להפעיל התראות: ${e.message}`); }
  };

  return (
    <AppBar position="sticky" color="inherit" elevation={0}>
      <Toolbar sx={{ justifyContent: "space-between", gap: 2, py: 1.2, minHeight: 72 }}>
        <BrandLogo />

        <Stack direction="row" spacing={0.5} sx={{ display: { xs: "none", md: "flex" } }}>
          <Box component={NavLink} to="/dashboard" sx={navBtnSx}>דף התרופות</Box>
          <Box component={NavLink} to="/about" sx={navBtnSx}>אודות</Box>
        </Stack>

        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title="הפעלת התראות דחיפה">
            <IconButton onClick={handleEnableNotifications}
              sx={{ background: "rgba(16,185,129,.10)", color: "#047857",
                "&:hover": { background: "rgba(16,185,129,.18)", transform: "translateY(-1px)" } }}>
              <NotificationsActiveIcon />
            </IconButton>
          </Tooltip>
          {user && (
            <Tooltip title="עדכון פרופיל">
              <Box display="flex" alignItems="center" gap={1.2}
                sx={{ cursor: "pointer", px: 1.2, py: .6, borderRadius: 999,
                  transition: "background .2s",
                  "&:hover": { background: "rgba(15,23,42,.04)" } }}
                onClick={() => setProfileOpen(true)}>
                <Avatar sx={{
                  background: "linear-gradient(135deg,#10b981,#0891b2)",
                  width: 36, height: 36, fontWeight: 700, fontSize: 15,
                  boxShadow: "0 6px 16px -6px rgba(16,185,129,.6)"
                }}>
                  {user.name?.[0] || "?"}
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 700, display: { xs: "none", sm: "block" } }}>{user.name}</Typography>
              </Box>
            </Tooltip>
          )}
          <Button onClick={handleLogout} startIcon={<LogoutIcon />} color="inherit"
            sx={{ color: "#64748b", "&:hover": { color: "#ef4444", background: "rgba(239,68,68,.06)" } }}>
            התנתק
          </Button>
        </Box>
      </Toolbar>
      <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />
    </AppBar>
  );
}
