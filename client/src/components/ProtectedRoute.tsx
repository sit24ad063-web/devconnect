import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();

  if (!initialized) {
    return <div className="py-24 text-center text-gray-500">Loading...</div>;
  }
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
