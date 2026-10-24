import { useForm } from "react-hook-form";
import { TextField, Button, Typography, Box, Alert, Link as MLink } from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLoginMutation, useLazyGetUserByEmailQuery } from "../features/apiSlice";
import { useDispatch } from "react-redux";
import { setCredentials, setUser } from "../features/auth/authSlice";
import { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PWD_RE = /^(?=(.*[a-zA-Z]){4,})(?=(.*[0-9]){4,})(?=.*[!@#$%^&*(),.?":{}|<>]).*$/;

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [login, { isLoading }] = useLoginMutation();
  const [fetchUser] = useLazyGetUserByEmailQuery();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState("");

  const onSubmit = async ({ email, password }) => {
    setServerError("");
    try {
      const token = await login({ email, password }).unwrap(); // raw JWT string
      dispatch(setCredentials({ token, email }));
      const user = await fetchUser(email).unwrap();
      dispatch(setUser(user));
      const to = location.state?.from?.pathname || "/dashboard";
      navigate(to, { replace: true });
    } catch (e) {
      setServerError(e?.data || e?.error || "התחברות נכשלה. בדוק את הפרטים ונסה שוב.");
    }
  };

  return (
    <div className="auth-page">
      <Box className="auth-card">
        <Typography variant="h5" align="center" gutterBottom color="primary.dark">
          התחברות
        </Typography>
        <Typography align="center" color="text.secondary" sx={{ mb: 2 }}>
          ברוכים השבים לתזכורת התרופות
        </Typography>
        {serverError && <Alert severity="error" sx={{ mb: 2 }}>{String(serverError)}</Alert>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label="אימייל"
            type="email"
            {...register("email", {
              required: "אימייל הוא שדה חובה",
              pattern: { value: EMAIL_RE, message: "כתובת אימייל לא תקינה" },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            label="סיסמה"
            type="password"
            {...register("password", {
              required: "סיסמה היא שדה חובה",
              pattern: { value: PWD_RE, message: "הסיסמה חייבת להכיל לפחות 4 אותיות, 4 ספרות ותו מיוחד אחד" },
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 2 }} disabled={isLoading}>
            {isLoading ? "מתחבר..." : "התחבר"}
          </Button>
        </form>
        <Typography align="center" sx={{ mt: 2 }}>
          אין לך חשבון? <MLink component={Link} to="/register">הירשם כעת</MLink>
        </Typography>
      </Box>
    </div>
  );
}
