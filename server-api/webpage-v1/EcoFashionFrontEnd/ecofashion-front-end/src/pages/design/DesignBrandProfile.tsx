import { useNavigate, useParams } from "react-router-dom";
import type { Fashion } from "../../types/Fashion";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Grid,
  Stack,
  Typography,
  Link,
  Divider,
  InputBase,
  IconButton,
  CardMedia,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  Pagination,
} from "@mui/material";
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

import { GridExpandMoreIcon, GridSearchIcon } from "@mui/x-data-grid";
import React, { useEffect, useRef, useState } from "react";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import StarIcon from "@mui/icons-material/Star";
import DesignsSection from "../../components/design/DesignsSection";
import { toast } from "react-toastify";
import { DesignerService } from "../../services/api";
import { DesignerPublic } from "../../services/api/designerService";
import DesignService, { Design } from "../../services/api/designService";
const products: Fashion[] = [
  {
    id: 1,
    name: "Áo thun Organic Cotton",
    category: "clothing",
    brand: { id: 1, name: "EcoWear" },
    image: ao_linen,
    images: [ao_linen, dam_con_trung, chan_vay_dap],
    sustainability: 85,
    materials: [
      {
        name: "Cotton hữu cơ",
        percentageUse: 40,
      },
      {
        name: "Vải Nilon",
        percentageUse: 60,
      },
    ],
    price: {
      current: 450000,
      currency: "VND",
    },
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Trắng", "Đen", "Xanh Navy", "Xám"],
    availability: "in-stock",
    rating: {
      average: 4,
      count: 127,
    },
    description:
      "Áo thun làm từ 100% cotton hữu cơ, thoáng mát và thân thiện với môi trường. Thiết kế minimalist phù hợp với mọi phong cách.",
    features: [
      "100% Cotton hữu cơ",
      "Thoáng khí",
      "Co giãn nhẹ",
      "Dễ chăm sóc",
    ],
    isFeatured: true,
    isBestSeller: false,
    isNew: true,
    discountPercentage: 18,
  },
  {
    id: 2,
    name: "Chân Váy Đắp",
    brand: { id: 2, name: "Nguyễn Công Trí" },
    category: "clothing",
    image: chan_vay_dap,
    images: [ao_linen, dam_con_trung, chan_vay_dap],
    sustainability: 85,
    materials: [
      {
        name: "Cotton hữu cơ",
        percentageUse: 40,
      },
      {
        name: "Vải Nilon",
        percentageUse: 60,
      },
    ],
    price: {
      current: 450000,
      original: 550000,
      currency: "VND",
    },
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Trắng", "Đen", "Xanh Navy", "Xám"],
    availability: "in-stock",
    rating: {
      average: 4.5,
      count: 127,
    },
    description:
      "Áo thun làm từ 100% cotton hữu cơ, thoáng mát và thân thiện với môi trường. Thiết kế minimalist phù hợp với mọi phong cách.",
    features: [
      "100% Cotton hữu cơ",
      "Thoáng khí",
      "Co giãn nhẹ",
      "Dễ chăm sóc",
    ],
    isFeatured: true,
    isBestSeller: false,
    isNew: true,
    discountPercentage: 18,
  },
  {
    id: 3,
    name: "Đầm Côn Trùng",
    brand: { id: 2, name: "Nguyễn Công Trí" },
    category: "clothing",
    image: dam_con_trung,
    images: [ao_linen, dam_con_trung, chan_vay_dap],
    sustainability: 85,
    materials: [
      {
        name: "Cotton hữu cơ",
        percentageUse: 40,
      },
      {
        name: "Vải Nilon",
        percentageUse: 60,
      },
    ],
    price: {
      current: 450000,
      original: 550000,
      currency: "VND",
    },
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Trắng", "Đen", "Xanh Navy", "Xám"],
    availability: "in-stock",
    rating: {
      average: 4.5,
      count: 127,
    },
    description:
      "Áo thun làm từ 100% cotton hữu cơ, thoáng mát và thân thiện với môi trường. Thiết kế minimalist phù hợp với mọi phong cách.",
    features: [
      "100% Cotton hữu cơ",
      "Thoáng khí",
      "Co giãn nhẹ",
      "Dễ chăm sóc",
    ],
    isFeatured: true,
    isBestSeller: false,
    isNew: true,
    discountPercentage: 18,
  },
  {
    id: 4,
    name: "Đầm Côn Trùng",
    brand: { id: 2, name: "Nguyễn Công Trí" },
    category: "clothing",
    image: dam_con_trung,
    images: [ao_linen, dam_con_trung, chan_vay_dap],
    sustainability: 85,
    materials: [
      {
        name: "Cotton hữu cơ",
        percentageUse: 40,
      },
      {
        name: "Vải Nilon",
        percentageUse: 60,
      },
    ],
    price: {
      current: 450000,
      original: 550000,
      currency: "VND",
    },
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Trắng", "Đen", "Xanh Navy", "Xám"],
    availability: "in-stock",
    rating: {
      average: 4.5,
      count: 127,
    },
    description:
      "Áo thun làm từ 100% cotton hữu cơ, thoáng mát và thân thiện với môi trường. Thiết kế minimalist phù hợp với mọi phong cách.",
    features: [
      "100% Cotton hữu cơ",
      "Thoáng khí",
      "Co giãn nhẹ",
      "Dễ chăm sóc",
    ],
    isFeatured: true,
    isBestSeller: false,
    isNew: true,
    discountPercentage: 18,
  },
  {
    id: 5,
    name: "Quần jeans tái chế",
    category: "clothing",
    brand: { id: 2, name: "GreenStyle" },
    sustainability: 78,
    materials: [
      { name: "Vải denim tái chế", percentageUse: 80 },
      { name: "Spandex", percentageUse: 20 },
    ],
    price: { current: 620000, currency: "VND" },
    sizes: ["S", "M", "L", "XL"],
    colors: ["Xanh Đậm", "Xám", "Đen"],
    availability: "in-stock",
    rating: { average: 4.5, count: 96 },
    description: "Quần jeans thân thiện với môi trường, độ co giãn tốt và bền.",
    features: ["Vải tái chế", "Co giãn", "Chống nhăn"],
    isFeatured: false,
    isBestSeller: true,
    isNew: false,
    discountPercentage: 10,
    image: dam_con_trung,
    images: [dam_con_trung, ao_linen, chan_vay_dap],
  },
  {
    id: 6,
    name: "Đầm vải lanh mùa hè",
    category: "clothing",
    brand: { id: 3, name: "NatureWear" },
    sustainability: 92,
    materials: [{ name: "Lanh", percentageUse: 100 }],
    price: { current: 720000, currency: "VND" },
    sizes: ["S", "M", "L"],
    colors: ["Kem", "Hồng Nhạt"],
    availability: "in-stock",
    rating: { average: 4.7, count: 212 },
    description: "Đầm nhẹ nhàng, thoáng mát, phù hợp cho thời tiết nóng bức.",
    features: ["Chống tia UV", "Thoáng mát", "Thiết kế nữ tính"],
    isFeatured: true,
    isBestSeller: true,
    isNew: true,
    discountPercentage: 20,
    image: chan_vay_dap,
    images: [chan_vay_dap, ao_linen],
  },
  {
    id: 7,
    name: "Áo khoác PET tái chế",
    category: "clothing",
    brand: { id: 4, name: "RecycleFit" },
    sustainability: 88,
    materials: [{ name: "Polyester tái chế (PET)", percentageUse: 100 }],
    price: { current: 890000, currency: "VND" },
    sizes: ["M", "L", "XL"],
    colors: ["Xanh Lá", "Đen"],
    availability: "in-stock",
    rating: { average: 4.2, count: 68 },
    description: "Áo khoác chắn gió từ chai nhựa tái chế, nhẹ và bền.",
    features: ["Chống gió", "Chống nước nhẹ", "Bền"],
    isFeatured: false,
    isBestSeller: false,
    isNew: true,
    discountPercentage: 15,
    image: ao_linen,
    images: [ao_linen, dam_con_trung],
  },
  {
    id: 8,
    name: "Chân váy đắp chéo",
    category: "clothing",
    brand: { id: 1, name: "EcoWear" },
    sustainability: 81,
    materials: [
      { name: "Cotton hữu cơ", percentageUse: 60 },
      { name: "Hemp", percentageUse: 40 },
    ],
    price: { current: 510000, currency: "VND" },
    sizes: ["XS", "S", "M", "L"],
    colors: ["Be", "Xanh Rêu"],
    availability: "in-stock",
    rating: { average: 4.6, count: 143 },
    description: "Chân váy đắp nhẹ nhàng, phong cách thanh lịch, dễ kết hợp.",
    features: ["Cotton hữu cơ", "Thiết kế đa năng"],
    isFeatured: true,
    isBestSeller: false,
    isNew: false,
    discountPercentage: 12,
    image: chan_vay_dap,
    images: [chan_vay_dap, ao_linen],
  },
  {
    id: 9,
    name: "Áo sơ mi Hemp thoáng khí",
    category: "clothing",
    brand: { id: 2, name: "GreenStyle" },
    sustainability: 90,
    materials: [{ name: "Hemp", percentageUse: 100 }],
    price: { current: 640000, currency: "VND" },
    sizes: ["S", "M", "L", "XL"],
    colors: ["Trắng", "Xanh Nhạt"],
    availability: "in-stock",
    rating: { average: 4.8, count: 119 },
    description: "Áo sơ mi chất liệu hemp mát mẻ và cực kỳ thoải mái.",
    features: ["Thoáng khí", "Thấm hút mồ hôi tốt", "Thân thiện môi trường"],
    isFeatured: false,
    isBestSeller: true,
    isNew: false,
    discountPercentage: 0,
    image: dam_con_trung,
    images: [dam_con_trung, ao_linen],
  },
  {
    id: 10,
    name: "Quần short thể thao tái chế",
    category: "clothing",
    brand: { id: 3, name: "NatureWear" },
    sustainability: 86,
    materials: [
      { name: "Polyester tái chế", percentageUse: 90 },
      { name: "Spandex", percentageUse: 10 },
    ],
    price: { current: 370000, currency: "VND" },
    sizes: ["S", "M", "L"],
    colors: ["Xám", "Xanh Dương"],
    availability: "in-stock",
    rating: { average: 4.1, count: 55 },
    description: "Quần short nhẹ, thoáng khí, lý tưởng cho vận động hàng ngày.",
    features: ["Thân thiện môi trường", "Co giãn", "Thoáng khí"],
    isFeatured: false,
    isBestSeller: false,
    isNew: true,
    discountPercentage: 5,
    image: ao_linen,
    images: [ao_linen, chan_vay_dap],
  },
  {
    id: 11,
    name: "Đồ bộ ngủ Bamboo",
    category: "clothing",
    brand: { id: 5, name: "SoftEarth" },
    sustainability: 95,
    materials: [{ name: "Sợi tre", percentageUse: 100 }],
    price: { current: 560000, currency: "VND" },
    sizes: ["M", "L", "XL"],
    colors: ["Hồng", "Kem", "Xám"],
    availability: "in-stock",
    rating: { average: 4.9, count: 189 },
    description:
      "Chất liệu bamboo cực kỳ mềm mại, thoáng mát, lý tưởng cho giấc ngủ.",
    features: ["Siêu mềm", "Kháng khuẩn", "Tự phân hủy sinh học"],
    isFeatured: true,
    isBestSeller: true,
    isNew: true,
    discountPercentage: 25,
    image: dam_con_trung,
    images: [dam_con_trung, chan_vay_dap],
  },
  {
    id: 12,
    name: "Áo croptop tái chế",
    category: "clothing",
    brand: { id: 1, name: "EcoWear" },
    sustainability: 84,
    materials: [
      { name: "Cotton tái chế", percentageUse: 70 },
      { name: "Polyester", percentageUse: 30 },
    ],
    price: { current: 330000, currency: "VND" },
    sizes: ["XS", "S", "M"],
    colors: ["Tím", "Hồng"],
    availability: "in-stock",
    rating: { average: 4.3, count: 74 },
    description: "Phong cách trẻ trung, cá tính, thích hợp cho mùa hè.",
    features: ["Nhẹ", "Bền màu", "Thân thiện môi trường"],
    isFeatured: false,
    isBestSeller: false,
    isNew: true,
    discountPercentage: 8,
    image: ao_linen,
    images: [ao_linen, dam_con_trung],
  },
  {
    id: 13,
    name: "Áo khoác gió không thấm nước",
    category: "clothing",
    brand: { id: 4, name: "RecycleFit" },
    sustainability: 80,
    materials: [{ name: "Nylon tái chế", percentageUse: 100 }],
    price: { current: 950000, currency: "VND" },
    sizes: ["M", "L", "XL"],
    colors: ["Xám", "Xanh Đậm"],
    availability: "in-stock",
    rating: { average: 4.6, count: 101 },
    description: "Áo khoác nhẹ, chống thấm, lý tưởng cho thời tiết ẩm ướt.",
    features: ["Chống thấm", "Có mũ trùm", "Dễ vệ sinh"],
    isFeatured: true,
    isBestSeller: true,
    isNew: false,
    discountPercentage: 18,
    image: chan_vay_dap,
    images: [chan_vay_dap, ao_linen],
  },
  {
    id: 14,
    name: "Áo hai dây Organic",
    category: "clothing",
    brand: { id: 5, name: "SoftEarth" },
    sustainability: 91,
    materials: [{ name: "Cotton hữu cơ", percentageUse: 100 }],
    price: { current: 290000, currency: "VND" },
    sizes: ["XS", "S", "M"],
    colors: ["Trắng", "Nâu", "Hồng"],
    availability: "in-stock",
    rating: { average: 4.4, count: 87 },
    description: "Áo hai dây nhẹ nhàng, thoáng mát, phù hợp thời tiết nóng.",
    features: ["Cotton hữu cơ", "Thoáng khí", "Dễ phối đồ"],
    isFeatured: false,
    isBestSeller: false,
    isNew: true,
    discountPercentage: 10,
    image: ao_linen,
    images: [ao_linen, dam_con_trung],
  },
  {
    id: 15,
    name: "Set đồ công sở tái chế",
    category: "clothing",
    brand: { id: 2, name: "GreenStyle" },
    sustainability: 89,
    materials: [
      { name: "Vải tái chế", percentageUse: 85 },
      { name: "Polyamide", percentageUse: 15 },
    ],
    price: { current: 1250000, currency: "VND" },
    sizes: ["S", "M", "L", "XL"],
    colors: ["Đen", "Xám", "Xanh Navy"],
    availability: "in-stock",
    rating: { average: 4.5, count: 132 },
    description: "Trang phục công sở sang trọng, thân thiện với môi trường.",
    features: ["Thiết kế thanh lịch", "Co giãn nhẹ", "Chống nhăn"],
    isFeatured: true,
    isBestSeller: false,
    isNew: false,
    discountPercentage: 22,
    image: dam_con_trung,
    images: [dam_con_trung, ao_linen, chan_vay_dap],
  },
];

