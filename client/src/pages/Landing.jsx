import { Box, Button, Container, Typography, Grid, Card, CardContent, Stack, Chip } from "@mui/material";
import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectToken } from "../features/auth/authSlice";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import ScheduleIcon from "@mui/icons-material/Schedule";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { BrandLogo } from "../components/Navbar";

const features = [
  { icon: <PhotoCameraIcon />, title: "סריקת מרשם חכמה", desc: "צילום של אריזת תרופה או מרשם — וה‑AI ימלא עבורך את הפרטים." },
  { icon: <ScheduleIcon />, title: "תזמון מדויק", desc: "הגדרת מספר מנות ביום עם שעות מותאמות אישית." },
  { icon: <NotificationsActiveIcon />, title: "התראות דחיפה", desc: "תזכורות בזמן אמת לכל מכשיר — גם כשהדפדפן סגור." },
  { icon: <VerifiedUserIcon />, title: "פרטיות ואבטחה", desc: "נתוני המטופל מאוחסנים בצורה מאובטחת ומוצפנת." },
];

export default function Landing() {
  const token = useSelector(selectToken);
  if (token) return <Navigate to="/dashboard" replace />;

  return (
    <Box sx={{
      minHeight: "100vh",
      background: `
        radial-gradient(900px 500px at 100% 0%, rgba(16,185,129,0.18), transparent 60%),
        radial-gradient(800px 500px at 0% 10%, rgba(8,145,178,0.14), transparent 60%),
        linear-gradient(180deg,#f0fdf4 0%,#f8fafc 50%,#ecfeff 100%)
      `,
    }}>
      {/* Top bar */}
      <Box sx={{ py: 2.5, px: { xs: 2, md: 6 }, display: "flex", justifyContent: "space-between", alignItems: "center",
        backdropFilter: "blur(8px)", background: "rgba(255,255,255,.5)", borderBottom: "1px solid rgba(15,23,42,.05)" }}>
        <BrandLogo />
        <Stack direction="row" spacing={1.5}>
          <Button component={Link} to="/login" variant="text" color="primary">התחברות</Button>
          <Button component={Link} to="/register" variant="contained">הרשמה</Button>
        </Stack>
      </Box>

      {/* Hero */}
      <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 6, md: 10 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            <Chip
              icon={<HealthAndSafetyIcon />}
              label="פלטפורמת בריאות חכמה"
              color="primary"
              variant="outlined"
              sx={{ mb: 3, fontWeight: 600 }}
            />
            <Typography variant="h2" sx={{ fontSize: { xs: 36, md: 56 }, lineHeight: 1.15, mb: 2 }}>
              לא לשכוח אף מנה.
              <Box component="span" sx={{ display: "block", background: "linear-gradient(135deg,#10b981,#0891b2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                ניהול תרופות בעידן ה‑AI.
              </Box>
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, mb: 4, maxWidth: 560 }}>
              צלמו מרשם או אריזה, וה‑AI שלנו ימלא עבורכם את הפרטים. קבלו תזכורות חכמות בזמן הנכון, לכל המכשירים — בצורה פשוטה, יפה ומאובטחת.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button component={Link} to="/register" size="large" variant="contained" sx={{ px: 4, py: 1.4, fontSize: 16 }}>
                התחילו עכשיו — חינם
              </Button>
              <Button component={Link} to="/login" size="large" variant="outlined" sx={{ px: 4, py: 1.4, fontSize: 16 }}>
                כבר יש לי חשבון
              </Button>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                position: "relative",
                p: 4,
                borderRadius: 6,
                background: "linear-gradient(135deg,#10b981 0%,#0891b2 100%)",
                color: "#fff",
                boxShadow: "0 30px 60px rgba(16,185,129,.45)",
                overflow: "hidden",
              }}
            >
              <Box sx={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,.15)" }} />
              <Box sx={{ position: "absolute", bottom: -60, left: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,.08)" }} />
              <Stack spacing={2} sx={{ position: "relative" }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <NotificationsActiveIcon />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>תזכורת חדשה</Typography>
                </Stack>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>הגיע הזמן לאקמול 500mg</Typography>
                <Typography sx={{ opacity: .9 }}>מנה אחת · 08:00 · עם כוס מים</Typography>
                <Box sx={{ mt: 2, p: 2, borderRadius: 3, background: "rgba(255,255,255,.18)" }}>
                  <Typography sx={{ fontWeight: 600, mb: .5 }}>סריקה אחרונה</Typography>
                  <Typography variant="body2" sx={{ opacity: .9 }}>זוהה אוטומטית: שם, מינון, תדירות, ותאריך סיום.</Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Features */}
      <Box sx={{ background: "#fff", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
          <Typography variant="h4" align="center" sx={{ mb: 1 }}>למה לבחור בנו?</Typography>
          <Typography align="center" color="text.secondary" sx={{ mb: 6 }}>כל מה שצריך כדי לנהל בריאות — במקום אחד.</Typography>
          <Grid container spacing={3}>
            {features.map((f) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={f.title}>
                <Card sx={{ height: "100%", p: 1, transition: "transform .2s, box-shadow .2s", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 18px 36px rgba(15,23,42,.10)" } }}>
                  <CardContent>
                    <Box sx={{ width: 48, height: 48, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(16,185,129,.10)", color: "primary.dark", mb: 2 }}>
                      {f.icon}
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>{f.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Container maxWidth="md" sx={{ py: { xs: 8, md: 10 }, textAlign: "center" }}>
        <Typography variant="h4" sx={{ mb: 2 }}>מוכנים להתחיל?</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>צרו חשבון בחינם ונהלו את התרופות שלכם בצורה חכמה ובטוחה.</Typography>
        <Button component={Link} to="/register" size="large" variant="contained" sx={{ px: 5, py: 1.5 }}>
          הרשמה מהירה
        </Button>
      </Container>

      <Box component="footer" sx={{ py: 3, textAlign: "center", color: "text.secondary", borderTop: "1px solid #e2e8f0", background: "#fff" }}>
        © {new Date().getFullYear()} תזכורת תרופות · נבנה באהבה לבריאות שלך
      </Box>
    </Box>
  );
}
