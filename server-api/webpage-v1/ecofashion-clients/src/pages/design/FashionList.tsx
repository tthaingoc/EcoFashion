import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AppBar,
  Box,
  Breadcrumbs,
  Button,
  CardMedia,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  Drawer,
  FormControlLabel,
  FormGroup,
  Link,
  MenuItem,
  Pagination,
  Select,
  Typography,
} from "@mui/material";
import DesignsSection from "../../components/design/DesignsSection";
import React, { useEffect, useState } from "react";
//image
import fashion_banner from "../../assets/pictures/fashion/Fashion.png";
//example
import ao_linen from "../../assets/pictures/example/ao-linen.webp";
import chan_vay_dap from "../../assets/pictures/example/chan-vay-dap.webp";
import dam_con_trung from "../../assets/pictures/example/dam-con-trung.webp";
import brand_banner from "../../assets/pictures/example/brand-banner.jpg";
import linen from "../../assets/pictures/example/linen.webp";
import nylon from "../../assets/pictures/example/nylon.webp";
import denim from "../../assets/pictures/example/denim.jpg";
import cotton from "../../assets/pictures/example/cotton.webp";
import polyester from "../../assets/pictures/example/Polyester.jpg";
import { Fashion } from "../../types/Fashion";
import { GridExpandMoreIcon } from "@mui/x-data-grid";
import { Design, DesignService } from "../../services/api/designService";
import { toast } from "react-toastify";
// const products: Fashion[] = [
//   {
//     id: 1,
//     name: "Áo thun Organic Cotton",
//     category: "clothing",
//     brand: { id: 1, name: "EcoWear" },
//     image: ao_linen,
//     images: [ao_linen, dam_con_trung, chan_vay_dap],
//     sustainability: 85,
//     materials: [
//       {
//         name: "Cotton hữu cơ",
//         percentageUse: 40,
//       },
//       {
//         name: "Vải Nilon",
//         percentageUse: 60,
//       },
//     ],
//     price: {
//       current: 450000,
//       currency: "VND",
//     },
//     sizes: ["XS", "S", "M", "L", "XL"],
//     colors: ["Trắng", "Đen", "Xanh Navy", "Xám"],
//     availability: "in-stock",
//     rating: {
//       average: 4,
//       count: 127,
//     },
//     description:
//       "Áo thun làm từ 100% cotton hữu cơ, thoáng mát và thân thiện với môi trường. Thiết kế minimalist phù hợp với mọi phong cách.",
//     features: [
//       "100% Cotton hữu cơ",
//       "Thoáng khí",
//       "Co giãn nhẹ",
//       "Dễ chăm sóc",
//     ],
//     isFeatured: true,
//     isBestSeller: false,
//     isNew: true,
//     discountPercentage: 18,
//   },
//   {
//     id: 2,
//     name: "Chân Váy Đắp",
//     brand: { id: 2, name: "Nguyễn Công Trí" },
//     category: "clothing",
//     image: chan_vay_dap,
//     images: [ao_linen, dam_con_trung, chan_vay_dap],
//     sustainability: 85,
//     materials: [
//       {
//         name: "Cotton hữu cơ",
//         percentageUse: 40,
//       },
//       {
//         name: "Vải Nilon",
//         percentageUse: 60,
//       },
//     ],
//     price: {
//       current: 450000,
//       original: 550000,
//       currency: "VND",
//     },
//     sizes: ["XS", "S", "M", "L", "XL"],
//     colors: ["Trắng", "Đen", "Xanh Navy", "Xám"],
//     availability: "in-stock",
//     rating: {
//       average: 4.5,
//       count: 127,
//     },
//     description:
//       "Áo thun làm từ 100% cotton hữu cơ, thoáng mát và thân thiện với môi trường. Thiết kế minimalist phù hợp với mọi phong cách.",
//     features: [
//       "100% Cotton hữu cơ",
//       "Thoáng khí",
//       "Co giãn nhẹ",
//       "Dễ chăm sóc",
//     ],
//     isFeatured: true,
//     isBestSeller: false,
//     isNew: true,
//     discountPercentage: 18,
//   },
//   {
//     id: 3,
//     name: "Đầm Côn Trùng",
//     brand: { id: 2, name: "Nguyễn Công Trí" },
//     category: "clothing",
//     image: dam_con_trung,
//     images: [ao_linen, dam_con_trung, chan_vay_dap],
//     sustainability: 85,
//     materials: [
//       {
//         name: "Cotton hữu cơ",
//         percentageUse: 40,
//       },
//       {
//         name: "Vải Nilon",
//         percentageUse: 60,
//       },
//     ],
//     price: {
//       current: 450000,
//       original: 550000,
//       currency: "VND",
//     },
//     sizes: ["XS", "S", "M", "L", "XL"],
//     colors: ["Trắng", "Đen", "Xanh Navy", "Xám"],
//     availability: "in-stock",
//     rating: {
//       average: 4.5,
//       count: 127,
//     },
//     description:
//       "Áo thun làm từ 100% cotton hữu cơ, thoáng mát và thân thiện với môi trường. Thiết kế minimalist phù hợp với mọi phong cách.",
//     features: [
//       "100% Cotton hữu cơ",
//       "Thoáng khí",
//       "Co giãn nhẹ",
//       "Dễ chăm sóc",
//     ],
//     isFeatured: true,
//     isBestSeller: false,
//     isNew: true,
//     discountPercentage: 18,
//   },
//   {
//     id: 4,
//     name: "Đầm Côn Trùng",
//     brand: { id: 2, name: "Nguyễn Công Trí" },
//     category: "clothing",
//     image: dam_con_trung,
//     images: [ao_linen, dam_con_trung, chan_vay_dap],
//     sustainability: 85,
//     materials: [
//       {
//         name: "Cotton hữu cơ",
//         percentageUse: 40,
//       },
//       {
//         name: "Vải Nilon",
//         percentageUse: 60,
//       },
//     ],
//     price: {
//       current: 450000,
//       original: 550000,
//       currency: "VND",
//     },
//     sizes: ["XS", "S", "M", "L", "XL"],
//     colors: ["Trắng", "Đen", "Xanh Navy", "Xám"],
//     availability: "in-stock",
//     rating: {
//       average: 4.5,
//       count: 127,
//     },
//     description:
//       "Áo thun làm từ 100% cotton hữu cơ, thoáng mát và thân thiện với môi trường. Thiết kế minimalist phù hợp với mọi phong cách.",
//     features: [
//       "100% Cotton hữu cơ",
//       "Thoáng khí",
//       "Co giãn nhẹ",
//       "Dễ chăm sóc",
//     ],
//     isFeatured: true,
//     isBestSeller: false,
//     isNew: true,
//     discountPercentage: 18,
//   },
//   {
//     id: 5,
//     name: "Quần jeans tái chế",
//     category: "clothing",
//     brand: { id: 2, name: "GreenStyle" },
//     sustainability: 78,
//     materials: [
//       { name: "Vải denim tái chế", percentageUse: 80 },
//       { name: "Spandex", percentageUse: 20 },
//     ],
//     price: { current: 620000, currency: "VND" },
//     sizes: ["S", "M", "L", "XL"],
//     colors: ["Xanh Đậm", "Xám", "Đen"],
//     availability: "in-stock",
//     rating: { average: 4.5, count: 96 },
//     description: "Quần jeans thân thiện với môi trường, độ co giãn tốt và bền.",
//     features: ["Vải tái chế", "Co giãn", "Chống nhăn"],
//     isFeatured: false,
//     isBestSeller: true,
//     isNew: false,
//     discountPercentage: 10,
//     image: dam_con_trung,
//     images: [dam_con_trung, ao_linen, chan_vay_dap],
//   },
//   {
//     id: 6,
//     name: "Đầm vải lanh mùa hè",
//     category: "clothing",
//     brand: { id: 3, name: "NatureWear" },
//     sustainability: 92,
//     materials: [{ name: "Lanh", percentageUse: 100 }],
//     price: { current: 720000, currency: "VND" },
//     sizes: ["S", "M", "L"],
//     colors: ["Kem", "Hồng Nhạt"],
//     availability: "in-stock",
//     rating: { average: 4.7, count: 212 },
//     description: "Đầm nhẹ nhàng, thoáng mát, phù hợp cho thời tiết nóng bức.",
//     features: ["Chống tia UV", "Thoáng mát", "Thiết kế nữ tính"],
//     isFeatured: true,
//     isBestSeller: true,
//     isNew: true,
//     discountPercentage: 20,
//     image: chan_vay_dap,
//     images: [chan_vay_dap, ao_linen],
//   },
//   {
//     id: 7,
//     name: "Áo khoác PET tái chế",
//     category: "clothing",
//     brand: { id: 4, name: "RecycleFit" },
//     sustainability: 88,
//     materials: [{ name: "Polyester tái chế (PET)", percentageUse: 100 }],
//     price: { current: 890000, currency: "VND" },
//     sizes: ["M", "L", "XL"],
//     colors: ["Xanh Lá", "Đen"],
//     availability: "in-stock",
//     rating: { average: 4.2, count: 68 },
//     description: "Áo khoác chắn gió từ chai nhựa tái chế, nhẹ và bền.",
//     features: ["Chống gió", "Chống nước nhẹ", "Bền"],
//     isFeatured: false,
//     isBestSeller: false,
//     isNew: true,
//     discountPercentage: 15,
//     image: ao_linen,
//     images: [ao_linen, dam_con_trung],
//   },
//   {
//     id: 8,
//     name: "Chân váy đắp chéo",
//     category: "clothing",
//     brand: { id: 1, name: "EcoWear" },
//     sustainability: 81,
//     materials: [
//       { name: "Cotton hữu cơ", percentageUse: 60 },
//       { name: "Hemp", percentageUse: 40 },
//     ],
//     price: { current: 510000, currency: "VND" },
//     sizes: ["XS", "S", "M", "L"],
//     colors: ["Be", "Xanh Rêu"],
//     availability: "in-stock",
//     rating: { average: 4.6, count: 143 },
//     description: "Chân váy đắp nhẹ nhàng, phong cách thanh lịch, dễ kết hợp.",
//     features: ["Cotton hữu cơ", "Thiết kế đa năng"],
//     isFeatured: true,
//     isBestSeller: false,
//     isNew: false,
//     discountPercentage: 12,
//     image: chan_vay_dap,
//     images: [chan_vay_dap, ao_linen],
//   },
//   {
//     id: 9,
//     name: "Áo sơ mi Hemp thoáng khí",
//     category: "clothing",
//     brand: { id: 2, name: "GreenStyle" },
//     sustainability: 90,
//     materials: [{ name: "Hemp", percentageUse: 100 }],
//     price: { current: 640000, currency: "VND" },
//     sizes: ["S", "M", "L", "XL"],
//     colors: ["Trắng", "Xanh Nhạt"],
//     availability: "in-stock",
//     rating: { average: 4.8, count: 119 },
//     description: "Áo sơ mi chất liệu hemp mát mẻ và cực kỳ thoải mái.",
//     features: ["Thoáng khí", "Thấm hút mồ hôi tốt", "Thân thiện môi trường"],
//     isFeatured: false,
//     isBestSeller: true,
//     isNew: false,
//     discountPercentage: 0,
//     image: dam_con_trung,
//     images: [dam_con_trung, ao_linen],
//   },
//   {
//     id: 10,
//     name: "Quần short thể thao tái chế",
//     category: "clothing",
//     brand: { id: 3, name: "NatureWear" },
//     sustainability: 86,
//     materials: [
//       { name: "Polyester tái chế", percentageUse: 90 },
//       { name: "Spandex", percentageUse: 10 },
//     ],
//     price: { current: 370000, currency: "VND" },
//     sizes: ["S", "M", "L"],
//     colors: ["Xám", "Xanh Dương"],
//     availability: "in-stock",
//     rating: { average: 4.1, count: 55 },
//     description: "Quần short nhẹ, thoáng khí, lý tưởng cho vận động hàng ngày.",
//     features: ["Thân thiện môi trường", "Co giãn", "Thoáng khí"],
//     isFeatured: false,
//     isBestSeller: false,
//     isNew: true,
//     discountPercentage: 5,
//     image: ao_linen,
//     images: [ao_linen, chan_vay_dap],
//   },
//   {
//     id: 11,
//     name: "Đồ bộ ngủ Bamboo",
//     category: "clothing",
//     brand: { id: 5, name: "SoftEarth" },
//     sustainability: 95,
//     materials: [{ name: "Sợi tre", percentageUse: 100 }],
//     price: { current: 560000, currency: "VND" },
//     sizes: ["M", "L", "XL"],
//     colors: ["Hồng", "Kem", "Xám"],
//     availability: "in-stock",
//     rating: { average: 4.9, count: 189 },
//     description:
//       "Chất liệu bamboo cực kỳ mềm mại, thoáng mát, lý tưởng cho giấc ngủ.",
//     features: ["Siêu mềm", "Kháng khuẩn", "Tự phân hủy sinh học"],
//     isFeatured: true,
//     isBestSeller: true,
//     isNew: true,
//     discountPercentage: 25,
//     image: dam_con_trung,
//     images: [dam_con_trung, chan_vay_dap],
//   },
//   {
//     id: 12,
//     name: "Áo croptop tái chế",
//     category: "clothing",
//     brand: { id: 1, name: "EcoWear" },
//     sustainability: 84,
//     materials: [
//       { name: "Cotton tái chế", percentageUse: 70 },
//       { name: "Polyester", percentageUse: 30 },
//     ],
//     price: { current: 330000, currency: "VND" },
//     sizes: ["XS", "S", "M"],
//     colors: ["Tím", "Hồng"],
//     availability: "in-stock",
//     rating: { average: 4.3, count: 74 },
//     description: "Phong cách trẻ trung, cá tính, thích hợp cho mùa hè.",
//     features: ["Nhẹ", "Bền màu", "Thân thiện môi trường"],
//     isFeatured: false,
//     isBestSeller: false,
//     isNew: true,
//     discountPercentage: 8,
//     image: ao_linen,
//     images: [ao_linen, dam_con_trung],
//   },
//   {
//     id: 13,
//     name: "Áo khoác gió không thấm nước",
//     category: "clothing",
//     brand: { id: 4, name: "RecycleFit" },
//     sustainability: 80,
//     materials: [{ name: "Nylon tái chế", percentageUse: 100 }],
//     price: { current: 950000, currency: "VND" },
//     sizes: ["M", "L", "XL"],
//     colors: ["Xám", "Xanh Đậm"],
//     availability: "in-stock",
//     rating: { average: 4.6, count: 101 },
//     description: "Áo khoác nhẹ, chống thấm, lý tưởng cho thời tiết ẩm ướt.",
//     features: ["Chống thấm", "Có mũ trùm", "Dễ vệ sinh"],
//     isFeatured: true,
//     isBestSeller: true,
//     isNew: false,
//     discountPercentage: 18,
//     image: chan_vay_dap,
//     images: [chan_vay_dap, ao_linen],
//   },
//   {
//     id: 14,
//     name: "Áo hai dây Organic",
//     category: "clothing",
//     brand: { id: 5, name: "SoftEarth" },
//     sustainability: 91,
//     materials: [{ name: "Cotton hữu cơ", percentageUse: 100 }],
//     price: { current: 290000, currency: "VND" },
//     sizes: ["XS", "S", "M"],
//     colors: ["Trắng", "Nâu", "Hồng"],
//     availability: "in-stock",
//     rating: { average: 4.4, count: 87 },
//     description: "Áo hai dây nhẹ nhàng, thoáng mát, phù hợp thời tiết nóng.",
//     features: ["Cotton hữu cơ", "Thoáng khí", "Dễ phối đồ"],
//     isFeatured: false,
//     isBestSeller: false,
//     isNew: true,
//     discountPercentage: 10,
//     image: ao_linen,
//     images: [ao_linen, dam_con_trung],
//   },
//   {
//     id: 15,
//     name: "Set đồ công sở tái chế",
//     category: "clothing",
//     brand: { id: 2, name: "GreenStyle" },
//     sustainability: 89,
//     materials: [
//       { name: "Vải tái chế", percentageUse: 85 },
//       { name: "Polyamide", percentageUse: 15 },
//     ],
//     price: { current: 1250000, currency: "VND" },
//     sizes: ["S", "M", "L", "XL"],
//     colors: ["Đen", "Xám", "Xanh Navy"],
//     availability: "in-stock",
//     rating: { average: 4.5, count: 132 },
//     description: "Trang phục công sở sang trọng, thân thiện với môi trường.",
//     features: ["Thiết kế thanh lịch", "Co giãn nhẹ", "Chống nhăn"],
//     isFeatured: true,
//     isBestSeller: false,
//     isNew: false,
//     discountPercentage: 22,
//     image: dam_con_trung,
//     images: [dam_con_trung, ao_linen, chan_vay_dap],
//   },
// ];

