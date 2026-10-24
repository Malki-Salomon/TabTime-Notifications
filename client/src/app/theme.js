import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  direction: "rtl",
  palette: {
    mode: "light",
    primary: { main: "#10b981", dark: "#047857", light: "#6ee7b7", contrastText: "#fff" },
    secondary: { main: "#0891b2", dark: "#0e7490", light: "#67e8f9" },
    background: { default: "#f8fafc", paper: "#ffffff" },
    error: { main: "#ef4444" },
    success: { main: "#10b981" },
    warning: { main: "#f59e0b" },
    text: { primary: "#0f172a", secondary: "#64748b" },
    divider: "rgba(15,23,42,0.06)",
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: '"Inter","Assistant","Rubik","Heebo","Segoe UI",Tahoma,sans-serif',
    h1: { fontWeight: 800, letterSpacing: "-0.03em" },
    h2: { fontWeight: 800, letterSpacing: "-0.03em" },
    h3: { fontWeight: 800, letterSpacing: "-0.025em" },
    h4: { fontWeight: 800, letterSpacing: "-0.02em" },
    h5: { fontWeight: 700, letterSpacing: "-0.01em" },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    body1: { lineHeight: 1.65 },
    body2: { lineHeight: 1.6 },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: 0 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#f8fafc",
          backgroundImage:
            "radial-gradient(1200px 600px at 100% -10%, rgba(16,185,129,0.08), transparent 60%), radial-gradient(900px 500px at -10% 10%, rgba(8,145,178,0.06), transparent 60%)",
          backgroundAttachment: "fixed",
        },
        "::selection": { background: "rgba(16,185,129,0.25)" },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingInline: 22,
          paddingBlock: 11,
          fontWeight: 600,
          transition: "transform .25s ease, box-shadow .25s ease, background .25s ease, filter .25s ease",
          "&:hover": { transform: "translateY(-2px)" },
        },
        containedPrimary: {
          background: "linear-gradient(135deg,#10b981 0%,#059669 50%,#0d9488 100%)",
          boxShadow: "0 8px 20px -8px rgba(16,185,129,0.55)",
          "&:hover": {
            background: "linear-gradient(135deg,#059669 0%,#047857 50%,#0f766e 100%)",
            boxShadow: "0 14px 30px -10px rgba(16,185,129,0.6)",
          },
        },
        outlinedPrimary: {
          borderWidth: 1.5,
          "&:hover": { borderWidth: 1.5, background: "rgba(16,185,129,0.06)" },
        },
        sizeLarge: { paddingInline: 28, paddingBlock: 13, fontSize: 16 },
      },
    },
    MuiTextField: { defaultProps: { fullWidth: true, margin: "normal" } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          background: "#fff",
          transition: "box-shadow .2s ease, border-color .2s ease",
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(16,185,129,0.45)" },
          "&.Mui-focused": { boxShadow: "0 0 0 4px rgba(16,185,129,0.12)" },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          backgroundImage: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: "1px solid rgba(15,23,42,0.04)",
          boxShadow: "0 4px 20px -4px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.03)",
          transition: "transform .25s ease, box-shadow .25s ease",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: "0 18px 40px -12px rgba(15,23,42,0.12), 0 4px 10px rgba(15,23,42,0.04)",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: "saturate(180%) blur(14px)",
          WebkitBackdropFilter: "saturate(180%) blur(14px)",
          background: "rgba(255,255,255,0.72)",
          borderBottom: "1px solid rgba(15,23,42,0.06)",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
          boxShadow: "0 30px 80px -20px rgba(15,23,42,0.25)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 999, fontWeight: 600 },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { transition: "background .2s ease, transform .2s ease" },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { borderRadius: 8, fontSize: 12, background: "rgba(15,23,42,0.92)" },
      },
    },
  },
});
