import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Rating,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Breadcrumbs,
  Link,
  TextField,
  Alert,
} from "@mui/material";
import {
  FavoriteBorder,
  LocalShipping,
  ArrowBackIos,
  ArrowForwardIos,
  ShoppingCart,
} from "@mui/icons-material";
import { materialService } from "../../services/api/materialService";
import { useCartStore } from "../../store/cartStore";
import { toast } from "react-toastify";
import SustainabilityToolbar from "../../components/materials/SustainabilityToolbar";
import SustainabilityCompact from "../../components/materials/SustainabilityCompact";
import TransportInfo from "../../components/materials/TransportInfo";
import ProductionInfo from "../../components/materials/ProductionInfo";
import { getSustainabilityColor, getMaterialTypeColor } from "../../utils/themeColors";
import type { MaterialDetailDto } from "../../schemas/materialSchema";

// Constants
const PRICE_MULTIPLIER = 1000; // Convert from backend unit to VND

// Component để hiển thị chi tiết chứng nhận
const CertificationDetails = ({ certificationDetails }: { certificationDetails: string }) => {
  if (!certificationDetails) {
    return (
      <Typography variant="body2" color="text.secondary">
        Chưa có thông tin chứng nhận
      </Typography>
    );
  }

  const certifications = certificationDetails.split(',').map(c => c.trim()).filter(c => c.length > 0);
  
  if (certifications.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {certificationDetails}
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {certificationDetails}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        Các tổ chức cấp chứng nhận:
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {certifications.map((cert, index) => (
          <Typography key={index} variant="caption" color="text.secondary">
            {cert}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

const MaterialDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [material, setMaterial] = useState<MaterialDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [quantityError, setQuantityError] = useState("");
  const [relatedMaterials, setRelatedMaterials] = useState<MaterialDetailDto[]>([]);
  
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchMaterial = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const materialData = await materialService.getMaterialById(parseInt(id));
        setMaterial(materialData);
        
        // Fetch related materials
        const allMaterials = await materialService.getAllMaterials();
        const related = allMaterials
          .filter(m => m.materialId !== materialData.materialId && 
                      m.materialTypeName === materialData.materialTypeName &&
                      m.materialTypeName != null)
          .slice(0, 3);
        setRelatedMaterials(related);
      } catch (err) {
        setError("Không thể tải thông tin nguyên liệu");
        console.error("Error fetching material:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [id]);

  const getTypeColor = (typeName?: string) => {
    if (!typeName) return "#9e9e9e";
    return getMaterialTypeColor(typeName);
  };

  const getSustainabilityScore = (recycledPercentage: number) => {
    if (material?.sustainabilityScore !== undefined && material.sustainabilityScore !== null) {
      return material.sustainabilityScore;
    }
    
    let score = recycledPercentage;
    if (recycledPercentage >= 80) score += 20;
    else if (recycledPercentage >= 50) score += 10;
    return Math.min(score, 100);
  };

  const handlePrevImage = () => {
    if (!material?.imageUrls || material.imageUrls.length === 0) return;
    setCurrentImageIndex((prev) => (prev === 0 ? material.imageUrls.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!material?.imageUrls || material.imageUrls.length === 0) return;
    setCurrentImageIndex((prev) => (prev === material.imageUrls.length - 1 ? 0 : prev + 1));
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleAddToCart = () => {
    if (!material) return;
    
    if (!quantity || quantity <= 0) {
      setQuantityError("Vui lòng nhập số lượng hợp lệ!");
      return;
    }
    if (quantity > (material.quantityAvailable || 0)) {
      setQuantityError(`Chỉ còn ${material.quantityAvailable || 0} mét có sẵn!`);
      return;
    }
    
    setQuantityError("");
    addToCart({
      id: (material.materialId || 0).toString(),
      name: material.name || "Nguyên liệu",
      image: material.imageUrls?.[0] || "",
      price: (material.pricePerUnit || 0) * PRICE_MULTIPLIER,
      quantity: quantity,
      unit: "mét",
      type: "material"
    });
    
    toast.success(`Đã thêm ${quantity} mét ${material.name || "Nguyên liệu"} vào giỏ hàng! 💡 Kiểm tra số lượng trong giỏ hàng.`);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  if (error || !material) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Typography color="error">{error || "Không tìm thấy nguyên liệu"}</Typography>
      </Box>
    );
  }

  const sustainabilityScore = getSustainabilityScore(material.recycledPercentage || 0);
  const sustainabilityLevel = material.sustainabilityLevel || 
    (sustainabilityScore >= 80 ? "Xuất sắc" : 
     sustainabilityScore >= 60 ? "Tốt" : 
     sustainabilityScore >= 40 ? "Trung bình" : "Cần cải thiện");
  
  const sustainabilityColor = material.sustainabilityColor || getSustainabilityColor(sustainabilityScore);
  const mainImage = material.imageUrls && material.imageUrls.length > 0 ? material.imageUrls[0] : "";

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "white",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Box sx={{ p: 2 }}>
          <Breadcrumbs separator="›" aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="/">
              Trang chủ
            </Link>
            <Link underline="hover" color="inherit" href="/materials">
              Nguyên liệu
            </Link>
                         <Typography color="text.primary">{material.name || "Nguyên liệu"}</Typography>
          </Breadcrumbs>
        </Box>
      </AppBar>

      <Box sx={{ mx: "auto", width: "100%", bgcolor: "#fff", minHeight: "100vh" }}>
        {/* Main Content */}
        <Box sx={{ py: 3, px: 4, display: "flex", gap: 4, flexDirection: { xs: "column", md: "row" } }}>
          {/* Left: Images */}
          <Box sx={{ width: { xs: "100%", md: "50%" } }}>
            {/* Main Image with Navigation */}
            <Box sx={{ position: "relative", mb: 2 }}>
              <Box
                component="img"
                src={material.imageUrls && material.imageUrls.length > 0 ? material.imageUrls[currentImageIndex] || mainImage : mainImage}
                alt={material.name || "Material"}
                sx={{
                  width: "100%",
                  height: { xs: "300px", md: "60vh" },
                  borderRadius: 2,
                  objectFit: "cover",
                }}
              />
              {material.imageUrls && material.imageUrls.length > 1 && material.imageUrls.length > 0 && (
                <>
                  <IconButton
                    onClick={handlePrevImage}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: 8,
                      transform: "translateY(-50%)",
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      "&:hover": { backgroundColor: "rgba(255, 255, 255, 1)" },
                    }}
                  >
                    <ArrowBackIos fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={handleNextImage}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      right: 8,
                      transform: "translateY(-50%)",
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      "&:hover": { backgroundColor: "rgba(255, 255, 255, 1)" },
                    }}
                  >
                    <ArrowForwardIos fontSize="small" />
                  </IconButton>
                </>
              )}
            </Box>

            {/* Thumbnail Images */}
            {material.imageUrls && material.imageUrls.length > 1 && material.imageUrls.length > 0 && (
              <Box sx={{ display: "flex", gap: 1 }}>
                {material.imageUrls.slice(0, 4).map((img, index) => (
                  <Box
                    key={index}
                    component="img"
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    onClick={() => setCurrentImageIndex(index)}
                    sx={{
                      width: "23%",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: 1,
                      cursor: "pointer",
                      border: index === currentImageIndex ? "2px solid #1976d2" : "1px solid #ccc",
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* Right: Material Info */}
          <Box sx={{ width: { xs: "100%", md: "50%" } }}>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                                     {material.name || "Nguyên liệu"}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                  Mã: M{(material.materialId || 0)?.toString().padStart(3, '0')}
                </Typography>
                <Chip
                                     label={material.materialTypeName || "Chưa phân loại"}
                  color="primary"
                  size="small"
                  sx={{ mb: 1 }}
                />
              </Box>
              <IconButton onClick={() => setIsFavorite(!isFavorite)}>
                <FavoriteBorder 
                  sx={{ 
                    fontSize: 28,
                    color: isFavorite ? "#f44336" : "inherit"
                  }} 
                />
              </IconButton>
            </Box>

            {/* Supplier Info */}
            <Box sx={{ mb: 3, p: 2, bgcolor: "#f8f9fa", borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                Nhà cung cấp
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  src={material.supplier?.avatarUrl}
                  sx={{ width: 50, height: 50 }}
                >
                  {material.supplier?.supplierName?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {material.supplier?.supplierName}
                  </Typography>
                  {material.supplier?.rating && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Rating 
                        value={material.supplier.rating} 
                        readOnly 
                        size="small" 
                      />
                      <Typography variant="body2">
                        ({material.supplier.reviewCount || 0} đánh giá)
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Price and Availability */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" color="primary" fontWeight="bold" sx={{ mb: 1 }}>
                                 {((material.pricePerUnit || 0) * PRICE_MULTIPLIER)?.toLocaleString('vi-VN')} ₫/mét
              </Typography>
              <Chip
                label={(material.quantityAvailable || 0) > 0 ? "Còn hàng" : "Hết hàng"}
                color={(material.quantityAvailable || 0) > 0 ? "success" : "error"}
                icon={<LocalShipping />}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                Còn lại: {(material.quantityAvailable || 0).toLocaleString('vi-VN')} mét
              </Typography>
            </Box>

            {/* Sustainability Score */}
            <Box sx={{ mb: 3, p: 2, bgcolor: "#e8f5e8", borderRadius: 2 }}>
              <SustainabilityToolbar 
                sustainabilityScore={sustainabilityScore}
                recycledPercentage={material.recycledPercentage || 0}
                sustainabilityLevel={material.sustainabilityLevel}
                sustainabilityColor={material.sustainabilityColor}
                showDetails={false}
              />
            </Box>

            {/* Add to Cart Section */}
            <Box sx={{ mb: 3, p: 2, bgcolor: "#f8f9fa", borderRadius: 2 }}>
                             <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                 Thêm vào giỏ hàng
               </Typography>
               <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                 💡 Gợi ý: Nhập số lượng mét cần mua
               </Typography>
              
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <TextField
                  type="number"
                  label="Số lượng (mét)"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                     inputProps={{ min: 1, max: material.quantityAvailable || 0 }}
                  sx={{ width: 150 }}
                />
                                 <Typography variant="body2" color="text.secondary">
                   / {(material.quantityAvailable || 0).toLocaleString('vi-VN')} mét có sẵn
                 </Typography>
                 <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                   💡 Ví dụ: Nhập 10 = 10 mét vải
                 </Typography>
              </Box>
              
              {quantityError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {quantityError}
                </Alert>
              )}
              
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                                 disabled={(material.quantityAvailable || 0) === 0}
                 fullWidth
               >
                 Thêm vào giỏ hàng
               </Button>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button 
                variant="contained" 
                color="secondary" 
                size="large"
                fullWidth
                                 disabled={(material.quantityAvailable || 0) === 0}
               >
                 Liên hệ nhà cung cấp
               </Button>
              <Button 
                variant="outlined" 
                size="large"
                                   onClick={() => navigate(`/supplier/${material.supplier?.supplierId || material.supplierId || 0}`)}
              >
                Xem hồ sơ
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Tabs Section */}
        <Box sx={{ borderTop: "1px solid #e0e0e0" }}>
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": {
                fontWeight: "bold",
              },
            }}
          >
            <Tab label="Thông tin chi tiết" />
            <Tab label="Tính bền vững" />
            <Tab label="Đánh giá" />
            <Tab label="Tài liệu" />
          </Tabs>

          {/* Tab Content */}
          <Box sx={{ p: 4 }}>
            {/* Tab 1: Thông số kỹ thuật */}
            {tabIndex === 0 && (
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                  Thông số kỹ thuật
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Tỷ lệ tái chế" 
                      secondary={`${(material.recycledPercentage || 0).toFixed(1)}% (1 trong 5 tiêu chí đánh giá bền vững)`} 
                    />
                  </ListItem>
                  <ListItem>
                                       <ListItemText 
                     primary="Số lượng có sẵn" 
                     secondary={`${(material.quantityAvailable || 0).toLocaleString('vi-VN')} mét`} 
                   />
                  </ListItem>
                  <ListItem>
                                       <ListItemText 
                     primary="Giá trên đơn vị" 
                     secondary={`${((material.pricePerUnit || 0) * PRICE_MULTIPLIER)?.toLocaleString('vi-VN')} ₫/mét`} 
                   />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Tổng giá trị kho" 
                      secondary={`${((material.quantityAvailable || 0) * (material.pricePerUnit || 0) * PRICE_MULTIPLIER).toLocaleString('vi-VN')} ₫`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Ngày tạo" 
                      secondary={material.createdAt ? new Date(material.createdAt).toLocaleDateString('vi-VN') : 'Chưa có thông tin'} 
                    />
                  </ListItem>
                  
                  {/* Thông tin sản xuất */}
                  {(material.productionCountry || material.productionRegion || material.manufacturingProcess) && (
                    <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                      <ListItemText primary="Thông tin sản xuất" />
                      <Box sx={{ mt: 1, ml: 2, width: '100%' }}>
                        <ProductionInfo 
                          country={material.productionCountry}
                          region={material.productionRegion}
                          process={material.manufacturingProcess}
                          showDescription={true}
                        />
                      </Box>
                    </ListItem>
                  )}
                  
                  {/* Thông tin vận chuyển */}
                  {material.transportDistance && material.transportMethod && (
                    <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                      <ListItemText primary="Thông tin vận chuyển" />
                      <Box sx={{ mt: 1, ml: 2, width: '100%' }}>
                        <TransportInfo 
                          distance={material.transportDistance}
                          method={material.transportMethod}
                          showDescription={true}
                        />
                      </Box>
                    </ListItem>
                  )}
                  
                  {/* Chứng nhận bền vững */}
                  {material.certificationDetails && (
                    <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                      <ListItemText primary="Chứng nhận bền vững" />
                      <Box sx={{ mt: 1, ml: 2, width: '100%' }}>
                        <CertificationDetails certificationDetails={material.certificationDetails} />
                      </Box>
                    </ListItem>
                  )}
                  
                  {/* Sustainability Score */}
                  <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <ListItemText primary="Điểm bền vững" />
                    <Box sx={{ mt: 1, ml: 2, width: '100%' }}>
                      <SustainabilityToolbar 
                        sustainabilityScore={sustainabilityScore}
                        recycledPercentage={material.recycledPercentage || 0}
                        sustainabilityLevel={material.sustainabilityLevel}
                        sustainabilityColor={material.sustainabilityColor}
                        showDetails={false}
                      />
                    </Box>
                  </ListItem>
                </List>
              </Box>
            )}

            {/* Tab 2: Tính bền vững */}
            {tabIndex === 1 && (
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                  Thông tin bền vững
                </Typography>
                
                {/* Tổng quan điểm bền vững */}
                <Box sx={{ mb: 4, p: 3, bgcolor: "#f8f9fa", borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Tổng quan điểm bền vững
                  </Typography>
                                     <SustainabilityToolbar 
                     sustainabilityScore={sustainabilityScore}
                     recycledPercentage={material.recycledPercentage || 0}
                     sustainabilityLevel={material.sustainabilityLevel}
                     sustainabilityColor={material.sustainabilityColor}
                     showDetails={true}
                   />
                </Box>
                
                {material?.benchmarks && material.benchmarks.length > 0 ? (
                  <Grid container spacing={3}>
                    {material.benchmarks.map((benchmark, index) => (
                      <Grid key={index} >
                        <Card>
                          <CardContent>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                              {benchmark.sustainabilityCriteria?.name || `Tiêu chí ${index + 1}`}
                            </Typography>
                            
                            {/* Giá trị chuẩn */}
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                              <Typography variant="body2">Giá trị chuẩn:</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {benchmark.criteriaId === 4 ? 
                                  (benchmark.value >= 1 ? "Có" : "Không") : 
                                  `${benchmark.value} ${benchmark.sustainabilityCriteria?.unit || ''}`
                                }
                              </Typography>
                            </Box>
                            
                            {/* Giá trị thực tế */}
                            {benchmark.actualValue !== null && benchmark.actualValue !== undefined && (
                              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                <Typography variant="body2">Giá trị thực tế:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {benchmark.criteriaId === 4 ? 
                                    (benchmark.actualValue >= 1 ? "Có" : "Không") : 
                                    `${benchmark.actualValue} ${benchmark.sustainabilityCriteria?.unit || ''}`
                                  }
                                </Typography>
                              </Box>
                            )}
                            
                            {/* So sánh cải thiện */}
                            {benchmark.improvementPercentage !== null && benchmark.improvementPercentage !== undefined && (
                              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                <Typography variant="body2">Cải thiện:</Typography>
                                <Typography 
                                  variant="body2" 
                                  fontWeight="bold"
                                  color={benchmark.improvementColor === 'success' ? 'success.main' : 
                                         benchmark.improvementColor === 'error' ? 'error.main' : 'warning.main'}
                                >
                                  {benchmark.criteriaId === 4 ? 
                                    `(${benchmark.improvementStatus})` :
                                    `${benchmark.improvementPercentage > 0 ? '+' : ''}${benchmark.improvementPercentage.toFixed(1)}% (${benchmark.improvementStatus})`
                                  }
                                </Typography>
                              </Box>
                            )}
                            
                            {/* Loại vật liệu */}
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                              <Typography variant="body2">Loại vật liệu:</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                                                 {benchmark.materialType?.typeName || 'Chưa có thông tin'}
                              </Typography>
                            </Box>
                            
                            {/* Tiêu chí ID */}
                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                              <Typography variant="body2">Tiêu chí ID:</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {benchmark.criteriaId}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Chưa có thông tin benchmark.
                  </Typography>
                )}
              </Box>
            )}

            {/* Tab 3: Đánh giá */}
            {tabIndex === 2 && (
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                  Đánh giá từ khách hàng
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Chưa có đánh giá cho nguyên liệu này.
                </Typography>
              </Box>
            )}

            {/* Tab 4: Tài liệu */}
            {tabIndex === 3 && (
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                  Tài liệu liên quan
                </Typography>
                {material.documentationUrl ? (
                  <Button 
                    variant="contained" 
                    href={material.documentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Xem tài liệu kỹ thuật
                  </Button>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Chưa có tài liệu đính kèm.
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {/* Related Materials */}
        {relatedMaterials.length > 0 && (
          <Box sx={{ p: 4, borderTop: "1px solid #e0e0e0" }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
              Nguyên liệu tương tự
            </Typography>
            <Grid container spacing={3}>
              {relatedMaterials.map((relatedMaterial) => (
                <Grid key={relatedMaterial.materialId || 0} >
                  <Card 
                    sx={{ 
                      cursor: "pointer",
                      transition: "transform 0.2s",
                      "&:hover": { transform: "translateY(-4px)" }
                    }}
                    onClick={() => navigate(`/material/${relatedMaterial.materialId || 0}`)}
                  >
                    <CardContent>
                      <Box
                        component="img"
                        src={relatedMaterial.imageUrls && relatedMaterial.imageUrls.length > 0 ? relatedMaterial.imageUrls[0] : ""}
                        alt={relatedMaterial.name || "Material"}
                        sx={{
                          width: "100%",
                          height: "200px",
                          objectFit: "cover",
                          borderRadius: 1,
                          mb: 2
                        }}
                      />
                      <Typography variant="h6" fontWeight="bold" noWrap>
                                                 {relatedMaterial.name || "Nguyên liệu"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                                                 {relatedMaterial.supplier?.supplierName || "Chưa có thông tin"}
                      </Typography>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                                                 {((relatedMaterial.pricePerUnit || 0) * PRICE_MULTIPLIER)?.toLocaleString('vi-VN')} ₫/mét
                      </Typography>
                      <Chip
                        label={`${(relatedMaterial.recycledPercentage || 0).toFixed(1)}% tái chế`}
                        size="small"
                        color="success"
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MaterialDetailPage; 