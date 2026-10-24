// import { useForm } from "react-hook-form";
// import { TextField, Button, Typography, Box, Alert, Link as MLink } from "@mui/material";
// import { Link, useNavigate } from "react-router-dom";
// import { useRegisterMutation } from "../features/apiSlice";
// import { useState } from "react";

// const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// const PWD_RE = /^(?=(.*[a-zA-Z]){4,})(?=(.*[0-9]){4,})(?=.*[!@#$%^&*(),.?":{}|<>]).*$/;

// export default function Register() {
//   const { register, handleSubmit, formState: { errors } } = useForm();
//   const [doRegister, { isLoading }] = useRegisterMutation();
//   const navigate = useNavigate();
//   const [serverError, setServerError] = useState("");

//   const onSubmit = async (values) => {
//     setServerError("");
//     try {
//       await doRegister({
//         name: values.name,
//         email: values.email,
//         password: values.password,
//         pushEndpoint: null,
//         pushP256dh: null,
//         pushAuth: null,
//       }).unwrap();
//       navigate("/login", { replace: true });
//     } catch (e) {
//       setServerError(e?.data || e?.error || "ההרשמה נכשלה. נסה שוב.");
//     }
//   };

//   return (
//     <div className="auth-page">
//       <Box className="auth-card">
//         <Typography variant="h5" align="center" gutterBottom color="primary.dark">
//           הרשמה
//         </Typography>
//         <Typography align="center" color="text.secondary" sx={{ mb: 2 }}>
//           צרו חשבון כדי לנהל תזכורות תרופות
//         </Typography>
//         {serverError && <Alert severity="error" sx={{ mb: 2 }}>{String(serverError)}</Alert>}
//         <form onSubmit={handleSubmit(onSubmit)}>
//           <TextField
//             label="שם מלא"
//             {...register("name", {
//               required: "שם הוא שדה חובה",
//               minLength: { value: 2, message: "שם חייב להכיל לפחות 2 תווים" },
//               maxLength: { value: 50, message: "שם חייב להיות עד 50 תווים" },
//             })}
//             error={!!errors.name}
//             helperText={errors.name?.message}
//           />
//           <TextField
//             label="אימייל"
//             type="email"
//             {...register("email", {
//               required: "אימייל הוא שדה חובה",
//               pattern: { value: EMAIL_RE, message: "כתובת אימייל לא תקינה" },
//             })}
//             error={!!errors.email}
//             helperText={errors.email?.message}
//           />
//           <TextField
//             label="סיסמה"
//             type="password"
//             {...register("password", {
//               required: "סיסמה היא שדה חובה",
//               pattern: { value: PWD_RE, message: "הסיסמה חייבת להכיל לפחות 4 אותיות, 4 ספרות ותו מיוחד אחד" },
//             })}
//             error={!!errors.password}
//             helperText={errors.password?.message}
//           />
//           <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 2 }} disabled={isLoading}>
//             {isLoading ? "נרשם..." : "צור חשבון"}
//           </Button>
//         </form>
//         <Typography align="center" sx={{ mt: 2 }}>
//           יש לך חשבון? <MLink component={Link} to="/login">התחבר</MLink>
//         </Typography>
//       </Box>
//     </div>
//   );
// }


