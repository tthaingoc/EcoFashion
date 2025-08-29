import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  ImageList,
  ImageListItem,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Rating,
  Select,
  Stack,
  styled,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Typography,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import React, { useEffect, useRef, useState } from "react";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import StarIcon from "@mui/icons-material/Star";
import GroupIcon from "@mui/icons-material/Group";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import DesignServicesOutlinedIcon from "@mui/icons-material/DesignServicesOutlined";
import AddIcon from "@mui/icons-material/Add";
import DesignerOrders from "./DesignerOrders";
import {
  DressIcon,
  EcoIcon,
  ShirtIcon,
  SkirtIcon,
  TrouserIcon,
} from "../../assets/icons/icon";
import EditIcon from "@mui/icons-material/Edit";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import DeleteIcon from "@mui/icons-material/Delete";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import AirIcon from "@mui/icons-material/Air";
import CompostIcon from "@mui/icons-material/Compost";
import CloseIcon from "@mui/icons-material/Close";

//image
import DesignDefaultImage from "../../assets/pictures/fashion/design-default-image.jpg";

//Icon
import { CircularProgress } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import SellIcon from "@mui/icons-material/Sell";

//Chart
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Legend,
} from "chart.js";
import DesignService, {
  Design,
  DesignDraftDetails,
  FullProductDetail,
  MaterialInStored,
  StoredMaterial,
  UpdateProductDetail,
} from "../../services/api/designService";
import { toast } from "react-toastify";
import { useAuthStore } from "../../store/authStore";
import DesignVariantService, {
  AddVariant,
  FullDesignVariant,
  UpdateVariant,
} from "../../services/api/designVariantService";
import { Controller, useForm } from "react-hook-form";
import FileUpload from "../../components/FileUpload";
import {
  createProductSchema,
  CreateProductSchemaFormValues,
} from "../../schemas/createProductSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import ProductService from "../../services/api/productService";
import { Link } from "react-router-dom";
// import { useConfirm } from "material-ui-confirm";
import InventoryTransactionsService, {
  ProductInventoryTransactions,
} from "../../services/api/inventoryTransactionsService";
import { useCartStore } from "../../store/cartStore";
import { Description } from "@mui/icons-material";
// Register chart components
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Legend
);

