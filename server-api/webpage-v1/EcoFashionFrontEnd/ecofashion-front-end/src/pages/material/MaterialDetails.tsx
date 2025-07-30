import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Rating,
  Tabs,
  Typography,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import Tab from "@mui/material/Tab";
import {
  ArrowBackIos,
  ArrowForwardIos,
  FavoriteBorder,
  Star,
  Recycling,
  LocalShipping,
  Info,
} from "@mui/icons-material";
import { EcoIcon } from "../../assets/icons/icon";
import { materialService } from "../../services/api/materialService";
import type { MaterialDetailResponse } from "../../schemas/materialSchema";
import SustainabilityToolbar from "../../components/materials/SustainabilityToolbar";
import TransportInfo from "../../components/materials/TransportInfo";
import ProductionInfo from "../../components/materials/ProductionInfo";

import { toast } from "react-toastify";



// Component để hiển thị chi tiết chứng nhận
const CertificationDetails = ({ certificationDetails }: { certificationDetails: string }) => {
  const certifications = certificationDetails.split(',').map(c => c.trim());
  
  const getCertificationLink = (cert: string) => {
    const certMap: { [key: string]: string } = {
      'GOTS': 'https://global-standard.org/',
      'OEKO-TEX': 'https://www.oeko-tex.com/',
      'GRS': 'https://textileexchange.org/standards/grs/',
      'RWS': 'https://textileexchange.org/standards/rws/',
      'USDA': 'https://www.usda.gov/topics/organic',
      'EU Ecolabel': 'https://ec.europa.eu/environment/ecolabel/',
      'Soil Association': 'https://www.soilassociation.org/'
    };
    
    return certMap[cert] || null;
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {certificationDetails}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        Các tổ chức cấp chứng nhận:
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {certifications.map((cert, index) => {
          const link = getCertificationLink(cert);
          return link ? (
            <Link 
              key={index}
              href={link} 
              target="_blank" 
              rel="noopener noreferrer"
              sx={{ 
                fontSize: '0.75rem',
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              {cert}
            </Link>
          ) : (
            <Typography key={index} variant="caption" color="text.secondary">
              {cert}
            </Typography>
          );
        })}
      </Box>
    </Box>
  );
};

export default function MaterialDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [materialDetail, setMaterialDetail] = useState<any>(null);
  const [relatedMaterials, setRelatedMaterials] = useState<any[]>([]);

  // UI State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch material detail
  useEffect(() => {
    if (!id) return;
    
    const fetchMaterialDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await materialService.getMaterialDetail(Number(id));
        const allMaterials = await materialService.getAllMaterials();
        
        // Debug logging

        
        setMaterialDetail({
          ...data,
          imageUrls: data.imageUrls ?? [],
        });
        
        // Get related materials (same type, different supplier)
        const related = allMaterials
          .filter(m => m.materialId !== Number(id) && m.materialTypeName === data.materialTypeName)
          .slice(0, 3);
        setRelatedMaterials(related);
      } catch (err: any) {
        console.error("Error fetching material detail:", err);
        const msg = err.message || "Không thể tải thông tin nguyên liệu.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterialDetail();
  }, [id]);

  // Image navigation
  const handlePrevImage = () => {
    const images = materialDetail?.imageUrls ?? [];
    if (!images || images.length === 0) return;
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    const images = materialDetail?.imageUrls ?? [];
    if (!images || images.length === 0) return;
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Tab handling
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // Calculate sustainability score
  const getSustainabilityScore = (recycledPercentage: number) => {
    // Ưu tiên sử dụng sustainability score từ backend
    if (materialDetail.sustainabilityScore !== undefined && materialDetail.sustainabilityScore !== null) {
      return materialDetail.sustainabilityScore;
    }
    
    // Fallback: tính toán local như cũ (chỉ dùng khi backend chưa có data)
    let score = recycledPercentage;
    if (recycledPercentage >= 80) score += 20;
    else if (recycledPercentage >= 50) score += 10;
    return Math.min(score, 100);
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error || !materialDetail) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="error" variant="h6">
          {error || "Không tìm thấy nguyên liệu."}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate("/")}
          sx={{ mt: 2 }}
        >
          Về trang chủ
        </Button>
      </Box>
    );
  }

  const sustainabilityScore = getSustainabilityScore(materialDetail.recycledPercentage);
  const mainImage = materialDetail.imageUrls[currentImageIndex] || "/assets/default-material.jpg";

  return (
    <Box sx={{ width: "100%", bgcolor: "#f5f5f5" }}>
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
            <Typography color="text.primary">{materialDetail.name}</Typography>
          </Breadcrumbs>
        </Box>
      </AppBar>

      <Box sx={{ mx: "auto", width: "80%", bgcolor: "#fff", minHeight: "100vh" }}>
        {/* Main Content */}
        <Box sx={{ py: 3, px: 4, display: "flex", gap: 4 }}>
          {/* Left: Images */}
          <Grid sx={{ width: "50%" }}>
            {/* Main Image with Navigation */}
            <Box sx={{ position: "relative", mb: 2 }}>
              <Box
                component="img"
                src={mainImage}
                alt={materialDetail.name || "Material"}
                sx={{
                  width: "100%",
                  height: "60vh",
                  borderRadius: 2,
                  objectFit: "cover",
                }}
              />
              {materialDetail.imageUrls.length > 1 && (
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
            {materialDetail.imageUrls.length > 1 && (
              <Box sx={{ display: "flex", gap: 1 }}>
                {materialDetail.imageUrls.slice(0, 4).map((img, index) => (
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
          </Grid>

          {/* Right: Material Info */}
          <Grid sx={{ width: "50%" }}>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                  {materialDetail.name || "Unnamed Material"}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                  Mã: M{materialDetail.materialId.toString().padStart(3, '0')}
                </Typography>
                <Chip
                  label={materialDetail.materialTypeName || "Unknown Type"}
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
                  src={materialDetail.supplier.avatarUrl}
                  sx={{ width: 50, height: 50 }}
                >
                  {materialDetail.supplier.supplierName?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {materialDetail.supplier.supplierName}
                  </Typography>
                  {materialDetail.supplier.rating && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Rating 
                        value={materialDetail.supplier.rating} 
                        readOnly 
                        size="small" 
                      />
                      <Typography variant="body2">
                        ({materialDetail.supplier.reviewCount || 0} đánh giá)
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Price and Availability */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" color="primary" fontWeight="bold" sx={{ mb: 1 }}>
                {(materialDetail.pricePerUnit * 1000)?.toLocaleString('vi-VN')} ₫/mét
              </Typography>
              <Chip
                label={materialDetail.quantityAvailable > 0 ? "Còn hàng" : "Hết hàng"}
                color={materialDetail.quantityAvailable > 0 ? "success" : "error"}
                icon={<LocalShipping />}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                                  Còn lại: {materialDetail.quantityAvailable.toLocaleString('vi-VN')} mét
              </Typography>
            </Box>

            {/* Sustainability Score */}
            <Box sx={{ mb: 3, p: 2, bgcolor: "#e8f5e8", borderRadius: 2 }}>
              <SustainabilityToolbar 
                sustainabilityScore={sustainabilityScore}
                recycledPercentage={materialDetail.recycledPercentage}
                sustainabilityLevel={materialDetail.sustainabilityLevel}
                sustainabilityColor={materialDetail.sustainabilityColor}
                showDetails={false}
              />
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                fullWidth
                disabled={materialDetail.quantityAvailable === 0}
              >
                Liên hệ nhà cung cấp
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => navigate(`/supplier/${materialDetail.supplier.supplierId}`)}
              >
                Xem hồ sơ
              </Button>
            </Box>
          </Grid>
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
                      secondary={`${(materialDetail.recycledPercentage || 0).toFixed(1)}% (1 trong 5 tiêu chí đánh giá bền vững)`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Số lượng có sẵn" 
                      secondary={`${materialDetail.quantityAvailable.toLocaleString('vi-VN')} mét`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Giá trên đơn vị" 
                      secondary={`${(materialDetail.pricePerUnit * 1000)?.toLocaleString('vi-VN')} ₫/mét`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Tổng giá trị kho" 
                      secondary={`${((materialDetail.quantityAvailable || 0) * (materialDetail.pricePerUnit || 0) * 1000).toLocaleString('vi-VN')} ₫`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Ngày tạo" 
                      secondary={materialDetail.createdAt ? new Date(materialDetail.createdAt).toLocaleDateString('vi-VN') : 'N/A'} 
                    />
                  </ListItem>
                  
                  {/* Thông tin sản xuất */}
                  {(materialDetail.productionCountry || materialDetail.productionRegion || materialDetail.manufacturingProcess) && (
                    <ListItem>
                      <ListItemText 
                        primary="Thông tin sản xuất" 
                        secondary={
                          <ProductionInfo 
                            country={materialDetail.productionCountry}
                            region={materialDetail.productionRegion}
                            process={materialDetail.manufacturingProcess}
                            showDescription={true}
                          />
                        } 
                      />
                    </ListItem>
                  )}
                  
                  {/* Thông tin vận chuyển */}
                  {materialDetail.transportDistance && materialDetail.transportMethod && (
                    <ListItem>
                      <ListItemText 
                        primary="Thông tin vận chuyển" 
                        secondary={
                          <TransportInfo 
                            distance={materialDetail.transportDistance}
                            method={materialDetail.transportMethod}
                            showDescription={true}
                          />
                        } 
                      />
                    </ListItem>
                  )}
                  
                  {/* Chứng nhận bền vững */}
                  {materialDetail.certificationDetails && (
                    <ListItem>
                      <ListItemText 
                        primary="Chứng nhận bền vững" 
                        secondary={<CertificationDetails certificationDetails={materialDetail.certificationDetails} />} 
                      />
                    </ListItem>
                  )}
                  {/* Sustainability Score */}
                  <ListItem>
                    <ListItemText 
                      primary="Điểm bền vững" 
                      secondary={<SustainabilityToolbar 
                        sustainabilityScore={sustainabilityScore}
                        recycledPercentage={materialDetail.recycledPercentage}
                        sustainabilityLevel={materialDetail.sustainabilityLevel}
                        sustainabilityColor={materialDetail.sustainabilityColor}
                        showDetails={false}
                      />} 
                    />
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
                    recycledPercentage={materialDetail.recycledPercentage}
                    sustainabilityLevel={materialDetail.sustainabilityLevel}
                    sustainabilityColor={materialDetail.sustainabilityColor}
                    showDetails={true}
                  />
                </Box>
                

                
                {materialDetail?.benchmarks && materialDetail.benchmarks.length > 0 ? (
                  <Grid container spacing={3}>
                    {materialDetail.benchmarks.map((benchmark, index) => (
                      <Grid key={index}>
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
                                {benchmark.materialType?.typeName || 'N/A'}
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
                {materialDetail.documentationUrl ? (
                  <Button 
                    variant="contained" 
                    href={materialDetail.documentationUrl}
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
              {relatedMaterials.map((material) => (
                <Grid key={material.materialId}>
                  <Card 
                    sx={{ 
                      cursor: "pointer",
                      transition: "transform 0.2s",
                      "&:hover": { transform: "translateY(-4px)" }
                    }}
                    onClick={() => navigate(`/material/${material.materialId}`)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={material.imageUrls[0] || "/assets/default-material.jpg"}
                      alt={material.name || "Material"}
                    />
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" noWrap>
                        {material.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {material.supplier.supplierName}
                      </Typography>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        {(material.pricePerUnit * 1000)?.toLocaleString('vi-VN')} ₫/mét
                      </Typography>
                      <Chip
                        label={`${material.recycledPercentage.toFixed(1)}% tái chế`}
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
}