export default function DesignsList() {
  //Design Data
  const [designs, setDesigns] = useState<Design[]>([]);
  //Loading
  const [loading, setLoading] = useState(true);
  //Error
  const [error, setError] = useState<string | null>(null);
  //Count type
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({});
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  //Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState<number>();
  const pageSize = 12;
  const [page, setPage] = useState(currentPage);

  useEffect(() => {
    loadDesigners();
    window.scrollTo(0, 0);
  }, [currentPage]);

  const loadDesigners = async () => {
    try {
      setLoading(true);
      setError(null);
      // const data = await DesignService.getAllDesign();
      const total = await DesignService.getAllDesign();
      setTotalPage(Math.ceil(total.length / pageSize));
      const data = await DesignService.getAllDesignPagination(
        currentPage,
        pageSize
      );
      // Count design types
      const counts: Record<string, number> = {};
      data.forEach((design: any) => {
        const typeName = design.designTypeName || "Khác"; // fallback if null/undefined
        counts[typeName] = (counts[typeName] || 0) + 1;
      });

      setTypeCounts(counts);
      setDesigns(data);
    } catch (error: any) {
      const errorMessage =
        error.message || "Không thể tải danh sách nhà thiết kế";
      setError(errorMessage);
      toast.error(errorMessage, { position: "bottom-center" });
    } finally {
      setLoading(false);
    }
  };

  //Pagination
  const handlePageScrollChange = (id: string, value: number) => {
    setPage(value);
    setCurrentPage(value);
    const element = document.getElementById(id);
    const navbarHeight =
      document.querySelector(".MuiAppBar-root")?.clientHeight || 0;

    if (element) {
      const y =
        element.getBoundingClientRect().top + window.scrollY - navbarHeight;

      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  //filter color
  const colorCounts: Record<string, number> = {};

  // products.forEach((product: any) => {
  //   product.colors.forEach((color: string) => {
  //     colorCounts[color] = (colorCounts[color] || 0) + 1;
  //   });
  // });

  const dynamicColorFilterOptions = Object.entries(colorCounts).map(
    ([label, count]) => ({
      label,
      count,
    })
  );

  const colorToHex = (colorName: string): string => {
    const colors: Record<string, string> = {
      Đen: "#000000",
      Trắng: "#ffffff",
      "Xanh lá": "#2ecc40",
      Nâu: "#8B4513",
      "Xanh Navy": "#001f3f",
      "Xanh Rêu": "#556b2f",
      Xám: "#808080",
      Be: "#f5f5dc",
      Tím: "#800080",
      Hồng: "#ff69b4",
      "Hồng Nhạt": "#ffe4e1",
      Kem: "#fdf5e6",
      "Xanh Nhạt": "#add8e6",
      "Xanh Dương": "#0074D9",
      "Xanh Đậm": "#003366",
    };
    return colors[colorName] || "#ccc"; // fallback
  };

  // filter type
  const dynamicTypeFilterOptions = Object.entries(typeCounts).map(
    ([label, count]) => ({
      label,
      count,
    })
  );
  const handleTypeChange = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };
  const filterOptions = {
    Loại: [
      { label: "Áo", count: 24 },
      { label: "Quần", count: 14 },
      { label: "Đầm", count: 19 },
      { label: "Váy", count: 19 },
    ],

    "Chất Liệu": [
      { label: "Cotton", count: 36 },
      { label: "Linen", count: 28 },
      { label: "Tencel", count: 15 },
      { label: "Recycled Polyester", count: 11 },
    ],
  };
  //filter by color
  const [showSorted, setShowSorted] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [activeColors, setActiveColors] = useState<string[]>([]);
  const [activeTypes, setActiveTypes] = useState<string[]>([]);
  const handleColorChange = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };
  const filteredProducts = designs.filter((product: any) => {
    const colorMatch =
      activeColors.length === 0 ||
      product.colors.some((color: string) => activeColors.includes(color));

    const typeMatch =
      activeTypes.length === 0 ||
      activeTypes.includes(product.designTypeName || "Khác");

    return colorMatch && typeMatch;
  });
  const previewFilteredProducts = designs.filter((product: any) => {
    const colorMatch =
      selectedColors.length === 0 ||
      product.colors.some((color: string) => selectedColors.includes(color));

    const typeMatch =
      selectedTypes.length === 0 ||
      selectedTypes.includes(product.designTypeName || "Khác");

    return colorMatch && typeMatch;
  });

  //Sort product
  const [sortType, setSortType] = useState<
    "all" | "recent" | "lowest" | "highest"
  >("all");
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!showSorted) return 0; // don't sort until button is clicked

    switch (sortType) {
      case "lowest":
        return a.price - b.price;
      case "highest":
        return b.price - a.price;
      case "recent":
        return b.designId - a.designId;
      default:
        return 0;
    }
  });
  //Scroll To Anchor
  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    const navbarHeight =
      document.querySelector(".MuiAppBar-root")?.clientHeight || 0;

    if (element) {
      const y =
        element.getBoundingClientRect().top + window.scrollY - navbarHeight;

      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };
  //Xóa filter
  const handleClearAll = () => {
    setSelectedColors([]); // Reset color selections
    setShowSorted(false); // Hide filtered result
    setActiveColors([]); // Clear applied filter if you use one
    setSelectedTypes([]);
    setActiveTypes([]);
    handleScroll("items");
    toggleDrawer("left", false);
  };
  //Drawer
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });
  type Anchor = "top" | "left" | "bottom" | "right";
  const toggleDrawer =
    (anchor: Anchor, open: boolean) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }

      setState({ ...state, [anchor]: open });
    };
  return (
    <Box
      sx={{
        mx: "auto",
        width: "100%",
      }}
    >
      <img
        src={fashion_banner}
        alt="EcoFashion Banner"
        style={{ width: "100%", height: "100vh", objectFit: "cover" }}
      />
      <Box id="items">
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor: "white",
            borderBottom: "1px solid black",
            display: "flex",
            flexDirection: "row",
            // top: { xs: 56, sm: 64 },
            // zIndex: (theme) => theme.zIndex.appBar,
            justifyContent: "space-between",
            paddingRight: 1,
            paddingLeft: 1,
          }}
        >
          {/* Navigation bar */}
          <Breadcrumbs
            separator="›"
            aria-label="breadcrumb"
            sx={{ padding: 1, display: "flex" }}
          >
            <Link underline="hover" color="inherit" href="/">
              Trang chủ
            </Link>
            <Typography color="text.primary">Thời Trang</Typography>
          </Breadcrumbs>
          {/* Sort & Filter */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                height: 48,
                bgcolor: "transparent",
                borderRadius: "999px",
                marginLeft: "auto",
                float: "left",
              }}
            >
              {/* Filter */}
              <React.Fragment key={"left"}>
                <Button
                  variant="text"
                  onClick={toggleDrawer("left", true)}
                  sx={{ color: "black", marginRight: 2, fontWeight: "bold" }}
                >
                  Phân Loại
                </Button>
                <Drawer
                  anchor={"left"}
                  open={state["left"]}
                  onClose={toggleDrawer("left", false)}
                >
                  <Box flex={1} sx={{ textAlign: "left" }}>
                    <Box sx={{ width: 300, padding: 3 }}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        marginBottom={"30px"}
                      >
                        <Typography variant="h6" fontWeight="bold">
                          Phân Loại
                        </Typography>
                        <Link
                          onClick={() => {
                            handleClearAll();
                          }}
                          underline="hover"
                          sx={{ cursor: "pointer", fontSize: 14 }}
                        >
                          Xóa lựa chọn
                        </Link>
                      </Box>

                      {/* Filter Sections */}
                      {/* Filter By Color */}
                      <Accordion
                        disableGutters
                        elevation={0}
                        sx={{ boxShadow: "none" }}
                      >
                        <AccordionSummary expandIcon={<GridExpandMoreIcon />}>
                          <Typography fontSize={16}>Màu Sắc</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box
                            sx={{
                              maxHeight: 200,
                              overflowY: "auto",
                              pr: 1,
                            }}
                          >
                            <FormGroup>
                              {dynamicColorFilterOptions.map((item, index) => (
                                <FormControlLabel
                                  key={index}
                                  control={
                                    <Checkbox
                                      checked={selectedColors.includes(
                                        item.label
                                      )}
                                      onChange={() =>
                                        handleColorChange(item.label)
                                      }
                                    />
                                  }
                                  label={
                                    <Box display="flex" alignItems="center">
                                      <Box
                                        sx={{
                                          width: 14,
                                          height: 14,
                                          borderRadius: "50%",
                                          backgroundColor: colorToHex(
                                            item.label
                                          ),
                                          border: "1px solid #ccc",
                                          mr: 1,
                                        }}
                                      />
                                      {`${item.label} (${item.count})`}
                                    </Box>
                                  }
                                  sx={{ mb: 0.5, alignItems: "center" }}
                                />
                              ))}
                            </FormGroup>
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                      <Divider />
                      {/* Filter By Type */}
                      <Accordion
                        disableGutters
                        elevation={0}
                        sx={{ boxShadow: "none" }}
                      >
                        <AccordionSummary expandIcon={<GridExpandMoreIcon />}>
                          <Typography fontSize={16}>Loại Sản Phẩm</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box
                            sx={{ maxHeight: 200, overflowY: "auto", pr: 1 }}
                          >
                            <FormGroup>
                              {dynamicTypeFilterOptions.map((item, index) => (
                                <FormControlLabel
                                  key={index}
                                  control={
                                    <Checkbox
                                      checked={selectedTypes.includes(
                                        item.label
                                      )}
                                      onChange={() =>
                                        handleTypeChange(item.label)
                                      }
                                    />
                                  }
                                  label={`${item.label} (${item.count})`}
                                  sx={{ mb: 0.5 }}
                                />
                              ))}
                            </FormGroup>
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                      {/* {Object.entries(filterOptions).map(([title, options]) => (
                        <React.Fragment key={title}>
                          <Accordion
                            disableGutters
                            elevation={0}
                            sx={{ boxShadow: "none" }}
                          >
                            <AccordionSummary
                              expandIcon={<GridExpandMoreIcon />}
                            >
                              <Typography fontSize={16}>{title}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <FormGroup>
                                {options.map((item, index) => (
                                  <FormControlLabel
                                    key={index}
                                    control={<Checkbox />}
                                    label={`${item.label} (${item.count})`}
                                    sx={{ mb: 0.5, alignItems: "center" }}
                                  />
                                ))}
                              </FormGroup>
                            </AccordionDetails>
                          </Accordion>
                          <Divider />
                        </React.Fragment>
                      ))} */}
                      {/* Bottom Button */}
                      <Box mt={6}>
                        <Button
                          variant="outlined"
                          color="inherit"
                          fullWidth
                          sx={{
                            color: "black",
                            fontWeight: "bold",
                            "&:hover": {
                              bgcolor: "#333",
                              color: "white",
                            },
                          }}
                          onClick={() => {
                            setActiveColors(selectedColors); // apply filter
                            setActiveTypes(selectedTypes);
                            setShowSorted(true);
                            handleScroll("items");
                          }}
                        >
                          {selectedColors.length > 0
                            ? `Xem ${previewFilteredProducts.length} sản phẩm`
                            : "Xem Tất Cả Sản Phẩm"}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Drawer>
              </React.Fragment>
              <Divider orientation="vertical" sx={{ height: "90%" }} />
              {/* Sort */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "black",
                    marginLeft: 2,
                    textAlign: "center",
                  }}
                >
                  Sắp xếp theo:
                </Typography>
                <Select
                  value={sortType}
                  sx={{
                    border: "none",
                    fontSize: 14,
                    minWidth: 100,
                    "& fieldset": { border: "none" },
                    fontWeight: "bold",
                  }}
                  MenuProps={{
                    disableScrollLock: true,
                  }}
                  onChange={(e) => {
                    setSortType(e.target.value);
                    setShowSorted(true);
                  }}
                >
                  <MenuItem value="all" sx={{ width: "100%" }}>
                    Tất cả
                  </MenuItem>
                  <MenuItem value="recent">Mới Đây</MenuItem>
                  <MenuItem value="lowest">Giá Thấp Tới Cao</MenuItem>
                  <MenuItem value="highest">Giá Cao Tới Thấp</MenuItem>
                </Select>
              </Box>
            </Box>
          </Box>
        </AppBar>
        <Box
          sx={{
            width: "100%",
            margin: "10px auto",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/*Danh sách Sản Phẩm */}
          <Box sx={{ minHeight: "100vh", p: 3, py: 0 }}>
            {/* Sản Phẩm */}
            <Box
              flex={5}
              sx={{ width: "100%", margin: "auto", padding: 3, paddingTop: 0 }}
            >
              <DesignsSection
                products={sortedProducts}
                id={"items"}
                pageSize={pageSize}
                currentPage={currentPage}
                totalPages={totalPage}
              />
            </Box>
          </Box>
          <Divider />
        </Box>
        <Box
          mt={4}
          sx={{
            width: "100%",
            display: "flex", // ✅ Added
            justifyContent: "center", // ✅ Added
            alignItems: "center", // Optional
            margin: "20px 0",
          }}
        >
          <Pagination
            count={totalPage}
            page={page}
            variant="outlined"
            shape="rounded"
            onChange={(e, value) => {
              handlePageScrollChange("items", value);
            }}
            color="primary"
            size="large"
          />
        </Box>
      </Box>
    </Box>
  );
}
