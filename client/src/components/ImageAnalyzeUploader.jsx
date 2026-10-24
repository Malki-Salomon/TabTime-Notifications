import { useRef, useState } from "react";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useAnalyzeMedicationImageMutation } from "../features/apiSlice";

export default function ImageAnalyzeUploader({ onAnalyzed }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [analyze, { isLoading }] = useAnalyzeMedicationImageMutation();

 const handleFile = async (file) => {
 
  try {
   
    const response = await analyze(file).unwrap();
    
    console.log("Success! Data received:", response);
    
    if (onAnalyzed) {
      onAnalyzed(response); // הפעלת ה-callback עם הנתונים שחזרו
    }

  } catch (error) {
    console.error("Upload failed:", error);
    alert(error?.data || error?.message || "שגיאה בניתוח התמונה");
  }
};

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
   
    <Box
    className={`upload-dropzone ${dragOver ? "drag-over" : ""}`}
    onClick={(e) => {
      // אם אנחנו כבר בטעינה, אל תעשה כלום
      if (isLoading) return;
      
      // מניעה של הפעלה כפולה אם לחצו בטעות על אלמנט פנימי
      inputRef.current?.click();
    }}
    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
    onDragLeave={() => setDragOver(false)}
    onDrop={onDrop}
    style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
  >
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      hidden
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          handleFile(file);
          // טיפ קריטי: מנקים את ערך ה-input כדי שהבחירה הבאה תעבוד תמיד
          e.target.value = ""; 
        }
      }}
    />
    {isLoading ? (
      <Box display="flex" flexDirection="column" alignItems="center" gap={1} onClick={(e) => e.stopPropagation()}>
        <CircularProgress />
        <Typography>מנתח תמונה...</Typography>
      </Box>
    ) : (
      <Box display="flex" flexDirection="column" alignItems="center" gap={1.2}>
        <Box sx={{
          width: 72, height: 72, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, rgba(16,185,129,.16), rgba(8,145,178,.12))",
          color: "#047857", mb: 1,
          boxShadow: "0 10px 28px -10px rgba(16,185,129,.5)",
        }}>
          <CloudUploadIcon sx={{ fontSize: 38 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>גרור תמונת מרשם לכאן</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
          או לחץ לבחור קובץ. ה‑AI יזהה אוטומטית את שם התרופה, המינון, התדירות ותאריך הסיום.
        </Typography>
        {preview && (
          <img
            src={preview}
            alt="preview"
            style={{ maxWidth: 180, marginTop: 8, borderRadius: 12, boxShadow: "0 8px 24px rgba(15,23,42,.12)" }}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        <Button
          size="medium"
          sx={{ mt: 1.5 }}
          variant="contained"
          onClick={(e) => {
            e.stopPropagation();
            if (!isLoading) inputRef.current?.click();
          }}
        >
          בחר קובץ
        </Button>
      </Box>
    )}
  </Box>
  );
}
