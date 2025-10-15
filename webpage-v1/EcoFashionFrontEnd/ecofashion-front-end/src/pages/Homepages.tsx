// Utility function to fallback image URL safely
function safeImageUrl(
  url?: string,
  fallback: string = "/assets/default-image.jpg"
): string {
  return typeof url === "string" && url.trim() ? url : fallback;
}
import {
  Box,
  Button,
  Grid,
  Typography,
  Stack,
  ListItem,
  List,
  Container,
  InputBase,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
//Image
import banner from "../assets/pictures/homepage/banner.jpg";
import fashion from "../assets/pictures/homepage/fashion.png";
import material from "../assets/pictures/homepage/material.png";
import information from "../assets/pictures/homepage/information.png";
import sustain from "../assets/pictures/homepage/sustain.png";
//Api
import { useAuthStore } from "../store/authStore";
import { Design, DesignService } from "../services/api/designService";
import { toast } from "react-toastify";
//Icon
import { AddToCart, EcoIcon, FavoriteBorderIcon } from "../assets/icons/icon";
import { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Fab } from "@mui/material";
//Card

import FashionsSection from "../components/fashion/FashionsSection";
import { useNavigate } from "react-router-dom";
import useMaterial from "../hooks/useMaterial";
import MaterialsSection from "../components/materials/MaterialsSection";
import {
  DesignerService,
  SupplierService,
  SupplierSummary,
} from "../services/api";

const StyledInput = styled(InputBase)({
  borderRadius: 20,
  backgroundColor: "#fff",
  border: "1px solid #ccc",
  flex: 1,
});

type DesignerSummaryExtra = {
  designerId: string;
  designerName?: string;
  avatarUrl?: string;
  bio?: string;
  bannerUrl?: string;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  taxNumber?: string;
  identificationPictureOwner?: string;
};

export default function Homepage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Materials Data using API
  const {
    materials,
    loading: materialsLoading,
    error: materialsError,
  } = useMaterial();

  //Design Data
  const [designs, setDesigns] = useState<Design[]>([]);
  const [designers, setDesigners] = useState<DesignerSummaryExtra[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierSummary[]>([]);
  //Loading
  const [loading, setLoading] = useState(true);
  //Error
  const [error, setError] = useState<string | null>(null);
  //Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState<number>();
  const pageSize = 12;
  const [page, setPage] = useState(currentPage);

  // Scroll to top state
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    loadDesigners();
  }, []);

  const loadDesigners = async () => {
    try {
      setLoading(true);
      setError(null);

      const desginData = await DesignService.getAllDesignPagination(
        currentPage,
        pageSize
      );
      setDesigns(desginData);

      const designerData = await DesignerService.getPublicDesigners(
        currentPage,
        pageSize
      );
      setDesigners(designerData);

      const supplierData = await SupplierService.getPublicSuppliers(
        currentPage,
        pageSize
      );
      setSuppliers(supplierData);
    } catch (error: any) {
      const errorMessage =
        error.message || "Không thể tải danh sách nhà thiết kế";
      setError(errorMessage);
      toast.error(errorMessage, { position: "bottom-center" });
    } finally {
      setLoading(false);
    }
  };

  const CountUp = ({ end, duration = 1000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let start = 0;
      const totalSteps = end;
      const stepTime = Math.max(1, Math.floor(duration / totalSteps)); // ensure stepTime ≥ 1ms

      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start >= end) clearInterval(timer);
      }, stepTime);

      return () => clearInterval(timer);
    }, [end, duration]);

    return <>{count.toLocaleString()}</>;
  };

  return (
    <Box>
      <Grid sx={{ display: { xs: "none", md: "block" } }}>
        {/* Banner */}
        <Box
          sx={{
            height: "100vh",
            transition: "height 0.5s ease",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={banner}
            alt="EcoFashion Banner"
            style={{ width: "100%", height: "580", objectFit: "cover" }}
          />
          <Box
            sx={{
              position: "absolute",
              textAlign: "center",
              color: "white",
              width: "100%",
              marginBottom: { xs: "50px", md: "100px" },
              px: { xs: 1, sm: 2, md: 0 },
            }}
          >
            <Box
              sx={{
                width: { xs: "95%", sm: "90%", md: "80%" },
                backgroundColor: "rgba(145, 136, 136, 0.42)",
                margin: "auto",
                padding: { xs: 2, sm: 2.5, md: 3 },
                borderRadius: { xs: 1, md: 0 },
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontFamily: "'Allura', cursive",
                  fontWeight: 400,
                  fontSize: {
                    xs: "1.8rem",
                    sm: "2.5rem",
                    md: "3.5rem",
                    lg: "5rem",
                  },
                  lineHeight: { xs: 1.2, md: 1.3 },
                }}
              >
                Kiến Tạo Phong Cách, Gắn Kết Cộng Đồng, Hướng Tới{" "}
                <span style={{ color: "#32e087" }}>Thời Trang Bền Vững</span>
              </Typography>
            </Box>
            <Typography
              sx={{
                width: { xs: "90%", sm: "80%", md: "60%" },
                margin: "auto",
                fontSize: { xs: "16px", sm: "20px", md: "25px" },
                mb: { xs: 5, md: 10 },
                mt: { xs: 2, md: 0 },
                px: { xs: 1, md: 0 },
              }}
            >
              Cùng Tham Gia Thay Đổi Ngành Thời Trang Với Vật Liệu Tái Chế Và
              Thiết Kế Thân Thiện Với Môi Trường
            </Typography>
            {/* <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "white",
              p: 0.5,
              width: "60%",
              border: "1px solid black",
              margin: "30px auto",
            }}
          >
            <Box
              sx={{
                borderRight: "1px solid black",
                height: "100%",
              }}
            >
              <Select
                defaultValue="all"
                sx={{
                  border: "none",
                  fontSize: 14,
                  minWidth: 100,
                  "& fieldset": { border: "none" },
                }}
                MenuProps={{
                  disableScrollLock: true,
                }}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="products">Thời trang</MenuItem>
                <MenuItem value="material">Vật liệu</MenuItem>
              </Select>
            </Box>
            <Box
              sx={{
                width: "85%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <StyledInput
                placeholder="Tìm kiếm.."
                fullWidth
                sx={{ border: "none" }}
              />
              <SearchIcon sx={{ color: "black", margin: "auto" }} />
            </Box>
          </Box> */}
            {user ? (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="center"
                width={{ xs: "90%", sm: "80%", md: "50%" }}
                margin={"auto"}
                sx={{ px: { xs: 2, md: 0 } }}
              >
                <Button
                  variant="outlined"
                  sx={{
                    color: "white",
                    borderColor: "white",
                    display: "flex",
                    alignItems: "center",
                    textAlign: "center",
                    justifyContent: "center",
                    width: { xs: "100%", sm: "50%" },
                    marginTop: { xs: "20px", md: "30px" },
                    py: { xs: 1.5, md: 1 },
                  }}
                  href="/fashion"
                >
                  <Typography
                    sx={{
                      color: "white",
                      fontSize: "20px",
                      fontWeight: "bold",
                    }}
                  >
                    THỜI TRANG
                  </Typography>
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    color: "white",
                    borderColor: "white",
                    display: "flex",
                    alignItems: "center",
                    textAlign: "center",
                    justifyContent: "center",
                    width: "50%",
                  }}
                  href="/materials"
                >
                  <Typography
                    sx={{
                      color: "white",
                      fontSize: "20px",
                      fontWeight: "bold",
                    }}
                  >
                    VẬT LIỆU
                  </Typography>
                </Button>
              </Stack>
            ) : (
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                    px: 4,
                    py: 1.5,
                  }}
                  href="/businessinfor?tab=designer"
                >
                  <Typography
                    sx={{
                      color: "white",
                      fontSize: "20px",
                      fontWeight: "bold",
                    }}
                  >
                    Nhà Thiết Kế
                  </Typography>
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                    px: 4,
                    py: 1.5,
                  }}
                  href="/businessinfor?tab=supplier"
                >
                  <Typography
                    sx={{
                      color: "white",
                      fontSize: "20px",
                      fontWeight: "bold",
                    }}
                  >
                    Nhà Cung Cấp
                  </Typography>
                </Button>

                <Button
                  variant="outlined"
                  sx={{
                    color: "white",
                    borderColor: "white",
                    display: "flex",
                    alignItems: "center",
                    textAlign: "center",
                    justifyContent: "center",
                  }}
                  href="/signup"
                >
                  <Box
                    sx={{
                      display: "flex",
                      width: "100%",
                      margin: "0 auto",
                      alignItems: "center",
                      padding: "10px 20px",
                      fontSize: "20px",
                      fontWeight: "bold",
                    }}
                  >
                    Đăng ký
                  </Box>
                </Button>
              </Stack>
            )}
          </Box>
        </Box>
        {/* Thông Tin Bền Vững */}
        <Box
          sx={{
            padding: "40px 10px",
            position: "relative",
            backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)),
            url('${sustain}')
          `,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <Grid
            container
            spacing={3}
            justifyContent="space-between"
            alignItems="center"
            sx={{ maxWidth: 1200, margin: "0 auto" }}
          >
            {[
              { quantity: materials.length || 0, unit: "+", label: "Vật Liệu" },
              { quantity: designs.length || 0, unit: "+", label: "Thiết Kế" },
              {
                quantity: designers.length || 0,
                unit: "+",
                label: "Nhà Thiết Kế",
              },
              {
                quantity: suppliers.length || 0,
                unit: "+",
                label: "Nhà Cung Cấp",
              },
            ].map((item, index) => (
              <Grid key={index} textAlign="center">
                <Typography
                  variant="h3"
                  component="div"
                  sx={{ color: "rgba(52, 168, 83, 1)", fontWeight: "bold" }}
                >
                  <CountUp end={item.quantity} />
                  <Typography
                    component="span"
                    sx={{ fontSize: "2.5rem", marginLeft: "4px" }}
                  >
                    {item.unit}
                  </Typography>
                </Typography>
                <Typography
                  variant="h5"
                  component="div"
                  sx={{ fontWeight: "bold", fontSize: "30px", color: "black" }}
                >
                  {item.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Grid>

      {/* Truy Cập Nhanh  */}
      <Grid sx={{ maxWidth: 1200, margin: "30px auto" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: { xs: "center", md: "space-between" },
            width: "100%",
            margin: "30px auto",
            gap: { xs: 4, md: 5 },
            px: { xs: 2, md: 0 },
          }}
        >
          <Box>
            <Box
              component="img"
              src={fashion}
              sx={{ width: "100%", height: "60%" }}
            />
            <Typography variant="h5" fontWeight="bold" sx={{ mt: 2 }}>
              Khám phá xu hướng thời trang bền vững hiện nay
            </Typography>
            <Stack direction="row" alignItems="center" sx={{ mt: 1 }}>
              <Button
                variant="text"
                sx={{
                  fontSize: 25,
                  fontWeight: "bold",
                  color: "rgba(52,168,83,1)",
                  textTransform: "none",
                }}
                href="/fashion"
              >
                Khám Phá
                <svg
                  viewBox="0 0 32 32"
                  width={30}
                  style={{ fill: "rgba(52,168,83,1)", marginLeft: 8 }}
                >
                  <path d="M22,9a1,1,0,0,0,0,1.42l4.6,4.6H3.06a1,1,0,1,0,0,2H26.58L22,21.59A1,1,0,0,0,22,23a1,1,0,0,0,1.41,0l6.36-6.36a.88.88,0,0,0,0-1.27L23.42,9A1,1,0,0,0,22,9Z" />
                </svg>
              </Button>
            </Stack>
          </Box>

          <Box>
            <Box
              component="img"
              src={material}
              sx={{ width: "100%", height: "60%" }}
            />
            <Typography variant="h5" fontWeight="bold" sx={{ mt: 2 }}>
              Lựa chọn vật liệu bền vững với chất lượng tuyệt vời
            </Typography>
            <Stack direction="row" alignItems="center" sx={{ mt: 1 }}>
              <Button
                variant="text"
                sx={{
                  fontSize: 25,
                  fontWeight: "bold",
                  color: "rgba(52,168,83,1)",
                  textTransform: "none",
                }}
                onClick={() => navigate("/materials")}
              >
                Khám Phá
                <svg
                  viewBox="0 0 32 32"
                  width={30}
                  style={{ fill: "rgba(52,168,83,1)", marginLeft: 8 }}
                >
                  <path d="M22,9a1,1,0,0,0,0,1.42l4.6,4.6H3.06a1,1,0,1,0,0,2H26.58L22,21.59A1,1,0,0,0,22,23a1,1,0,0,0,1.41,0l6.36-6.36a.88.88,0,0,0,0-1.27L23.42,9A1,1,0,0,0,22,9Z" />
                </svg>
              </Button>
            </Stack>
          </Box>
        </Box>
      </Grid>

      {/* Bán Hàng */}
      <Box
        sx={{
          p: 4,
          background: "#f5f5f5",
        }}
      >
        {/* Thời Trang Mới */}
        <FashionsSection
          products={designs}
          title="SẢN PHẨM NỔI BẬT"
          type="special"
          onProductClick={(design) =>
            navigate(
              `/detail/${design.designId}/${design.designer?.designerId}`
            )
          } // Navigate to Detail page with designerId
          onViewMore={() => "/fashion"}
        />
        <Divider
          sx={{ height: "2px", backgroundColor: "black", opacity: "20%" }}
        />
        {/* Bán Chạy Nhất */}
        {/* <FashionsSection
          products={designs}
          title="BÁN CHẠY NHẤT"
          type="special"
          onViewMore={() => "/fashion"}
        /> */}
        <Divider
          sx={{ height: "2px", backgroundColor: "black", opacity: "20%" }}
        />
        {/* Nguyên Vật Liệu */}
        <MaterialsSection
          materials={materials} // Truyền toàn bộ materials để next/back hoạt động
          title="NGUYÊN LIỆU NỔI BẬT"
          type="special"
          loading={materialsLoading}
          error={materialsError}
          onMaterialSelect={(material) => {
            navigate(`/material/${material.materialId}`);
          }}
          onViewMore={() => {
            navigate("/materials");
          }}
        />
      </Box>
      {/* Thông Tin Chi Tiết */}
      <Box sx={{ bgcolor: "#fff", py: 6, px: 4, display: "flex" }}>
        {/* Text Section */}
        <Grid>
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Hướng tới Thời trang Bền vững
          </Typography>
          <Typography>
            Ngành thời trang là một trong những ngành gây ô nhiễm lớn nhất trên
            toàn cầu. Tại EcoFashion, chúng tôi đang thay đổi điều đó bằng cách
            thúc đẩy các nguyên tắc kinh tế tuần hoàn và thực hành bền vững.
          </Typography>

          <List sx={{ mt: 3 }}>
            {/* Item 1 */}
            <ListItem sx={{ alignItems: "flex-start", pl: 0 }}>
              <EcoIcon />
              <Box>
                <Typography fontWeight="bold">Giảm Thiểu Rác Thải</Typography>
                <Typography>
                  Nền tảng của chúng tôi đã góp phần chuyển hướng hơn 5 tấn rác
                  thải dệt may khỏi bãi chôn lấp.
                </Typography>
              </Box>
            </ListItem>

            {/* Item 2 */}
            <ListItem sx={{ alignItems: "flex-start", pl: 0 }}>
              <EcoIcon />
              <Box>
                <Typography fontWeight="bold">Bảo Tồn Nguồn Nước</Typography>
                <Typography>
                  Các sản phẩm trên nền tảng của chúng tôi sử dụng ít hơn 70%
                  lượng nước so với thời trang thông thường.
                </Typography>
              </Box>
            </ListItem>

            {/* Item 3 */}
            <ListItem sx={{ alignItems: "flex-start", pl: 0 }}>
              <EcoIcon />
              <Box>
                <Typography fontWeight="bold">Giảm Dấu Chân Carbon</Typography>
                <Typography>
                  Việc tối ưu hóa chuỗi cung ứng của chúng tôi giúp giảm lượng
                  khí thải carbon lên đến 60%.
                </Typography>
              </Box>
            </ListItem>
          </List>

          <Button
            variant="contained"
            sx={{
              mt: 3,
              bgcolor: "#00a651",
              "&:hover": { bgcolor: "#008b45" },
            }}
            onClick={() => navigate("/businessinfor")}
          >
            Tìm hiểu thêm ➞
          </Button>
        </Grid>

        {/* Image Section */}
        <Grid display="flex" justifyContent="center">
          <Box
            component="img"
            src={information}
            alt="Sustainable Fashion"
            sx={{ maxWidth: "80%", height: "auto" }}
          />
        </Grid>
      </Box>
      {/* About Us */}
      <Box
        sx={{
          backgroundColor: "rgba(18, 96, 77, 1)",
          textAlign: "center",
          py: 5,
        }}
      >
        <Container>
          <Typography variant="h4" sx={{ color: "white", mb: 2 }}>
            Tham Gia Vào EcoFashion
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "white",
              fontSize: "20px",
              width: "80%",
              mx: "auto",
              mb: 3,
            }}
          >
            Dù bạn là nhà thiết kế, nhà cung cấp hay người có ý thức về Bảo Vệ
            Môi trường, cộng đồng của chúng tôi luôn có chỗ dành cho bạn.
          </Typography>

          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            flexWrap="wrap"
          >
            {!user && (
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "white",
                  color: "rgba(52, 168, 83, 1)",
                  "&:hover": {
                    backgroundColor: "#f0f0f0",
                  },
                  fontWeight: "bold",
                }}
                onClick={() => navigate("/signup")}
              >
                Đăng Ký
              </Button>
            )}
            <Button
              variant="outlined"
              sx={{
                color: "white",
                borderColor: "white",
                "&:hover": {
                  borderColor: "#ddd",
                },
              }}
              onClick={() => navigate("/about")}
            >
              Về Chúng Tôi
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Fab
          size="medium"
          onClick={scrollToTop}
          sx={{
            position: "fixed",
            bottom: 32,
            right: 32,
            zIndex: 1000,
            boxShadow: 3,
            backgroundColor: "#4CAF50", // Green color for Eco theme
            color: "white",
            borderRadius: 2, // Square shape instead of circle
            "&:hover": {
              backgroundColor: "#45a049",
              transform: "scale(1.1)",
              transition: "transform 0.2s",
            },
          }}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      )}
    </Box>
  );
}
