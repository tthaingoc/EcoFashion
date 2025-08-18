import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  FavoriteBorderOutlined,
  LocalShipping,
  ShoppingCart,
  Close,
} from "@mui/icons-material";
import { EcoIcon } from "../../assets/icons/icon";
import type { Design } from "../../services/api/designService";
import { useCartStore } from "../../store/cartStore";
import { toast } from "react-toastify";

interface DesignProductCardProps {
  design: Design;
  type?: string;
  onSelect?: (design: Design) => void;
}

const DesignProductCard: React.FC<DesignProductCardProps> = ({
  design,
  type,
  onSelect,
}) => {
  const navigate = useNavigate();
  const [quickBuyOpen, setQuickBuyOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const addProductToCart = useCartStore((state) => state.addProductToCart);

  const getCategoryColor = (category?: string): string => {
    if (!category) return "#9e9e9e";
    const colors: Record<string, string> = {
      Áo: "#2196f3",
      Quần: "#ff9800", 
      Đầm: "#4caf50",
      Váy: "#9c27b0",
    };
    return colors[category.normalize("NFC")] || "#9e9e9e";
  };

  const getAvailabilityColor = (productCount: number) => {
    return productCount > 0 ? "success" : "error";
  };

  const getAvailabilityText = (productCount: number) => {
    return productCount > 0 ? "Còn Hàng" : "Hết Hàng";
  };

  const formatPriceVND = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Get unique colors and sizes from products
  const uniqueColors = [...new Set(design.products?.map((p) => p.colorCode) || [])];
  const uniqueSizes = Array.from(
    (design.products || []).reduce((map, product) => {
      if (!map.has(product.sizeId)) {
        map.set(product.sizeId, product.sizeName);
      }
      return map;
    }, new Map<number, string>())
  );

  // Find selected product
  const selectedProduct = design.products?.find(
    (p) => p.colorCode === selectedColor && p.sizeId === selectedSize
  );

  const handleQuickBuy = () => {
    setQuickBuyOpen(true);
    // Set default selections if available
    if (uniqueColors.length > 0 && !selectedColor) {
      setSelectedColor(uniqueColors[0]);
    }
    if (uniqueSizes.length > 0 && !selectedSize) {
      setSelectedSize(uniqueSizes[0][0]);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedProduct) {
      toast.error("Vui lòng chọn màu và kích thước!");
      return;
    }

    if (quantity <= 0) {
      toast.error("Vui lòng nhập số lượng hợp lệ!");
      return;
    }

    if (quantity > selectedProduct.quantityAvailable) {
      toast.error(`Chỉ còn ${selectedProduct.quantityAvailable} sản phẩm có sẵn!`);
      return;
    }

    try {
      await addProductToCart({ productId: selectedProduct.productId, quantity });
      toast.success(`Đã thêm ${quantity} sản phẩm ${design.name} vào giỏ hàng! 🛒`);
      setQuickBuyOpen(false);
      // Reset selections
      setSelectedColor("");
      setSelectedSize(null);
      setQuantity(1);
    } catch (error) {
      console.error("Error adding product to cart:", error);
      toast.error("Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại!");
    }
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(design);
    } else {
      navigate(`/detail/${design.designId}/${design.designer.designerId}`);
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
          cursor: "pointer",
          "&:hover": {
            transform: "translateY(-4px)",
            transition: "all 0.3s ease",
            boxShadow: 3,
          },
          "&:hover .card-hover-content": {
            opacity: 1,
            transform: "translateY(0)",
          },
          borderRadius: "10px",
        }}
        onClick={handleCardClick}
      >
        {/* Tags and Favorite */}
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            zIndex: 2,
          }}
        >
          <Chip
            icon={<EcoIcon />}
            label={`${design.recycledPercentage}% Bền Vững`}
            size="small"
            sx={{
              backgroundColor: "rgba(200, 248, 217, 1)",
              color: "rgba(22, 103, 86, 1)",
              fontSize: "12px",
            }}
          />
        </Box>

        <IconButton
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 2,
            backgroundColor: "white",
          }}
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
        >
          <FavoriteBorderOutlined />
        </IconButton>

        {/* Product Image */}
        <CardMedia
          component="img"
          image={design.designImageUrls?.[0] || ""}
          alt={design.name}
          sx={{
            width: "100%",
            height: "250px",
            objectFit: "cover",
          }}
        />

        {/* Hover Content */}
        <CardContent
          className="card-hover-content"
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            background: "rgba(255, 255, 255, 0.95)",
            opacity: 0,
            transform: "translateY(20px)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
            zIndex: 2,
            borderRadius: "0 0 10px 10px",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {/* Category and Designer */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Chip
              label={design.itemTypeName}
              size="small"
              sx={{
                bgcolor: getCategoryColor(design.itemTypeName),
                color: "white",
                fontWeight: "bold",
                fontSize: "0.75rem",
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {design.designer.designerName}
            </Typography>
          </Box>

          {/* Design Name */}
          <Typography
            fontWeight="bold"
            sx={{
              fontSize: "16px",
              color: "black",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {design.name}
          </Typography>

          {/* Price */}
          <Typography
            sx={{
              fontWeight: "bold",
              color: "#2e7d32",
              fontSize: "20px",
            }}
          >
            {formatPriceVND(design.salePrice)}
          </Typography>

          {/* Availability */}
          <Chip
            label={getAvailabilityText(design.productCount)}
            size="small"
            color={getAvailabilityColor(design.productCount)}
            icon={<LocalShipping sx={{ fontSize: 16 }} />}
          />

          {/* Quick Buy Button */}
          <Button
            variant="contained"
            fullWidth
            startIcon={<ShoppingCart />}
            onClick={(e) => {
              e.stopPropagation();
              handleQuickBuy();
            }}
            disabled={design.productCount === 0}
            sx={{
              mt: 1,
              backgroundColor: "rgba(22, 163, 74, 1)",
              "&:hover": { backgroundColor: "rgba(22, 163, 74, 0.8)" },
            }}
          >
            Mua Ngay
          </Button>
        </CardContent>
      </Card>

      {/* Quick Buy Dialog */}
      <Dialog open={quickBuyOpen} onClose={() => setQuickBuyOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            Mua Ngay - {design.name}
            <IconButton onClick={() => setQuickBuyOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {/* Color Selection */}
            <FormControl fullWidth>
              <InputLabel>Màu sắc</InputLabel>
              <Select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                label="Màu sắc"
              >
                {uniqueColors.map((color) => (
                  <MenuItem key={color} value={color}>
                    {color}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Size Selection */}
            <FormControl fullWidth>
              <InputLabel>Kích thước</InputLabel>
              <Select
                value={selectedSize || ""}
                onChange={(e) => setSelectedSize(Number(e.target.value))}
                label="Kích thước"
              >
                {uniqueSizes.map(([sizeId, sizeName]) => (
                  <MenuItem key={sizeId} value={sizeId}>
                    {sizeName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Quantity */}
            <TextField
              type="number"
              label="Số lượng"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              inputProps={{ min: 1, max: selectedProduct?.quantityAvailable || 1 }}
              fullWidth
            />

            {/* Product Info */}
            {selectedProduct && (
              <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                <Typography variant="body2">
                  Sản phẩm: {selectedProduct.sku}
                </Typography>
                <Typography variant="body2">
                  Còn lại: {selectedProduct.quantityAvailable} sản phẩm
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="primary">
                  Tổng: {formatPriceVND(design.salePrice * quantity)}
                </Typography>
              </Box>
            )}

            {/* Add to Cart Button */}
            <Button
              variant="contained"
              fullWidth
              onClick={handleAddToCart}
              disabled={!selectedProduct}
              sx={{
                backgroundColor: "rgba(22, 163, 74, 1)",
                "&:hover": { backgroundColor: "rgba(22, 163, 74, 0.8)" },
              }}
            >
              Thêm vào giỏ hàng
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DesignProductCard;