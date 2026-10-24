import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControlLabel, Switch, Box, Typography } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../features/auth/authSlice";
import {
  useCreateMedicationMutation,
  useUpdateMedicationMutation,
} from "../features/apiSlice";

const toHHmmss = (t) => {
  if (!t) return "08:00:00";
  const parts = t.split(":");
  if (parts.length === 2) return `${t}:00`;
  return t;
};

const toHHmm = (t) => {
  if (!t) return "";
  const parts = t.split(":");
  return `${parts[0]}:${parts[1] ?? "00"}`;
};

export default function MedicationFormDialog({ open, onClose, initial }) {
  const user = useSelector(selectUser);
  const [createMed, { isLoading: creating }] = useCreateMedicationMutation();
  const [updateMed, { isLoading: updating }] = useUpdateMedicationMutation();

  const today = new Date().toISOString().slice(0, 10);
  const [times, setTimes] = useState([]);

  const { control, register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: { name: "", dosage: "", dosagePerDay: 1, endDate: "", fixedSchedule: false },
  });

  const dosagePerDay = Number(watch("dosagePerDay")) || 1;

  useEffect(() => {
    if (open) {
      const freq = initial?.frequency || initial?.dosagePerDay || 1;
      reset({
        name: initial?.medicine_name || initial?.name || "",
        dosage: initial?.dosage || "",
        dosagePerDay: freq,
        endDate: initial?.endDate || "",
        fixedSchedule: initial?.fixedSchedule || false,
      });

      const existing = (initial?.schedules || []).map((s) => toHHmm(s.timeOfDay));
      const initialTimes = [];
      for (let i = 0; i < freq; i++) {
        initialTimes.push(existing[i] || "08:00");
      }
      setTimes(initialTimes);
    }
  }, [open, initial, reset]);

  useEffect(() => {
    setTimes((prev) => {
      const next = [...prev];
      if (dosagePerDay > next.length) {
        while (next.length < dosagePerDay) next.push("08:00");
      } else if (dosagePerDay < next.length) {
        next.length = dosagePerDay;
      }
      return next;
    });
  }, [dosagePerDay]);

  const updateTimeAt = (idx, val) => {
    setTimes((prev) => prev.map((t, i) => (i === idx ? val : t)));
  };

  // הפונקציה המעודכנת שמבצעת בקשה אחת יעילה ומסונכרנת
  const onSubmit = async (values) => {
    // 1. מיפוי מערך השעות לפורמט שה-Entity ב-Java מצפה לו
    const schedulesPayload = times
      .filter((t) => t)
      .map((t) => ({
        timeOfDay: toHHmmss(t),
        isTake: true,
        user: { id: user.id },
      }));

    // 2. בניית ה-Payload המלא שמכיל את התרופה והשעות יחד
    const payload = {
      name: values.name,
      dosage: values.dosage,
      frequency: Number(values.dosagePerDay),
      endDate: values.endDate,
      fixedSchedule: values.fixedSchedule,
      user: { id: user.id },
      schedules: schedulesPayload, // נשלח כחלק אינטגרלי מהתרופה
    };

    try {
      // 3. שליחה לשרת במכה אחת
      if (initial?.id) {
        await updateMed({ id: initial.id, body: payload }).unwrap();
      } else {
        await createMed(payload).unwrap();
      }

      onClose();
    } catch (error) {
      console.error("Failed to save medication:", error);
      alert(error?.data?.message || error?.data || "שגיאה בשמירת התרופה");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" dir="rtl">
      <DialogTitle>{initial?.id ? "עריכת תרופה" : "הוספת תרופה"}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <TextField
            label="שם התרופה"
            fullWidth
            margin="normal"
            {...register("name", {
              required: "שם הוא שדה חובה",
              minLength: { value: 2, message: "שם חייב להכיל לפחות 2 תווים" },
              maxLength: { value: 50, message: "שם חייב להיות עד 50 תווים" },
            })}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            label="מינון (לדוגמה: 2 כדורים)"
            fullWidth
            margin="normal"
            {...register("dosage", {
              maxLength: { value: 100, message: "מינון עד 100 תווים" },
            })}
            error={!!errors.dosage}
            helperText={errors.dosage?.message}
          />
          <TextField
            label="מנות ביום"
            type="number"
            fullWidth
            margin="normal"
            inputProps={{ min: 1 }}
            {...register("dosagePerDay", {
              required: "מנות ביום הוא שדה חובה",
              min: { value: 1, message: "חייב להיות לפחות 1" },
              valueAsNumber: true,
            })}
            error={!!errors.dosagePerDay}
            helperText={errors.dosagePerDay?.message}
          />
          <TextField
            label="תאריך סיום"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            {...register("endDate", {
              required: "תאריך סיום הוא שדה חובה",
              validate: (v) => v >= today || "התאריך חייב להיות היום או בעתיד",
            })}
            error={!!errors.endDate}
            helperText={errors.endDate?.message}
          />
          <Controller
            control={control}
            name="fixedSchedule"
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                label="זמנים קבועים"
              />
            )}
          />

          <Box mt={2}>
            <Typography variant="subtitle1" gutterBottom>
              זמני נטילה
            </Typography>
            {times.map((t, idx) => (
              <Box key={idx} display="flex" alignItems="center" gap={1} mb={1}>
                <TextField
                  type="time"
                  label={`מנה ${idx + 1}`}
                  value={t}
                  onChange={(e) => updateTimeAt(idx, e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 60 }}
                  fullWidth
                />
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>ביטול</Button>
          <Button type="submit" variant="contained" disabled={creating || updating}>
            שמירה
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}



// import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControlLabel, Switch, Box, Typography, IconButton } from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";
// import { useForm, Controller } from "react-hook-form";
// import { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import { selectUser } from "../features/auth/authSlice";
// import {
//   useCreateMedicationMutation,
//   useUpdateMedicationMutation,
//   useCreateMedicationScheduleMutation,
// } from "../features/apiSlice";

// const toHHmmss = (t) => {
//   if (!t) return "08:00:00";
//   // accept "HH:mm" or "HH:mm:ss"
//   const parts = t.split(":");
//   if (parts.length === 2) return `${t}:00`;
//   return t;
// };

// const toHHmm = (t) => {
//   if (!t) return "";
//   const parts = t.split(":");
//   return `${parts[0]}:${parts[1] ?? "00"}`;
// };

// export default function MedicationFormDialog({ open, onClose, initial }) {
//   const user = useSelector(selectUser);
//   const [createMed, { isLoading: creating }] = useCreateMedicationMutation();
//   const [updateMed, { isLoading: updating }] = useUpdateMedicationMutation();
//   const [createSchedule, { isLoading: schedSaving }] = useCreateMedicationScheduleMutation();

//   const today = new Date().toISOString().slice(0, 10);

//   const [times, setTimes] = useState([]);

//   const { control, register, handleSubmit, reset, watch, formState: { errors } } = useForm({
//     defaultValues: { name: "", dosage: "", dosagePerDay: 1, endDate: "", fixedSchedule: false },
//   });

//   const dosagePerDay = Number(watch("dosagePerDay")) || 1;

//   useEffect(() => {
//     if (open) {
//       const freq = initial?.frequency || initial?.dosagePerDay || 1;
//       reset({
//         name: initial?.medicine_name || initial?.name || "",
//         dosage: initial?.dosage || "",
//         dosagePerDay: freq,
//         endDate: initial?.endDate || "",
//         fixedSchedule: initial?.fixedSchedule || false,
//       });

//       // populate existing schedule times if editing
//       const existing = (initial?.schedules || []).map((s) => toHHmm(s.timeOfDay));
//       const initialTimes = [];
//       for (let i = 0; i < freq; i++) {
//         initialTimes.push(existing[i] || "08:00");
//       }
//       setTimes(initialTimes);
//     }
//   }, [open, initial, reset]);

//   // Resize times array when dosagePerDay changes
//   useEffect(() => {
//     setTimes((prev) => {
//       const next = [...prev];
//       if (dosagePerDay > next.length) {
//         while (next.length < dosagePerDay) next.push("08:00");
//       } else if (dosagePerDay < next.length) {
//         next.length = dosagePerDay;
//       }
//       return next;
//     });
//   }, [dosagePerDay]);

//   const updateTimeAt = (idx, val) => {
//     setTimes((prev) => prev.map((t, i) => (i === idx ? val : t)));
//   };

//   const onSubmit = async (values) => {
//     const payload = {
//       name: values.name,
//       dosage: values.dosage,
//       frequency: Number(values.dosagePerDay),
//       endDate: values.endDate,
//       fixedSchedule: values.fixedSchedule,
//       user: { id: user.id },
//     };

//     try {
//       // Step A: save/update medication
//       let savedMed;
//       if (initial?.id) {
//         savedMed = await updateMed({ id: initial.id, body: payload }).unwrap();
//         // updateMed may not return body — fall back to initial.id
//         if (!savedMed || !savedMed.id) savedMed = { ...payload, id: initial.id };
//       } else {
//         savedMed = await createMed(payload).unwrap();
//       }

//       const medId = savedMed?.id ?? initial?.id;

//       // Step B: create a schedule entry for each selected time
//       if (medId && times.length) {
//         for (const t of times) {
//           if (!t) continue;
//           await createSchedule({
//             medication: { id: medId },
//             user: { id: user.id },
//             timeOfDay: toHHmmss(t),
//             isTake: true,
//           }).unwrap();
//         }
//       }

//       onClose();
//     } catch (error) {
//       console.error("Failed to save medication:", error);
//       alert(error?.data?.message || error?.data || "שגיאה בשמירת התרופה");
//     }
//   };

//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" dir="rtl">
//       <DialogTitle>{initial?.id ? "עריכת תרופה" : "הוספת תרופה"}</DialogTitle>
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <DialogContent>
//           <TextField
//             label="שם התרופה"
//             {...register("name", {
//               required: "שם הוא שדה חובה",
//               minLength: { value: 2, message: "שם חייב להכיל לפחות 2 תווים" },
//               maxLength: { value: 50, message: "שם חייב להיות עד 50 תווים" },
//             })}
//             error={!!errors.name}
//             helperText={errors.name?.message}
//           />
//           <TextField
//             label="מינון (לדוגמה: 2 כדורים)"
//             {...register("dosage", {
//               maxLength: { value: 100, message: "מינון עד 100 תווים" },
//             })}
//             error={!!errors.dosage}
//             helperText={errors.dosage?.message}
//           />
//           <TextField
//             label="מנות ביום"
//             type="number"
//             inputProps={{ min: 1 }}
//             {...register("dosagePerDay", {
//               required: "מנות ביום הוא שדה חובה",
//               min: { value: 1, message: "חייב להיות לפחות 1" },
//               valueAsNumber: true,
//             })}
//             error={!!errors.dosagePerDay}
//             helperText={errors.dosagePerDay?.message}
//           />
//           <TextField
//             label="תאריך סיום"
//             type="date"
//             InputLabelProps={{ shrink: true }}
//             {...register("endDate", {
//               required: "תאריך סיום הוא שדה חובה",
//               validate: (v) => v >= today || "התאריך חייב להיות היום או בעתיד",
//             })}
//             error={!!errors.endDate}
//             helperText={errors.endDate?.message}
//           />
//           <Controller
//             control={control}
//             name="fixedSchedule"
//             render={({ field }) => (
//               <FormControlLabel
//                 control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
//                 label="זמנים קבועים"
//               />
//             )}
//           />

//           <Box mt={2}>
//             <Typography variant="subtitle1" gutterBottom>
//               זמני נטילה
//             </Typography>
//             {times.map((t, idx) => (
//               <Box key={idx} display="flex" alignItems="center" gap={1} mb={1}>
//                 <TextField
//                   type="time"
//                   label={`מנה ${idx + 1}`}
//                   value={t}
//                   onChange={(e) => updateTimeAt(idx, e.target.value)}
//                   InputLabelProps={{ shrink: true }}
//                   inputProps={{ step: 60 }}
//                   fullWidth
//                 />
//               </Box>
//             ))}
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={onClose}>ביטול</Button>
//           <Button type="submit" variant="contained" disabled={creating || updating || schedSaving}>
//             שמירה
//           </Button>
//         </DialogActions>
//       </form>
//     </Dialog>
//   );
// }
