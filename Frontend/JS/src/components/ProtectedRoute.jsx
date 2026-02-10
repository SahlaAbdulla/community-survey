import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const usertype = localStorage.getItem("usertype"); // 👈 set at login

  if (!usertype) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!allowedRoles.includes(usertype)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
