import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControlLabel, Switch, Alert, Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectEmail, selectUser, setCredentials, setUser } from "../features/auth/authSlice";
import { useUpdateUserByEmailMutation } from "../features/apiSlice";
import { getPushTokens } from "../hooks/useNotification";

export default function ProfileDialog({ open, onClose }) {
  const user = useSelector(selectUser);
  const currentEmail = useSelector(selectEmail);
  const dispatch = useDispatch();
  const [updateUser, { isLoading }] = useUpdateUserByEmailMutation();
  const [updateDevice, setUpdateDevice] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: "", email: "" },
  });

  useEffect(() => {
    if (open && user) {
      reset({ name: user.name || "", email: user.email || currentEmail || "" });
      setUpdateDevice(false);
      setErrorMsg("");
    }
  }, [open, user, currentEmail, reset]);

  const onSubmit = async (values) => {
    setErrorMsg("");
    try {
      let pushFields = {
        pushEndpoint: user?.pushEndpoint ?? null,
        pushP256dh: user?.pushP256dh ?? null,
        pushAuth: user?.pushAuth ?? null,
      };

      if (updateDevice) {
        try {
          pushFields = await getPushTokens();
        } catch (e) {
          setErrorMsg(`לא ניתן לעדכן התראות במכשיר זה: ${e.message}`);
          return;
        }
      }

      const body = {
        ...user,
        name: values.name,
        email: values.email,
        ...pushFields,
      };

      const updated = await updateUser({ email: currentEmail, body }).unwrap().catch(() => body);
      const next = updated && typeof updated === "object" && updated.id ? updated : body;

      dispatch(setUser(next));
      if (values.email !== currentEmail) {
        dispatch(setCredentials({ email: values.email }));
      }
      onClose();
    } catch (e) {
      setErrorMsg(e?.data?.message || e?.message || "שגיאה בעדכון פרופיל");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" dir="rtl">
      <DialogTitle>עדכון פרופיל</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="שם"
              {...register("name", {
                required: "שם הוא שדה חובה",
                minLength: { value: 2, message: "לפחות 2 תווים" },
              })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              label="אימייל"
              type="email"
              {...register("email", {
                required: "אימייל הוא שדה חובה",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "אימייל לא תקין" },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <FormControlLabel
              control={<Switch checked={updateDevice} onChange={(e) => setUpdateDevice(e.target.checked)} />}
              label="עדכן מכשיר זה לקבלת התראות"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>ביטול</Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            שמירה
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
