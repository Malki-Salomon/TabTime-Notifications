import { Card, CardContent, Typography, IconButton, Chip, Box, Divider } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EventIcon from "@mui/icons-material/Event";
import MedicationIcon from "@mui/icons-material/Medication";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const formatTime = (t) => {
  if (!t) return "";
  const parts = String(t).split(":");
  return `${parts[0]}:${parts[1] ?? "00"}`;
};

export default function MedicationCard({ med, onEdit, onDelete }) {
  const frequency = med.frequency ?? med.dosagePerDay;
  const schedules = med.schedules || [];
  return (
    <Card elevation={0} sx={{ position: "relative", overflow: "hidden" }}>
      <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 4,
        background: "linear-gradient(135deg,#10b981 0%,#0891b2 100%)" }} />
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box display="flex" gap={1.5} alignItems="center">
            <Box sx={{
              width: 44, height: 44, borderRadius: 3,
              background: "linear-gradient(135deg, rgba(16,185,129,.14), rgba(8,145,178,.10))",
              color: "primary.dark", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <MedicationIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ lineHeight: 1.2 }}>{med.name}</Typography>
              {med.dosage && (
                <Typography variant="body2" color="text.secondary">{med.dosage}</Typography>
              )}
            </Box>
          </Box>
          <Box>
            <IconButton size="small" onClick={() => onEdit?.(med)}
              sx={{ "&:hover": { background: "rgba(16,185,129,.10)", color: "primary.dark" } }}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete?.(med)}
              sx={{ color: "#94a3b8", "&:hover": { background: "rgba(239,68,68,.08)", color: "error.main" } }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Box display="flex" gap={1} mt={2} flexWrap="wrap">
          <Chip size="small" label={`${frequency ?? "?"} מנות ביום`}
            sx={{ background: "rgba(16,185,129,.10)", color: "primary.dark", fontWeight: 700 }} />
          <Chip size="small" icon={<EventIcon />} label={`עד ${med.endDate}`}
            sx={{ background: "rgba(8,145,178,.10)", color: "secondary.dark" }} />
          {med.fixedSchedule && <Chip size="small" label="זמנים קבועים"
            sx={{ background: "rgba(15,23,42,.06)" }} />}
        </Box>

        {schedules.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: .5 }}>
              זמני נטילה
            </Typography>
            <Box display="flex" gap={0.75} mt={1} flexWrap="wrap">
              {schedules.map((s, i) => (
                <Chip key={s.id ?? i} size="small" icon={<AccessTimeIcon />} label={formatTime(s.timeOfDay)}
                  sx={{ background: "#fff", border: "1px solid rgba(15,23,42,.08)" }} />
              ))}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}
