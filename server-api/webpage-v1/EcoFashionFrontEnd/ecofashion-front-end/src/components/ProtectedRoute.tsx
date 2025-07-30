import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../services/user/AuthContext";
import { CircularProgress, Box, Typography } from "@mui/material";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // Optional: nếu không có thì cho phép tất cả user đã login
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user === null) {
      // Lưu current path để redirect về sau khi login
      const returnUrl = location.pathname + location.search;
      navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [user, loading, navigate, location]);

  // Hiển thị loading trong lúc check authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Nếu user null và không loading, về trang login
  if (user === null) {
    return null;
  }

  // Kiểm tra role nếu có allowedRoles
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role?.toLowerCase();
    const isAllowed = allowedRoles.some(
      (role) => role.toLowerCase() === userRole
    );

    if (!isAllowed) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
            textAlign: "center",
            p: 4,
          }}
        >
          <Typography variant="h5" sx={{ color: "#e53e3e", mb: 2 }}>
            Không có quyền truy cập
          </Typography>
          <Typography variant="body1" sx={{ color: "#718096" }}>
            Bạn không có quyền truy cập trang này. Role hiện tại: {user.role}
          </Typography>
        </Box>
      );
    }
  }

  return <>{children}</>;
}
