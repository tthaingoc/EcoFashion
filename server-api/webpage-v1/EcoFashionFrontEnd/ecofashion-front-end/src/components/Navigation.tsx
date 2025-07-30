// ===== MUI COMPONENTS =====
import {
  AppBar,
  Box,
  Button,
  Icon,
  IconButton,
  Link as MuiLink,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  styled,
  Divider,
} from "@mui/material";
// ===== REACT ROUTER =====
import { Link, matchPath, useLocation, useNavigate } from "react-router-dom";
// ===== IMAGE =====
import logo from "../assets/pictures/homepage/logo2.png";
// ===== ICONS =====
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import SettingsIcon from "@mui/icons-material/Settings";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LoginIcon from "@mui/icons-material/Login";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import PersonIcon from "@mui/icons-material/Person";
import InventoryIcon from "@mui/icons-material/Inventory";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import FeedIcon from "@mui/icons-material/Feed";
import HandshakeIcon from "@mui/icons-material/Handshake";
import CompostIcon from "@mui/icons-material/Compost";
import LogoutIcon from "@mui/icons-material/Logout";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BusinessIcon from "@mui/icons-material/Business";
import MenuIcon from "@mui/icons-material/Menu";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
// ===== REACT HOOKS =====
import { useEffect, useState } from "react";
// ===== AUTH HOOK =====
import { useAuth } from "../services/user/AuthContext";
// ===== TOAST =====
import { toast } from "react-toastify";

