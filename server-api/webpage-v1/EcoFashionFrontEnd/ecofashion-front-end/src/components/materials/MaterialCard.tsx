import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Box,
  Rating,
  IconButton,
  Button,
  SwipeableDrawer,
  styled,
  Drawer,
} from "@mui/material";
import "./MaterialCard.css";
import {
  FavoriteBorderOutlined,
  LocalShipping,
  Recycling,
  Star,
} from "@mui/icons-material";
import { grey } from "@mui/material/colors";
import type { MaterialDetailDto } from "../../schemas/materialSchema";
import SustainabilityToolbar from "./SustainabilityToolbar";
import SustainabilityCompact from "./SustainabilityCompact";
import { getSustainabilityColor, getMaterialTypeColor } from "../../utils/themeColors";


interface MaterialCardProps {
  material: MaterialDetailDto;
  type?: string;
  onSelect?: (material: MaterialDetailDto) => void;
}

const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  type,
  onSelect,
}) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const getTypeColor = (typeName?: string) => {
    if (!typeName) return "#9e9e9e";
    return getMaterialTypeColor(typeName);
  };

  const getAvailabilityColor = (quantity: number) => {
    if (quantity === 0) return "error" as const;
    if (quantity <= 10) return "warning" as const;
    return "success" as const;
  };

  const getAvailabilityText = (quantity: number) => {
    if (quantity === 0) return "Hết hàng";
    if (quantity <= 10) return "Số lượng có hạn";
    return "Còn hàng";
  };

  const getQuantityDisplay = (quantity: number) => {
    if (quantity === 0) return "Hết hàng";
    return `${quantity.toLocaleString('vi-VN')} mét`;
  };

  const getSustainabilityScore = (recycledPercentage: number) => {
    // Ưu tiên sử dụng sustainability score từ backend
    if (material.sustainabilityScore !== undefined && material.sustainabilityScore !== null) {
      return material.sustainabilityScore;
    }
    
    // Fallback: tính toán local như cũ
    let score = recycledPercentage;
    if (recycledPercentage >= 80) score += 20;
    else if (recycledPercentage >= 50) score += 10;
    return Math.min(score, 100);
  };

  const sustainabilityScore = getSustainabilityScore(material.recycledPercentage);
  
  // Lấy sustainability level và color từ backend
  const sustainabilityLevel = material.sustainabilityLevel || 
    (sustainabilityScore >= 80 ? "Xuất sắc" : 
     sustainabilityScore >= 60 ? "Tốt" : 
     sustainabilityScore >= 40 ? "Trung bình" : "Cần cải thiện");
  
  const sustainabilityColor = material.sustainabilityColor || getSustainabilityColor(sustainabilityScore);
  const mainImage = material.imageUrls && material.imageUrls.length > 0 ? material.imageUrls[0] : "/assets/default-material.jpg";

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(material);
    } else {
      setDrawerOpen(true);
    }
  };

  return (
    <>
      <Card
        sx={{
          width: "95%",
          height: "95%",
          position: type === "special" ? "absolute" : "relative",
          overflow: "hidden",
          zIndex: 1,
          "&:hover": {
            transform: "translateY(-4px)",
            transition: "all 0.3s ease",
            boxShadow: 3,
          },
          "&:hover .hover-trigger:hover + .card-hover-content": {
            opacity: 1,
            transform: "translateY(0)",
          },
          borderRadius: "10px",
        }}
      >
        <Box
          sx={{
            top: 8,
            left: 8,
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Material Tag */}
          <Box
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              justifyContent: "space-between",
            }}
          >
            <Chip
              icon={<Recycling />}
              label={`${material.recycledPercentage.toFixed(1)}% Tái Chế`}
              size="small"
              sx={{
                backgroundColor: "rgba(200, 248, 217, 1)",
                color: "rgba(22, 103, 86, 1)",
                fontSize: "15px",
                paddingTop: 2,
                paddingBottom: 2,
              }}
            />
          </Box>
          {/* Favorite */}
          <IconButton
            className="favorite-button"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 1,
              backgroundColor: "white",
            }}
            onClick={handleToggleFavorite}
          >
            <FavoriteBorderOutlined 
              sx={{
                color: isFavorite ? "#f44336" : grey[600],
              }}
            />
          </IconButton>
        </Box>
        {/* Material Image */}
        <CardMedia
          component="img"
          image={mainImage}
          alt={material.name || "Material"}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            cursor: "pointer",
          }}
          onClick={handleCardClick}
        />

        <Box
          className="hover-trigger"
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: "70%",
            width: "100%",
            zIndex: 2,
            marginTop: "auto",
            cursor: "pointer",
          }}
          onClick={handleCardClick}
        />

        {/* Content */}
        <CardContent
          className="card-hover-content"
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "auto",
            background: "rgba(255, 255, 255, 1)",
            opacity: 0,
            transition: "opacity 0.3s ease, transform 0.3s ease",
            zIndex: 2,
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 2,
            backgroundImage: `
          linear-gradient(0deg,
            transparent 24%,
            #e1e1e1 26%,
            #e1e1e1 26%,
            transparent 27%,
            transparent 74%,
            #e1e1e1 75%,
            #e1e1e1 76%,
            transparent 77%,
            transparent
          ),
          linear-gradient(90deg,
            transparent 24%,
            #e1e1e1 25%,
            #e1e1e1 26%,
            transparent 27%,
            transparent 74%,
            #e1e1e1 75%,
            #e1e1e1 76%,
            transparent 77%,
            transparent
          )
        `,
            backgroundSize: "55px 55px",
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              width: "90%",
              height: "90%",
              margin: "auto",
              textAlign: "left",
            }}
          >
            <Box
              onClick={handleCardClick}
              sx={{ cursor: "pointer" }}
            >
              {/* Type and Supplier */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Chip
                  label={material.materialTypeName || "Unknown"}
                  size="small"
                  sx={{
                    bgcolor: getTypeColor(material.materialTypeName),
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    paddingTop: 2,
                    paddingBottom: 2,
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {material.supplier?.supplierName || "Unknown Supplier"}
                </Typography>
              </Box>
              {/* Material Name */}
              <Typography
                fontWeight="bold"
                sx={{
                  fontSize: "25px",
                  width: "100%",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color: "black",
                }}
              >
                {material.name || "Unnamed Material"}
              </Typography>
              {/* Rating */}
              {material.supplier?.rating && (
                <Box display="flex" alignItems="center">
                  <Rating
                    value={material.supplier.rating}
                    readOnly
                    size="small"
                  />
                  <Typography variant="body2" ml={1}>
                    ({material.supplier.reviewCount || 0})
                  </Typography>
                </Box>
              )}
              {/* Price */}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: "#4caf50",
                  fontSize: "1.5rem",
                  mb: 1,
                }}
              >
                {(material.pricePerUnit * 1000)?.toLocaleString('vi-VN')} ₫/mét
              </Typography>
              {/* Sustainability Score - Sử dụng component compact cho card */}
              <Box sx={{ mb: 1 }}>
                <SustainabilityCompact 
                  sustainabilityScore={sustainabilityScore}
                  recycledPercentage={material.recycledPercentage}
                  sustainabilityLevel={material.sustainabilityLevel}
                  sustainabilityColor={material.sustainabilityColor}
                />
              </Box>
              {/* Availability */}
              <Box sx={{ margin: "10px 0" }}>
                <Chip
                  label={getAvailabilityText(material.quantityAvailable)}
                  size="small"
                  color={getAvailabilityColor(material.quantityAvailable)}
                  icon={<LocalShipping sx={{ fontSize: 16 }} />}
                />
              </Box>
              {/* Sustainability highlights */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
                {material.sustainabilityCriteria && material.sustainabilityCriteria.length > 0 && (
                  <Chip
                    size="small"
                    label={`${material.sustainabilityCriteria.length} Criteria`}
                    variant="outlined"
                    sx={{ fontSize: "0.6rem", height: "20px" }}
                  />
                )}
                {material.benchmarks && material.benchmarks.length > 0 && (
                  <Chip
                    size="small"
                    label={`${material.benchmarks.length} Benchmarks`}
                    variant="outlined"
                    sx={{ fontSize: "0.6rem", height: "20px" }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Detail Drawer */}
      <SwipeableDrawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: 400 },
            p: 3,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
            {material.name || "Material Details"}
          </Typography>
          
          <CardMedia
            component="img"
            height="200"
            image={mainImage}
            alt={material.name || "Material"}
            sx={{ objectFit: "cover", borderRadius: 1, mb: 2 }}
          />

          <Typography variant="body1" sx={{ mb: 2 }}>
            {material.description || "No description available"}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Supplier Information
            </Typography>
            <Typography variant="body2">
              <strong>Name:</strong> {material.supplier?.supplierName || "Unknown"}
            </Typography>
            {material.supplier?.bio && (
              <Typography variant="body2">
                <strong>Bio:</strong> {material.supplier.bio}
              </Typography>
            )}
            {material.supplier?.rating && (
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <Rating value={material.supplier.rating} readOnly size="small" />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ({material.supplier.reviewCount || 0} reviews)
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Sustainability Details
            </Typography>
            <Typography variant="body2">
              <strong>Recycled Content:</strong> {material.recycledPercentage.toFixed(1)}%
            </Typography>
            <Typography variant="body2">
              <strong>Sustainability Score:</strong> {sustainabilityScore.toFixed(0)}%
            </Typography>
            {material.sustainabilityCriteria && material.sustainabilityCriteria.length > 0 && (
              <Typography variant="body2">
                <strong>Criteria Met:</strong> {material.sustainabilityCriteria.length}
              </Typography>
            )}
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Pricing & Availability
            </Typography>
            <Typography variant="h5" color="#4caf50" fontWeight="bold">
              {(material.pricePerUnit * 1000)?.toLocaleString('vi-VN')} ₫/mét
            </Typography>
            <Typography variant="body2">
              <strong>Số lượng có sẵn:</strong> {getQuantityDisplay(material.quantityAvailable)}
            </Typography>
          </Box>

          <Button
            variant="contained"
            fullWidth
            sx={{
              bgcolor: "#4caf50",
              "&:hover": { bgcolor: "#45a049" },
            }}
            onClick={() => {
              console.log("Contact supplier for:", material.name);
            }}
          >
            Liên Hệ Nhà Cung Cấp
          </Button>
        </Box>
      </SwipeableDrawer>
    </>
  );
};

export default MaterialCard; 