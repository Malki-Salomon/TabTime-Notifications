// import { useEffect } from "react";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { Provider } from "react-redux";
// import { CacheProvider } from "@emotion/react";
// import { ThemeProvider, CssBaseline } from "@mui/material";
// import { store } from "./app/store";
// import { rtlCache } from "./app/rtlCache";
// import { theme } from "./app/theme";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Dashboard from "./pages/Dashboard";
// import ProtectedRoute from "./components/ProtectedRoute";
// import "./styles/globals.scss";

// function ServiceWorkerBootstrap() {
//   useEffect(() => {
//     if ("serviceWorker" in navigator) {
//       navigator.serviceWorker.register("/sw.js").catch(() => {});
//     }
//   }, []);
//   return null;
// }

// export default function App() {
//   return (
//     <Provider store={store}>
//       <CacheProvider value={rtlCache}>
//         <ThemeProvider theme={theme}>
//           <CssBaseline />
//           <ServiceWorkerBootstrap />
//           <BrowserRouter>
//             <Routes>
//               <Route path="/login" element={<Login />} />
//               <Route path="/register" element={<Register />} />
//               <Route
//                 path="/"
//                 element={
//                   <ProtectedRoute>
//                     <Dashboard />
//                   </ProtectedRoute>
//                 }
//               />
//               <Route path="*" element={<Navigate to="/" replace />} />
//             </Routes>
//           </BrowserRouter>
//         </ThemeProvider>
//       </CacheProvider>
//     </Provider>
//   );
// }

import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { store } from "./app/store";
import { rtlCache } from "./app/rtlCache";
import { theme } from "./app/theme";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import "./styles/globals.scss";

function ServiceWorkerBootstrap() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const registerSW = () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      };
      if (document.readyState === "complete") registerSW();
      else {
        window.addEventListener("load", registerSW);
        return () => window.removeEventListener("load", registerSW);
      }
    }
  }, []);
  return null;
}

export default function App() {
  return (
    <Provider store={store}>
      <CacheProvider value={rtlCache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ServiceWorkerBootstrap />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/about" element={<About />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </CacheProvider>
    </Provider>
  );
}