const sustainabilityItems = [
  {
    image: linen,
    amount: "200m",
    material: "vải linen",
  },
  {
    image: nylon,
    amount: "200m",
    material: "vải nylon",
  },
  {
    image: cotton,
    amount: "200m",
    material: "vải cotton",
  },
  {
    image: denim,
    amount: "200m",
    material: "vải denim",
  },
  {
    image: polyester,
    amount: "200m",
    material: "vải polyester",
  },
  {
    image: polyester,
    amount: "200m",
    material: "vải polyester2",
  },
];
const reviews = [
  {
    name: "Sarah M.",
    date: "May 10, 2025",
    rating: 5,
    comment:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
  },
  {
    name: "Michael T.",
    date: "April 28, 2025",
    rating: 5,
    comment:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
  },
  {
    name: "Jessica L.",
    date: "April 15, 2025",
    rating: 4,
    comment:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
  },
  {
    name: "Jessica L.",
    date: "April 15, 2025",
    rating: 4,
    comment:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
  },
  {
    name: "Jessica L.",
    date: "April 15, 2025",
    rating: 4,
    comment:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
  },
  // Add more reviews as needed
];

export default function DesingBrandProfile() {
  //Change image
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  //Get Brand Detail
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [designer, setDesigner] = useState<DesignerPublic | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  //filter by color
  const [showSorted, setShowSorted] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [activeColors, setActiveColors] = useState<string[]>([]);
  //Count type
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({});
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  //Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState<number>();
  const pageSize = 12;
  const [page, setPage] = useState(currentPage);
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

  useEffect(() => {
    if (!id) return;
    const fetchDesigner = async () => {
      try {
        setLoading(true);
        const data = await DesignerService.getDesignerPublicProfile(id);
        if (data) {
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
        }

        setDesigner(data);
      } catch (err: any) {
        const msg = err.message || "Không thể tải thông tin nhà thiết kế.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchDesigner();
  }, [id]);

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

  const [activeTypes, setActiveTypes] = useState<string[]>([]);

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

  // if (loading) return <div className="designer-loading">Đang tải...</div>;
  // if (error || !designer)
  //   return (
  //     <div className="designer-error">
  //       <p>{error || "Không tìm thấy designer."}</p>
  //       <button>← Quay lại</button>
  //     </div>
  //   );

  //filter
  const colorCounts: Record<string, number> = {};

  products.forEach((product: any) => {
    product.colors.forEach((color: string) => {
      colorCounts[color] = (colorCounts[color] || 0) + 1;
    });
  });

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

  const handleColorChange = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  //Scroll TO Anchor
  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    const navbarHeight = 150;
    // document.querySelector(".MuiAppBar-root")?.clientHeight || 0;

    if (element) {
      const y =
        element.getBoundingClientRect().top + window.scrollY - navbarHeight;

      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };
  const handleScroll2 = () => {
    const el = scrollRef.current;
    if (el) {
      setIsAtStart(el.scrollLeft === 0);
      setIsAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1); // small margin for rounding errors
    }
  };

  useEffect(() => {
    handleScroll2(); // initialize scroll state
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", handleScroll2);
    return () => {
      if (el) el.removeEventListener("scroll", handleScroll2);
    };
  }, []);
  //Xóa filter
  const handleClearAll = () => {
    setSelectedColors([]); // Reset color selections
    setShowSorted(false); // Hide filtered result
    setActiveColors([]); // Clear applied filter if you use one
    setSelectedTypes([]);
    setActiveTypes([]);
    handleScroll("items");
  };

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const cardWidth = 400;
    const gap = 16;
    const scrollAmount = cardWidth + gap;

    const maxScroll = el.scrollWidth - el.clientWidth;
    const nextScrollLeft =
      direction === "left"
        ? Math.max(el.scrollLeft - scrollAmount, 0)
        : Math.min(el.scrollLeft + scrollAmount, maxScroll);

    el.scrollTo({
      left: nextScrollLeft,
      behavior: "smooth",
    });
  };
  if (loading) return <div className="designer-loading">Đang tải...</div>;
  if (error || !designer)
    return (
      <div className="designer-error">
        <p>{error || "Không tìm thấy designer."}</p>
        <button onClick={() => navigate("/explore/designers")}>
          ← Quay lại
        </button>
      </div>
    );
  return (
    <Box width={"100%"}>
      {/* Banner */}
      <Box
        sx={{
          backgroundImage: `url(${designer?.bannerUrl || brand_banner})`, // replace with actual image path
          backgroundSize: "fit",
          height: "50vh",
        }}
      />
      {/* Profile Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          margin: "auto",
          width: "90%",
        }}
      >
        <Grid
          sx={{
            width: "40%",
            margin: "10px",
            borderRight: "3px solid rgba(0, 0, 0, 0.1)",
            display: "flex",
          }}
        >
          <Avatar
            src={designer.avatarUrl || undefined}
            sx={{ margin: "auto 10px", height: "80px", width: "80px" }}
          >
            {!designer.avatarUrl && designer.designerName?.[0]}
          </Avatar>
          <Box
            sx={{
              margin: "auto",
              width: "100%",
              overflow: "hidden",
              marginLeft: "30px",
            }}
          >
            <Typography
              sx={{
                width: "100%",
                fontSize: "30px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {designer.designerName}
            </Typography>

            <Typography
              sx={{ width: "100%", fontSize: "15px", opacity: "50%" }}
            >
              Online 3 phút trước
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
              <Button variant="outlined">+ Theo dõi</Button>
              <Button variant="outlined">Chat</Button>
            </Stack>
          </Box>
        </Grid>
        <Grid
          sx={{
            width: "70%",
            paddingLeft: 5,
            paddingRight: 5,
          }}
        >
          <Box sx={{ width: "100%" }}>
            <Grid
              container
              rowSpacing={1}
              columnSpacing={{ xs: 1, sm: 2, md: 3 }}
            >
              <Grid size={6}>
                <Box sx={{ display: "flex", width: "100%" }}>
                  <Typography
                    sx={{
                      marginRight: "auto",
                      opacity: "50%",
                      fontSize: "20px",
                    }}
                  >
                    Đánh Giá:
                  </Typography>
                  <Typography sx={{ fontSize: "20px" }}>80k</Typography>
                </Box>
              </Grid>
              <Grid size={6}>
                <Box sx={{ display: "flex", width: "100%" }}>
                  <Typography
                    sx={{
                      marginRight: "auto",
                      opacity: "50%",
                      fontSize: "20px",
                    }}
                  >
                    Tham Gia:
                  </Typography>
                  <Typography sx={{ fontSize: "20px" }}>4 năm trước</Typography>
                </Box>
              </Grid>
              <Grid size={6}>
                <Box sx={{ display: "flex", width: "100%" }}>
                  <Typography
                    sx={{
                      marginRight: "auto",
                      opacity: "50%",
                      fontSize: "20px",
                    }}
                  >
                    Sản Phẩm:
                  </Typography>
                  <Typography sx={{ fontSize: "20px" }}>800</Typography>
                </Box>
              </Grid>
              <Grid size={6}>
                <Box sx={{ display: "flex", width: "100%" }}>
                  <Typography
                    sx={{
                      marginRight: "auto",
                      opacity: "50%",
                      fontSize: "20px",
                    }}
                  >
                    Người Theo Dõi:
                  </Typography>
                  <Typography sx={{ fontSize: "20px" }}>100k</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Box>
      <Divider />
      {/* Description */}
      <Box
        sx={{
          width: "90%",
          margin: "auto",
          padding: "10px 0",
        }}
      >
        <Typography sx={{ fontSize: "20px", fontWeight: "bold" }}>
          Giới Thiệu
        </Typography>
        <Typography sx={{ fontSize: "18px", marginLeft: "20px" }}>
          Nguyễn Công Trí là một trong những nhà thiết kế thời trang hàng đầu
          Việt Nam, được biết đến với phong cách sáng tạo độc đáo và tinh tế.
          Anh là người sáng lập thương hiệu thời trang cao cấp mang tên mình và
          đã ghi dấu ấn trên nhiều sàn diễn quốc tế như Tokyo Fashion Week, New
          York Fashion Week. Với khả năng kết hợp hài hòa giữa yếu tố truyền
          thống và hiện đại, các thiết kế của Nguyễn Công Trí không chỉ tôn vinh
          vẻ đẹp của người phụ nữ Việt mà còn chinh phục giới mộ điệu thời trang
          toàn cầu.
        </Typography>
      </Box>
      <Divider />
      {/* Sustainability */}
      <Box sx={{ width: "90%", margin: "auto", padding: 2 }}>
        {/* Scroll */}
        <Box
          sx={{
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: "100%",
              margin: "auto",
            }}
          >
            <IconButton onClick={() => scroll("left")}>
              <ArrowBackIos />
            </IconButton>

            <Box
              ref={scrollRef}
              sx={{
                display: "flex", // keep flex for horizontal scroll
                overflowX: "auto",
                scrollBehavior: "smooth",
                gap: 2,
                width: "100%",
                mx: "auto",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              {sustainabilityItems.map((item, index) => (
                <Grid
                  key={index}
                  sx={{
                    width: 410,
                    height: 250,
                    backgroundImage: `url(${item.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "relative",
                    flexShrink: 0,
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: "rgba(255,255,255,0.8)",
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      textAlign: "center",
                      p: 2,
                      borderRadius: 2,
                      width: "50%",
                    }}
                  >
                    <Typography variant="body1">Đã tái sử dụng</Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {item.amount}
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {item.material}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Box>
            <IconButton onClick={() => scroll("right")}>
              <ArrowForwardIos />
            </IconButton>
          </Box>
        </Box>
        {/* Navigation */}
      </Box>
      <Divider />
      <Box id="items">
        {/* Nav Bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor: "white",
            color: "black",
            width: "100%",
            // top: { xs: 56, sm: 64 },
            // zIndex: (theme) => theme.zIndex.appBar,
            borderBottom: "1px solid black",
          }}
        >
          <Box sx={{ display: "flex", padding: 2 }}>
            <Stack direction="row" spacing={2}>
              <Button
                color="inherit"
                onClick={() => handleScroll("items")}
                sx={{
                  fontSize: "1rem",
                }}
              >
                Sản Phẩm
              </Button>
              <Button
                color="inherit"
                onClick={() => handleScroll("reviews")}
                sx={{
                  fontSize: "1rem",
                }}
              >
                Đánh giá
              </Button>
              <Button
                color="inherit"
                onClick={() => handleScroll("about")}
                sx={{
                  fontSize: "1rem",
                }}
              >
                Thông Tin Khác
              </Button>
              <Button
                color="inherit"
                onClick={() => handleScroll("policies")}
                sx={{
                  fontSize: "1rem",
                }}
              >
                Qui Định
              </Button>
            </Stack>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "30%",
                height: 48,
                bgcolor: "#eaeaea",
                borderRadius: "999px",
                boxShadow: 1,
                marginLeft: "auto",
              }}
            >
              <InputBase
                fullWidth
                placeholder="Tìm kiếm..."
                sx={{
                  fontSize: "1rem",
                  mx: 2,
                }}
              />
              <IconButton
                sx={{
                  borderRadius: "0px 999px 999px 0px",
                  color: "black",
                  height: "100%",
                  width: 48,
                  "&:hover": {
                    bgcolor: "darkgreen",
                    color: "white",
                  },
                }}
              >
                <GridSearchIcon />
              </IconButton>
            </Box>
          </Box>
        </AppBar>
        {/* Section */}
        <Box sx={{ width: "90%", margin: "auto" }}>
          {/*Danh sách Sản Phẩm */}
          <Box sx={{ minHeight: "100vh", display: "flex" }}>
            {/* Filter */}
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
                    onClick={handleClearAll}
                    underline="hover"
                    sx={{ cursor: "pointer", fontSize: 14 }}
                  >
                    Xóa lựa chọn
                  </Link>
                </Box>

                {/* Filter Sections */}
                <Accordion
                  disableGutters
                  elevation={0}
                  sx={{ boxShadow: "none" }}
                >
                  <AccordionSummary expandIcon={<GridExpandMoreIcon />}>
                    <Typography fontSize={16}>Màu Sắc</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <FormGroup>
                      {dynamicColorFilterOptions.map((item, index) => (
                        <FormControlLabel
                          key={index}
                          control={
                            <Checkbox
                              checked={selectedColors.includes(item.label)}
                              onChange={() => handleColorChange(item.label)}
                            />
                          }
                          label={
                            <Box display="flex" alignItems="center">
                              <Box
                                sx={{
                                  width: 14,
                                  height: 14,
                                  borderRadius: "50%",
                                  backgroundColor: colorToHex(item.label),
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
                    <Box sx={{ maxHeight: 200, overflowY: "auto", pr: 1 }}>
                      <FormGroup>
                        {dynamicTypeFilterOptions.map((item, index) => (
                          <FormControlLabel
                            key={index}
                            control={
                              <Checkbox
                                checked={selectedTypes.includes(item.label)}
                                onChange={() => handleTypeChange(item.label)}
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
                {Object.entries(filterOptions).map(([title, options]) => (
                  <React.Fragment key={title}>
                    <Accordion
                      disableGutters
                      elevation={0}
                      sx={{ boxShadow: "none" }}
                    >
                      <AccordionSummary expandIcon={<GridExpandMoreIcon />}>
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
                ))}
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
            <Divider orientation="vertical" flexItem />
            {/* Sản Phẩm */}
            <Box flex={5} sx={{ margin: "0 30px" }}>
              <Box sx={{ width: "100%", display: "flex", margin: "10px 0" }}>
                <Typography variant="h4" fontWeight="bold">
                  Thời Trang
                </Typography>
                {/*Sắp xếp theo */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    height: 48,
                    bgcolor: "transparent",
                    borderRadius: "999px",
                    marginLeft: "auto",

                    float: "right",
                  }}
                >
                  <Typography>
                    Sắp xếp theo:
                    <Select
                      value={sortType}
                      sx={{
                        border: "none",
                        fontSize: 14,
                        minWidth: 100,
                        "& fieldset": { border: "none" },
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
                      <MenuItem value="material">Vật liệu</MenuItem>
                      <MenuItem value="lowest">Giá Thấp Tới Cao</MenuItem>
                      <MenuItem value="highest">Giá Cao Tới Thấp</MenuItem>
                    </Select>
                  </Typography>
                </Box>
              </Box>
              <DesignsSection
                products={sortedProducts}
                id={"items"}
                pageSize={pageSize}
                currentPage={currentPage}
                totalPages={totalPage}
              />
              <Box
                mt={4}
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "left",
                  alignItems: "center",
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
          <Divider />
          {/* Đánh Giá */}
          <Box id="reviews" sx={{ p: 3, display: "flex" }}>
            <Typography variant="h4" flex={1}>
              Đánh giá
            </Typography>
            <Box flex={4} sx={{ display: "flex" }}>
              <Box sx={{ width: "100%" }}>
                <Box
                  sx={{
                    maxHeight: 500,
                    overflowY: "auto",
                    p: 2,
                    border: "1px solid #eee",
                    borderRadius: 2,
                  }}
                >
                  {reviews.map((review, index) => (
                    <Box key={index} mb={2}>
                      <Typography fontWeight="bold">{review.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {review.date}
                      </Typography>
                      <Box
                        sx={{
                          width: 200,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Rating
                          name="text-feedback"
                          value={review.rating}
                          readOnly
                          precision={0.5}
                          emptyIcon={
                            <StarIcon
                              style={{ opacity: 0.55 }}
                              fontSize="inherit"
                            />
                          }
                        />
                        <Box sx={{ ml: 2, fontSize: "20px" }}>
                          {review.rating}
                        </Box>
                      </Box>
                      <Typography>{review.comment}</Typography>
                      {index < reviews.length - 1 && (
                        <Divider sx={{ mt: 2, mb: 2 }} />
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
          <Divider />
          {/* Thông Tin Khác */}
          <Box id="about" sx={{ p: 3, mt: 0 }}>
            <Typography variant="h5" sx={{ marginBottom: "30px" }}>
              Thông Tin Khác
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "50%",
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="caption">Đơn Hàng Thành Công</Typography>
                <Typography sx={{ fontWeight: "bold", fontSize: "30px" }}>
                  900
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="caption">
                  Năm Gia Nhập EcoFashion
                </Typography>
                <Typography sx={{ fontWeight: "bold", fontSize: "30px" }}>
                  2024
                </Typography>
              </Box>
            </Box>
          </Box>
          <Divider />
          {/* Qui Định */}
          <Box
            id="policies"
            sx={{ p: 3, paddingBottom: 10, scrollMarginTop: "70px" }}
          >
            <Typography variant="h5"> Qui Định Thanh Toán</Typography>
            <Box sx={{ px: 4, py: 2 }}>
              {/* Payment Section */}
              <Box display="flex" alignItems="flex-start" gap={4}>
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    Thanh Toán Bằng
                  </Typography>
                  <Box display="flex" gap={1} mt={1}>
                    <CardMedia
                      component="img"
                      alt="Visa"
                      image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTlp4qW2M8xPofmuZHwEfGi9mNMWUG0zs53A&s"
                      sx={{ height: 100, width: "auto" }}
                    />
                  </Box>
                </Box>

                {/* Divider */}
                <Divider orientation="vertical" flexItem />

                {/* Return Policy */}
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    Trả Hàng
                  </Typography>
                  <Typography variant="body2" mt={1}>
                    Xem chi tiết tại sản phẩm bạn mua.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
