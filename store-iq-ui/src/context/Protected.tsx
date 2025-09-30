import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // Wait until auth check finishes

  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
