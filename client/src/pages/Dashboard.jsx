import { useState } from "react";
import { Box, Button, Typography, CircularProgress, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MedicationCard from "../components/MedicationCard";
import MedicationFormDialog from "../components/MedicationFormDialog";
import ImageAnalyzeUploader from "../components/ImageAnalyzeUploader";
import { useSelector } from "react-redux";
import { selectUser } from "../features/auth/authSlice";
import {
  useGetMedicationsByUserQuery,
  useDeleteMedicationMutation,
} from "../features/apiSlice";

export default function Dashboard() {
  const user = useSelector(selectUser);
  const { data: meds = [], isLoading, error } = useGetMedicationsByUserQuery(user?.id, {
    skip: !user?.id,
  });
  const [deleteMed] = useDeleteMedicationMutation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (med) => { setEditing(med); setDialogOpen(true); };
  const handleDelete = async (med) => {
    if (!confirm(`למחוק את ${med.name}?`)) return;
    await deleteMed(med.id).unwrap();
  };

  return (
    <>
      <div className="app-container">
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4">שלום {user?.name} 👋</Typography>
            <Typography color="text.secondary">ניהול תזכורות התרופות שלך</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} size="large">
            הוספת תרופה
          </Button>
        </Box>

        <Typography className="section-title">העלאת מרשם / תמונת תרופה</Typography>
        <ImageAnalyzeUploader onAnalyzed={(prefill) => { setEditing(prefill); setDialogOpen(true); }} />

        <Typography className="section-title">התרופות שלי</Typography>

        {isLoading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}
        {error && <Alert severity="error">שגיאה בטעינת התרופות</Alert>}

        {!isLoading && meds.length === 0 ? (
          <div className="empty-state">
            <Typography>עדיין אין תרופות. הוסף תרופה חדשה או העלה תמונת מרשם.</Typography>
          </div>
        ) : (
          <div className="medication-grid">
            {meds.map((m) => (
              <MedicationCard key={m.id} med={m} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      <MedicationFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initial={editing}
      />
    </>
  );
}
