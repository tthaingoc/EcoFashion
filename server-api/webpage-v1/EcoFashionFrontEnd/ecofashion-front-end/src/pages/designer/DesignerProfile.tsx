// Utility function to fallback image URL safely
function safeImageUrl(
  url?: string,
  fallback: string = "/assets/default-image.jpg"
): string {
  return typeof url === "string" && url.trim() ? url : fallback;
}
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Paper,
  Divider,
  CircularProgress,
  TextField,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useAuth } from "../../services/user/AuthContext";
import { useDesignerProfile } from "../../hooks/useDesignerProfile";
import type { DesignerProfile as DesignerProfileType } from "../../services/api";
import {
  Edit,
  Save,
  Cancel,
  Phone,
  Email,
  LocationOn,
  Language,
  Business,
  Badge,
  Image,
  Verified,
} from "@mui/icons-material";
import Grid from "@mui/material/Grid";
import logo from "../../assets/pictures/homepage/logo.png";

export default function DesignerProfile() {
  const { user, refreshUserFromServer } = useAuth();
  const { profile, loading, saving, error, updateProfile, refreshProfile } =
    useDesignerProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<DesignerProfileType>>({});

  // Update formData when profile changes
  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleInputChange = (
    field: keyof DesignerProfileType,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setIsEditing(false);
  };

  const handleRefreshAll = async () => {
    try {
      console.log("Refreshing user info from server...");
      await refreshUserFromServer();
      console.log("Refreshing designer profile...");
      await refreshProfile();
    } catch (error) {
      console.error("Error refreshing:", error);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Đang tải thông tin profile...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!profile && !loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error || "Không tìm thấy thông tin Designer Profile"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.role?.toLowerCase() !== "designer"
              ? `Bạn cần có quyền Designer để xem trang này. Role hiện tại: ${user?.role}`
              : "Vui lòng liên hệ admin để tạo profile Designer"}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleRefreshAll}
              sx={{ mr: 2 }}
            >
              🔄 Refresh thông tin
            </Button>
            <Button
              variant="outlined"
              onClick={() => (window.location.href = "/my-applications")}
            >
              📋 Xem đơn đăng ký
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h4" component="h1" fontWeight="bold">
            Hồ Sơ Designer Của Tôi
          </Typography>
          {!isEditing ? (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => setIsEditing(true)}
              sx={{ bgcolor: "#4caf50", "&:hover": { bgcolor: "#388e3c" } }}
            >
              Chỉnh sửa
            </Button>
          ) : (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={16} /> : <Save />}
                onClick={handleSave}
                disabled={saving}
                sx={{ bgcolor: "#4caf50", "&:hover": { bgcolor: "#388e3c" } }}
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancel}
                disabled={saving}
              >
                Hủy
              </Button>
            </Box>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            label={`Trạng thái: ${profile.status || "Chưa xác định"}`}
            color={profile.status === "Active" ? "success" : "default"}
            variant="outlined"
            icon={<Verified />}
          />
          <Chip label="Designer" color="primary" variant="outlined" />
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column - Main Info */}
        <Grid>
          {/* Basic Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <Badge sx={{ mr: 1, color: "#4caf50" }} />
                Thông tin cơ bản
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Avatar
                  sx={{ width: 80, height: 80, mr: 3, bgcolor: "#4caf50" }}
                  src={safeImageUrl(profile.avatarUrl, logo)}
                  imgProps={{
                    onError: (e: any) => {
                      if (
                        e.currentTarget.src !==
                        window.location.origin + "/assets/default-avatar.png"
                      ) {
                        e.currentTarget.src = "/assets/default-avatar.png";
                      }
                    },
                  }}
                >
                  {!profile.avatarUrl ? profile.designerName?.charAt(0) : null}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {profile.designerName || user?.fullName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Designer ID: {profile.designerId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Email: {profile.email || user?.email}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      label="Tên Designer"
                      value={formData.designerName || ""}
                      onChange={(e) =>
                        handleInputChange("designerName", e.target.value)
                      }
                    />
                  ) : (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Tên Designer
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {profile.designerName || "Chưa cập nhật"}
                      </Typography>
                    </Box>
                  )}
                </Grid>

                <Grid>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      value={formData.phoneNumber || ""}
                      onChange={(e) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                    />
                  ) : (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Số điện thoại
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {profile.phoneNumber || "Chưa cập nhật"}
                      </Typography>
                    </Box>
                  )}
                </Grid>

                <Grid>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Địa chỉ"
                      value={formData.address || ""}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                    />
                  ) : (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Địa chỉ
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {profile.address || "Chưa cập nhật"}
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Portfolio & Business */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <Language sx={{ mr: 1, color: "#4caf50" }} />
                Portfolio & Kinh doanh
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      label="Portfolio URL"
                      value={formData.portfolioUrl || ""}
                      onChange={(e) =>
                        handleInputChange("portfolioUrl", e.target.value)
                      }
                    />
                  ) : (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Portfolio URL
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {profile.portfolioUrl ? (
                          <a
                            href={profile.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#4caf50" }}
                          >
                            {profile.portfolioUrl}
                          </a>
                        ) : (
                          "Chưa cập nhật"
                        )}
                      </Typography>
                    </Box>
                  )}
                </Grid>

                <Grid>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      label="Mã số thuế"
                      value={formData.taxNumber || ""}
                      onChange={(e) =>
                        handleInputChange("taxNumber", e.target.value)
                      }
                    />
                  ) : (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Mã số thuế
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {profile.taxNumber || "Chưa cập nhật"}
                      </Typography>
                    </Box>
                  )}
                </Grid>

                <Grid>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      label="Chuyên môn URL"
                      value={formData.specializationUrl || ""}
                      onChange={(e) =>
                        handleInputChange("specializationUrl", e.target.value)
                      }
                    />
                  ) : (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Chuyên môn URL
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {profile.specializationUrl ? (
                          <a
                            href={profile.specializationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#4caf50" }}
                          >
                            Xem chuyên môn
                          </a>
                        ) : (
                          "Chưa cập nhật"
                        )}
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - CCCD & Identity */}
        <Grid>
          {/* Identity Verification */}
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <Image sx={{ mr: 1, color: "#4caf50" }} />
                Xác minh danh tính
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Số CMND/CCCD
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.identificationNumber || ""}
                    onChange={(e) =>
                      handleInputChange("identificationNumber", e.target.value)
                    }
                  />
                ) : (
                  <Typography variant="body1" fontWeight="medium">
                    {profile.identificationNumber || "Chưa cập nhật"}
                  </Typography>
                )}
              </Box>

              {/* CCCD Front Image */}
              <Paper sx={{ p: 2, mb: 3, textAlign: "center" }}>
                <Typography variant="subtitle2" gutterBottom>
                  Ảnh CMND/CCCD (Mặt trước)
                </Typography>
                {profile.identificationPictureFront ? (
                  <Box>
                    <img
                      src={safeImageUrl(
                        profile.identificationPictureFront,
                        "/assets/default-cccd-front.jpg"
                      )}
                      alt="CMND/CCCD mặt trước"
                      style={{
                        maxWidth: "100%",
                        height: "120px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                      onError={(e) => {
                        if (
                          e.currentTarget.src !==
                          window.location.origin +
                            "/assets/default-cccd-front.jpg"
                        ) {
                          e.currentTarget.src =
                            "/assets/default-cccd-front.jpg";
                        }
                      }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ py: 3, color: "text.secondary" }}>
                    <Image sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body2">Chưa tải lên</Typography>
                  </Box>
                )}
                {isEditing && (
                  <TextField
                    fullWidth
                    size="small"
                    label="URL ảnh CMND/CCCD (Mặt trước)"
                    value={formData.identificationPictureFront || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "identificationPictureFront",
                        e.target.value
                      )
                    }
                    sx={{ mt: 1 }}
                  />
                )}
              </Paper>

              {/* CCCD Back Image */}
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="subtitle2" gutterBottom>
                  Ảnh CMND/CCCD (Mặt sau)
                </Typography>
                {profile.identificationPictureBack ? (
                  <Box>
                    <img
                      src={safeImageUrl(
                        profile.identificationPictureBack,
                        "/assets/default-cccd-back.jpg"
                      )}
                      alt="Ảnh CMND/CCCD mặt sau"
                      style={{
                        maxWidth: "100%",
                        height: "120px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                      onError={(e) => {
                        if (
                          e.currentTarget.src !==
                          window.location.origin +
                            "/assets/default-cccd-back.jpg"
                        ) {
                          e.currentTarget.src = "/assets/default-cccd-back.jpg";
                        }
                      }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ py: 3, color: "text.secondary" }}>
                    <Image sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body2">Chưa tải lên</Typography>
                  </Box>
                )}
                {isEditing && (
                  <TextField
                    fullWidth
                    size="small"
                    label="URL ảnh CMND/CCCD (Mặt sau)"
                    value={formData.identificationPictureBack || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "identificationPictureBack",
                        e.target.value
                      )
                    }
                    sx={{ mt: 1 }}
                  />
                )}
              </Paper>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Lịch sử hoạt động
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Ngày tạo:</strong>{" "}
                  {new Date(profile.createdAt).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Typography>
                {profile.updatedAt && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Cập nhật lần cuối:</strong>{" "}
                    {new Date(profile.updatedAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  <strong>Trạng thái:</strong>{" "}
                  {profile.status || "Chưa xác định"}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
