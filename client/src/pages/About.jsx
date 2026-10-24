import { Box, Container, Typography, Grid, Card, CardContent, Stack, Avatar } from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ScheduleIcon from "@mui/icons-material/Schedule";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import FavoriteIcon from "@mui/icons-material/Favorite";

const items = [
  { icon: <PhotoCameraIcon />, title: "סריקת תמונה בעזרת AI", desc: "צלמו אריזה או מרשם וקבלו מילוי אוטומטי של שם התרופה, מינון, תדירות ותאריך סיום." },
  { icon: <ScheduleIcon />, title: "תזמון מנות יומי", desc: "הגדירו כמה מנות ביום וקבעו שעות מדויקות לכל מנה." },
  { icon: <NotificationsActiveIcon />, title: "התראות חוצות מכשירים", desc: "התראות דחיפה לכל מכשיר רשום — גם כשהדפדפן סגור." },
  { icon: <HealthAndSafetyIcon />, title: "ניהול בריאות מרכזי", desc: "כל התרופות, מועדי הנטילה והפרופיל האישי במקום אחד." },
  { icon: <VerifiedUserIcon />, title: "פרטיות מלאה", desc: "הנתונים שלכם מאוחסנים בצורה מאובטחת ואינם משותפים עם צד שלישי." },
  { icon: <FavoriteIcon />, title: "ממשק נגיש ונעים", desc: "עוצב במיוחד עבור משתמשים מכל הגילאים, עם תמיכה מלאה בעברית ו‑RTL." },
];

export default function About() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography variant="h3" sx={{ mb: 2 }}>אודות המערכת</Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 720, mx: "auto", fontSize: 18 }}>
          תזכורת תרופות היא פלטפורמה מתקדמת המשלבת בינה מלאכותית עם חוויית משתמש מודרנית,
          כדי לעזור לכם ולקרוביכם לקחת את התרופות בזמן — בכל יום, בכל מכשיר.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {items.map((it) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={it.title}>
            <Card sx={{ height: "100%", transition: "transform .2s, box-shadow .2s", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 18px 36px rgba(15,23,42,.10)" } }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar sx={{ bgcolor: "rgba(16,185,129,.12)", color: "primary.dark" }}>{it.icon}</Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ mb: .5 }}>{it.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{it.desc}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          mt: 8, p: { xs: 4, md: 6 }, borderRadius: 5, textAlign: "center", color: "#fff",
          background: "linear-gradient(135deg,#10b981 0%,#0891b2 100%)",
          boxShadow: "0 30px 60px rgba(16,185,129,.35)",
        }}
      >
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 800 }}>החזון שלנו</Typography>
        <Typography sx={{ opacity: .95, maxWidth: 720, mx: "auto", fontSize: 17 }}>
          להפוך את ניהול הבריאות היומיומי לפשוט, חכם ונגיש לכולם — בעזרת טכנולוגיה שמשרתת אנשים אמיתיים.
        </Typography>
      </Box>
    </Container>
  );
}
