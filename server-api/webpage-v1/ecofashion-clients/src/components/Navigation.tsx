import React, { useState, useEffect } from 'react';
import CartWithPopup from './cart/CartWithPopup';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useCartStore } from '../store/cartStore';
// ...existing code...
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';
import Avatar from './common/Avatar';

// Icons
const MenuIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4 group-hover:text-ecofashion-dark transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// HeartIcon => Heroicons outline

const ChevronDownIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const UserIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const DashboardIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  
  // Zustand stores
  const { 
    user, 
    logout, 
    getAvatarUrl, 
    getInitials, 
    getDisplayName,
    isAdmin,
    isSupplier,
    isCustomer,
    isDesigner
  } = useAuthStore();
  
  const { 
    userMenu, 
    notifications 
  } = useUIStore();

      // Subscribe to items so Navigation re-renders on cart change
  const [cartOpen, setCartOpen] = useState(false);
  // Cart logic moved to PopupCart

  // Local state
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [shopDropdownVisible, setShopDropdownVisible] = useState(false);
  const shopDropdownTimer = React.useRef<NodeJS.Timeout | null>(null);
  const [exploreMenuOpen, setExploreMenuOpen] = useState(false);
  const [exploreDropdownVisible, setExploreDropdownVisible] = useState(false);
  const exploreDropdownTimer = React.useRef<NodeJS.Timeout | null>(null);

  // Scroll effect
  useEffect(() => {
    if (!isHome) return;
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      toast.success("Đăng xuất thành công!", { position: "top-center" });
    } catch (error: any) {
      toast.error("Lỗi khi đăng xuất", { position: "bottom-center" });
    }
  };

  // Navigation handlers
  const handleAuth = (type: string) => {
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

  // Get menu items by role
  const getMenuItems = () => {
    if (!user) return [];
    const role = user.role?.toLowerCase();
    const menuItems = [];
    
    switch (role) {
      case "designer":
        menuItems.push(
          { label: "Hồ Sơ Designer", path: "/designer/profile", icon: <UserIcon /> },
          { label: "Sản Phẩm Cá Nhân", path: "/designer/products", icon: <DashboardIcon /> },
          { label: "Bảng Điều Khiển", path: "/designer/dashboard", icon: <DashboardIcon /> },
        );
        break;
      case "admin":
        menuItems.push(
          { label: "Bảng Điều Khiển", path: "/admin/dashboard", icon: <DashboardIcon /> },
          { label: "Quản Lý Đơn Đăng Ký", path: "/admin/applications", icon: <DashboardIcon /> },
          { label: "Quản Lý Users", path: "/admin/users", icon: <UserIcon /> },
        );
        break;
      case "supplier":
        menuItems.push(
          { label: "Hồ Sơ Nhà Cung Cấp", path: "/supplier/profile", icon: <UserIcon /> },
          { label: "Bảng Điều Khiển", path: "/supplier/dashboard", icon: <DashboardIcon /> },
        );
        break;
      case "customer":
      case "user":
      default:
        menuItems.push(
          { label: "Hồ Sơ Cá Nhân", path: "/profile", icon: <UserIcon /> },
          { label: "Đơn Hàng", path: "/orders", icon: <DashboardIcon /> },
        );
        break;
    }
    
    if (role !== "admin") {
      menuItems.push({ label: "Xem đơn đăng ký", path: "/my-applications", icon: <DashboardIcon /> });
    }
    
    if (role !== "designer" && role !== "admin" && role !== "supplier") {
      menuItems.push({ label: "Đăng ký làm Nhà Thiết Kế", path: "/apply/designer", icon: <UserIcon /> });
    }
    
    if (role !== "supplier" && role !== "admin" && role !== "designer") {
      menuItems.push({ label: "Đăng ký làm Nhà Cung Cấp", path: "/apply/supplier", icon: <UserIcon /> });
    }
    
    return menuItems;
  };

  const mainMenuItems = [
    { label: "TRANG CHỦ", path: "/" },
    { label: "CỬA HÀNG", path: "/fashion" },
    { label: "KHÁM PHÁ", path: "/explore" },
    { label: "THÔNG TIN KINH DOANH", path: "/businessinfor" },
    { label: "VỀ CHÚNG TÔI", path: "/about" },
    { label: "LIÊN LẠC", path: "/contact" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled || !isHome 
        ? 'bg-white shadow-lg text-gray-900' 
        : 'bg-transparent text-white'
    }`}>
      <div className="w-full px-4 sm:px-8 lg:px-16">
        <div className="flex justify-center items-center h-16 gap-2">
          {/* Logo */}
          <div className="flex items-center mr-2">
            <Link to="/" className="flex items-center space-x-1">
              <img 
                src="/src/assets/pictures/homepage/logo2.png" 
                alt="EcoFashion Logo" 
                className="h-11 w-auto transition-transform duration-300 hover:scale-105"
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center flex-nowrap w-auto space-x-6 p-0 m-0 justify-center">
            {/* Main Navigation */}
            <div className="flex items-center flex-nowrap w-auto space-x-5 p-0 m-0 justify-center">
              <Link 
                to="/" 
                className={`navbar-link uppercase tracking-wide px-2 py-1 transition-all duration-300 ${
                  scrolled || !isHome ? 'text-gray-900' : 'text-white'
                }`}
              >
                TRANG CHỦ
              </Link>
              
              {/* Shop Menu */}
              <div className="relative">
                <button
                  onMouseEnter={() => {
                    if (shopDropdownTimer.current) clearTimeout(shopDropdownTimer.current);
                    setShopMenuOpen(true);
                    setShopDropdownVisible(true);
                  }}
                  onMouseLeave={() => {
                    shopDropdownTimer.current = setTimeout(() => {
                      setShopDropdownVisible(false);
                      setShopMenuOpen(false);
                    }, 500);
                  }}
                  onClick={() => {
                    setShopMenuOpen(!shopMenuOpen);
                    setShopDropdownVisible(!shopMenuOpen);
                  }}
                  className={`navbar-link flex items-center space-x-1 uppercase tracking-wide px-2 py-1 transition-all duration-300 ${
                    scrolled || !isHome ? 'text-gray-900' : 'text-white'
                  }`}
                >
                  <span>CỬA HÀNG</span>
                  <ChevronDownIcon />
                </button>
                <div
                  className={`absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-50 transition-opacity duration-500 ${shopDropdownVisible && shopMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                  onMouseEnter={() => {
                    if (shopDropdownTimer.current) clearTimeout(shopDropdownTimer.current);
                    setShopDropdownVisible(true);
                  }}
                  onMouseLeave={() => {
                    shopDropdownTimer.current = setTimeout(() => {
                      setShopDropdownVisible(false);
                      setShopMenuOpen(false);
                    }, 500);
                  }}
                >
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShopMenuOpen(false);
                        setShopDropdownVisible(false);
                        handleAuth("fashion");
                      }}
                      className="dropdown-item block w-full text-left px-4 py-2 text-base text-gray-700 transition-all duration-200 rounded-lg"
                    >
                      Thời Trang
                    </button>
                    <button
                      onClick={() => {
                        setShopMenuOpen(false);
                        setShopDropdownVisible(false);
                        handleAuth("material");
                      }}
                      className="dropdown-item block w-full text-left px-4 py-2 text-base text-gray-700 transition-all duration-200 rounded-lg"
                    >
                      Vật Liệu
                    </button>
                  </div>
                </div>
              </div>

              {/* Explore Menu */}
              <div className="relative">
                <button
                  onMouseEnter={() => {
                    if (exploreDropdownTimer.current) clearTimeout(exploreDropdownTimer.current);
                    setExploreMenuOpen(true);
                    setExploreDropdownVisible(true);
                  }}
                  onMouseLeave={() => {
                    exploreDropdownTimer.current = setTimeout(() => {
                      setExploreDropdownVisible(false);
                      setExploreMenuOpen(false);
                    }, 500);
                  }}
                  onClick={() => {
                    setExploreMenuOpen(!exploreMenuOpen);
                    setExploreDropdownVisible(!exploreMenuOpen);
                  }}
                  className={`navbar-link flex items-center space-x-1 uppercase tracking-wide px-2 py-1 transition-all duration-300 ${
                    scrolled || !isHome ? 'text-gray-900' : 'text-white'
                  }`}
                >
                  <span>KHÁM PHÁ</span>
                  <ChevronDownIcon />
                </button>
                <div
                  className={`absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-50 transition-opacity duration-500 ${exploreDropdownVisible && exploreMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                  onMouseEnter={() => {
                    if (exploreDropdownTimer.current) clearTimeout(exploreDropdownTimer.current);
                    setExploreDropdownVisible(true);
                  }}
                  onMouseLeave={() => {
                    exploreDropdownTimer.current = setTimeout(() => {
                      setExploreDropdownVisible(false);
                      setExploreMenuOpen(false);
                    }, 500);
                  }}
                >
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setExploreMenuOpen(false);
                        setExploreDropdownVisible(false);
                        handleAuth("explore-designers");
                      }}
                      className="dropdown-item block w-full text-left px-4 py-2 text-base text-gray-700 transition-all duration-200 rounded-lg"
                    >
                      Nhà Thiết Kế
                    </button>
                    <button
                      onClick={() => {
                        setExploreMenuOpen(false);
                        setExploreDropdownVisible(false);
                        handleAuth("explore-suppliers");
                      }}
                      className="dropdown-item block w-full text-left px-4 py-2 text-base text-gray-700 transition-all duration-200 rounded-lg"
                    >
                      Nhà Cung Cấp
                    </button>
                  </div>
                </div>
              </div>

              <Link 
                to="/businessinfor" 
                className={`navbar-link uppercase tracking-wide px-2 py-1 transition-all duration-300 ${
                  scrolled || !isHome ? 'text-gray-900' : 'text-white'
                }`}
              >
                THÔNG TIN KINH DOANH
              </Link>
              
              <Link 
                to="/about" 
                className={`navbar-link uppercase tracking-wide px-2 py-1 transition-all duration-300 ${
                  scrolled || !isHome ? 'text-gray-900' : 'text-white'
                }`}
              >
                VỀ CHÚNG TÔI
              </Link>
              
              <Link 
                to="/contact" 
                className={`navbar-link uppercase tracking-wide px-2 py-1 transition-all duration-300 ${
                  scrolled || !isHome ? 'text-gray-900' : 'text-white'
                }`}
                style={{ whiteSpace: 'nowrap' }}
              >
                LIÊN LẠC
              </Link>
            </div>
          </div>

          {/* Right side - Icons and User */}
          <div className="flex items-center space-x-2 ml-2">
            {/* Icons */}
            <CartWithPopup />
            <button className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${scrolled || !isHome ? 'text-gray-700' : 'text-white'}`}>
              <HeartOutlineIcon className="w-6 h-6 text-inherit hover:text-pink-500 transition duration-200" />
            </button>

            {/* User Section */}
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Avatar 
                    src={getAvatarUrl()}
                    alt={getDisplayName()}
                    fallbackText={getInitials()}
                    size="sm"
                  />
                  <div className="hidden md:block text-left">
                    <p className={`text-sm font-medium ${
                      scrolled || !isHome ? 'text-gray-900' : 'text-white'
                    }`}>
                      {getDisplayName()}
                    </p>
                    <p className={`text-xs ${
                      scrolled || !isHome ? 'text-gray-600' : 'text-gray-200'
                    }`}>
                      {user.role}
                    </p>
                  </div>
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={userMenu.toggle}
                    className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                      scrolled || !isHome ? 'text-gray-700' : 'text-white'
                    }`}
                  >
                    <ChevronDownIcon />
                  </button>

                  {userMenu.isOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="py-2">
                        {/* Profile Link */}
                        <button
                          onClick={() => {
                            userMenu.toggle();
                            handleAuth("desiger-profile");
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <UserIcon />
                          <span className="ml-3">Trang Cá Nhân</span>
                        </button>

                        {/* Role-specific Menu Items */}
                        {isAdmin() && (
                          <>
                            <button
                              onClick={() => {
                                userMenu.toggle();
                                handleAuth("admin-dashboard");
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <DashboardIcon />
                              <span className="ml-3">Quản Trị Hệ Thống</span>
                            </button>
                            <button
                              onClick={() => {
                                userMenu.toggle();
                                handleAuth("admin-applications");
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <DashboardIcon />
                              <span className="ml-3">Quản Lý Đơn Đăng Ký</span>
                            </button>
                          </>
                        )}

                        {isDesigner() && (
                          <button
                            onClick={() => {
                              userMenu.toggle();
                              handleAuth("desiger-dashboard");
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <DashboardIcon />
                            <span className="ml-3">Designer Dashboard</span>
                          </button>
                        )}

                        {isSupplier() && (
                          <button
                            onClick={() => {
                              userMenu.toggle();
                              handleAuth("supplier-dashboard");
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <DashboardIcon />
                            <span className="ml-3">Bảng Điều Khiển</span>
                          </button>
                        )}

                        {/* Show application menus for customers/users */}
                        {(isCustomer() || user.role === 'user') && (
                          <>
                            <button
                              onClick={() => {
                                userMenu.toggle();
                                handleAuth("applydesigner");
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <UserIcon />
                              <span className="ml-3">Đăng Ký Làm Nhà Thiết Kế</span>
                            </button>
                            <button
                              onClick={() => {
                                userMenu.toggle();
                                handleAuth("supplierregister");
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <UserIcon />
                              <span className="ml-3">Đăng Ký Làm Nhà Cung Cấp</span>
                            </button>
                          </>
                        )}

                        {/* My Applications */}
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => {
                              userMenu.toggle();
                              handleAuth("my-applications");
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <DashboardIcon />
                            <span className="ml-3">Đơn Đăng Ký Của Tôi</span>
                          </button>
                        )}

                        <hr className="my-2 border-gray-200" />

                        {/* Settings and Logout */}
                        <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <SettingsIcon />
                          <span className="ml-3">Cài Đặt</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            userMenu.toggle();
                            handleLogout();
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <LogoutIcon />
                          <span className="ml-3">Đăng Xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className={`px-4 py-2 border border-current rounded-lg hover:bg-white hover:text-gray-900 transition-colors ${
                    scrolled || !isHome ? 'text-gray-900 border-gray-900' : 'text-white border-white'
                  }`}
                >
                  Đăng Nhập
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-6 space-y-4">
            {/* Main menu items */}
            {mainMenuItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="block text-gray-700 hover:text-brand-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* User menu items */}
            {user && getMenuItems().map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="flex items-center space-x-3 text-gray-700 hover:text-brand-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
