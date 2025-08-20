import {
  AppBar,
  Autocomplete,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  colors,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  Link,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  styled,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { DesignService } from "../../services/api";
import { toast } from "react-toastify";
import {
  DesignType,
  MaterialType,
  StoredMaterial,
  TypeMaterial,
} from "../../services/api/designService";
//Icon
import { DraftIcon, EcoIcon } from "../../assets/icons/icon";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import DeleteOutlineTwoToneIcon from "@mui/icons-material/DeleteOutlineTwoTone";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import SearchIcon from "@mui/icons-material/Search";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
//Generate UUid
import { v4 as uuidv4 } from "uuid";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CardsFormSchema,
  CardsFormType,
} from "../../schemas/createDesignDraftSchema";
import { CreateDesignFormValues } from "../../schemas";
import { createDesignSchema } from "../../schemas/createDesignSchema";
import {
  CreateDesignDraftFormValues,
  createDesignDraftSchema,
} from "../../schemas/createDesignDraftTesting";
import FileUpload from "../../components/FileUpload";
import { useNavigate } from "react-router-dom";

export default function AddDesignDraft() {
  const [laborCost, setLaborCost] = useState(16000);
  const [laborHour, setLaborHour] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // //Design Data
  // const [material, setMaterial] = useState<StoredMaterial[]>([]);

  //Design Type Data
  const [designType, setDesignType] = useState<DesignType[]>([]);

  //Material Type Data
  const [materialType, setMaterialType] = useState<MaterialType[]>([]);

  //Get Design Type
  const [designTypeData, setDesignTypeData] = useState("");

  //Material  Data
  const [material, setMaterial] = useState<TypeMaterial[]>([]);

  const handleChangeDesign = (event: SelectChangeEvent) => {
    setDesignTypeData(event.target.value as string);
  };

  //Get Material Data
  useEffect(() => {
    loadStoredMaterial();
  }, []);

  const loadStoredMaterial = async () => {
    try {
      setLoading(true);
      setError(null);

      const designTypeData = await DesignService.getDesignType();
      setDesignType(designTypeData);

      const materialTypeData = await DesignService.getMaterialType();
      setMaterialType(materialTypeData);
    } catch (error: any) {
      const errorMessage =
        error.message || "Không thể tải danh sách nhà thiết kế";
      setError(errorMessage);
      toast.error(errorMessage, { position: "bottom-center" });
    } finally {
      setLoading(false);
    }
  };

  type MaterialItem = {
    materialId: number;
    name: string;
    // Add other fields if needed
  };

  const [materialMap, setMaterialMap] = useState<
    Record<number, MaterialItem[]>
  >({});

  const getMaterial = async (cardId: string, materialTypeId: number) => {
    try {
      const materialData = await DesignService.getMaterialByType(
        materialTypeId
      );
      setMaterialMap((prev) => ({
        ...prev,
        [cardId]: materialData, // store per-card
      }));
    } catch (error) {
      console.error("Failed to fetch materials:", error);
    }
  };

  type CardData = {
    id: string;
    label: string;
    draftName: string;
    width: number;
    height: number;
    draftQuantity: number;
    materialType: {
      typeId: number;
      typeName: string;
    };
    material: {
      materialId: number;
      name: string;
      pricePerUnit: number;
      quantityAvailable: number;
      carbonFootprint: number;
      carbonFootprintUnit: string;
      waterUsage: number;
      waterUsageUnit: string;
      wasteDiverted: number;
      wasteDivertedUnit: string;
      productionCountry: string;
      productionRegion: string;
      transportDistance: number;
      transportMethod: string;
      supplierName: string;
      sustainabilityScore: number;
      sustainabilityColor: string;
      certificationDetails: string;
    };
    // (Add more fields later if needed)
  };

  const [cards, setCards] = useState<CardData[]>([]);

  const handleAddCard = () => {
    setSearchTerm("");
    const newId = uuidv4();
    const newCard: CardsFormType["cards"][number] = {
      id: uuidv4(),
      label: "Chính",
      draftName: "",
      width: 0,
      height: 0,
      draftQuantity: 1,
      materialType: {
        typeId: 0,
        typeName: "",
      },
      material: {
        materialId: 0,
        name: "",
        pricePerUnit: 0,
        quantityAvailable: 0,
        carbonFootprint: 0,
        carbonFootprintUnit: "Kg",
        waterUsage: 0,
        waterUsageUnit: "L",
        wasteDiverted: 0,
        wasteDivertedUnit: "%",
        productionCountry: "",
        productionRegion: "",
        transportDistance: 0,
        transportMethod: "",
        supplierName: "",
        sustainabilityScore: 0,
        sustainabilityColor: "",
        certificationDetails: "",
      },
    };
    setCards((prev) => [...prev, newCard]);
  };

  const handleRemoveCard = (idToRemove: string) => {
    setCards((prev) => prev.filter((card) => card.id !== idToRemove));
  };

  //Change Label
  const handleChangeLabel = (id: string, newLabel: string) => {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, label: newLabel } : card))
    );
  };

  //Change Width
  const handleChangeWidth = (id: string, newWidth: number) => {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, width: newWidth } : card))
    );
  };

  //Change Height
  const handleChangeHeight = (id: string, newHeigth: number) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, height: newHeigth } : card
      )
    );
  };

  //Change Material Type
  const handleMaterialTypeChange = async (
    cardId: string,
    typeId: number,
    typeName: string
  ) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? {
              ...card,
              materialType: { typeId, typeName },
              material: {
                materialId: null,
                name: "",
                pricePerUnit: 0,
                quantityAvailable: 0,
                carbonFootprint: 0,
                carbonFootprintUnit: "Kg",
                waterUsage: 0,
                waterUsageUnit: "L",
                wasteDiverted: 0,
                wasteDivertedUnit: "%",
                productionCountry: "",
                productionRegion: "",
                transportDistance: 0,
                transportMethod: "",
                supplierName: "",
                sustainabilityScore: 0,
                sustainabilityColor: "",
                certificationDetails: "",
              },
            }
          : card
      )
    );
    await getMaterial(cardId, typeId);
  };

  //Change Material
  const handleMaterialChange = async (
    cardId: string,
    materialId: number,
    name: string,
    pricePerUnit: number,
    quantityAvailable: number,
    carbonFootprint: number,
    carbonFootprintUnit: string,
    waterUsage: number,
    waterUsageUnit: string,
    wasteDiverted: number,
    wasteDivertedUnit: string,
    productionCountry: string,
    productionRegion: string,
    transportDistance: number,
    transportMethod: string,
    supplierName: string,
    sustainabilityScore: number,
    sustainabilityColor: string,
    certificationDetails: string
  ) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? {
              ...card,
              material: {
                materialId,
                name,
                pricePerUnit,
                quantityAvailable,
                carbonFootprint,
                carbonFootprintUnit,
                waterUsage,
                waterUsageUnit,
                wasteDiverted,
                wasteDivertedUnit,
                productionCountry,
                productionRegion,
                transportDistance,
                transportMethod,
                supplierName,
                sustainabilityScore,
                sustainabilityColor,
                certificationDetails,
              },
            }
          : card
      )
    );
  };

  //Change Draft Name
  const handleChangeDraftName = (cardId: string, value: string) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, draftName: value } : card
      )
    );
  };

  //Change Quantity
  const handleChangeQuantityAvailable = (id: string, newQuantity: number) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, draftQuantity: newQuantity } : card
      )
    );
  };

  //Tìm kiếm draft name
  //Search
  const [searchTerm, setSearchTerm] = useState("");
  const findCardByDraftName = cards.filter((card) =>
    card.draftName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Bước 0: tính tổng diện tích cho từng loại vải và tổng loại vải khác nhau
  const totalAreaByMaterial = findCardByDraftName.reduce((acc, item) => {
    const key = item.material.materialId;
    const area = item.width * item.height * item.draftQuantity;
    acc[key] = (acc[key] || 0) + area;
    return acc;
  }, {} as Record<number, number>);

  const uniqueMaterialCount = Object.keys(totalAreaByMaterial).length;

  // Step 1: Group by materialId
  const groupedByMaterial = findCardByDraftName.reduce((acc, item) => {
    const key = item.material.materialId;
    const area = item.width * item.height * item.draftQuantity;

    const calcNeedMaterial = (totalArea: number) =>
      Math.ceil(((totalArea * 1.2) / 150 / 100) * 10) / 10; //(totalArea * (1 + 20 / 100)) là tính diện tích + phế liệu, /150 là 1 khổ vải là 150 cm, /100 đổi thành mét
    const needMaterialForThis = calcNeedMaterial(area);

    if (!acc[key]) {
      const percentMaterialUsed = 1 / uniqueMaterialCount; // Ví dụ: 2 nguyên liệu => 0.5

      // footprint của nguyên liệu này = footprint gốc * phần trăm chia đều
      const carbonForThis = item.material.carbonFootprint * percentMaterialUsed;
      const waterForThis = item.material.waterUsage * percentMaterialUsed;
      const wasteForThis = item.material.wasteDiverted * percentMaterialUsed;
      const sustainabilityScoreForThis =
        item.material.sustainabilityScore * percentMaterialUsed;
      acc[key] = {
        ...item,
        totalArea: area,
        needMaterial: needMaterialForThis,
        price: needMaterialForThis * item.material.pricePerUnit,

        totalCarbon: carbonForThis,
        totalWater: waterForThis,
        totalWaste: wasteForThis,
        sustainabilityScore: sustainabilityScoreForThis,
        allDraftNames: [item.draftName],
      };
    } else {
      acc[key].totalArea += area;
      acc[key].needMaterial = calcNeedMaterial(acc[key].totalArea);
      acc[key].price =
        acc[key].needMaterial * acc[key].material.pricePerUnit;
      acc[key].allDraftNames.push(item.draftName);
    }

    return acc;
  }, {} as Record<number, any>);

  // Step 2: Convert to array
  const groupedMaterial = Object.values(groupedByMaterial);
  //Step 3: Calc Sum of all
  const totalPrice = groupedMaterial.reduce((sum, item) => sum + item.price, 0);
  //Step 4: Calc Sum of all
  const totalMeterUsed = groupedMaterial.reduce(
    (sum, item) => sum + item.needMaterial,
    0
  );
  // Step 5.1: Calc Sum of TotalCarbon
  const totalCarbonAll =
    Math.round(
      Object.values(groupedByMaterial).reduce(
        (sum, item) => sum + item.totalCarbon,
        0
      ) * 10
    ) / 10;

  // Step 5.2: Calc Sum of TotalWater
  const totalWaterAll =
    Math.round(
      Object.values(groupedByMaterial).reduce(
        (sum, item) => sum + item.totalWater,
        0
      ) * 10
    ) / 10;

  // Step 5.3: Calc Sum of TotalWaste
  const totalWasteAll =
    Math.round(
      Object.values(groupedByMaterial).reduce(
        (sum, item) => sum + item.totalWaste,
        0
      ) * 10
    ) / 10;
  // Step 5.4: Calc Sum of sustainabilityScore
  const sustainabilityScoreAll = Math.round(
    Object.values(groupedByMaterial).reduce(
      (sum, item) => sum + item.sustainabilityScore,
      0
    )
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CreateDesignDraftFormValues>({
    resolver: zodResolver(createDesignDraftSchema),
    defaultValues: {
      name: "",
      description: "",
      recycledPercentage: 0,
      designTypeId: 0,
      unitPrice: null,
      salePrice: null,
      laborHours: null,
      laborCostPerHour: null,
      draftPartsJson: null,
      materialsJson: null,
      totalCarbon: 0,
      totalWater: 0,
      totalWaste: 0,
      sketchImages: [], // mảng file rỗng ban đầu
    },
  });

  useEffect(() => {
    setValue("designTypeId", Number(designTypeData));
    setValue("unitPrice", totalPrice);
    setValue("salePrice", totalPrice + laborCost * laborHour);
    setValue("laborHours", laborHour);
    setValue("laborCostPerHour", laborCost);
    setValue("totalCarbon", totalCarbonAll);
    setValue("totalWater", totalWaterAll);
    setValue("totalWaste", totalWasteAll);
    setValue("recycledPercentage", sustainabilityScoreAll);
  }, [
    designTypeData,
    totalPrice,
    laborCost,
    laborHour,
    totalCarbonAll,
    totalWaterAll,
    totalWasteAll,
    sustainabilityScoreAll,
    setValue,
  ]);

  const navigate = useNavigate();

  const onSubmit = async (formData: any) => {
    // Ví dụ: tính toán materialsJson để gửi API
    const materials = (() => {
      const uniqueCount = groupedMaterial.length; // số loại material khác nhau

      return groupedMaterial.map((item) => {
        const meterUsed = Math.round(item.needMaterial * 10) / 10; // đã là mét, làm tròn 1 chữ số thập phân
        const percentageUsed =
          uniqueCount === 1 ? 100 : Math.round((100 / uniqueCount) * 10) / 10;

        return {
          materialId: item.material.materialId,
          meterUsed,
          percentageUsed,
        };
      });
    })();

    //Tính DraftPartJson
    const cardsJson = cards.map((card) => {
      return {
        name: card.draftName,
        length: card.height,
        width: card.width,
        quantity: card.draftQuantity,
        materialId: card.material.materialId,
      };
    });
    const payload = {
      ...formData,
      designTypeId: designTypeData,
      unitPrice: totalPrice,
      salePrice: totalPrice + laborCost * laborHour,
      laborHours: laborHour,
      laborCostPerHour: laborCost,
      totalCarbon: totalCarbonAll,
      totalWater: totalWaterAll,
      totalWaste: totalWasteAll,
      recycledPercentage: sustainabilityScoreAll,
      materialsJson: materials,
      draftPartsJson: JSON.stringify(cardsJson),
    };

    console.log("📦 Payload gửi API:", payload);
    try {
      setLoading(true);
      console.log("Submitted:", payload);

      const result = await DesignService.createDesignDraft(payload);
      toast.success("Gửi đơn thành công!");
      navigate("/designer/dashboard?tab=design");
    } catch (err) {
      console.error("❌ Error submitting application:", err);
      console.error("❌ Error message:", err.message);
      toast.error("Có lỗi xảy ra khi gửi đơn.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Appbar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "white",
          borderBottom: "1px solid black",
          borderTop: "1px solid black",
          paddingLeft: 2,
        }}
      >
        <Breadcrumbs separator="›" aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/designer/dashboard">
            Dashboard
          </Link>
          <Typography color="text.primary">Thiết Kế Rập</Typography>
        </Breadcrumbs>
      </AppBar>
      <form
        onSubmit={handleSubmit(onSubmit, (errors) =>
          console.log("Validation lỗi:", errors)
        )}
      >
        {/* Top Part */}
        <Box sx={{ width: "100%", display: "flex", padding: 2 }}>
          {/* Title */}
          <Box
            sx={{
              width: "95%",
              display: "flex",
              justifyContent: "space-between",
              margin: "0 auto",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <EcoIcon />
                <Typography sx={{ fontWeight: "bold", fontSize: "30px" }}>
                  Thiết Kế Rập
                </Typography>
              </Box>
              <Typography>
                Tính toán nguyên vật liệu bền vững và đánh giá tác động môi
                trường
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                paddingTop: 2,
                paddingBottom: 2,
              }}
            >
              <Button
                variant="outlined"
                startIcon={<SaveAltIcon />}
                sx={{
                  color: "black",
                  borderColor: "black",
                  textTransform: "none",
                }}
              >
                Mẫu
              </Button>
              <Button
                type="submit"
                variant="outlined"
                startIcon={<SaveOutlinedIcon />}
                sx={{
                  color: "black",
                  borderColor: "black",
                  textTransform: "none",
                }}
              >
                Lưu
              </Button>
              <Button
                variant="contained"
                startIcon={<ShareOutlinedIcon sx={{ color: "white" }} />}
                sx={{
                  backgroundColor: "rgba(22, 163, 74, 1)",
                  color: "white",
                  borderColor: "rgba(22, 163, 74, 1)",
                  textTransform: "none",
                }}
              >
                Chia Sẻ
              </Button>
            </Box>
          </Box>
        </Box>
        {/* Mid Part */}
        <Box sx={{ width: "95%", padding: 2, margin: "0 auto" }}>
          {/* Đánh Giá Bền Vững */}
          <Box
            sx={{
              bgcolor: "#f0fff5",
              p: 1,
              borderRadius: 2,
              border: "1px solid #d2f5e8",
              width: "100%",
              margin: "0 auto",
            }}
          >
            {/* Tittle */}

            <Box sx={{ display: "flex", mb: 2, width: "100%" }}>
              <WorkspacePremiumOutlinedIcon sx={{ color: "green", mr: 1 }} />
              <Typography fontWeight="bold" fontSize="1.2rem">
                Đánh Giá Bền Vững
              </Typography>
            </Box>
            {/* Chỉ Số Bền Vững */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                paddingLeft: 15,
                paddingRight: 15,
                paddingBottom: 2,
                alignItems: "center",
              }}
            >
              {/* Tổng thể */}
              <Grid textAlign="center" sx={{ xs: 12, md: 3 }}>
                <Typography
                  fontSize="2rem"
                  color="rgba(22, 163, 74, 1)"
                  fontWeight="bold"
                >
                  {sustainabilityScoreAll}/100
                </Typography>
                <Typography color="rgba(22, 163, 74, 1)">
                  Điểm tổng thể
                </Typography>
                {/* <Typography color="error" fontSize="0.875rem">
                Cần cải thiện
              </Typography> */}
              </Grid>

              {/* Carbon */}
              <Grid textAlign="center" sx={{ xs: 12, md: 3 }}>
                <Typography color="primary" fontWeight="bold" fontSize="1.5rem">
                  {totalCarbonAll} kg
                </Typography>
                <Typography color="text.secondary">Giảm lượng CO2</Typography>
              </Grid>

              {/* Water */}
              <Grid textAlign="center" sx={{ xs: 12, md: 3 }}>
                <Typography
                  sx={{ color: "teal" }}
                  fontWeight="bold"
                  fontSize="1.5rem"
                >
                  {totalWaterAll} L
                </Typography>
                <Typography color="text.secondary">Tiết kiệm nước</Typography>
              </Grid>

              {/* Certification */}
              <Grid textAlign="center" sx={{ xs: 12, md: 3 }}>
                <Typography
                  sx={{ color: "#F57C00" }}
                  fontWeight="bold"
                  fontSize="1.5rem"
                >
                  {totalWasteAll} %
                </Typography>
                <Typography color="text.secondary">
                  Giảm Số Lượng Rác Thải
                </Typography>
              </Grid>
            </Box>
          </Box>
          {/* Thông Tin Sản Phẩm */}
          <Card
            sx={{
              m: "10px 0",
              border: "1px solid rgba(0, 0, 0, 0.2)",
              borderRadius: "5px",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <CheckroomIcon sx={{ color: "rgba(22, 163, 74, 1)" }} />
                <Typography variant="h6" fontWeight="bold">
                  Thông Tin Rập
                </Typography>
              </Box>
              <Grid container spacing={2} sx={{ marginBottom: 5 }}>
                {/* Design Type */}
                <Grid flex={1}>
                  <Box sx={{ width: "100%" }}>
                    <TextField
                      fullWidth
                      label="Tên rập"
                      {...register("name")}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  </Box>
                </Grid>
                <Grid flex={1}>
                  <Box sx={{ width: "100%" }}>
                    <FormControl fullWidth>
                      <InputLabel id="design-type-label">
                        Loại Thời Trang
                      </InputLabel>
                      <Select
                        labelId="design-type-label"
                        id="designType-select"
                        value={designTypeData}
                        label="Loại Thời Trang"
                        onChange={handleChangeDesign}
                      >
                        {designType.map((dt) => (
                          <MenuItem value={dt.itemTypeId}>
                            {dt.typeName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
                {/* Labor Hour */}
                <Grid flex={1}>
                  <Box sx={{ width: "100%" }}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Tiền Công Một Giờ"
                      value={laborCost}
                      defaultValue={1}
                      onChange={(e) => {
                        const value = e.target.value;

                        // Chỉ cho phép số nguyên dương hoặc rỗng
                        if (value === "") {
                          setLaborCost(0);
                          return;
                        }

                        const intValue = parseInt(value, 10);
                        if (!isNaN(intValue) && intValue >= 0) {
                          setLaborCost(intValue);
                        }
                      }}
                      inputProps={{ min: 0, step: 1 }}
                    />
                  </Box>
                </Grid>
                {/* Quantity */}
                <Grid flex={1}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Giờ Làm"
                    value={laborHour}
                    defaultValue={1}
                    onChange={(e) => {
                      const value = e.target.value;

                      // Chỉ cho phép số nguyên dương hoặc rỗng
                      if (value === "") {
                        setLaborHour(0);
                        return;
                      }

                      const intValue = parseInt(value, 10);
                      if (!isNaN(intValue) && intValue >= 0) {
                        setLaborHour(intValue);
                      }
                    }}
                    inputProps={{ min: 0, step: 1 }}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid flex={1}>
                  <TextField
                    name="description"
                    label="Mô tả"
                    multiline
                    rows={5}
                    placeholder="Nhập vào"
                    sx={{ width: "100%", height: "100%" }}
                    {...register("description")}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                </Grid>
                <Grid flex={1}>
                  <Typography
                    variant="caption"
                    fontWeight={"bold"}
                    sx={{ mb: 2 }}
                  >
                    Ảnh Rập
                  </Typography>
                  <Controller
                    name="sketchImages"
                    control={control}
                    rules={{ required: "Cần thêm hình ảnh" }}
                    render={({ field, fieldState }) => (
                      <FileUpload
                        label=""
                        multiple
                        files={
                          field.value
                            ? Array.isArray(field.value)
                              ? field.value
                              : [field.value]
                            : []
                        }
                        onFilesChange={(files) => field.onChange(files)}
                        accept="image/*"
                        maxSize={5}
                        required={!!fieldState.error} // shows red border or error state
                        helperText={fieldState.error?.message} // show the message
                      />
                    )}
                  />
                  <Typography variant="caption" sx={{ mt: 2 }}>
                    Thêm tối thiểu 3 hình ảnh bổ sung hiển thị các góc hoặc chi
                    tiết khác nhau{" "}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          {/* Thêm Mảnh Rập */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "stretch" }}>
            {/* Mảnh Rập */}
            <Grid flex={1}>
              <Card
                sx={{
                  border: "1px solid rgba(0, 0, 0, 0.2)",
                  width: "100%",
                  borderRadius: "5px",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <DraftIcon color={"rgba(22, 163, 74, 1)"} />
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          gap={2}
                          sx={{ marginLeft: "5px" }}
                        >
                          Mảnh Rập
                        </Typography>
                      </Box>
                      <Typography>
                        Nhập kích thước các mảnh rập (Size M làm chuẩn)
                      </Typography>
                    </Box>
                    <Box sx={{}}>
                      <Button
                        variant="contained"
                        sx={{
                          color: "white",
                          backgroundColor: "black",
                          borderRadius: "5px",
                        }}
                        onClick={handleAddCard}
                      >
                        + Thêm
                      </Button>
                    </Box>
                  </Box>
                  {/* Mảnh Rập Được Thêm */}
                  {/* Chưa Thêm Mảnh Rập */}
                  {cards.length === 0 ? (
                    <Box
                      sx={{
                        height: "400px", // hoặc "100%" nếu cha có chiều cao cố định
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                        gap: 1,
                      }}
                    >
                      <ReportGmailerrorredIcon sx={{ color: "red" }} />
                      <Typography
                        variant="h5"
                        textAlign="center"
                        color="text.secondary"
                        fontWeight={"bold"}
                      >
                        Bạn Cần Thêm Mảnh Rập
                      </Typography>
                    </Box>
                  ) : (
                    // Đã Thêm Mảnh Rập
                    <Box
                      sx={{
                        height: "auto",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          bgcolor: "white",
                          p: 0.5,
                          width: "100%",
                          border: "1px solid black",
                          borderRadius: "5px",
                          margin: "20px 0",
                        }}
                      >
                        <Box
                          sx={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <TextField
                            placeholder="Tìm kiếm Mảnh Rập..."
                            variant="standard"
                            fullWidth
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{ disableUnderline: true }}
                            sx={{ ml: 1 }}
                          />
                          <SearchIcon sx={{ color: "black", margin: "auto" }} />
                        </Box>
                      </Box>
                      {/* Không Có Mảnh Rập */}
                      {findCardByDraftName.length === 0 ? (
                        <Box
                          sx={{
                            height: "auto",
                            display: "flex",
                            gap: 2,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <ReportGmailerrorredIcon sx={{ color: "red" }} />
                          <Typography
                            variant="h5"
                            textAlign="center"
                            color="text.secondary"
                          >
                            Không tìm thấy Mảnh Rập
                          </Typography>
                        </Box>
                      ) : (
                        // Có Mảnh Rập
                        <Box
                          sx={{
                            height: cards.length > 0 ? 500 : "auto",
                            overflowY: "auto",
                          }}
                        >
                          {findCardByDraftName.map((card, index) => (
                            <Grid
                              key={card.id}
                              sx={{
                                border: "1px solid rgba(0, 0, 0, 0.1)",
                                borderRadius: "5px",
                                margin: "10px 0",
                              }}
                            >
                              <Card
                                sx={{
                                  width: "100%",
                                  padding: 2,
                                  margin: "auto",
                                }}
                              >
                                <CardContent>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                    }}
                                  >
                                    {/* Tên Mảnh Rập */}
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "20px",
                                        gap: 1,
                                      }}
                                    >
                                      <TextField
                                        id="draftName"
                                        label="Tên Mảnh Rập"
                                        variant="outlined"
                                        value={card.draftName}
                                        onChange={(e) =>
                                          handleChangeDraftName(
                                            card.id,
                                            e.target.value
                                          )
                                        }
                                        sx={{ width: "100%" }}
                                        InputLabelProps={{
                                          sx: {
                                            fontWeight: "bold",
                                            color: "black",
                                          },
                                        }}
                                      />
                                      <IconButton
                                        color="error"
                                        onClick={() =>
                                          handleRemoveCard(card.id)
                                        }
                                        sx={{
                                          color: "error.main",
                                          "&:hover": {
                                            color: "#ff1744", // màu đỏ sáng hơn, hoặc dùng theme color khác
                                          },
                                        }}
                                      >
                                        <DeleteOutlineTwoToneIcon />
                                      </IconButton>
                                    </Box>
                                    {/* Kích Thước */}
                                    <Box
                                      sx={{
                                        display: "flex",
                                        gap: 2,
                                        marginBottom: "20px",
                                      }}
                                    >
                                      <TextField
                                        id="width"
                                        label="Rộng (cm)"
                                        type="number"
                                        defaultValue="0"
                                        InputLabelProps={{
                                          sx: {
                                            fontWeight: "bold",
                                            color: "black",
                                          },
                                        }}
                                        onChange={(e) => {
                                          const value = Number(e.target.value);
                                          if (value >= 0) {
                                            handleChangeWidth(card.id, value);
                                          }
                                        }}
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === "-" ||
                                            e.key === "e" ||
                                            e.key === "E"
                                          ) {
                                            e.preventDefault();
                                          }
                                        }}
                                        inputProps={{ min: 0, step: 1 }}
                                      />
                                      <TextField
                                        id="height"
                                        label="Cao (cm)"
                                        type="number"
                                        defaultValue="0"
                                        InputLabelProps={{
                                          sx: {
                                            fontWeight: "bold",
                                            color: "black",
                                          },
                                        }}
                                        onChange={(e) => {
                                          const value = Number(e.target.value);
                                          if (value >= 0) {
                                            handleChangeHeight(card.id, value);
                                          }
                                        }}
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === "-" ||
                                            e.key === "e" ||
                                            e.key === "E"
                                          ) {
                                            e.preventDefault();
                                          }
                                        }}
                                        inputProps={{ min: 0, step: 1 }}
                                      />
                                      <TextField
                                        id="draftQuantity"
                                        label="Số lượng"
                                        defaultValue="1"
                                        InputLabelProps={{
                                          sx: {
                                            fontWeight: "bold",
                                            color: "black",
                                          },
                                        }}
                                        onChange={(e) => {
                                          const value = Number(e.target.value);
                                          if (value >= 0) {
                                            handleChangeQuantityAvailable(
                                              card.id,
                                              value
                                            );
                                          }
                                        }}
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === "-" ||
                                            e.key === "e" ||
                                            e.key === "E"
                                          ) {
                                            e.preventDefault();
                                          }
                                        }}
                                        inputProps={{ min: 0, step: 1 }}
                                      />
                                    </Box>
                                    {/* Loại Vật Liệu */}
                                    <Box
                                      sx={{
                                        display: "flex",
                                        gap: 2,
                                      }}
                                    >
                                      {/* Label */}
                                      <Box sx={{ width: 200 }}>
                                        <FormControl fullWidth>
                                          <Select
                                            id="lining-select"
                                            value={card.label}
                                            onChange={(e) =>
                                              handleChangeLabel(
                                                card.id,
                                                e.target.value
                                              )
                                            }
                                          >
                                            <MenuItem value={"Chính"}>
                                              Vải Chính
                                            </MenuItem>
                                            <MenuItem value={"Lót"}>
                                              Vải Lót
                                            </MenuItem>
                                            <MenuItem value={"Phụ Liệu"}>
                                              Phụ Liệu
                                            </MenuItem>
                                          </Select>
                                        </FormControl>
                                      </Box>
                                      {/* Loại Vật Liệu */}
                                      <Box sx={{ width: 200 }}>
                                        <FormControl fullWidth>
                                          <InputLabel id="material-type-label">
                                            Loại Vải
                                          </InputLabel>
                                          <Select
                                            labelId="material-type-label"
                                            id="materialType-select"
                                            value={card.materialType.typeId}
                                            label="Loại Vật Liệu"
                                            onChange={async (e) => {
                                              const selected =
                                                materialType.find(
                                                  (m) =>
                                                    m.typeId === e.target.value
                                                );
                                              if (selected) {
                                                handleMaterialTypeChange(
                                                  card.id,
                                                  selected.typeId,
                                                  selected.typeName
                                                );
                                              }
                                            }}
                                          >
                                            {materialType.map((dt) => (
                                              <MenuItem
                                                key={dt.typeId}
                                                value={dt.typeId}
                                              >
                                                {dt.typeName}
                                              </MenuItem>
                                            ))}
                                          </Select>
                                        </FormControl>
                                      </Box>
                                      {/* Vải Sử Dụng */}
                                      {card.materialType.typeId && (
                                        <Box sx={{ width: 200 }}>
                                          <FormControl fullWidth>
                                            <Autocomplete
                                              id="materialUsed-autocomplete"
                                              options={
                                                materialMap[card.id] || []
                                              }
                                              getOptionLabel={(option) =>
                                                option.name || ""
                                              }
                                              value={card.material || null}
                                              onChange={(event, newValue) => {
                                                if (newValue) {
                                                  handleMaterialChange(
                                                    card.id,
                                                    newValue.materialId,
                                                    newValue.name,
                                                    newValue.pricePerUnit,
                                                    newValue.quantityAvailable,
                                                    newValue.carbonFootprint,
                                                    newValue.carbonFootprintUnit,
                                                    newValue.waterUsage,
                                                    newValue.waterUsageUnit,
                                                    newValue.wasteDiverted,
                                                    newValue.wasteDivertedUnit,
                                                    newValue.productionCountry,
                                                    newValue.productionRegion,
                                                    newValue.transportDistance,
                                                    newValue.transportMethod,
                                                    newValue.supplierName,
                                                    newValue.sustainabilityScore,
                                                    newValue.sustainabilityColor,
                                                    newValue.certificationDetails
                                                  );
                                                }
                                              }}
                                              renderInput={(params) => (
                                                <TextField
                                                  {...params}
                                                  label="Vải Sử Dụng"
                                                />
                                              )}
                                              fullWidth
                                            />
                                          </FormControl>
                                        </Box>
                                      )}
                                    </Box>
                                  </Box>
                                  <Chip
                                    icon={
                                      <SquareFootIcon
                                        sx={{ colors: "black" }}
                                      />
                                    }
                                    label={`${card.width} x ${card.height} cm (Size M)`}
                                    size="medium"
                                    sx={{
                                      backgroundColor: "white",
                                      border: "1px solid rgba(0, 0, 0, 0.3)",
                                      color: "black",
                                      fontSize: "15px",
                                      fontWeight: "bold",
                                      margin: "auto",
                                      mt: 2,
                                    }}
                                  />
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Box>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Kết Quả Tính Toán */}
            <Grid flex={1}>
              <Card
                sx={{
                  height: "100%", // Match height
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid rgba(0, 0, 0, 0.2)",
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CalculateOutlinedIcon />
                    <Typography variant="h6" fontWeight="bold">
                      Kết Quả Tính Toán
                    </Typography>
                  </Box>
                  <Tabs
                    value={tabIndex}
                    onChange={(_, newVal) => setTabIndex(newVal)}
                    sx={{ mb: 2 }}
                  >
                    <Tab label="Vật Liệu" />
                    <Tab label="Chi Phí" />
                    <Tab label="Bền Vững" />
                    <Tab label="Tổng Kết" />
                  </Tabs>
                  {/* Vật Liệu */}
                  {tabIndex === 0 && (
                    <>
                      {groupedMaterial.length > 0 ? (
                        groupedMaterial.map((m) => (
                          <Box
                            key={m.id}
                            sx={{
                              mb: 2,
                              p: 2,
                              border: "1px solid #ccc",
                              borderRadius: 2,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              {m.material.sustainabilityColor && (
                                <Box
                                  sx={{
                                    width: 20,
                                    height: 20,
                                    bgcolor: `${m.material.sustainabilityColor}`,
                                    borderRadius: 1,
                                    marginRight: 1,
                                  }}
                                />
                              )}
                              <Typography fontWeight="bold">
                                {m.material.name
                                  ? m.material.name
                                  : `Chọn Vật Liệu ${m.draftName}`}
                              </Typography>
                              <Chip
                                variant="outlined"
                                label={m.label}
                                size="small"
                                sx={{ ml: 1, fontWeight: "bold" }}
                              />
                              <Chip
                                label={`${m.material.sustainabilityScore} %`}
                                variant="outlined"
                                size="small"
                                sx={{
                                  ml: 1,
                                  color: `${m.material.sustainabilityColor}`,
                                  fontWeight: "bold",
                                }}
                              />
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                width: "90%",
                              }}
                            >
                              <Box>
                                {/* Diện Tích */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mt: 1,
                                    width: "100%",
                                    gap: 1,
                                  }}
                                >
                                  <Typography variant="body2">
                                    Diện tích:
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: "bold" }}
                                  >
                                    {new Intl.NumberFormat("de-DE").format(
                                      m.totalArea
                                    )}{" "}
                                    cm²
                                  </Typography>
                                </Box>
                                {/* Xuất xứ */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mt: 1,
                                    width: "100%",
                                    gap: 1,
                                  }}
                                >
                                  <Typography variant="body2">
                                    Xuất xứ:
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: "bold" }}
                                  >
                                    {m.material.productionCountry}
                                    {m.material.productionRegion
                                      ? `, ${m.material.productionRegion}`
                                      : ""}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body1">
                                  Mét Vải Cần thiết:
                                </Typography>
                                <Typography
                                  variant="body1"
                                  color="primary"
                                  sx={{ fontWeight: "bold" }}
                                >
                                  {m.needMaterial} mét
                                </Typography>
                              </Box>
                            </Box>
                            {m.material.certificationDetails && (
                              <Box mt={1}>
                                {m.material.certificationDetails
                                  .split(",")
                                  .map((item) => item.trim())
                                  .map((cert, index) => (
                                    <Chip
                                      key={index}
                                      label={cert}
                                      sx={{
                                        fontWeight: "bold",
                                        marginRight: 1,
                                      }}
                                      size="small"
                                    />
                                  ))}
                              </Box>
                            )}
                            {/* Trung bình vải sẽ có 20% phế liệu */}
                            <Typography variant="caption" color="error">
                              Phế liệu ước tính: {m.totalArea * 0.2} cm²
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Box
                          sx={{
                            height: "400px", // hoặc "100%" nếu cha có chiều cao cố định
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            gap: 1,
                          }}
                        >
                          <ReportGmailerrorredIcon sx={{ color: "red" }} />
                          <Typography
                            variant="h5"
                            textAlign="center"
                            color="text.secondary"
                            fontWeight={"bold"}
                          >
                            Bạn Cần Thêm Mảnh Rập
                          </Typography>
                        </Box>
                      )}
                    </>
                  )}
                  {/* Chi Phí */}
                  {tabIndex === 1 && (
                    <>
                      {cards.length === 0 ? (
                        <Box
                          sx={{
                            height: "400px", // hoặc "100%" nếu cha có chiều cao cố định
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            gap: 1,
                          }}
                        >
                          <ReportGmailerrorredIcon sx={{ color: "red" }} />
                          <Typography
                            variant="h5"
                            textAlign="center"
                            color="text.secondary"
                            fontWeight={"bold"}
                          >
                            Bạn Cần Thêm Mảnh Rập
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                          {/* Tổng Tiền */}
                          <Box
                            sx={{
                              bgcolor: "#f0fff5",
                              p: 1,
                              borderRadius: 2,
                              border: "1px solid #d2f5e8",
                              width: "100%",
                              margin: "0 auto",
                              marginBottom: 3,
                            }}
                          >
                            <Box
                              sx={{
                                width: "100%",
                                paddingLeft: 15,
                                paddingRight: 15,
                                paddingBottom: 2,
                                alignItems: "center",
                                margin: "auto",
                              }}
                            >
                              <Grid textAlign="center" sx={{ xs: 12, md: 3 }}>
                                <Typography
                                  fontSize="2rem"
                                  color="rgba(22, 163, 74, 1)"
                                  fontWeight="bold"
                                >
                                  {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(totalPrice)}
                                </Typography>
                                <Typography color="rgba(22, 163, 74, 1)">
                                  Tổng chi phí
                                </Typography>
                              </Grid>
                            </Box>
                          </Box>
                          {/* Giá Từng Loại Vải */}
                          {groupedMaterial.length > 0 &&
                            groupedMaterial.map((m) => (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 2,
                                }}
                              >
                                <Box
                                  key={m.id}
                                  sx={{
                                    mb: 2,
                                    p: 2,
                                    border: "1px solid #ccc",
                                    borderRadius: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <Typography>{m.material.name}</Typography>
                                  <Typography>
                                    {new Intl.NumberFormat("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    }).format(m.price)}
                                  </Typography>
                                </Box>
                              </Box>
                            ))}
                        </Box>
                      )}
                    </>
                  )}
                  {/* Bền Vững */}
                  {tabIndex === 2 && (
                    <>
                      {cards.length === 0 ? (
                        <Box
                          sx={{
                            height: "400px", // hoặc "100%" nếu cha có chiều cao cố định
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            gap: 1,
                          }}
                        >
                          <ReportGmailerrorredIcon sx={{ color: "red" }} />
                          <Typography
                            variant="h5"
                            textAlign="center"
                            color="text.secondary"
                            fontWeight={"bold"}
                          >
                            Bạn Cần Thêm Mảnh Rập
                          </Typography>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            width: "100%",
                            height: "300px",
                            margin: "auto",
                          }}
                        >
                          <Grid
                            container
                            rowSpacing={1}
                            columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                          >
                            <Grid size={6}>
                              <Box sx={{ width: "100%" }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 0.5,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <EcoIcon />
                                    <Typography variant="body2">
                                      Tính Bền Vững
                                    </Typography>
                                  </Box>
                                  <Typography variant="body2">
                                    {sustainabilityScoreAll}%
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={sustainabilityScoreAll}
                                  sx={{
                                    height: 8,
                                    borderRadius: 5,
                                    backgroundColor: "#e0e0e0",
                                    "& .MuiLinearProgress-bar": {
                                      backgroundColor: "black",
                                      borderRadius: 5,
                                    },
                                  }}
                                />
                              </Box>
                            </Grid>
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
                                  {totalCarbonAll} Kg
                                </Typography>
                              </Box>
                            </Grid>
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
                                  {totalWaterAll} L
                                </Typography>
                              </Box>
                            </Grid>
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
                                  {totalWasteAll}%
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                          <Box
                            sx={{
                              border: "1px solid #e0e0e0",
                              borderRadius: 2,
                              padding: 2,
                              backgroundColor: "#fff",
                              margin: "10px 0",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 1,
                              }}
                            >
                              <TrendingUpIcon
                                fontSize="small"
                                sx={{ color: "black" }}
                              />
                              <Typography variant="body2" fontWeight="medium">
                                Gợi ý cải thiện:
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              component="ul"
                              sx={{ pl: 2 }}
                            >
                              <li>Thiết kế đã đạt tiêu chuẩn bền vững tốt!</li>
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </>
                  )}
                  {/* Tổng Kết */}
                  {tabIndex === 3 && (
                    <>
                      {cards.length === 0 ? (
                        <Box
                          sx={{
                            height: "400px", // hoặc "100%" nếu cha có chiều cao cố định
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            gap: 1,
                          }}
                        >
                          <ReportGmailerrorredIcon sx={{ color: "red" }} />
                          <Typography
                            variant="h5"
                            textAlign="center"
                            color="text.secondary"
                            fontWeight={"bold"}
                          >
                            Bạn Cần Thêm Mảnh Rập
                          </Typography>
                        </Box>
                      ) : (
                        <Box>
                          <Grid
                            container
                            rowSpacing={1}
                            columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                          >
                            <Grid size={6}>
                              <Box
                                sx={{
                                  backgroundColor: "#EFF6FF", // Light blue
                                  borderRadius: 2,
                                  padding: 2,
                                  textAlign: "center",
                                }}
                              >
                                <Typography
                                  variant="h6"
                                  fontWeight="bold"
                                  color="primary"
                                >
                                  {groupedMaterial.length}
                                </Typography>
                                <Typography variant="body2" color="primary">
                                  Loại vật liệu
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid size={6}>
                              <Box
                                sx={{
                                  backgroundColor: "#F7F0FF", // Light purple
                                  borderRadius: 2,
                                  padding: 2,
                                  textAlign: "center",
                                }}
                              >
                                <Typography
                                  variant="h6"
                                  fontWeight="bold"
                                  sx={{ color: "#8e24aa" }} // Purple
                                >
                                  {totalMeterUsed}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#8e24aa" }}
                                >
                                  Tổng mét/đơn vị
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>

                          <Box
                            sx={{
                              border: "1px solid #e0e0e0",
                              borderRadius: 2,
                              padding: 2,
                              backgroundColor: "#fff",
                              margin: "10px 0",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 1,
                              }}
                            >
                              <Inventory2OutlinedIcon
                                fontSize="small"
                                sx={{ color: "black" }}
                              />
                              <Typography variant="body2" fontWeight="medium">
                                Gợi ý đặt hàng:
                              </Typography>
                            </Box>
                            {groupedMaterial.map((m) => (
                              <Box
                                key={m.id}
                                sx={{
                                  mb: 2,
                                  p: 2,
                                  border: "1px solid #ccc",
                                  borderRadius: 2,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Typography>
                                  {m.material.name ? m.material.name + ":" : ""}
                                </Typography>
                                <Typography>
                                  {m.needMaterial ? m.needMaterial + "mét" : ""}{" "}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Box>
        </Box>
      </form>
      {/* Bottom Part */}
      <Box sx={{ width: "95%", margin: "auto", padding: 2 }}>
        <Box
          sx={{
            background: "linear-gradient(to right, #f0fff4, #e6f7ff)",
            borderRadius: 2,
            border: "1px solid #d2f5e8",
            width: "100%",
            margin: "auto",
            padding: 3,
          }}
        >
          {/* Chỉ Số Bền Vững */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              paddingLeft: 15,
              paddingRight: 15,
              alignItems: "stretch",
            }}
          >
            {/* Size & Số Lượng */}
            <Grid textAlign="center" sx={{ xs: 12, md: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CheckroomIcon sx={{ color: "blue", fontSize: "2rem" }} />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                    textAlign: "center",
                  }}
                >
                  <Typography fontSize="1rem" color="black" fontWeight="bold">
                    Tiền Công:{" "}
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(laborCost * laborHour)}
                  </Typography>
                  <Typography color="black">Giờ Làm {laborHour}</Typography>
                </Box>
              </Box>
            </Grid>

            {/* Số Mảnh Rập */}
            <Grid textAlign="center" sx={{ xs: 12, md: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <DraftIcon color="purple" />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                    textAlign: "center",
                  }}
                >
                  <Typography fontSize="1rem" color="black" fontWeight="bold">
                    {cards.length} Mảnh
                  </Typography>
                  <Typography color="black">Mảnh Rập</Typography>
                </Box>
              </Box>
            </Grid>

            {/* Chi Phí */}
            <Grid textAlign="center" sx={{ xs: 12, md: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AttachMoneyOutlinedIcon
                  sx={{ color: "green", fontSize: "2rem" }}
                />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                    textAlign: "center",
                  }}
                >
                  <Typography fontSize="1rem" color="black" fontWeight="bold">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(totalPrice)}
                  </Typography>
                  <Typography color="black">Tổng Chi Phí</Typography>
                </Box>
              </Box>
            </Grid>

            {/* Tính bền vững */}
            <Grid textAlign="center" sx={{ xs: 12, md: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <EcoIcon />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                    textAlign: "center",
                  }}
                >
                  <Typography fontSize="1rem" color="green" fontWeight={"bold"}>
                    {sustainabilityScoreAll}/100
                  </Typography>
                  <Typography color="black">Điểm Bền Vững</Typography>
                </Box>
              </Box>
            </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