export default function DesignerDashBoard() {
  window.scrollTo(0, 0);
  const stats = [
    {
      title: "Tổng Sản Phẩm",
      value: "24",
      subtitle: "3 sản phẩm mới tháng này",
      icon: <LocalMallOutlinedIcon />,
      color: "success.main",
    },
    {
      title: "Tổng Doanh Thu",
      value: "3.800.000đ",
      subtitle: "Tăng 12%",
      icon: <TrendingUpIcon />,
      color: "info.main",
    },
    {
      title: "Đánh Giá Trung Bình",
      value: "24",
      subtitle: "3 sản phẩm mới tháng này",
      icon: <StarIcon />,
      color: "warning.main",
    },
    {
      title: "Cộng Đồng",
      value: "156",
      subtitle: "12 lượt theo dõi mới",
      icon: <GroupIcon />,
      color: "secondary.main",
    },
  ];

  const orders = [
    {
      orderId: "ORD-01",
      product: "Áo Khoác Denim Tái Chế",
      status: 1, //1: Đang Vận Chuyển, 2: Chưa Xử Lý, 3: Đã Giao Hàng
    },
    {
      orderId: "ORD-02",
      product: "Túi Tote Tái Chế (2 cái)",
      status: 2, //1: Đang Vận Chuyển, 2: Chưa Xử Lý, 3: Đã Giao Hàng
    },
    {
      orderId: "ORD-03",
      product: "Khăn Choàng Thân Với Môi Trường",
      status: 3, //1: Đang Vận Chuyển, 2: Chưa Xử Lý, 3: Đã Giao Hàng
    },
  ];

  //Design Data
  const [designs, setDesigns] = useState<Design[]>([]);
  //Material Data
  const [storedMaterial, setStoredMaterial] = useState<StoredMaterial[]>([]);
  //Design Have Product Data
  const [designProduct, setDesignProduct] = useState<Design[]>([]);
  //Loading
  const [loading, setLoading] = useState(true);
  //PageLoading
  const [pageLoading, setPageLoading] = useState(true);
  //Error
  const [error, setError] = useState<string | null>(null);
  // Zustand stores
  const { getDesignerId } = useAuthStore();
  //Confirm delete
  // const confirm = useConfirm();
  //Hiện thông tin product
  const [selectedDesign, setSelectedDesign] = useState(null);
  //Lấy thông tin trong inventory
  const [inventoryTransactions, setInventoryTransactions] = useState<
    ProductInventoryTransactions[]
  >([]);

  useEffect(() => {
    loadDesigners();
  }, []);

  const loadDesigners = async () => {
    try {
      setLoading(true);
      setPageLoading(true);
      setError(null);
      const designData = await DesignService.getAllDesignByDesigner(
        getDesignerId()
      );
      setDesigns(designData);

      const materialData = await DesignService.getStoredMaterial(
        getDesignerId()
      );
      setStoredMaterial(materialData);
      console.log("Stored Material: ", materialData);

      const designProductData = await DesignService.getAllDesignProuct(
        getDesignerId()
      );
      setDesignProduct(designProductData);

      const inventoryTransactionsData =
        await InventoryTransactionsService.getAllMaterialInventoryByDesigner();
      setInventoryTransactions(inventoryTransactionsData);
    } catch (error: any) {
      const errorMessage =
        error.message || "Không thể tải danh sách nhà thiết kế";
      setError(errorMessage);
      toast.error(errorMessage, { position: "bottom-center" });
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  };

  //Get Material Used In Design
  const currentDesign = designs.find(
    (design) => design.designId === selectedDesign?.designId
  );

  const [productInfo, setProductInfo] = useState({
    designId: 0,
    productName: "",
    description: "",
    careInstruction: "",
    designFeatures: {
      ReduceWaste: false,
      LowImpactDyes: false,
      Durable: false,
      EthicallyManufactured: false,
    },
    designImages: null,
    files: null,
  });

  // Mỗi lần đổi currentDesign thì update state
  useEffect(() => {
    if (currentDesign) {
      setProductInfo({
        designId: currentDesign.designId || 0,
        productName: currentDesign.name || "",
        description: currentDesign.description || "",
        careInstruction: currentDesign.careInstruction || "",
        designFeatures: {
          ReduceWaste: currentDesign.designFeatures?.reduceWaste || false,
          LowImpactDyes: currentDesign.designFeatures?.lowImpactDyes || false,
          Durable: currentDesign.designFeatures?.durable || false,
          EthicallyManufactured:
            currentDesign.designFeatures?.ethicallyManufactured || false,
        },
        designImages: null,
        files: null,
      });
    }
  }, [currentDesign]);

  const [mainImage, setMainImage] = useState<string>("");
  // Cập nhật state khi user nhập
  const handleProductDetailChange = (field: string, value: string) => {
    setProductInfo((prev) => ({ ...prev, [field]: value }));
  };

  // Cập nhật checkbox
  const handleDesignFeatureChange = (feature: string, checked: boolean) => {
    setProductInfo((prev) => ({
      ...prev,
      designFeatures: { ...prev.designFeatures, [feature]: checked },
    }));
  };

  //Get Material Used In Stored
  const getMatchingStoredMaterials = () => {
    if (!currentDesign || !storedMaterial) return [];

    // Lọc các storedMaterial có id trùng với material trong currentDesign
    return storedMaterial.filter((storedMat) =>
      currentDesign.materials.some(
        (mat) => mat.materialId === storedMat.materialId
      )
    );
  };

  // Lấy matching stored materials
  const matchingMaterials = getMatchingStoredMaterials();

  const yearData = [
    { label: "Jan", revenue: 64854, cost: 32652 },
    { label: "Feb", revenue: 54628, cost: 42393 },
    { label: "Mar", revenue: 117238, cost: 50262 },
    { label: "Apr", revenue: 82830, cost: 64731 },
    { label: "May", revenue: 91208, cost: 41893 },
    { label: "Jun", revenue: 103609, cost: 83809 },
    { label: "Jul", revenue: 90974, cost: 44772 },
    { label: "Aug", revenue: 82919, cost: 37590 },
    { label: "Sep", revenue: 62407, cost: 43349 },
    { label: "Oct", revenue: 82528, cost: 45324 },
    { label: "Nov", revenue: 56979, cost: 47978 },
    { label: "Dec", revenue: 87436, cost: 39175 },
  ];

  const weekData = [
    { label: "Mon", revenue: 12000, cost: 5000 },
    { label: "Tue", revenue: 9000, cost: 4500 },
    { label: "Wed", revenue: 15000, cost: 6000 },
    { label: "Thu", revenue: 11000, cost: 4000 },
    { label: "Fri", revenue: 16000, cost: 7000 },
    { label: "Sat", revenue: 18000, cost: 8000 },
    { label: "Sun", revenue: 10000, cost: 3000 },
  ];

  const monthData = [
    { label: "Week 1", revenue: 50000, cost: 23000 },
    { label: "Week 2", revenue: 62000, cost: 27000 },
    { label: "Week 3", revenue: 58000, cost: 24000 },
    { label: "Week 4", revenue: 60000, cost: 25000 },
  ];

  const [range, setRange] = useState("year");

  const getCurrentData = () => {
    if (range === "week") return weekData;
    if (range === "month") return monthData;
    return yearData;
  };
  const chartData = getCurrentData();

  const { user } = useAuthStore();
  //Change Tabs
  const [tabIndex, setTabIndex] = useState(0);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");

    if (tab === "design") setTabIndex(2);
  }, [location.search]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const generateMockMaterial = (inventory: StoredMaterial[]) => {
    return inventory.map((inventory) => ({
      id: inventory.materialId,
      material: inventory.material.name,
      quantity: inventory.quantity,
      quantityAvailable: inventory.material.quantityAvailable,
      status:
        inventory.quantity <= 0
          ? "Hết Hàng"
          : inventory.quantity < 30
          ? "Sắp Hết Hàng"
          : "Còn Hàng",
      supplier: inventory.material.supplierName,
      costPerUnit: new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(inventory.material.pricePerUnit),
      totalValue: new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(inventory.cost),
      creatAt: new Date(inventory.lastBuyDate).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    }));
  };
  type MaterialRow = ReturnType<typeof generateMockMaterial>[number];

  const [openMaterial, setOpenMaterial] = useState(false);

  const material_columns: GridColDef<MaterialRow>[] = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "material",
      headerName: "Chất Liệu",
      flex: 1,
      renderCell: (params) => (
        <Link
          to={`/material/${params.row.id}`} // hoặc params.row.MaterialId
          target="_blank"
          style={{ color: "#1976d2", textDecoration: "underline" }}
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: "quantity",
      headerName: "Số Lượng (m)",
      width: 110,
      flex: 1,
    },
    {
      field: "status",
      headerName: "Trạng Thái",
      width: 110,
      renderCell: (params) => {
        let color:
          | "default"
          | "warning"
          | "secondary"
          | "error"
          | "info"
          | "success"
          | "primary" = "default";
        switch (params.value) {
          case "Còn Hàng":
            color = "success";
            break;
          case "Sắp Hết Hàng":
            color = "warning";
            break;
          case "Hết Hàng":
            color = "error";
            break;
          default:
            color = "primary";
        }

        return <Chip label={params.value} color={color} size="small" />;
      },
      flex: 1,
    },
    {
      field: "supplier",
      headerName: "Nhà Cung Cấp",
      width: 110,
      flex: 1,
    },
    {
      field: "costPerUnit",
      headerName: "Giá 1 Mét Vải",
      width: 110,
      flex: 1,
    },
    {
      field: "totalValue",
      headerName: "Tổng Tiền Chi",
      width: 110,
      flex: 1,
    },
    {
      field: "creatAt",
      headerName: "Ngày Cập Nhật",
      width: 150,
      flex: 1,
    },
    {
      field: "quantityAvailable",
      headerName: "NCC Còn (m)",
      width: 110,
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Hành Động",
      width: 120,
      sortable: false,
      filterable: false,
      headerAlign: "right",
      disableColumnMenu: true,
      renderCell: (params) => {
        const [openDialog, setOpenDialog] = useState(false);
        const [quantity, setQuantity] = useState(1);

        const handleOpenDialog = () => {
          setOpenDialog(true);
        };

        const handleCloseDialog = () => {
          setOpenDialog(false);
          setQuantity(1);
        };

        const handleMaterialToCart = async (
          material: any,
          quantity: number
        ) => {
          const safeQuantity = Math.abs(quantity);
          const available = material.quantityAvailable || 0;

          if (safeQuantity === 0) {
            toast.error("Số lượng phải lớn hơn 0!");
            return;
          }

          let finalQuantity = safeQuantity;

          if (safeQuantity > available) {
            finalQuantity = available; // 🔑 lấy toàn bộ tồn kho
            toast.warning(
              `Bạn yêu cầu ${safeQuantity} mét nhưng chỉ còn ${available} mét. Đã thêm toàn bộ tồn kho vào giỏ hàng.`
            );
          }

          await addToCart({
            materialId: material.id || 0,
            quantity: finalQuantity,
          });

          setOpenCreateDialog(false);

          toast.success(
            `Đã thêm ${finalQuantity} mét ${
              material.name || "Nguyên liệu"
            } vào giỏ hàng! 💡 Kiểm tra số lượng trong giỏ hàng.`
          );
        };

        return (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                width: "100%",
              }}
            >
              <Stack direction="row" spacing={1}>
                <Tooltip title="Mua Vật Liệu" arrow>
                  <IconButton
                    size="small"
                    onClick={handleOpenDialog}
                    color="primary"
                  >
                    <AddBusinessIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
              <DialogTitle>Xác nhận thêm vào giỏ hàng</DialogTitle>
              <DialogContent dividers>
                <Box mb={2}>
                  Bạn có chắc muốn thêm <strong>{params.row.material}</strong>{" "}
                  vào giỏ hàng không?
                </Box>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent={"space-between"}
                  width={"100%"}
                  gap={1}
                  mb={2}
                >
                  <TextField
                    label="Số lượng"
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const max = params.row.quantityAvailable || 9999;
                      if (val < 1) setQuantity(1);
                      else if (val > max) setQuantity(max);
                      else setQuantity(val);
                    }}
                    InputProps={{
                      inputProps: {
                        min: 1,
                        max: params.row.quantityAvailable || 9999,
                      },
                    }}
                    sx={{ width: "100%" }}
                  />
                  <Typography variant="body2">
                    /{params.row.quantityAvailable}m
                  </Typography>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Hủy</Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleMaterialToCart(params.row, quantity)}
                >
                  Thêm vào giỏ
                </Button>
              </DialogActions>
            </Dialog>
          </>
        );
      },
      flex: 1,
    },
  ];

  const totalMaterials = storedMaterial.length;
  const totalCost = storedMaterial.reduce(
    (sum, m) => sum + m.material.pricePerUnit * m.quantity,
    0
  );
  const lowStockCount = storedMaterial.filter(
    (m) => m.quantity > 0 && m.quantity < 30
  ).length;
  const totalMeters = storedMaterial.reduce((sum, m) => sum + m.quantity, 0);

  const material_stats = [
    {
      title: "Tổng Vật Liệu",
      value: totalMaterials,
      subtitle: "Tổng Tất Cả Các Loại Chất Liệu",
      icon: <LocalMallOutlinedIcon />,
      color: "success.main",
    },
    {
      title: "Tổng Tiền Vật Liệu",
      value: totalCost.toLocaleString("vi-VN") + "đ",
      subtitle: "Tổng Số Tiền Đã Chi",
      icon: <TrendingUpIcon />,
      color: "info.main",
    },
    {
      title: "Vật Liệu Sắp Hết",
      value: lowStockCount,
      subtitle: "Loại Cần Đặt",
      icon: <StarIcon />,
      color: "warning.main",
    },
    {
      title: "Tổng Mét Vải Hiện Có",
      value: totalMeters.toLocaleString("vi-VN"),
      subtitle: "Mét Vải Hiện Có Trong Kho",
      icon: <SellIcon />,
      color: "warning.main",
    },
  ];

  const [open, setOpen] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  const handleClickOpen = (image: string) => {
    setOpen(true);
    setSelectedImage(image);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedImage(null);
  };

  const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialogContent-root": {
      padding: theme.spacing(2),
    },
    "& .MuiDialogActions-root": {
      padding: theme.spacing(1),
    },
  }));
  const generateMockDesigns = (designs: Design[]) => {
    return designs.map((design) => ({
      id: design.designId,
      title: design.name,
      image: design.drafSketches[0] || "", // hoặc ảnh mặc địn
      price: new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(design.salePrice),
      recycledPercentage: design.recycledPercentage,
      material: design.materials,
      typeName: design.itemTypeName,
      designVariants: design.designsVariants,
    }));
  };

  const getCategoryColor = (category?: string): string => {
    if (!category) return "#9e9e9e"; // default grey
    const colors: Record<string, string> = {
      Áo: "#2196f3",
      Quần: "#ff9800",
      Đầm: "#4caf50",
      Váy: "#9c27b0",
    };
    return colors[category.normalize("NFC")] || "#9e9e9e";
  };

  const getCategoryIcon = (category?: string) => {
    if (!category) return null;
    const icons: Record<string, React.ReactNode> = {
      Áo: <ShirtIcon />,
      Quần: <TrouserIcon />,
      Đầm: <DressIcon />,
      Váy: <SkirtIcon />,
    };
    return icons[category.normalize("NFC")] || null;
  };

  //Open Dialog
  const [openEditDialog, setOpenEditDialog] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<FashionRow | null>(
    null
  );

  const [variant, setVariant] = useState<FullDesignVariant[]>([]);
  useEffect(() => {
    if (openEditDialog) {
      getVariantByDesignId(selectedItem.id);
    }
  }, [openEditDialog]);

  const getVariantByDesignId = async (id: number) => {
    try {
      const response = await DesignVariantService.getVariantsByDesignIdAsync(
        id
      );
      setVariant(response);
      setVariantRows(generateMockVariant(response)); // cập nhật DataGrid
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách variant");
    }
  };

  const handleEdit = (item: FashionRow) => {
    setSelectedItem(item);
    setOpenEditDialog(true);
  };

  type FashionRow = ReturnType<typeof generateMockDesigns>[number];

  //Open Draft Detail Dialog
  const [openDesignDraftDetailDialog, setOpenDesignDraftDetailDialog] =
    React.useState(false);

  const [designDraftDetail, setDesignDraftDetail] =
    useState<DesignDraftDetails>();

  const handleViewDesignDraftDetail = async (item: FashionRow) => {
    setSelectedItem(item);
    setOpenDesignDraftDetailDialog(true);
  };

  useEffect(() => {
    if (openDesignDraftDetailDialog) {
      getDesignDraftDetail(selectedItem.id);
    }
  }, [openDesignDraftDetailDialog]);

  const getDesignDraftDetail = async (designId: number) => {
    try {
      const response = await DesignService.getDesignDraftDetailAsync(designId);
      setDesignDraftDetail(response);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách variant");
    }
  };

  const fashion_columns: GridColDef<FashionRow>[] = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "image",
      headerName: "Rập",
      width: 110,
      flex: 1,
      renderCell: (params) => {
        return (
          <>
            {params.row.image ? (
              <Box
                sx={{
                  display: "flex",
                  height: "100%",
                  width: "100%",
                }}
                onClick={() => handleClickOpen(params.row.image)}
              >
                <img
                  src={params.row.image}
                  alt="Sản Phẩm"
                  style={{
                    width: 50,
                    height: 50,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  height: "100%",
                  width: "100%",
                }}
                onClick={() => handleClickOpen(DesignDefaultImage)}
              >
                <img
                  src={DesignDefaultImage}
                  alt="Sản Phẩm"
                  style={{
                    width: 50,
                    height: 50,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              </Box>
            )}
          </>
        );
      },
    },
    {
      field: "title",
      headerName: "Tên Rập",
      width: 110,
      flex: 1,
    },
    {
      field: "price",
      headerName: "Giá",
      width: 110,
      flex: 1,
    },
    {
      field: "recycledPercentage",
      headerName: "Điểm Bền Vững",
      width: 110,
      flex: 1,
      renderCell: (params) => {
        return (
          <Chip
            icon={<EcoIcon />}
            label={`${params.row.recycledPercentage}% Bền Vững`}
            size="small"
            sx={{
              backgroundColor: "rgba(200, 248, 217, 1)",
              color: "rgba(22, 103, 86, 1)",
              fontSize: "15px",
            }}
          />
        );
      },
    },
    {
      field: "typeName",
      headerName: "Loại Thời Trang",
      width: 110,
      flex: 1,
      renderCell: (params) => {
        return (
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
                {getCategoryIcon(params.row.typeName)}
              </Box>
            }
            label={params.row.typeName}
            size="small"
            sx={{
              bgcolor: getCategoryColor(params.row.typeName),
              color: "white",
              fontWeight: "bold",
              fontSize: "1rem",
              paddingTop: 2,
              paddingBottom: 2,
            }}
          />
        );
      },
    },
    {
      field: "designVariants",
      headerName: "Kế Hoạch Thiết Kế",
      width: 110,
      flex: 1,
      renderCell: (params) => {
        const hasVariants =
          Array.isArray(params.row.designVariants) &&
          params.row.designVariants.length > 0;

        return (
          <Chip
            label={hasVariants ? "Có Kế Hoạch" : "Chưa Có"}
            size="medium"
            sx={{
              bgcolor: hasVariants ? "success.main" : "grey.500",
              color: "white",
              fontWeight: "bold",
            }}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Hành Động",
      width: 120,
      sortable: false,
      filterable: false,
      headerAlign: "right",
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}
          >
            <Stack direction="row" spacing={1}>
              <Tooltip title="Thông tin rập" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleViewDesignDraftDetail(params.row)}
                  color="primary"
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Chi tiết kế hoạch" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleEdit(params.row)}
                  color="primary"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Xóa rập" arrow>
                <IconButton
                  size="small"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Bạn có chắc chắn muốn xoá variant này không?"
                      )
                    ) {
                      handleDeleteDesign(params.row.id);
                    }
                  }}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        );
      },
      flex: 1,
    },
  ];

  const handleDeleteDesign = async (designId: number) => {
    try {
      const result = await DesignService.deleteDesign(designId);
      if (result) {
        // 🔄 Reload lại danh sách từ server
        const designData = await DesignService.getAllDesignByDesigner(
          getDesignerId()
        );
        setDesigns(designData);
        toast.success("Xoá thành công!");
      } else {
        toast.error("Thiết Kế Đã Có Sản Phẩm");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Có lỗi khi xoá");
    }
  };

  const mapColorCodeToHex = (code) => {
    switch (code.toUpperCase()) {
      case "BLK":
        return "#000000";
      case "RED":
        return "#FF0000";
      case "BLU":
        return "#0000FF";
      case "WHT":
        return "#FFFFFF";
      case "GRN":
        return "#00ff04ff";
      // thêm các mã khác tùy ý
      default:
        return code;
    }
  };

  const [addingNew, setAddingNew] = useState(false);
  const [newVariant, setNewVariant] = useState({
    sizeName: "",
    colorCode: "",
    quantity: "",
  });

  const sizeOptions = [
    { value: 1, label: "S" },
    { value: 2, label: "M" },
    { value: 3, label: "L" },
    { value: 4, label: "XL" },
  ];

  const sizeMapReverse = {
    1: "S",
    2: "M",
    3: "L",
    4: "XL",
  };

  const reloadTab2 = async () => {
    try {
      const designData = await DesignService.getAllDesignByDesigner(
        getDesignerId()
      );
      setDesigns(designData);
    } catch (error) {
      console.error("Lỗi khi load lại tab 2:", error);
    }
  };

  const handleAddVariant = async () => {
    if (!newVariant.sizeName || !newVariant.colorCode || !newVariant.quantity) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const sizeId = Number(newVariant.sizeName);
    const quantityToAdd = Number(newVariant.quantity);
    const colorCode = newVariant.colorCode;

    try {
      setLoading(true);

      const addNewVariant: AddVariant = {
        sizeId,
        colorCode,
        quantity: quantityToAdd,
      };

      await DesignVariantService.creatVariantsByDesignIdAsync(
        selectedItem.id,
        addNewVariant
      );

      //Reload lại danh sách từ server
      await getVariantByDesignId(selectedItem.id);

      toast.success("Lưu thành công!");
      setAddingNew(false);
      setNewVariant({ sizeName: "", colorCode: "", quantity: "" });

      if (tabIndex === 2) {
        reloadTab2();
      }
    } catch (err) {
      console.error("❌ Error submitting application:", err);
      toast.error("Có lỗi xảy ra khi gửi đơn.");
    } finally {
      setLoading(false);
    }
  };

  const colorOptions = [
    { name: "Đen", hex: "#000000" },
    { name: "Trắng", hex: "#FFFFFF" },
    { name: "Đỏ", hex: "#FF0000" },
    { name: "Xanh lá", hex: "#008000" },
    { name: "Xanh dương", hex: "#0000FF" },
    { name: "Vàng", hex: "#FFFF00" },
    { name: "Lục lam", hex: "#00FFFF" },
    { name: "Đỏ tươi", hex: "#FF00FF" },
    { name: "Bạc", hex: "#C0C0C0" },
    { name: "Xám", hex: "#808080" },
    { name: "Nâu", hex: "#800000" },
  ];

  //Design Product
  //Open DesignProduct Dialog
  const [openViewProductDialog, setOpenViewProductDialog] =
    React.useState(false);
  const [selectedDesignProduct, setSelectedDesignProduct] =
    React.useState<DesignProductRow | null>(null);

  //Open DesignProductDetail Dialog
  const [openViewProductDetailDialog, setOpenViewProductDetailDialog] =
    React.useState(false);
  const [selectedProductDetail, setSelectedProductDetail] =
    React.useState<DesignProductRow | null>(null);
  //Edit Design Product Detail
  const [editMode, setEditMode] = useState(false);

  const handleViewProduct = (item: DesignProductRow) => {
    setSelectedDesignProduct(item);
    setOpenViewProductDialog(true);
  };

  const handleViewProductDetail = (item: any) => {
    setSelectedProductDetail(item);
    setOpenViewProductDetailDialog(true);
  };

  useEffect(() => {
    const initialFiles: File[] = [];
    if (selectedProductDetail) {
      setProductInfo({
        designId: selectedProductDetail.id || 0,
        productName: selectedProductDetail.title || "",
        description: selectedProductDetail.description || "",
        careInstruction: selectedProductDetail.careInstruction || "",
        designFeatures: {
          ReduceWaste:
            selectedProductDetail.designFeatures?.reduceWaste || false,
          LowImpactDyes:
            selectedProductDetail.designFeatures?.lowImpactDyes || false,
          Durable: selectedProductDetail.designFeatures?.durable || false,
          EthicallyManufactured:
            selectedProductDetail.designFeatures?.ethicallyManufactured ||
            false,
        },
        designImages: selectedProductDetail?.image,
        files: initialFiles,
      });
    }
  }, [selectedProductDetail]);

  // Cập nhật mainImage khi designImages thay đổi
  useEffect(() => {
    if (productInfo.designImages && productInfo.designImages.length > 0) {
      setMainImage(productInfo.designImages[0]);
    } else {
      setMainImage(""); // hoặc một placeholder image
    }
  }, [productInfo.designImages]);
  const handleUpdateProductDetail = async () => {
    try {
      await DesignService.updateProductDetailAsync(productInfo);
      toast.success("Cập nhật thành công!");
      if (tabIndex === 1) {
        reloadTabProduct();
        reloadTab2();
      }
    } catch (err: any) {
      console.error("Cập nhật thất bại:", err);
      toast.error(err.message || "Có lỗi khi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  const generateMockDesignProducts = (designs: Design[]) => {
    return designs.map((design) => ({
      id: design.designId,
      title: design.name,
      image:
        design.designImageUrls && design.designImageUrls.length > 0
          ? design.designImageUrls
          : [""],
      price: new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(design.salePrice),
      recycledPercentage: design.recycledPercentage,
      material: design.materials?.map((mat) => mat.materialName) || [],
      typeName: design.itemTypeName,
      description: design.description,
      careInstruction: design.careInstruction,
      designFeatures: design.designFeatures,
    }));
  };

  type DesignProductRow = ReturnType<typeof generateMockDesignProducts>[number];

  //Sản Phẩm
  const designProduct_columns: GridColDef<DesignProductRow>[] = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "image",
      headerName: "Sản Phẩm",
      width: 110,
      flex: 1,
      renderCell: (params) => {
        const imageUrl =
          params.row.image && params.row.image.length > 0
            ? params.row.image[0] // ✅ chỉ lấy hình đầu tiên
            : DesignDefaultImage;

        return (
          <Box
            sx={{
              display: "flex",
              height: "100%",
              width: "100%",
            }}
            onClick={() => handleClickOpen(imageUrl)}
          >
            <img
              src={imageUrl}
              alt="Sản Phẩm"
              style={{
                width: 50,
                height: 50,
                objectFit: "cover",
                borderRadius: 8,
              }}
            />
          </Box>
        );
      },
    },
    {
      field: "title",
      headerName: "Tên Sản Phảm",
      width: 110,
      flex: 1,
      renderCell: (params) => (
        <Link
          to={`/detail/${params.row.id}/${getDesignerId()}`} // hoặc params.row.MaterialId
          target="_blank"
          style={{ color: "#1976d2", textDecoration: "underline" }}
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: "price",
      headerName: "Giá",
      width: 110,
      flex: 1,
    },
    {
      field: "recycledPercentage",
      headerName: "Điểm Bền Vững",
      width: 110,
      flex: 1,
      renderCell: (params) => {
        return (
          <Chip
            icon={<EcoIcon />}
            label={`${params.row.recycledPercentage}% Bền Vững`}
            size="small"
            sx={{
              backgroundColor: "rgba(200, 248, 217, 1)",
              color: "rgba(22, 103, 86, 1)",
              fontSize: "15px",
            }}
          />
        );
      },
    },
    {
      field: "typeName",
      headerName: "Loại Thời Trang",
      width: 110,
      flex: 1,
      renderCell: (params) => {
        return (
          <Chip
            icon={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                {getCategoryIcon(params.row.typeName)}
              </Box>
            }
            label={params.row.typeName}
            size="small"
            sx={{
              bgcolor: getCategoryColor(params.row.typeName),
              color: "white",
              fontWeight: "bold",
              fontSize: "1rem",
              paddingTop: 2,
              paddingBottom: 2,
            }}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Hành Động",
      width: 120,
      sortable: false,
      filterable: false,
      headerAlign: "right",
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}
          >
            <Stack direction="row" spacing={1}>
              <Tooltip title="Thông tin sản phẩm" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleViewProductDetail(params.row)}
                  color="primary"
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cập nhật sản phẩm" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleViewProduct(params.row)}
                  color="primary"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        );
      },
      flex: 1,
    },
  ];

  const [designProductDetail, setDesignProductDetail] = useState<
    FullProductDetail[]
  >([]);
  useEffect(() => {
    if (openViewProductDialog) {
      getDesingProductDetail(selectedDesignProduct.id);
    }
  }, [openViewProductDialog]);

  const getDesingProductDetail = async (id: number) => {
    try {
      const response = await DesignService.getDesignProductDetailsAsync(
        id,
        getDesignerId()
      );
      setDesignProductDetail(response); // giả sử data là thông tin bạn cần hiển thị dialog
    } catch (error) {
      console.error(error);
      // có thể hiện lỗi cho người dùng nếu muốn
    }
  };

  //Open CreateProduct Dialog
  const [openCreateDialog, setOpenCreateDialog] = React.useState(false);

  const handleOpenCreate = () => {
    setOpenCreateDialog(true);
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CreateProductSchemaFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      designId: 0, // hoặc 0 tuỳ schema của bạn
      images: [], // mảng file rỗng ban đầu
    },
  });

  const onSubmit = async (formData: CreateProductSchemaFormValues) => {
    const files: File[] = formData.images || [];
    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext !== "jpg" && ext !== "jpeg") {
        toast.error("Chỉ chấp nhận file JPG/JPEG");
        return;
      }
    }
    // Kiểm tra nguyên liệu trước
    const insufficientMaterial = currentDesign.materials.some((mat) => {
      const stored = matchingMaterials.find(
        (m) => m.materialId === mat.materialId
      );
      return !stored || mat.meterUsed > stored.quantity;
    });

    if (insufficientMaterial) {
      toast.error("Không đủ nguyên liệu để tạo sản phẩm");
      return; // dừng submit
    }

    const payload = { ...formData };

    try {
      setLoading(true);
      await ProductService.createDesignDraft(payload);
      await DesignService.updateProductDetailAsync(productInfo);
      toast.success("Gửi đơn thành công!");
      setOpenCreateDialog(false); // đóng dialog
      if (tabIndex === 1) {
        reloadTabProduct();
        reloadTab2();
      }
    } catch (err: any) {
      toast.error(err.message);
      console.error("❌ Error submitting application:", err);
    } finally {
      setLoading(false);
    }
  };

  const reloadTabProduct = async () => {
    try {
      const designProductData = await DesignService.getAllDesignProuct(
        getDesignerId()
      );
      setDesignProduct(designProductData);

      const inventoryTransactionsData =
        await InventoryTransactionsService.getAllMaterialInventoryByDesigner();
      setInventoryTransactions(inventoryTransactionsData);
    } catch (error) {
      console.error("Lỗi khi load lại sản phẩm:", error);
    }
  };

  //Datagrid variant
  const getTotalMeterUsed = (materials: { meterUsed: number }[]) => {
    return materials.reduce((sum, mat) => sum + (mat.meterUsed ?? 0), 0);
  };

  const generateMockVariant = (variant: FullDesignVariant[]) => {
    return variant.map((variant) => ({
      variantId: variant.variantId,
      designName: variant.designName,
      sizeName: variant.sizeName,
      colorCode: variant.colorCode,
      quantity: variant.quantity,
      ratio: variant.ratio,
      sizeId: variant.sizeId,
      meterUsed:
        variant.quantity *
        getTotalMeterUsed(selectedItem.material) *
        variant.ratio,
    }));
  };

  type VariantColumn = ReturnType<typeof generateMockVariant>[number];
  const [variantRows, setVariantRows] = useState<VariantColumn[]>([]);

  const handleDeleteVariant = async (variantId: number) => {
    try {
      const result = await DesignVariantService.deleteVariant(variantId);
      if (result) {
        //Reload lại danh sách từ server
        await getVariantByDesignId(selectedItem.id);
        toast.success("Xoá thành công!");
      } else {
        toast.error("Xóa Thất Bại");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Có lỗi khi xoá");
    }
  };

  const handleUpdateVariant = async (
    variantId: number,
    updatedData: UpdateVariant
  ) => {
    try {
      setLoading(true);

      await DesignVariantService.updateVariantAsync(variantId, updatedData);

      //Reload lại danh sách từ server
      await getVariantByDesignId(selectedItem.id);

      toast.success("Cập nhật thành công!");
    } catch (err: any) {
      console.error("❌ Error updating variant:", err);
      toast.error(err.message || "Có lỗi khi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  const variant_columns: GridColDef<VariantColumn>[] = [
    { field: "variantId", headerName: "ID", width: 90 },
    { field: "sizeName", headerName: "Kích Thước", flex: 1, type: "string" },
    {
      field: "colorCode",
      headerName: "Màu sắc",
      flex: 1,
      type: "string",
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            width: "100%",
            height: "100%",
          }}
        >
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              backgroundColor: mapColorCodeToHex(params.value),
              border: "1px solid #ccc",
            }}
          />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    { field: "ratio", headerName: "Tỉ Lệ", flex: 1, type: "number" },

    {
      field: "quantity",
      headerName: (
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          Số lượng <EditIcon fontSize="small" />
        </span>
      ) as any, // DataGrid yêu cầu string, nên cast sang any
      flex: 1,
      type: "number",
      editable: true,
    },
    {
      field: "meterUsed",
      headerName: "Mét Vải Sử Dụng(m)",
      flex: 1,
      type: "number",
    },
    {
      field: "actions",
      headerName: "",
      width: 120,
      sortable: false,
      filterable: false,
      headerAlign: "right",
      disableColumnMenu: true,
      type: "actions",
      renderCell: (params) => {
        return (
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}
          >
            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  if (
                    window.confirm(
                      "Bạn có chắc chắn muốn xoá variant này không?"
                    )
                  ) {
                    handleDeleteVariant(params.row.variantId);
                  }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        );
      },
    },
  ];

  //Datagrid Product
  const product_columns = [
    { field: "sku", headerName: "SKU", flex: 1 },
    { field: "sizeName", headerName: "Kích Thước", width: 120 },
    {
      field: "colorCode",
      headerName: "Màu",
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 20,
              height: 20,
              bgcolor: mapColorCodeToHex(params.value),
              border: "1px solid #ccc",
              borderRadius: "50%",
            }}
          />
          {params.value}
        </Box>
      ),
    },
    {
      field: "quantityAvailable",
      headerName: "Tồn kho",
      width: 150,
      renderCell: (params) => (
        <Chip
          label={`Còn lại: ${params.value}`}
          color={params.value > 10 ? "success" : "warning"}
          size="small"
        />
      ),
    },
  ];

  const generateMockInventoryTransaction = (
    transaction: ProductInventoryTransactions[]
  ) => {
    return transaction.map((transaction) => ({
      transactionId: transaction.transactionId,
      inventoryId: transaction.inventoryId,
      designName: transaction.designName,
      itemName: transaction.itemName,
      performedByUserId: transaction.performedByUserId,
      quantityChanged: transaction.quantityChanged,
      beforeQty: transaction.beforeQty,
      afterQty: transaction.afterQty,
      transactionDate: transaction.transactionDate,
      transactionType: transaction.transactionType,
      notes: transaction.notes,
      inventoryType: transaction.inventoryType,
    }));
  };

  type InventoryTransactionColumn = ReturnType<
    typeof generateMockInventoryTransaction
  >[number];

  const [inventoryTransactionRows, setInventoryTransactionRows] = useState<
    InventoryTransactionColumn[]
  >([]);

  const productTransaction_columns: GridColDef<InventoryTransactionColumn>[] = [
    { field: "transactionId", headerName: "ID", width: 90 },
    { field: "designName", headerName: "Sản Phẩm", flex: 1 },
    { field: "itemName", headerName: "SKU", flex: 1 },
    {
      field: "transactionType",
      headerName: "Loại GD",
      width: 120,
      renderCell: (params) => {
        switch (params.value) {
          case "Import":
            return "Nhập kho";
          case "Usage":
            return "Sử dụng";
          default:
            return params.value;
        }
      },
    },
    {
      field: "quantityChanged",
      headerName: "Số lượng",
      width: 120,
      renderCell: (params) => {
        const value = params.value as number;
        return (
          <span
            style={{
              color: value < 0 ? "red" : "green",
              fontWeight: "bold",
            }}
          >
            {value > 0 && "+"}
            {value}
          </span>
        );
      },
    },
    { field: "beforeQty", headerName: "Trước", width: 120 },
    { field: "afterQty", headerName: "Sau", width: 120 },
    {
      field: "transactionDate",
      headerName: "Ngày",
      width: 220,
      renderCell: (params) => {
        const txDate = new Date(params.value as string);
        const today = new Date();

        const isToday =
          txDate.getDate() === today.getDate() &&
          txDate.getMonth() === today.getMonth() &&
          txDate.getFullYear() === today.getFullYear();

        return (
          <>
            {txDate.toLocaleString("vi-VN")}
            {isToday && (
              <Box
                component="span"
                sx={{
                  ml: 1,
                  px: 1,
                  py: 0.2,
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  color: "white",
                  backgroundColor: "red",
                }}
              >
                Mới
              </Box>
            )}
          </>
        );
      },
    },
    { field: "notes", headerName: "Ghi chú", flex: 1 },
  ];

  const materialTransaction_columns: GridColDef<InventoryTransactionColumn>[] =
    [
      { field: "transactionId", headerName: "ID", width: 90 },
      { field: "itemName", headerName: "Tên", flex: 1 },
      {
        field: "transactionType",
        headerName: "Loại GD",
        width: 120,
        renderCell: (params) => {
          switch (params.value) {
            case "Import":
              return "Nhập kho";
            case "Usage":
              return "Sử dụng";
            default:
              return params.value;
          }
        },
      },
      {
        field: "quantityChanged",
        headerName: "Số lượng (m)",
        width: 120,
        renderCell: (params) => {
          const value = params.value as number;
          return (
            <span
              style={{
                color: value < 0 ? "red" : "green",
                fontWeight: "bold",
              }}
            >
              {value > 0 && "+"}
              {value}
            </span>
          );
        },
      },
      { field: "beforeQty", headerName: "Trước", width: 120 },
      { field: "afterQty", headerName: "Sau", width: 120 },
      {
        field: "transactionDate",
        headerName: "Ngày",
        width: 220,
        renderCell: (params) => {
          const txDate = new Date(params.value as string);
          const today = new Date();

          const isToday =
            txDate.getDate() === today.getDate() &&
            txDate.getMonth() === today.getMonth() &&
            txDate.getFullYear() === today.getFullYear();

          return (
            <>
              {txDate.toLocaleString("vi-VN")}
              {isToday && (
                <Box
                  component="span"
                  sx={{
                    ml: 1,
                    px: 1,
                    py: 0.2,
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    color: "white",
                    backgroundColor: "red",
                  }}
                >
                  Mới
                </Box>
              )}
            </>
          );
        },
      },
      { field: "notes", headerName: "Ghi chú", flex: 1 },
    ];
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = async (material: any, quantity: number) => {
    const safeQuantity = Math.abs(quantity);
    const available = material.quantityAvailable || 0;

    if (safeQuantity === 0) {
      toast.error("Số lượng phải lớn hơn 0!");
      return;
    }

    let finalQuantity = safeQuantity;

    if (safeQuantity > available) {
      finalQuantity = available; // 🔑 lấy toàn bộ tồn kho
      toast.warning(
        `Bạn yêu cầu ${safeQuantity} mét nhưng chỉ còn ${available} mét. Đã thêm toàn bộ tồn kho vào giỏ hàng.`
      );
    }

    await addToCart({
      materialId: material.materialId || 0,
      quantity: finalQuantity,
    });

    setOpenCreateDialog(false);

    toast.success(
      `Đã thêm ${finalQuantity} mét ${
        material.name || "Nguyên liệu"
      } vào giỏ hàng! 💡 Kiểm tra số lượng trong giỏ hàng.`
    );
  };

  return !pageLoading ? (
    <Box sx={{ width: "95%", margin: "auto" }}>
      {/* Top Part */}
      <Box sx={{ width: "100%", display: "flex" }}>
        {/* Title */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            paddingTop: 3,
            paddingBottom: 3,
          }}
        >
          <Typography sx={{ fontWeight: "bold", fontSize: "30px" }}>
            Trung Tâm Nhà Thiết Kế
          </Typography>
          <Typography>Chào mừng trở lại, {user?.fullName}</Typography>
        </Box>
      </Box>
      {/* Tab Part */}
      <Box
        sx={{
          width: "50%",
          background: "rgba(241, 245, 249, 1)",
          display: "flex",
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={handleChange}
          sx={{
            width: "100%",
            margin: "auto",
          }}
          TabIndicatorProps={{
            sx: {
              backgroundColor: "rgba(22, 163, 74)",
              borderRadius: "2px",
            },
          }}
        >
          <Tab
            label="Trang chủ"
            sx={{
              flex: 1,
              "&.Mui-selected": {
                color: "rgba(22, 163, 74)", // Màu khi được chọn
                fontWeight: "bold", // Tuỳ chọn: in đậm
              },
            }}
          />
          <Tab
            label="Sản Phẩm"
            sx={{
              flex: 1,
              "&.Mui-selected": {
                color: "rgba(22, 163, 74)", // Màu khi được chọn
                fontWeight: "bold", // Tuỳ chọn: in đậm
              },
            }}
          />
          <Tab
            label="Kế Hoạch Thiết Kế"
            sx={{
              flex: 1,
              "&.Mui-selected": {
                color: "rgba(22, 163, 74)", // Màu khi được chọn
                fontWeight: "bold", // Tuỳ chọn: in đậm
              },
            }}
          />
          <Tab
            label="Kho Vật Liệu"
            sx={{
              flex: 1,
              "&.Mui-selected": {
                color: "rgba(22, 163, 74)", // Màu khi được chọn
                fontWeight: "bold", // Tuỳ chọn: in đậm
              },
            }}
          />
          <Tab
            label="Quản Lý Đơn Hàng"
            sx={{
              flex: 1,
              "&.Mui-selected": {
                color: "rgba(22, 163, 74)", // Màu khi được chọn
                fontWeight: "bold", // Tuỳ chọn: in đậm
              },
            }}
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {/* Tab Trang Chủ */}
      {tabIndex === 0 && (
        <Box sx={{ width: "100%" }}>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              gap: 3,
            }}
          >
            {stats.map((item, index) => (
              <Grid key={index} sx={{ flex: 1, margin: "20px 0" }}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="subtitle2" color="text.secondary">
                        {item.title}
                      </Typography>
                      <Avatar
                        sx={{ bgcolor: item.color, width: 35, height: 35 }}
                      >
                        {item.icon}
                      </Avatar>
                    </Stack>
                    <Typography variant="h5" fontWeight="bold" mt={1}>
                      {item.value}
                    </Typography>
                    <Typography variant="body2" color="success.main" mt={0.5}>
                      ↗ {item.subtitle}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Box>
          {/* Graph & Popular Product*/}
          <Box width={"100%"} sx={{ display: "flex", gap: 3 }}>
            <Stack direction="row" sx={{ width: "100%" }} spacing={3}>
              {/* Graph */}
              <Card sx={{ width: "60%", flex: 1 }}>
                <Box
                  sx={{ border: "1px solid rgba(0, 0, 0, 0.1)", padding: 3 }}
                >
                  <Box width={"100%"} sx={{ display: "flex" }}>
                    <Box
                      width={"100%"}
                      sx={{ display: "flex", flexDirection: "column" }}
                    >
                      <Typography sx={{ fontWeight: "bold", fontSize: "20px" }}>
                        Tổng Quan Doanh Thu
                      </Typography>
                      <Typography sx={{ opacity: "50%" }}>
                        Doanh số sản phẩm của bạn trong{" "}
                        {`${
                          range === "week"
                            ? "1 tuần"
                            : range === "month"
                            ? "1 tháng"
                            : "1 năm"
                        }`}{" "}
                        qua
                      </Typography>{" "}
                    </Box>
                    <Select
                      defaultValue="week"
                      sx={{
                        border: "none",
                        fontSize: 14,
                        minWidth: 100,
                      }}
                    >
                      <MenuItem value="week" onClick={() => setRange("week")}>
                        1 Tuần
                      </MenuItem>
                      <MenuItem value="month" onClick={() => setRange("month")}>
                        1 Tháng
                      </MenuItem>
                      <MenuItem value="year" onClick={() => setRange("year")}>
                        1 Năm
                      </MenuItem>
                    </Select>
                  </Box>
                  <Line
                    data={{
                      labels: chartData.map((d) => d.label),
                      datasets: [
                        {
                          label: "Doanh Thu",
                          data: chartData.map((d) => d.revenue),
                          backgroundColor: "#064FF0",
                          borderColor: "#064FF0",
                        },
                        {
                          label: "Chi Phí",
                          data: chartData.map((d) => d.cost),
                          backgroundColor: "#FF3030",
                          borderColor: "#FF3030",
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      elements: {
                        line: {
                          tension: 0.4,
                        },
                      },
                      plugins: {
                        legend: { position: "top" },
                        title: {
                          display: true,
                        },
                      },
                    }}
                  />
                </Box>
              </Card>
              {/* Popular Product */}
              <Card sx={{ width: "60%", flex: 1 }}>
                <Box
                  sx={{ border: "1px solid rgba(0, 0, 0, 0.1)", padding: 3 }}
                >
                  {/* Title */}
                  <Box
                    width="100%"
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: "bold", fontSize: "20px" }}>
                        Sản Phẩm Hàng Đầu
                      </Typography>
                      <Typography sx={{ opacity: "50%" }}>
                        Sản phẩm bán chạy nhất của bạn
                      </Typography>
                    </Box>
                  </Box>

                  <Stack
                    spacing={2}
                    sx={{
                      mt: 2,
                      maxHeight: 300, // set max height for scroll area
                      overflowY: "auto",
                      pr: 1,
                      scrollbarWidth: "thin",
                      "&::-webkit-scrollbar": {
                        width: 6,
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "rgba(0,0,0,0.2)",
                        borderRadius: 4,
                      },
                    }}
                  >
                    {designs.map((item) => (
                      <Button
                        key={item.designId}
                        variant="outlined"
                        sx={{
                          borderColor: "rgba(0,0,0,0.1)",
                          textTransform: "none",
                          width: "100%",
                          padding: 2,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        {/* Left side */}
                        <Box sx={{ textAlign: "left" }}>
                          <Typography
                            sx={{
                              fontWeight: "bold",
                              color: "black",
                              mb: 1,
                            }}
                          >
                            {item.name}
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Chip
                              icon={<EcoIcon />}
                              label={`${item.recycledPercentage}% Bền Vững`}
                              size="small"
                              sx={{
                                backgroundColor: "rgba(200, 248, 217, 1)",
                                color: "rgba(22, 103, 86, 1)",
                                marginRight: 1,
                                fontWeight: "bold",
                              }}
                            />
                            <Typography
                              sx={{
                                color: "black",
                                opacity: 0.4,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              Bán Được 15 Sản Phẩm
                            </Typography>
                          </Box>
                        </Box>

                        {/* Right side */}
                        <Typography
                          sx={{ color: "black", whiteSpace: "nowrap", ml: 2 }}
                        >
                          Chi Tiết
                        </Typography>
                      </Button>
                    ))}
                  </Stack>
                </Box>
              </Card>
            </Stack>
          </Box>
        </Box>
      )}

      {/* Tab Sản Phẩm */}
      {tabIndex === 1 && (
        <Box sx={{ width: "100%" }}>
          {/* Tạo Mới Sản Phẩm */}
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            {/* Tạo Sản Phẩm Từ Design*/}
            <Button
              variant="outlined"
              sx={{
                borderColor: "rgba(0,0,0,0.1)",
                textTransform: "none",
              }}
              onClick={() => handleOpenCreate()}
            >
              <DesignServicesOutlinedIcon color="success" />
              <Box
                sx={{
                  textAlign: "left",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  marginRight: "auto",
                }}
              >
                <Typography
                  sx={{
                    width: "100%",
                    marginRight: "auto",
                    fontWeight: "bold",
                    color: "black",
                  }}
                >
                  Tạo Sản Phẩm
                </Typography>
                <Typography
                  sx={{
                    color: "black",
                    opacity: "40%",
                  }}
                >
                  Tạo ra sản phẩm theo kế hoạch
                </Typography>
              </Box>
            </Button>
          </Box>
          <Dialog
            open={openCreateDialog}
            onClose={() => setOpenCreateDialog(false)}
            maxWidth="xl"
            fullWidth
            PaperProps={{
              component: "form",
              onSubmit: handleSubmit(onSubmit),
            }}
          >
            <DialogTitle>Sản xuất Theo Kế Hoạch</DialogTitle>
            <DialogContent>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  mt: 1,
                }}
              >
                <Controller // Chọn rập thiết kế
                  name="designId"
                  control={control}
                  defaultValue={0} // hoặc 0
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error}>
                      <InputLabel id="design-product-label">
                        Chọn rập thiết kế
                      </InputLabel>
                      <Select
                        {...field}
                        value={field.value || ""}
                        labelId="design-product-label"
                        label="Chọn rập thiết kế"
                        onChange={(e) => {
                          field.onChange(e); // cập nhật form value
                          const design = designs.find(
                            (d) => d.designId === e.target.value
                          );
                          setSelectedDesign(design || null); // cập nhật design chi tiết
                        }}
                      >
                        {designs
                          .filter(
                            (design) =>
                              design.designsVariants &&
                              design.designsVariants.length > 0
                          ) // chỉ lấy có variant
                          .map((design) => (
                            <MenuItem
                              key={design.designId}
                              value={design.designId}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Avatar // Ảnh thumbnail
                                  src={
                                    design.drafSketches || DesignDefaultImage
                                  } // nếu không có ảnh thì dùng default
                                  alt={design.name}
                                  sx={{ width: 32, height: 32 }}
                                />
                                <Box //Tên và score
                                >
                                  <Typography variant="body1">
                                    {design.name}
                                  </Typography>
                                  <Typography variant="caption" color="green">
                                    Tính Bền Vững: {design.recycledPercentage}%
                                  </Typography>
                                </Box>
                              </Box>
                            </MenuItem>
                          ))}
                      </Select>
                      {fieldState.error && (
                        <FormHelperText>
                          {fieldState.error.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />

                {currentDesign && (
                  <Box>
                    {/* Danh sách Variant */}
                    <Typography variant="subtitle1">
                      Danh sách Kế Hoạch Thiết kế:
                    </Typography>
                    {currentDesign.designsVariants.map((variant, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: 1,
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        <Typography variant="body2" flex={1}>
                          Kế Hoạch #{variant.id}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          flex={1}
                        >
                          Kích Thước: {variant.sizeName}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          flex={1}
                        >
                          Tỷ lệ KT: {variant.ratio}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          flex={1}
                        >
                          Màu Sắc: {variant.colorCode}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          flex={1}
                        >
                          Số lượng:{" "}
                          {new Intl.NumberFormat("vi-VN").format(
                            variant.quantity
                          )}
                        </Typography>
                      </Box>
                    ))}

                    {/* Tổng quantity */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        p: 1,
                        borderTop: "2px solid #ccc",
                        mt: 1,
                      }}
                    >
                      <Typography variant="subtitle2" color="primary">
                        Tổng số lượng:{" "}
                        {new Intl.NumberFormat("vi-VN").format(
                          currentDesign.designsVariants.reduce(
                            (sum, v) => sum + v.quantity,
                            0
                          )
                        )}
                      </Typography>
                    </Box>
                  </Box>
                )}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {currentDesign && currentDesign.materials && (
                    <Box mt={2}>
                      <Typography variant="subtitle1">
                        Danh sách vật liệu:
                      </Typography>
                      {currentDesign.materials.map((mat, index) => {
                        // Tổng quantity của tất cả variant
                        const totalQuantity =
                          currentDesign.designsVariants.reduce(
                            (sum, variant) =>
                              sum + variant.quantity * variant.ratio,
                            0
                          );

                        return (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              p: 1,
                              borderBottom: "1px solid #eee",
                            }}
                          >
                            <Box>
                              <Typography variant="body2">
                                {mat.materialName}({mat.meterUsed}m)
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Sử dụng:{" "}
                                {(mat.meterUsed * totalQuantity).toFixed(3)} m
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  )}

                  {/* Danh sách stored material trùng với currentDesign */}
                  {currentDesign &&
                    matchingMaterials &&
                    matchingMaterials.length > 0 && (
                      <Box mt={2}>
                        <Typography variant="subtitle1">
                          Vật Liệu Trong Kho:
                        </Typography>
                        {matchingMaterials.map((mat, index) => {
                          // Tính tổng quantity của tất cả variant trong currentDesign
                          const totalQuantity =
                            currentDesign?.designsVariants?.reduce(
                              (sum, variant) =>
                                sum + variant.quantity * variant.ratio,
                              0
                            ) || 0;

                          // Tìm material trong currentDesign để lấy meterUsed
                          const designMat = currentDesign?.materials.find(
                            (m) => m.materialId === mat.materialId
                          );

                          const required = designMat
                            ? designMat.meterUsed * totalQuantity
                            : 0;
                          const available = mat.quantity;
                          const isNotEnough = available < required;

                          return (
                            <Box
                              key={index}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                p: 1,
                                borderBottom: "1px solid #eee",
                              }}
                            >
                              <Box>
                                <Typography variant="body2">
                                  {mat.material.name}
                                </Typography>
                                {isNotEnough ? (
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "error.main" }}
                                  >
                                    Có: {available} m / Cần:{" "}
                                    {(required - available).toFixed(3)} m
                                  </Typography>
                                ) : (
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "success.main" }}
                                  >
                                    Có: {available} m / Dư:{" "}
                                    {(available - required).toFixed(3)} m
                                  </Typography>
                                )}
                              </Box>
                              {/* Nút Order nếu không đủ */}
                              {isNotEnough && (
                                <Button
                                  variant="contained"
                                  size="small"
                                  color="primary"
                                  onClick={() =>
                                    handleAddToCart(
                                      mat.material,
                                      available - required
                                    )
                                  }
                                >
                                  Đặt hàng
                                </Button>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                </Box>

                {currentDesign && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      p: 3,
                      border: "1px solid",
                      borderColor: "grey.300",
                      borderRadius: 2,
                      flex: 1,
                    }}
                  >
                    <Typography>Thông Tin Sản Phẩm</Typography>
                    {/* Input fields */}
                    <TextField
                      label="Tên sản phẩm"
                      value={productInfo.productName}
                      onChange={(e) =>
                        handleProductDetailChange("productName", e.target.value)
                      }
                      fullWidth
                    />

                    <TextField
                      label="Miêu tả"
                      value={productInfo.description}
                      onChange={(e) =>
                        handleProductDetailChange("description", e.target.value)
                      }
                      multiline
                      rows={3}
                      fullWidth
                    />

                    <TextField
                      label="Hướng dẫn bảo quản"
                      value={productInfo.careInstruction}
                      onChange={(e) =>
                        handleProductDetailChange(
                          "careInstruction",
                          e.target.value
                        )
                      }
                      multiline
                      rows={2}
                      fullWidth
                    />

                    {/* Checkbox group */}
                    <FormControl component="fieldset">
                      <FormLabel component="legend">Chọn tiêu chí</FormLabel>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={productInfo.designFeatures.ReduceWaste}
                              onChange={(e) =>
                                handleDesignFeatureChange(
                                  "ReduceWaste",
                                  e.target.checked
                                )
                              }
                            />
                          }
                          label="Giảm rác thải ra môi trường"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={productInfo.designFeatures.LowImpactDyes}
                              onChange={(e) =>
                                handleDesignFeatureChange(
                                  "LowImpactDyes",
                                  e.target.checked
                                )
                              }
                            />
                          }
                          label="Thuốc nhuộm và quy trình ít tác động đến môi trường"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={productInfo.designFeatures.Durable}
                              onChange={(e) =>
                                handleDesignFeatureChange(
                                  "Durable",
                                  e.target.checked
                                )
                              }
                            />
                          }
                          label="Kết cấu bền chắc sử dụng lâu dài"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={
                                productInfo.designFeatures.EthicallyManufactured
                              }
                              onChange={(e) =>
                                handleDesignFeatureChange(
                                  "EthicallyManufactured",
                                  e.target.checked
                                )
                              }
                            />
                          }
                          label="Quy trình sản xuất có trách nhiệm"
                        />
                      </FormGroup>
                    </FormControl>
                  </Box>
                )}
                <Controller // Upload hình ảnh
                  name="images"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormControl error={!!fieldState.error}>
                      <FileUpload
                        label=""
                        multiple
                        files={Array.isArray(field.value) ? field.value : []}
                        onFilesChange={(files) => field.onChange(files)}
                        accept="image/*"
                        maxSize={5}
                      />
                      {fieldState.error && (
                        <FormHelperText>
                          {fieldState.error.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                type="submit"
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  backgroundColor: "black",
                  "&:hover": { backgroundColor: "#333" },
                }}
                disabled={loading}
              >
                {loading ? "Đang tạo..." : "Tạo sản phẩm"}
              </Button>
            </DialogActions>
          </Dialog>
          {/* Table */}
          <DataGrid
            rows={generateMockDesignProducts(designProduct)}
            columns={designProduct_columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            pageSizeOptions={[5]}
            disableRowSelectionOnClick
            sx={{
              width: "100%", // or set a fixed px width like "800px"
            }}
          />

          {selectedDesignProduct && (
            <Dialog
              open={openViewProductDialog}
              onClose={() => setOpenViewProductDialog(false)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>Chi Tiết Sản Phẩm</DialogTitle>
              <DialogContent dividers>
                <Grid container spacing={2}>
                  <Box sx={{ height: 400, width: "100%" }}>
                    <DataGrid
                      rows={designProductDetail}
                      columns={product_columns}
                      getRowId={(row) => row.productId}
                      initialState={{
                        pagination: {
                          paginationModel: { page: 0, pageSize: 5 },
                        },
                      }}
                      pageSizeOptions={[5, 10, 20]}
                      disableRowSelectionOnClick
                    />
                  </Box>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenViewProductDialog(false)}>
                  Đóng
                </Button>
              </DialogActions>
            </Dialog>
          )}

          {selectedProductDetail && (
            <Dialog
              open={openViewProductDetailDialog}
              onClose={() => setOpenViewProductDetailDialog(false)}
              maxWidth="xl"
              fullWidth
            >
              <DialogTitle>Thông Tin Sản Phẩm</DialogTitle>
              <DialogContent dividers>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    border: "1px solid",
                    borderColor: "grey.300",
                    borderRadius: 2,
                    flex: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" }, // cột trên mobile, hàng trên desktop
                      gap: 3,
                      p: 3,
                    }}
                  >
                    {/* Left: Ảnh */}
                    <Box flex={1} position="relative">
                      {/* Nút Upload và Hủy */}
                      <Box
                        display="flex"
                        gap={1}
                        mb={2}
                        flexDirection={"column"}
                      >
                        <Box display="flex" gap={1}>
                          {/* Upload */}
                          <Button variant="contained" component="label">
                            Thay Ảnh
                            <input
                              type="file"
                              hidden
                              multiple // cho chọn nhiều ảnh
                              accept=".jpeg,.jpg"
                              onChange={(e) => {
                                const files = e.target.files;
                                if (!files || files.length === 0) return;

                                // Lọc chỉ file jpeg/jpg
                                const newFiles = Array.from(files).filter(
                                  (file) =>
                                    file.type === "image/jpeg" ||
                                    file.type === "image/jpg"
                                );

                                if (newFiles.length === 0) {
                                  alert("Chỉ chấp nhận file .jpeg hoặc .jpg");
                                  return;
                                }

                                // Tạo URL tạm thời để preview
                                const newUrls = newFiles.map((file) =>
                                  URL.createObjectURL(file)
                                );

                                // Cập nhật cả file thật và gallery preview
                                setProductInfo((prev) => ({
                                  ...prev,
                                  files: newFiles, // file thật để gửi lên backend
                                  designImages: newUrls, // preview
                                }));

                                // Ảnh chính là ảnh đầu tiên
                                setMainImage(newUrls[0]);
                                e.target.value = "";
                              }}
                            />
                          </Button>

                          {/* Hủy */}
                          <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => {
                              // reset về ảnh gốc từ selectedProductDetail
                              setProductInfo((prev) => ({
                                ...prev,
                                designImages: selectedProductDetail.image || [], // preview
                                files: [], // xóa file mới chưa upload
                              }));
                              setMainImage(
                                selectedProductDetail.image?.[0] || ""
                              );
                            }}
                          >
                            Hủy
                          </Button>
                        </Box>
                        {/* Thông báo định dạng */}
                        <Typography variant="caption" color="text.secondary">
                          Chỉ chấp nhận file ảnh có đuôi .jpg hoặc .jpeg
                        </Typography>
                      </Box>
                      <Box>
                        {/* Ảnh chính */}
                        <Box
                          component="img"
                          src={mainImage || productInfo.designImages?.[0] || ""}
                          alt="main"
                          sx={{
                            width: 500,
                            height: 500,
                            objectFit: "cover",
                            borderRadius: 2,
                            mb: 2,
                          }}
                        />

                        {/* Thumbnails */}
                        <Box display="flex" gap={1}>
                          {productInfo.designImages?.map((src, idx) => (
                            <Box
                              key={idx}
                              flex={1}
                              sx={{
                                borderRadius: 1,
                                overflow: "hidden",
                                border:
                                  mainImage === src
                                    ? "2px solid #1976d2"
                                    : "2px solid transparent",
                                cursor: "pointer",
                              }}
                              onClick={() => setMainImage(src)}
                            >
                              <Box
                                component="img"
                                src={src}
                                alt={`thumb-${idx}`}
                                sx={{
                                  width: "100%",
                                  height: 80,
                                  objectFit: "cover",
                                }}
                              />
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Box>

                    {/* Right: Input fields */}
                    <Box flex={1} display="flex" flexDirection="column" gap={2}>
                      <TextField
                        label="Tên sản phẩm"
                        value={productInfo.productName}
                        onChange={(e) =>
                          handleProductDetailChange(
                            "productName",
                            e.target.value
                          )
                        }
                        fullWidth
                      />
                      <TextField
                        label="Miêu tả"
                        value={productInfo.description}
                        onChange={(e) =>
                          handleProductDetailChange(
                            "description",
                            e.target.value
                          )
                        }
                        multiline
                        rows={3}
                        fullWidth
                      />
                      <TextField
                        label="Hướng dẫn bảo quản"
                        value={productInfo.careInstruction}
                        onChange={(e) =>
                          handleProductDetailChange(
                            "careInstruction",
                            e.target.value
                          )
                        }
                        multiline
                        rows={2}
                        fullWidth
                      />
                      {/* Checkbox group */}
                      <FormControl component="fieldset">
                        <FormLabel component="legend">Chọn tiêu chí</FormLabel>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={productInfo.designFeatures.ReduceWaste}
                                onChange={(e) =>
                                  handleDesignFeatureChange(
                                    "ReduceWaste",
                                    e.target.checked
                                  )
                                }
                              />
                            }
                            label="Giảm rác thải ra môi trường"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={
                                  productInfo.designFeatures.LowImpactDyes
                                }
                                onChange={(e) =>
                                  handleDesignFeatureChange(
                                    "LowImpactDyes",
                                    e.target.checked
                                  )
                                }
                              />
                            }
                            label="Thuốc nhuộm và quy trình ít tác động đến môi trường"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={productInfo.designFeatures.Durable}
                                onChange={(e) =>
                                  handleDesignFeatureChange(
                                    "Durable",
                                    e.target.checked
                                  )
                                }
                              />
                            }
                            label="Kết cấu bền chắc sử dụng lâu dài"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={
                                  productInfo.designFeatures
                                    .EthicallyManufactured
                                }
                                onChange={(e) =>
                                  handleDesignFeatureChange(
                                    "EthicallyManufactured",
                                    e.target.checked
                                  )
                                }
                              />
                            }
                            label="Quy trình sản xuất có trách nhiệm"
                          />
                        </FormGroup>
                      </FormControl>
                    </Box>
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => handleUpdateProductDetail()}>Lưu</Button>
                <Button onClick={() => setOpenViewProductDetailDialog(false)}>
                  Đóng
                </Button>
              </DialogActions>
            </Dialog>
          )}

          <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
          >
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={(theme) => ({
                position: "absolute",
                right: 8,
                top: 8,
                color: theme.palette.grey[500],
              })}
            >
              <CloseIcon />
            </IconButton>

            <img
              src={selectedImage || ""}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                borderRadius: 10,
              }}
            />
          </BootstrapDialog>
        </Box>
      )}

      {/* Tab Thời Trang  */}
      {tabIndex === 2 && (
        <Box sx={{ width: "100%" }}>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            {/* Thiết Kế Rập */}
            <Button
              variant="outlined"
              sx={{
                borderColor: "rgba(0,0,0,0.1)",
                textTransform: "none",
              }}
              href="/designer/dashboard/create"
            >
              <DesignServicesOutlinedIcon color="success" />
              <Box
                sx={{
                  textAlign: "left",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  marginRight: "auto",
                }}
              >
                <Typography
                  sx={{
                    width: "100%",
                    marginRight: "auto",
                    fontWeight: "bold",
                    color: "black",
                  }}
                >
                  Thiết Kế Rập
                </Typography>
                <Typography
                  sx={{
                    color: "black",
                    opacity: "40%",
                  }}
                >
                  Tạo ra các mẫu rập bền vững
                </Typography>
              </Box>
            </Button>
          </Box>
          {/* Table */}
          <DataGrid
            rows={generateMockDesigns(designs)}
            columns={fashion_columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            pageSizeOptions={[5]}
            disableRowSelectionOnClick
            sx={{
              width: "100%", // or set a fixed px width like "800px"
            }}
          />
          <Dialog
            open={openEditDialog}
            onClose={() => {
              setOpenEditDialog(false);
              reloadTab2();
            }}
            maxWidth="xl"
            fullWidth
          >
            <DialogTitle>Chi Tiết Kế Hoạch</DialogTitle>
            <DialogContent dividers>
              {selectedItem && (
                <Box>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Box flex={1}>
                      <Box
                        display={"flex"}
                        width={"100%"}
                        justifyContent={"space-between"}
                      >
                        <Box display={"flex"} flexDirection={"column"}>
                          <Typography variant="subtitle1">
                            Tên: {selectedItem.title}
                          </Typography>
                          <Typography variant="subtitle1">
                            Giá: {selectedItem.price}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row", // 2 chip nằm ngang
                            gap: 1, // khoảng cách giữa chip
                            justifyContent: "flex-end", // căn sang bên phải
                            alignItems: "center", // căn giữa theo chiều dọc
                          }}
                        >
                          <Chip
                            icon={<EcoIcon />}
                            label={`${selectedItem.recycledPercentage}% Bền Vững`}
                            size="small"
                            sx={{
                              backgroundColor: "rgba(200, 248, 217, 1)",
                              color: "rgba(22, 103, 86, 1)",
                              fontSize: "15px",
                            }}
                          />
                          <Chip
                            icon={
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  height: "100%",
                                }}
                              >
                                {getCategoryIcon(selectedItem.typeName)}
                              </Box>
                            }
                            label={selectedItem.typeName}
                            size="small"
                            sx={{
                              bgcolor: getCategoryColor(selectedItem.typeName),
                              color: "white",
                              fontWeight: "bold",
                              fontSize: "1rem",
                              paddingTop: 2,
                              paddingBottom: 2,
                              width: "50%",
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="subtitle1" fontWeight="bold">
                        Tên Vải:
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Mét Vải:
                      </Typography>
                    </Box>
                    {selectedItem.material.map((mat, index) => (
                      <Box
                        key={index}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={0.5}
                      >
                        <Typography variant="body1">
                          {mat.materialName}
                        </Typography>
                        <Typography variant="body1">
                          {mat.meterUsed}m
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  <Box mb={2}>
                    <Button
                      variant="outlined"
                      onClick={() => setAddingNew(true)}
                    >
                      Thêm Kế Hoạch
                    </Button>
                  </Box>
                  <Divider />
                  {/* Card form nhập liệu biến thể mới */}
                  {addingNew && (
                    <Card
                      variant="outlined"
                      sx={{
                        width: 220,
                        borderRadius: 3,
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      <CardContent>
                        <Stack spacing={2}>
                          <FormControl size="small" fullWidth>
                            <InputLabel id="size-select-label">Size</InputLabel>
                            <Select
                              labelId="size-select-label"
                              value={newVariant.sizeName}
                              label="Size"
                              onChange={(e) =>
                                setNewVariant({
                                  ...newVariant,
                                  sizeName: e.target.value,
                                })
                              }
                            >
                              {sizeOptions.map((option) => (
                                <MenuItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <FormControl size="small" fullWidth>
                            <InputLabel id="color-select-label">
                              Màu sắc
                            </InputLabel>
                            <Select
                              labelId="color-select-label"
                              value={newVariant.colorCode}
                              label="Màu sắc"
                              onChange={(e) =>
                                setNewVariant({
                                  ...newVariant,
                                  colorCode: e.target.value,
                                })
                              }
                              renderValue={(selected) => {
                                const color = colorOptions.find(
                                  (c) => c.hex === selected
                                );
                                return (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: 20,
                                        height: 20,
                                        bgcolor: selected,
                                        border: "1px solid #ccc",
                                        borderRadius: "50%",
                                      }}
                                    />
                                    <Typography>
                                      {color ? color.name : "Chọn màu"}
                                    </Typography>
                                  </Box>
                                );
                              }}
                            >
                              {colorOptions.map((color) => (
                                <MenuItem key={color.hex} value={color.hex}>
                                  <Box
                                    sx={{
                                      display: "inline-block",
                                      width: 20,
                                      height: 20,
                                      bgcolor: color.hex,
                                      border: "1px solid #ccc",
                                      borderRadius: "50%",
                                      mr: 1,
                                    }}
                                  />
                                  {color.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <TextField
                            label="Số lượng"
                            type="number"
                            value={newVariant.quantity}
                            onChange={(e) =>
                              setNewVariant({
                                ...newVariant,
                                quantity: e.target.value,
                              })
                            }
                            onKeyDown={(e) => {
                              if (
                                e.key === "-" ||
                                e.key === "e" ||
                                e.key === "E"
                              )
                                e.preventDefault();
                            }}
                            size="small"
                            inputProps={{ min: 0, step: 1 }}
                          />

                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                          >
                            <Button
                              variant="outlined"
                              onClick={() => setAddingNew(false)}
                            >
                              Hủy
                            </Button>
                            <Button
                              variant="contained"
                              onClick={handleAddVariant}
                              disabled={loading}
                            >
                              {loading ? (
                                <CircularProgress size={20} color="inherit" />
                              ) : (
                                "Lưu"
                              )}
                            </Button>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  )}
                  {variant && variant.length > 0 ? (
                    <Box
                      sx={{
                        height: 420,
                        width: "100%",
                        bgcolor: "background.paper",
                        p: 2,
                        borderRadius: 3,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    >
                      <DataGrid
                        rows={variantRows}
                        columns={variant_columns}
                        getRowId={(row) => row.variantId}
                        initialState={{
                          pagination: {
                            paginationModel: { page: 0, pageSize: 5 },
                          },
                        }}
                        pageSizeOptions={[5, 10, 20]}
                        disableRowSelectionOnClick
                        sx={{
                          border: "none", // removes default DataGrid border
                          "& .MuiDataGrid-columnHeaders": {
                            backgroundColor: "#f5f5f5",
                            color: "#333",
                            fontWeight: "bold",
                            fontSize: "0.9rem",
                          },
                          "& .MuiDataGrid-cell": {
                            alignItems: "center",
                            fontSize: "0.875rem",
                          },
                          "& .MuiDataGrid-row:hover": {
                            backgroundColor: "#fafafa",
                          },
                        }}
                        processRowUpdate={async (newRow, oldRow) => {
                          if (newRow.quantity !== oldRow.quantity) {
                            await handleUpdateVariant(newRow.variantId, {
                              colorCode: oldRow.colorCode,
                              quantity: newRow.quantity,
                            });
                          }
                          return newRow;
                        }}
                        onProcessRowUpdateError={(error) => {
                          toast.error("Cập nhật thất bại: " + error.message);
                        }}
                      />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        p: 3,
                        border: "2px dashed #90caf9",
                        borderRadius: 2,
                        textAlign: "center",
                        color: "#1976d2",
                        fontStyle: "italic",
                        backgroundColor: "#e3f2fd",
                        mx: "auto",
                        maxWidth: 400,
                        mt: 4,
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        Không có biến thể sản phẩm
                      </Typography>
                      <Typography variant="body2">
                        Hiện tại sản phẩm chưa có biến thể nào được thêm vào.
                        Vui lòng cập nhật thông tin biến thể để khách hàng có
                        thể lựa chọn.
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setOpenEditDialog(false);
                  reloadTab2();
                }}
              >
                Đóng
              </Button>
              {/* <Button variant="contained" color="primary">
                Lưu
              </Button> */}
            </DialogActions>
          </Dialog>
          <Dialog
            open={openDesignDraftDetailDialog}
            onClose={() => setOpenDesignDraftDetailDialog(false)}
            maxWidth="xl"
            fullWidth
          >
            <DialogTitle>Thông Tin Rập</DialogTitle>
            <DialogContent dividers>
              {designDraftDetail && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* Thông tin chung */}
                  <Grid>
                    <Card>
                      <CardContent>
                        <Grid container spacing={2}>
                          {/* Cột trái: hình ảnh */}
                          <Grid>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "100%",
                              }}
                              onClick={() =>
                                handleClickOpen(
                                  designDraftDetail.sketchImageUrls &&
                                    designDraftDetail.sketchImageUrls.length > 0
                                    ? designDraftDetail.sketchImageUrls[0]
                                    : DesignDefaultImage
                                )
                              }
                            >
                              <img
                                src={
                                  designDraftDetail.sketchImageUrls &&
                                  designDraftDetail.sketchImageUrls.length > 0
                                    ? designDraftDetail.sketchImageUrls[0]
                                    : DesignDefaultImage
                                }
                                alt="Sản Phẩm"
                                style={{
                                  width: "100%",
                                  maxHeight: 150,
                                  objectFit: "cover",
                                  borderRadius: 8,
                                }}
                              />
                            </Box>
                          </Grid>

                          {/* Cột phải: thông tin */}
                          <Grid flex={1}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Box
                                display={"flex"}
                                flexDirection={"column"}
                                mb={2}
                              >
                                <Typography variant="h5">
                                  {designDraftDetail.name}
                                </Typography>
                                <Typography color="text.secondary">
                                  Mô tả: {designDraftDetail.description}
                                </Typography>
                              </Box>
                              <Chip
                                icon={<EcoIcon />}
                                label={`${designDraftDetail.recycledPercentage}% Bền Vững`}
                                size="small"
                                sx={{
                                  backgroundColor: "rgba(200, 248, 217, 1)",
                                  color: "rgba(22, 103, 86, 1)",
                                  fontSize: "15px",
                                }}
                              />
                            </Box>
                            <Box
                              sx={{ display: "flex", width: "100%", gap: 2 }}
                            >
                              {/* Giảm Khí CO₂ */}
                              <Grid size={6}>
                                <Box
                                  sx={{
                                    backgroundColor: "rgba(239, 246, 255, 1)", // Light blue background
                                    borderRadius: 2,
                                    padding: 2,
                                    textAlign: "center",
                                    width: "100%",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <FlashOnIcon
                                      fontSize="small"
                                      sx={{ color: "#1E88E5" }}
                                    />
                                    <Typography variant="body2" color="primary">
                                      Giảm Khí CO₂
                                    </Typography>
                                  </Box>
                                  <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    color="primary"
                                  >
                                    {designDraftDetail.totalCarbon} Kg
                                  </Typography>
                                </Box>
                              </Grid>
                              {/* Tiết Kiệm Nước */}
                              <Grid size={6}>
                                <Box
                                  sx={{
                                    backgroundColor:
                                      "rgb(236 254 255/var(--tw-bg-opacity,1))", // Light blue background
                                    borderRadius: 2,
                                    padding: 2,
                                    textAlign: "center",
                                    width: "100%",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <WaterDropIcon
                                      fontSize="small"
                                      sx={{ color: "#00ACC1" }}
                                    />
                                    <Typography
                                      variant="body2"
                                      sx={{ color: "#00ACC1" }}
                                    >
                                      Tiết Kiệm Nước
                                    </Typography>
                                  </Box>
                                  <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    sx={{ color: "#00ACC1" }}
                                  >
                                    {designDraftDetail.totalWater} L
                                  </Typography>
                                </Box>
                              </Grid>
                              {/* Giảm Rác Thải */}
                              <Grid size={6}>
                                <Box
                                  sx={{
                                    backgroundColor: "#FFF3E0", // Light blue background
                                    borderRadius: 2,
                                    padding: 2,
                                    textAlign: "center",
                                    width: "100%",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <DeleteSweepIcon
                                      fontSize="small"
                                      sx={{ color: "#F57C00" }}
                                    />
                                    <Typography
                                      variant="body2"
                                      sx={{ color: "#F57C00" }}
                                    >
                                      Giảm Rác Thải
                                    </Typography>
                                  </Box>
                                  <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    sx={{ color: "#F57C00" }}
                                  >
                                    {designDraftDetail.totalWaste}%
                                  </Typography>
                                </Box>
                              </Grid>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Draft Parts */}
                  <Grid>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">Mảnh Rập</Typography>

                        {designDraftDetail.draftParts &&
                        designDraftDetail.draftParts.length > 0 ? (
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Tên</TableCell>
                                <TableCell>Chiều Dài</TableCell>
                                <TableCell>Chiều Rộng</TableCell>
                                <TableCell>Số Mảnh Rập</TableCell>
                                <TableCell>Nguyên Liệu</TableCell>
                                <TableCell>Loại Vải</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {designDraftDetail.draftParts.map(
                                (part, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{part.name}</TableCell>
                                    <TableCell>{part.length} cm</TableCell>
                                    <TableCell>{part.width} cm</TableCell>
                                    <TableCell>{part.quantity}</TableCell>
                                    <TableCell>{part.materialName}</TableCell>
                                    <TableCell>
                                      {(() => {
                                        switch (
                                          part.materialStatus.toLowerCase()
                                        ) {
                                          case "main":
                                            return "Vải Chính";
                                          case "lining":
                                            return "Vải Lót";
                                          case "trims":
                                            return "Phụ Liệu";
                                          case "other":
                                            return "Khác";
                                          default:
                                            return part.materialStatus;
                                        }
                                      })()}
                                    </TableCell>
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>
                        ) : (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                          >
                            Không có mảnh rập
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                  {/* Materials */}
                  <Grid>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">
                          Nguyên Liệu Sử Dụng
                        </Typography>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Nguyên Liệu</TableCell>
                              <TableCell>Mét Vải Sử Dụng</TableCell>
                              <TableCell>Giá 1 Mét Vải</TableCell>
                              <TableCell>Tổng Chi Phí</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {designDraftDetail.materials.map((m) => (
                              <TableRow key={m.materialId}>
                                <TableCell>{m.materialName}</TableCell>
                                <TableCell>{m.meterUsed} m</TableCell>
                                <TableCell>
                                  {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(m.price)}
                                </TableCell>
                                <TableCell>
                                  {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(m.price * m.meterUsed)}
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell colSpan={3} align="right">
                                <strong>Tổng Chi Phí:</strong>
                              </TableCell>
                              <TableCell>
                                <strong>
                                  {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(
                                    designDraftDetail.materials.reduce(
                                      (sum, m) => sum + m.price * m.meterUsed,
                                      0
                                    )
                                  )}
                                </strong>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDesignDraftDetailDialog(false)}>
                Đóng
              </Button>
            </DialogActions>
          </Dialog>
          <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
          >
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={(theme) => ({
                position: "absolute",
                right: 8,
                top: 8,
                color: theme.palette.grey[500],
              })}
            >
              <CloseIcon />
            </IconButton>

            <img
              src={selectedImage || ""}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                borderRadius: 10,
              }}
            />
          </BootstrapDialog>
        </Box>
      )}

      {/* Tab Vật Liệu*/}
      {tabIndex === 3 && (
        <Box sx={{ width: "100%" }}>
          {/* Material Stat */}
          <Box
            sx={{
              width: "100%",
              display: "flex",
              gap: 3,
            }}
          >
            {material_stats.map((item, index) => (
              <Grid key={index} sx={{ flex: 1, margin: "20px 0" }}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="subtitle2" color="text.secondary">
                        {item.title}
                      </Typography>
                      <Avatar
                        sx={{ bgcolor: item.color, width: 35, height: 35 }}
                      >
                        {item.icon}
                      </Avatar>
                    </Stack>
                    <Typography variant="h5" fontWeight="bold" mt={1}>
                      {item.value}
                    </Typography>
                    <Typography variant="body2" color="success.main" mt={0.5}>
                      {item.subtitle}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Box>
          {/* Table */}
          <DataGrid
            rows={generateMockMaterial(storedMaterial)}
            columns={material_columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            pageSizeOptions={[5]}
            disableRowSelectionOnClick
            sx={{
              width: "100%", // or set a fixed px width like "800px"
            }}
          />
        </Box>
      )}

      {tabIndex === 1 && (
        <Box mt={3}>
          {/* Header */}
          <Box
            sx={{
              pb: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Lịch Sử Sản Phẩm
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Các thay đổi gần đây
            </Typography>
          </Box>
          <DataGrid
            rows={generateMockInventoryTransaction(
              inventoryTransactions
            ).filter((tx) => tx.inventoryType?.toLowerCase() === "product")}
            columns={productTransaction_columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            getRowId={(row) => row.transactionId}
            pageSizeOptions={[5]}
            disableRowSelectionOnClick
            sx={{
              width: "100%", // or set a fixed px width like "800px"
            }}
          />
        </Box>
      )}

      {/* Tab Quản Lý Đơn Hàng */}
      {tabIndex === 4 && (
        <Box sx={{ width: "100%" }}>
          <DesignerOrders />
        </Box>
      )}

      {tabIndex === 3 && (
        <Box mt={3}>
          {/* Header */}
          <Box
            sx={{
              pb: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Lịch Sử Vật Liệu
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Các thay đổi gần đây
            </Typography>
          </Box>
          <DataGrid
            rows={generateMockInventoryTransaction(
              inventoryTransactions
            ).filter((tx) => tx.inventoryType?.toLowerCase() === "material")}
            columns={materialTransaction_columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            getRowId={(row) => row.transactionId}
            pageSizeOptions={[5]}
            disableRowSelectionOnClick
            sx={{
              width: "100%", // or set a fixed px width like "800px"
            }}
          />
        </Box>
      )}

      {/* Bottom Part */}
      <Box sx={{ width: "100%", display: "flex", gap: 3, margin: "30px 0" }}>
        {/* Card Quản Lí Giao Hàng */}
        <Card
          sx={{
            width: 300,
            textAlign: "center",
            p: 2,
            flex: 1,
            border: "1px solid rgba(0, 0, 0, 0.1)",
          }}
        >
          <Box sx={{ display: "flex", margin: "10px 0", gap: 1 }}>
            <LocalShippingOutlinedIcon
              color="success"
              sx={{ margin: "auto 0" }}
            />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Quản Lý Đơn Hàng
            </Typography>
          </Box>
          <Stack spacing={2} marginBottom={3}>
            {orders.map((item, index) => (
              <Button
                key={index}
                variant="outlined"
                sx={{
                  borderColor: "rgba(0,0,0,0.1)",
                  textTransform: "none",
                }}
              >
                <Box sx={{ width: "100%", display: "flex" }}>
                  <Box
                    sx={{
                      textAlign: "left",
                      padding: "10px",
                      display: "flex",
                      flexDirection: "column",
                      marginRight: "auto",
                    }}
                  >
                    <Typography
                      sx={{
                        width: "100%",
                        marginRight: "auto",
                        fontWeight: "bold",
                        color: "black",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.product}
                    </Typography>
                    <Typography
                      sx={{
                        color: "black",
                        opacity: "40%",
                      }}
                    >
                      {item.orderId}
                    </Typography>
                  </Box>
                  {/* Conditional Chip */}
                  {item.status === 1 ? (
                    <Chip
                      label="Đang vận chuyển"
                      sx={{
                        backgroundColor: "rgba(219, 234, 254, 1)",
                        color: "rgba(62, 92, 188, 1)",
                      }}
                    />
                  ) : item.status === 2 ? (
                    <Chip
                      label="Chưa Xử Lý"
                      sx={{
                        backgroundColor: "rgba(220, 252, 231, 1)",
                        color: "rgba(59, 129, 86, 1)",
                      }}
                    />
                  ) : item.status === 3 ? (
                    <Chip
                      label="Đã hoàn thành"
                      sx={{
                        backgroundColor: "rgba(254, 249, 195, 1)",
                        color: "rgba(139, 86, 23, 1)",
                      }}
                    />
                  ) : (
                    <Chip label="Không Xác Định" color="error" />
                  )}
                </Box>
              </Button>
            ))}
          </Stack>

          <Button variant="contained" color="success">
            Xem toàn bộ đơn hàng
          </Button>
        </Card>
      </Box>
    </Box>
  ) : (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: 200,
      }}
    >
      <CircularProgress />
    </Box>
  );
}