import { useForm } from "react-hook-form";
import { 
  TextField, Button, Typography, Box, Alert, 
  Link as MLink, Dialog, DialogTitle, DialogContent, DialogActions 
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../features/apiSlice";
import { useState } from "react";
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PWD_RE = /^(?=(.*[a-zA-Z]){4,})(?=(.*[0-9]){4,})(?=.*[!@#$%^&*(),.?":{}|<>]).*$/;

// מפתח ה-VAPID הציבורי שלך מהשרת (מתוך application.properties)
//const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
const VAPID_PUBLIC_KEY = "BMGUEB9dZapPslKUHiwMBw3Uf_XptX3dJum_x1GLQ_onJNGaSEmRH236uipucrtR_7vnC09RxBs9bKriFosUEU4";

export default function Register() {
  const { register, handleSubmit, formState: { errors }, getValues } = useForm();
  const [doRegister, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();
  
  const [serverError, setServerError] = useState("");
  const [isRequestingNotification, setIsRequestingNotification] = useState(false);
  
  // State לניהול פתיחה וסגירה של חלונית ההסבר המקדימה
  const [openExplanationDialog, setOpenExplanationDialog] = useState(false);

  // פונקציה שממירה את מפתח ה-VAPID לפורמט שהדפדפן דורש
 function urlBase64ToUint8Array(base64String) {
  // תיקון קריטי עבור Firefox: טיפול בתווים המיוחדים של URL-Safe Base64
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

 // פונקציה לחילוץ מפתחות ה-Push מהדפדפן לאחר אישור המשתמש
const getPushSubscription = async () => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("הדפדפן שלך אינו תומך בהתראות Push.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("חובה לאשר התראות דפדפן כדי להשלים את ההרשמה למערכת זו.");
  }

  const registration = await navigator.serviceWorker.ready;
  const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedVapidKey
  });

  const pushEndpoint = subscription.endpoint;

  // תיקון קריטי: הפיכת ה-Base64 ל-URL-Safe והסרת ה-Padding (=)
  const pushP256dh = btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh'))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const pushAuth = btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return { pushEndpoint, pushP256dh, pushAuth };
};
  // const getPushSubscription = async () => {
  //   if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
  //     throw new Error("הדפדפן שלך אינו תומך בהתראות Push.");
  //   }

  //   // הפעלת בקשת הרשות הרשמית של הדפדפן (כעת המשתמש מוכן לה)
  //   const permission = await Notification.requestPermission();
  //   if (permission !== "granted") {
  //     throw new Error("חובה לאשר התראות דפדפן כדי להשלים את ההרשמה למערכת זו.");
  //   }

  //   const registration = await navigator.serviceWorker.ready;
  //   const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

  //   const subscription = await registration.pushManager.subscribe({
  //     userVisibleOnly: true,
  //     applicationServerKey: convertedVapidKey
  //   });

  //   const pushEndpoint = subscription.endpoint;
  //   const pushP256dh = btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh'))));
  //   const pushAuth = btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))));

  //   return { pushEndpoint, pushP256dh, pushAuth };
  // };
// const getPushSubscription = async () => {
//   console.log("1. נכנס לפונקציית ה-Push");
  
//   if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
//     throw new Error("הדפדפן שלך אינו תומך בהתראות Push.");
//   }

//   const permission = await Notification.requestPermission();
//   console.log("2. סטטוס הרשאה מהמשתמש:", permission);
//   if (permission !== "granted") {
//     throw new Error("חובה לאשר התראות דפדפן כדי להשלים את ההרשמה.");
//   }

//   console.log("3. מנסה לגשת ל-Service Worker Ready...");
//   const registration = await navigator.serviceWorker.ready;
//   console.log("4. ה-Service Worker מוכן!", registration);

//   const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
//   console.log("5. מפתח VAPID הומר בהצלחה!");

//   console.log("6. מנסה לבצע subscribe ב-PushManager (עם הגבלת זמן)...");
  
//   try {
//     // מנגנון תחרות: אם הרישום האמיתי לוקח יותר מ-2 שניות, נחתוך ל-Mock
//     const subscription = await Promise.race([
//       registration.pushManager.subscribe({
//         userVisibleOnly: true,
//         applicationServerKey: convertedVapidKey.buffer
//       }),
//       new Promise((_, reject) => 
//         setTimeout(() => reject(new Error("Timeout: הדפדפן חסום ארגונית")), 2000)
//       )
//     ]);
    
//     console.log("7. ה-Subscription נוצר בהצלחה אמיתית!", subscription);

//     const pushEndpoint = subscription.endpoint;
//     const pushP256dh = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh'))))
//       .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
//     const pushAuth = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))))
//       .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

//     return { pushEndpoint, pushP256dh, pushAuth };

//   } catch (error) {
//     console.warn("⚠️ הדפדפן תקוע או חסום ארגונית. מעביר לנתוני Mock כדי להשלים הרשמה בשרת!");
    
//     // נתוני דמה תקינים במבנה עבור שרת ה-Java שלכם
//     const mockEndpoint = `https://fcm.googleapis.com/fcm/send/mock-token-${Math.random().toString(36).substring(7)}`;
//     const mockP256dh = "BMTuA_CYg660S4S7B6v-9V38_Z_wV5Y6A7C_b-W1gR_2O3W7U48E_SAMPLE_KEY";
//     const mockAuth = "xF92b_SAMPLE_AUTH_KEY==";

//     console.log("7 [MOCK]. נתוני דמה מוכנים לשליחה!");
    
//     return { 
//       pushEndpoint: mockEndpoint, 
//       pushP256dh: mockP256dh, 
//       pushAuth: mockAuth 
//     };
//   }
// };

  // שלב 1: כשהמשתמש לוחץ על כפתור הטופס (הוולידציה של ה-React עברה)
  const handlePreSubmit = () => {
    setServerError("");
    // פותח את המודאל המעוצב שלנו להסבר על ההתראות
    setOpenExplanationDialog(true);
  };

  // שלב 2: כשהמשתמש מאשר במודאל המעוצב שלנו ורוצה להמשיך
  const handleConfirmRegistration = async () => {
    setOpenExplanationDialog(false); // סגירת המודאל הפנימי
    setIsRequestingNotification(true);

    // קריאת הערכים הנוכחיים מהטופס
    const values = getValues(); 
    
    try {
      // הפעלת חלונית הדפדפן לקבלת המפתחות
      const pushData = await getPushSubscription();

      // שליחה סופית לשרת
      await doRegister({
        name: values.name,
        email: values.email,
        password: values.password,
        pushEndpoint: pushData.pushEndpoint,
        pushP256dh: pushData.pushP256dh,
        pushAuth: pushData.pushAuth,
      }).unwrap();

      navigate("/login", { replace: true });
    } catch (e) {
      setServerError(e?.message || e?.data?.message || e?.data || e?.error || "ההרשמה נכשלה. נסה שוב.");
    } finally {
      setIsRequestingNotification(false);
    }
  };

  return (
    <div className="auth-page" style={{ direction: 'rtl' }}>
      <Box className="auth-card">
        <Typography variant="h5" align="center" gutterBottom color="primary.dark">
          הרשמה
        </Typography>
        <Typography align="center" color="text.secondary" sx={{ mb: 3 }}>
          צרו חשבון כדי לנהל תזכורות תרופות
        </Typography>

        {serverError && <Alert severity="error" sx={{ mb: 2 }}>{String(serverError)}</Alert>}
        
        {/* הגשת הטופס קודם כל בודקת וולידציה (שם, סיסמה וכו') ורק אז פותחת את הדיאלוג */}
        <form onSubmit={handleSubmit(handlePreSubmit)}>
          <TextField
            label="שם מלא"
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
            label="אימייל"
            type="email"
            fullWidth
            margin="normal"
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
            fullWidth
            margin="normal"
            {...register("password", {
              required: "סיסמה היא שדה חובה",
              pattern: { value: PWD_RE, message: "הסיסמה חייבת להכיל לפחות 4 אותיות, 4 ספרות ותו מיוחד אחד" },
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            size="large" 
            sx={{ mt: 3 }} 
            disabled={isLoading || isRequestingNotification}
          >
            {isLoading || isRequestingNotification ? "מבצע רישום..." : "צור חשבון"}
          </Button>
        </form>
        
        <Typography align="center" sx={{ mt: 2 }}>
          יש לך חשבון? <MLink component={Link} to="/login">התחבר</MLink>
        </Typography>
      </Box>

      {/* ========================================================= */}
      {/* חלונית ההכנה המעוצבת של האתר (הפתרון המקובל בתעשייה) */}
      {/* ========================================================= */}
      <Dialog 
        open={openExplanationDialog} 
        onClose={() => setOpenExplanationDialog(false)}
      slotProps={{
    paper: {
      sx: { p: 1, borderRadius: 3, maxWidth: 450 }
    }
  }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <NotificationsActiveIcon color="primary" sx={{ fontSize: 45 }} />
          אישור קבלת התראות תרופה
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
            כדי שהמערכת תוכל להזכיר לך לקחת את התרופות בזמן, האתר זקוק לאישור לשלוח לך התראות דחיפה (Push Notifications).
          </Typography>
          
          {/* הודעת ההסבר הספציפית שלך */}
          <Alert severity="warning" variant="outlined" sx={{ textAlign: 'right', borderRadius: 2 }}>
            <strong>שים לב:</strong> ההתראות ישלחו למכשיר ממנו נרשמת. לצורך שינוי יש לעדכן פרטים במכשיר החדש.
          </Alert>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            בלחיצה על הכפתור למטה, דפדפן האינטרנט שלך יבקש ממך אישור סופי. אנא לחץ על <strong>Allow (אפשר)</strong>.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', gap: 2, px: 3, pb: 2 }}>
          <Button 
            variant="outlined" 
            onClick={() => setOpenExplanationDialog(false)}
            color="inherit"
          >
            ביטול
          </Button>
          <Button 
            variant="contained" 
            onClick={handleConfirmRegistration}
            autoFocus
          >
            אני מסכים, המשך ברישום
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}