// ===================== COMPONENT =====================
export default function Navigation() {
  // ===== HOOKS =====
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { user, logout, refreshUserFromServer } = useAuth();

  // ===== STATE: Menu Anchor =====
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorE2, setAnchorE2] = useState<null | HTMLElement>(null);
  const [anchorE3, setAnchorE3] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const openShop = Boolean(anchorE2);
  const openExplore = Boolean(anchorE3);
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  // ===== STATE: Scroll =====
  const [scrolled, setScrolled] = useState(false);

  // ===== HANDLERS: Menu =====
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);
  const handleClickShop = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorE2(event.currentTarget);
  const handleCloseShop = () => setAnchorE2(null);
  const handleClickExplore = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorE3(event.currentTarget);
  const handleCloseExplore = () => setAnchorE3(null);

  // ===== HANDLER: Logout =====
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      toast.success("Đăng xuất thành công!", { position: "top-center" });
    } catch (error: any) {
      toast.error("Lỗi khi đăng xuất", { position: "bottom-center" });
    }
    handleClose();
  };

  // ===== HANDLER: Auth Navigation =====
  const handleAuth = (type: any) => {
    handleClose();
    handleCloseShop();
    window.scrollTo(0, 0);
    const userRole = user?.role?.toLowerCase();
    switch (type) {
      case "signup": navigate("/signup"); break;
      case "login": navigate("/login"); break;
      case "applydesigner": navigate("/apply/designer"); break;
      case "supplierregister": navigate("/apply/supplier"); break;
      case "desiger-profile":
        if (userRole === "designer") navigate("/designer/profile");
        else if (userRole === "supplier") navigate("/supplier/profile");
        else if (userRole === "admin") navigate("/admin/dashboard");
        else navigate("/profile");
        break;
      case "desiger-dashboard": navigate("/designer/dashboard"); break;
      case "admin-dashboard": navigate("/admin/dashboard"); break;
      case "admin-applications": navigate("/admin/applications"); break;
      case "supplier-dashboard": navigate("/supplier/dashboard"); break;
      case "supplier-profile": navigate("/supplier/profile"); break;
      case "my-applications": navigate("/my-applications"); break;
      case "explore-designers": navigate("/explore/designers"); break;
      case "explore-suppliers": navigate("/explore/suppliers"); break;
      case "fashion": navigate("/fashion"); break;
    }
  };

  // ===== STYLED NAVLINK =====
  const NavLink = styled(MuiLink)(({ theme }) => ({
    marginRight: theme.spacing(2),
    color: theme.palette.text.primary,
    textDecoration: "none",
    fontWeight: 500,
    "&:hover": { color: "rgba(94, 224, 159, 1)" },
  }));

  // ===== SCROLL EFFECT =====
  useEffect(() => {
    if (!isHome) return;
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  // ===== MENU ITEMS BY ROLE =====
  const getMenuItems = () => {
    if (!user) return [];
    const role = user.role?.toLowerCase();
    const menuItems = [];
    switch (role) {
      case "designer":
        menuItems.push(
          { label: "Hồ Sơ Designer", path: "/designer/profile", icon: <PersonIcon sx={{ mr: 1.5, fontSize: 20, color: "#4a5568" }} /> },
          { label: "Sản Phẩm Cá Nhân", path: "/designer/products", icon: <InventoryIcon sx={{ mr: 1.5, fontSize: 20, color: "#4a5568" }} /> },
          { label: "Bảng Điều Khiển", path: "/designer/dashboard", icon: <DashboardIcon sx={{ mr: 1.5, fontSize: 20, color: "#4a5568" }} /> },
        );
        break;
      case "admin":
        menuItems.push(
          { label: "Bảng Điều Khiển", path: "/admin/dashboard", icon: <DashboardIcon sx={{ mr: 1.5, fontSize: 20, color: "#4a5568" }} /> },
          { label: "Quản Lý Đơn Đăng Ký", path: "/admin/applications", icon: <InventoryIcon sx={{ mr: 1.5, fontSize: 20, color: "#4a5568" }} /> },
          { label: "Quản Lý Users", path: "/admin/users", icon: <PeopleIcon sx={{ mr: 1.5, fontSize: 20, color: "#4a5568" }} /> },
        );
        break;
      case "supplier":
        menuItems.push(
          { label: "Hồ Sơ Nhà Cung Cấp", path: "/supplier/profile", icon: <PersonIcon sx={{ mr: 1.5, fontSize: 20, color: "#4a5568" }} /> },
          { label: "Bảng Điều Khiển", path: "/supplier/dashboard", icon: <DashboardIcon sx={{ mr: 1.5, fontSize: 20, color: "#4a5568" }} /> },
        );
        break;
      case "customer":
      case "user":
      default:
        menuItems.push(
          { label: "Hồ Sơ Cá Nhân", path: "/profile", icon: <PersonIcon sx={{ mr: 1.5, fontSize: 20, color: "#4a5568" }} /> },
          { label: "Đơn Hàng", path: "/orders", icon: <InventoryIcon sx={{ mr: 1.5, fontSize: 20, color: "#4a5568" }} /> },
        );
        break;
    }
    if (role !== "admin") {
      menuItems.push({ label: "Xem đơn đăng ký", path: "/my-applications", icon: <FeedIcon sx={{ mr: 1.5, fontSize: 20, color: "#4a5568" }} /> });
    }
    if (role !== "designer" && role !== "admin" && role !== "supplier") {
      menuItems.push({ label: "Đăng ký làm Nhà Thiết Kế", path: "/apply/designer", icon: <DesignServicesIcon sx={{ mr: 1.5, fontSize: 20, color: "#4a5568" }} /> });
    }
    if (role !== "supplier" && role !== "admin" && role !== "designer") {
      menuItems.push({ label: "Đăng ký làm Nhà Cung Cấp", path: "/apply/supplier", icon: <HandshakeIcon sx={{ mr: 1.5, fontSize: 20, color: "#4a5568" }} /> });
    }
    return menuItems;
  };

  // Menu items cho Drawer mobile
  const mainMenuItems = [
    { label: "TRANG CHỦ", path: "/" },
    { label: "CỬA HÀNG", path: "/fashion" },
    { label: "KHÁM PHÁ", path: "/explore" },
    { label: "THÔNG TIN KINH DOANH", path: "/businessinfor" },
    { label: "VỀ CHÚNG TÔI", path: "/about" },
    { label: "LIÊN LẠC", path: "/contact" },
  ];

  // ===================== Return RENDER =====================
  return (
    <AppBar
      position={"relative"}
      elevation={scrolled || !isHome ? 4 : 0}
      sx={{
        backgroundColor: scrolled || !isHome ? "#fff" : "transparent",
        color: scrolled || !isHome ? "white" : "black",
        transition: "0.3s",
        paddingLeft: 3,
        paddingRight: 3,
        zIndex: (theme) => theme.zIndex.appBar + 1,
        fontFamily: "'Julyit', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <Toolbar disableGutters sx={{ display: "flex", fontFamily: "'Julyit', ui-sans-serif, system-ui, sans-serif" }}>
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            component="img"
            src={logo}
            alt="EcoFashion Logo"
            sx={{
              height: 60,
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
                cursor: "pointer",
              },
            }}
            onClick={() => navigate("/")}
          />
        </Box>
        {/* Menu desktop */}
        <Box
          sx={{
            flexGrow: 1,
            display: { xs: "none", md: "flex" }, // Ẩn trên mobile
            justifyContent: "space-evenly",
            maxWidth: "70%",
          }}
        >
          <NavLink
            href="/"
            sx={{
              margin: "auto",
              color: scrolled || !isHome ? "black" : "white",
            }}
          >
            TRANG CHỦ
          </NavLink>
          <Button
            id="basic-button"
            aria-controls={openShop ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={openShop ? "true" : undefined}
            onClick={handleClickShop}
            disableRipple // xoá hiệu ứng ripple
            disableElevation // xoá đổ bóng nếu có
            sx={{
              margin: "auto",
              textDecoration: "none",
              color: scrolled || !isHome ? "black" : "white",
              background: "transparent",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "transparent", // xoá màu nền khi hover
                color: "rgba(94, 224, 159, 1)",
              },
              "&:focus": {
                outline: "none", // xoá viền khi focus
                backgroundColor: "transparent",
              },
              "&:active": {
                backgroundColor: "transparent", // xoá hiệu ứng khi click
                boxShadow: "none",
              },
              fontWeight: "bold",
            }}
          >
            Cửa Hàng
          </Button>
          <Menu
            id="basic-menu"
            anchorEl={anchorE2}
            open={openShop}
            onClose={handleCloseShop}
            slotProps={{
              list: {
                "aria-labelledby": "basic-button",
              },
            }}
            disableScrollLock
          >
            <MenuItem onClick={() => handleAuth("fashion")}>
              Thời Trang
            </MenuItem>
            <MenuItem onClick={handleCloseShop}>Vật Liệu</MenuItem>
          </Menu>

          <Button
            id="explore-button"
            aria-controls={openExplore ? "explore-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={openExplore ? "true" : undefined}
            onClick={handleClickExplore}
            disableRipple
            disableElevation
            sx={{
              margin: "auto",
              textDecoration: "none",
              color: scrolled || !isHome ? "black" : "white",
              background: "transparent",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "transparent",
                color: "rgba(94, 224, 159, 1)",
              },
              "&:focus": {
                outline: "none",
                backgroundColor: "transparent",
              },
              "&:active": {
                backgroundColor: "transparent",
                boxShadow: "none",
              },
              fontWeight: "bold",
            }}
          >
            Khám Phá
          </Button>
          <Menu
            id="explore-menu"
            anchorEl={anchorE3}
            open={openExplore}
            onClose={handleCloseExplore}
            slotProps={{
              list: {
                "aria-labelledby": "explore-button",
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleCloseExplore();
                handleAuth("explore-designers");
              }}
            >
              Nhà Thiết Kế
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleCloseExplore();
                handleAuth("explore-suppliers");
              }}
            >
              Nhà Cung Cấp
            </MenuItem>
          </Menu>
          <NavLink
            href="/businessinfor"
            sx={{
              margin: "auto",
              color: scrolled || !isHome ? "black" : "white",
            }}
          >
            THÔNG TIN KINH DOANH
          </NavLink>
          <NavLink
            href="/about"
            sx={{
              margin: "auto",
              color: scrolled || !isHome ? "black" : "white",
            }}
          >
            VỀ CHÚNG TÔI
          </NavLink>
          <NavLink
            href="/contact"
            sx={{
              margin: "auto",
              color: scrolled || !isHome ? "black" : "white",
            }}
          >
            LIÊN LẠC
          </NavLink>
        </Box>
        {/* Hamburger menu cho mobile */}
        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerToggle}
            sx={{
              color: '#22c55e', // EcoFashion green
              '&:hover': { color: '#16a34a' },
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            marginLeft: "auto",
          }}
        >
          <IconButton sx={{ color: "#3e4b3b" }}>
            <ShoppingCartIcon
              sx={{
                fontSize: 30,
                color: scrolled || !isHome ? "black" : "white",
                "&:hover": {
                  color: "rgba(94, 224, 159, 1)",
                },
              }}
            />
          </IconButton>
          <IconButton sx={{ color: "#3e4b3b" }}>
            <FavoriteIcon
              sx={{
                fontSize: 30,
                color: scrolled || !isHome ? "black" : "white",
                "&:hover": {
                  color: "rgba(94, 224, 159, 1)",
                },
              }}
            />
          </IconButton>
          <Box sx={{ display: "flex" }}>
            {user ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  id="basic-button"
                  aria-controls={open ? "user-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                  onClick={handleClick}
                  sx={{ color: "#3e4b3b" }}
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="User Avatar"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: "#4caf50",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                      {user.fullName
                        ? user.fullName.charAt(0).toUpperCase()
                        : user.email
                        ? user.email.charAt(0).toUpperCase()
                        : "U"}
                    </Box>
                  )}
                </IconButton>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <Typography
                    sx={{
                      color: scrolled || !isHome ? "black" : "white",
                      fontWeight: 500,
                      fontSize: "0.9rem",
                    }}
                  >
                    {user.fullName || user.email}
                  </Typography>
                  <Typography
                    sx={{
                      color: scrolled || !isHome ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.8)",
                      fontSize: "0.75rem",
                      textTransform: "capitalize",
                    }}
                  >
                    {user.role || "User"}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Button
                  onClick={() => navigate("/login")}
                  sx={{
                    color: scrolled || !isHome ? "black" : "white",
                    border: 1,
                    borderColor: scrolled || !isHome ? "black" : "white",
                    "&:hover": {
                      backgroundColor: "rgba(94, 224, 159, 0.1)",
                      borderColor: "rgba(94, 224, 159, 1)",
                      color: "rgba(94, 224, 159, 1)",
                    },
                  }}
                >
                  Đăng Nhập
                </Button>
              </Box>
            )}
          </Box>

          {!user ? (
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              slotProps={{
                list: {
                  "aria-labelledby": "basic-button",
                },
              }}
            >
              <MenuItem onClick={() => handleAuth("login")}>
                <Box sx={{ display: "flex" }}>
                  <Icon>
                    <LoginIcon />
                  </Icon>
                  <Typography sx={{ padding: "3px" }}>Đăng Nhập</Typography>
                </Box>
              </MenuItem>
              <MenuItem onClick={() => handleAuth("signup")}>
                <Box sx={{ display: "flex" }}>
                  <Icon>
                    <HowToRegIcon />
                  </Icon>
                  <Typography sx={{ padding: "3px" }}>Đăng Ký</Typography>
                </Box>
              </MenuItem>
            </Menu>
          ) : (
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              sx={{
                "& .MuiPaper-root": {
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  border: "1px solid #e2e8f0",
                  borderRadius: 2,
                  mt: 1,
                  minWidth: 100,
                },
              }}
            >
              {/* User Profile Link */}
              <MenuItem onClick={() => handleAuth("desiger-profile")}>
                <Box sx={{ display: "flex" }}>
                  <PersonIcon />
                  <Typography sx={{ padding: "3px" }}>Trang Cá Nhân</Typography>
                </Box>
              </MenuItem>

              {/* Role-specific Menu Items */}
              {user.role?.toLowerCase() === "admin" && [
                <MenuItem
                  key="admin-dashboard"
                  onClick={() => handleAuth("admin-dashboard")}
                >
                  <Box sx={{ display: "flex" }}>
                    <DashboardIcon />
                    <Typography sx={{ padding: "3px" }}>
                      Quản Trị Hệ Thống
                    </Typography>
                  </Box>
                </MenuItem>,
                <MenuItem
                  key="admin-applications"
                  onClick={() => handleAuth("admin-applications")}
                >
                  <Box sx={{ display: "flex" }}>
                    <AssignmentIcon />
                    <Typography sx={{ padding: "3px" }}>
                      Quản Lý Đơn Đăng Ký
                    </Typography>
                  </Box>
                </MenuItem>,
              ]}

              {user.role?.toLowerCase() === "designer" && (
                <MenuItem onClick={() => handleAuth("desiger-dashboard")}>
                  <Box sx={{ display: "flex" }}>
                    <DesignServicesIcon />
                    <Typography sx={{ padding: "3px" }}>
                      Designer Dashboard
                    </Typography>
                  </Box>
                </MenuItem>
              )}

              {user.role?.toLowerCase() === "supplier" && (
                <MenuItem onClick={() => handleAuth("supplier-dashboard")}>
                  <Box sx={{ display: "flex" }}>
                    <DashboardIcon />
                    <Typography sx={{ padding: "3px" }}>
                      Bảng Điều Khiển
                    </Typography>
                  </Box>
                </MenuItem>
              )}

              {/* Show application menus for customers/users who can still apply */}
              {(user.role?.toLowerCase() === "customer" ||
                user.role?.toLowerCase() === "user") && [
                <MenuItem
                  key="apply-designer"
                  onClick={() => handleAuth("applydesigner")}
                >
                  <Box sx={{ display: "flex" }}>
                    <DesignServicesIcon />
                    <Typography sx={{ padding: "3px" }}>
                      Đăng Ký Làm Nhà Thiết Kế
                    </Typography>
                  </Box>
                </MenuItem>,
                <MenuItem
                  key="apply-supplier"
                  onClick={() => handleAuth("supplierregister")}
                >
                  <Box sx={{ display: "flex" }}>
                    <HandshakeIcon />
                    <Typography sx={{ padding: "3px" }}>
                      Đăng Ký Làm Nhà Cung Cấp
                    </Typography>
                  </Box>
                </MenuItem>,
              ]}

              {/* Show "My Applications" for users who might have pending applications */}
              {(user.role?.toLowerCase() === "customer" ||
                user.role?.toLowerCase() === "user" ||
                user.role?.toLowerCase() === "designer" ||
                user.role?.toLowerCase() === "supplier") && (
                <MenuItem onClick={() => handleAuth("my-applications")}>
                  <Box sx={{ display: "flex" }}>
                    <FeedIcon />
                    <Typography sx={{ padding: "3px" }}>
                      Đơn Đăng Ký Của Tôi
                    </Typography>
                  </Box>
                </MenuItem>
              )}

              {/* Common Menu Items */}
              <MenuItem onClick={handleClose}>
                <Box sx={{ display: "flex", width: "100%" }}>
                  <SettingsIcon />
                  <Typography sx={{ padding: "3px" }}>Cài Đặt</Typography>
                </Box>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Box sx={{ display: "flex", width: "100%" }}>
                  <LogoutIcon />
                  <Typography sx={{ padding: "3px" }}> Đăng Xuất</Typography>
                </Box>
              </MenuItem>
            </Menu>
          )}
        </Box>
      </Toolbar>
      {/* Drawer cho mobile */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
      >
        <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle}>
          <List>
            {mainMenuItems.map((item) => (
              <ListItemButton key={item.label} onClick={() => navigate(item.path)}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
            {/* Nếu user đã đăng nhập, hiển thị menu động theo role */}
            {user && getMenuItems().map((item) => (
              <ListItemButton key={item.label} onClick={() => navigate(item.path)}>
                {item.icon}
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
