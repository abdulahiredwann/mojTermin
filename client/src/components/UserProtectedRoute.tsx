import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUserAuth } from "@/contexts/UserAuthContext";

export function UserProtectedRoute() {
  const { user, loading } = useUserAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-white text-sm text-gray-500">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
