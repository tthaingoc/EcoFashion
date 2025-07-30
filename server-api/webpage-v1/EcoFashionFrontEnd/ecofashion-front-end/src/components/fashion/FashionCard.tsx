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
import "./FashionCard.css";
import {
  AddToCart,
  DressIcon,
  EcoIcon,
  ShirtIcon,
  SkirtIcon,
  TrouserIcon,
} from "../../assets/icons/icon";
import type { Fashion } from "../../types/Fashion";
import {
  FavoriteBorderOutlined,
  Gradient,
  LocalShipping,
} from "@mui/icons-material";
import { grey } from "@mui/material/colors";
import type { Design } from "../../services/api/designService";
//example
import ao_linen from "../../assets/pictures/example/ao-linen.webp";
interface FashionCardProps {
  product: Design;
  type?: string;
  onSelect?: (product: Design) => void;
  onAddToCart?: (product: Design) => void;
  onToggleFavorite?: (product: Design) => void;
}

const FashionCard: React.FC<FashionCardProps> = ({
  product,
  type,
  // onSelect,
  // onAddToCart,
  // onToggleFavorite,
}) => {
  const navigate = useNavigate();
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      Áo: "#2196f3",
      Quần: "#ff9800",
      Đầm: "#4caf50",
      Váy: "#9c27b0",
    };

    return colors[category.normalize("NFC")] || "#9e9e9e"; // default grey
  };

  const getCategoryIcon = (category: string): string => {
    const colors: Record<string, any> = {
      Áo: <ShirtIcon />,
      Quần: <TrouserIcon />,
      Đầm: <DressIcon />,
      Váy: <SkirtIcon />,
    };

    return colors[category.normalize("NFC")] || "#9e9e9e"; // default grey
  };

  const getAvailabilityColor = (availability: Design["status"]) => {
    const colors = {
      "in stock": "success" as const,
      limited: "warning" as const,
      "pre-order": "info" as const,
      "out-of-stock": "error" as const,
    };
    return colors[availability];
  };

  const getAvailabilityText = (availability: Design["status"]) => {
    const texts = {
      "in stock": "Còn hàng",
      limited: "Số lượng có hạn",
      "pre-order": "Đặt trước",
      "out-of-stock": "Hết hàng",
    };
    return texts[availability];
  };

  // const getSustainabilityScore = (
  //   sustainability: Product["sustainability"]
  // ) => {
  //   let score = 0;

  //   // Carbon footprint score
  //   const carbonScores = {
  //     "very-low": 5,
  //     low: 4,
  //     medium: 3,
  //     high: 2,
  //     negative: 1,
  //   };
  //   score += carbonScores[sustainability.carbonFootprint] * 2;

  //   // Water usage score
  //   const waterScores = { "very-low": 4, low: 3, medium: 2, high: 1 };
  //   score += waterScores[sustainability.waterUsage] * 1.5;

  //   // Other factors
  //   if (sustainability.ethicalManufacturing) score += 3;
  //   if (sustainability.recyclable) score += 2;
  //   score += sustainability.durabilityRating * 0.5;

  //   return Math.min(Math.round(score / 4), 5); // Scale to 1-5
  // };

  const formatPriceVND = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatOriginalPrice = (price: Fashion["price"]) => {
    if (!price.original) return null;
    const formatted = new Intl.NumberFormat("vi-VN").format(price.original);
    return `${formatted}₫`;
  };

  // const handleCardClick = () => {
  //   if (onSelect) {
  //     onSelect(product);
  //   }
  // };

  // const handleAddToCart = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   if (onAddToCart && product.availability !== "out-of-stock") {
  //     onAddToCart(product);
  //   }
  // };

  // const handleToggleFavorite = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   if (onToggleFavorite) {
  //     onToggleFavorite(product);
  //   }
  // };

  //   const sustainabilityScore = getSustainabilityScore(product.sustainability);
  return (
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
        {/* Product Tag */}
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
          {/* {product.isNew && (
          <Chip
            label="Mới"
            size="small"
            sx={{ mb: 1, bgcolor: "#e91e63", color: "white" }}
          />
        )} */}
          {/* {product.isBestSeller && (
          <Chip
            label="Bán Chạy Nhất"
            size="small"
            sx={{
              mb: 1,
              backgroundColor: "rgba(245, 144, 56, 1)",
              color: "white",
            }}
          />
        )} */}
          <Chip
            icon={<EcoIcon />}
            label={`${product.recycledPercentage}% Tái Chế`}
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
        >
          <FavoriteBorderOutlined />
        </IconButton>
      </Box>
      {/* Product Image */}
      <CardMedia
        component="img"
        image={product.imageUrls[0]}
        alt={product.name}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          cursor: "pointer",
        }}
        onClick={() => navigate(`/detail/${product.designId}`)}
      />

      <Box
        className="hover-trigger"
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "70%", // Adjust as needed
          width: "100%",
          zIndex: 2,
          marginTop: "auto",
          cursor: "pointer",
        }}
        onClick={() => navigate(`/detail/${product.designId}`)}
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
          // transform: "translateY(20px)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          zIndex: 2, // Lower than favorite button
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
            onClick={() => navigate(`/detail/${product.designId}`)}
            sx={{ cursor: "pointer" }}
          >
            {/* Category and Brand */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Chip
                // label={product.category.toUpperCase()}
                icon={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                    }}
                  >
                    {getCategoryIcon(product.designTypeName)}
                  </Box>
                }
                label={product.designTypeName}
                size="small"
                sx={{
                  bgcolor: getCategoryColor(product.designTypeName),
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  paddingTop: 2,
                  paddingBottom: 2,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {product.designer.designerName}
              </Typography>
            </Box>
            {/* Design Name */}
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
              {product.name}
            </Typography>
            {/* Rating */}
            <Box display="flex" alignItems="center">
              <Rating
                value={Math.round(product.productScore)}
                readOnly
                size="small"
              />
              <Typography variant="body2" ml={1}>
                ({product.productScore})
              </Typography>
            </Box>
            {/* Design Price */}
            <Box
              sx={{
                mb: 1,
                minHeight: 56,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* {!product.price.original && (*/}
              <Typography
                component="div"
                sx={{
                  fontWeight: "bold",
                  color: "#2e7d32",
                  margin: "auto 0",
                  fontSize: "28px",
                }}
              >
                {formatPriceVND(product.price)}
              </Typography>
              {/* )}  */}
              {/* {product.price.original && (
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: "bold", color: "#2e7d32" }}
                  >

                    {product.price}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      textDecoration: "line-through",
                      color: "text.secondary",
                      fontSize: "0.875rem",
                    }}
                  >

                    {product.price}
                  </Typography>
                </Box>
              )} */}
            </Box>
            {/* Material */}
            <Box
              sx={{
                display: "flex",
                gap: 1,
                mt: 1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {product.materials.map((mat, index) => (
                <Chip
                  key={index}
                  label={`${mat.materialName} (${Math.round(
                    mat.persentageUsed
                  )}%)`}
                  size="small"
                  sx={{
                    backgroundColor: "rgba(220, 252, 231, 1)",
                    color: "rgba(29, 106, 58, 1)",
                  }}
                />
              ))}
            </Box>
            {/* Available */}
            <Box sx={{ margin: "10px 0" }}>
              <Chip
                label={getAvailabilityText(product.status)}
                size="small"
                color={getAvailabilityColor(product.status)}
                icon={<LocalShipping sx={{ fontSize: 16 }} />}
              />
            </Box>
          </Box>

          {/* Add To Cart */}
          {/* <Button
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "rgba(22, 163, 74, 1)",
            }}
            onClick={(e) => {
              e.stopPropagation(); // prevent navigation
              e.preventDefault(); // prevent Link
            }}
          >
            <AddToCart />
            Thêm vào Cart
          </Button> */}
        </Box>
      </CardContent>
    </Card>
  );
};

export default FashionCard;
