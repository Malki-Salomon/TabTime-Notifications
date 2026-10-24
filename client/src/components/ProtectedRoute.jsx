import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectToken } from "../features/auth/authSlice";

export default function ProtectedRoute({ children }) {
  const token = useSelector(selectToken);
  const location = useLocation();
  if (!token) return <Navigate to="/" state={{ from: location }} replace />;
  return children;
}
