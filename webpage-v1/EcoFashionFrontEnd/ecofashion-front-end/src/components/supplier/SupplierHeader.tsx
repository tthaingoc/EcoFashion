import React, { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import Avatar from "../common/Avatar";
import { useNavigate, Link, useLocation } from "react-router-dom";
import MaterialDetailModal from "../admin/MaterialDetailModal";
import { toast } from "react-toastify";
import notificationService, {
  type NotificationItem,
} from "../../services/api/notificationService";
import { formatViDateTime } from "../../utils/date";
import { useQuery } from "@tanstack/react-query";

const SupplierHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleSupplierMobileSidebar, supplierSidebar } = useUIStore();
  const {
    user,
    supplierProfile,
    getInitials,
    getAvatarUrl,
    getDisplayName,
    logout,
  } = useAuthStore();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [materialsMenuOpen, setMaterialsMenuOpen] = useState(false);
  const [ordersMenuOpen, setOrdersMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Đăng xuất thành công!");
    navigate("/");
    setIsUserMenuOpen(false);
  };

  const handleProfileClick = () => {
    navigate("/supplier/profile");
    setIsUserMenuOpen(false);
  };

  const { data: notifications = [] } = useQuery<NotificationItem[]>({
    queryKey: ["supplierNotifications", user?.userId],
    enabled: !!user,
    queryFn: () =>
      notificationService.getUserNotifications(user!.userId, 1, 10),
    // Nếu server khởi động chậm, thử lại theo backoff mặc định của React Query
    retry: 2,
    refetchInterval: isNotificationOpen ? 10000 : false,
    refetchOnWindowFocus: false,
    staleTime: 5000,
  });

  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ["supplierUnreadCount", user?.userId],
    enabled: !!user,
    queryFn: () => notificationService.getUnreadCount(user!.userId),
    retry: 2,
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
    staleTime: 5000,
  });

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-white px-4 shadow-sm dark:bg-gray-900 lg:px-6">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={toggleSupplierMobileSidebar}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Search */}
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-sm focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-brand-500 dark:focus:border-brand-500"
              placeholder="Search..."
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 relative"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5 5v-5zM4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-h-4 min-w-4 px-1 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 z-50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">
                      Không có thông báo
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.notificationId}
                        className="w-full text-left p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={async () => {
                          if (!user) return;
                          try {
                            await notificationService.markAsRead(
                              n.notificationId,
                              user.userId
                            );
                          } catch {}
                          setIsNotificationOpen(false);
                          const type = (n.relatedType || "").toLowerCase();
                          const id = n.relatedId ? parseInt(n.relatedId) : NaN;
                          if (type === "material" && !Number.isNaN(id)) {
                            setDetailId(id);
                            setDetailOpen(true);
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${
                              n.type === "success"
                                ? "bg-green-500"
                                : n.type === "error"
                                ? "bg-red-500"
                                : n.type === "warning"
                                ? "bg-yellow-500"
                                : "bg-brand-500"
                            }`}
                          ></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {n.message}
                            </p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                              {formatViDateTime(n.createdAt as any)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
                  <button
                    className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400"
                    onClick={async () => {
                      if (!user) return;
                      await notificationService.markAllAsRead(user.userId);
                    }}
                  >
                    Đánh dấu tất cả đã đọc
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Avatar
                src={getAvatarUrl()}
                alt={getDisplayName()}
                fallbackText={getInitials("S")}
                size="md"
              />
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* User dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 z-50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email || "supplier@ecofashion.com"}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate("/");
                      setIsUserMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Trang Chủ
                  </button>
                  <button
                    onClick={handleProfileClick}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Trang Cá Nhân
                  </button>
                  <button
                    onClick={() => {
                      navigate("/supplier/detailed-profile");
                      setIsUserMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Thông Tin Chi Tiết
                  </button>
                  <hr className="my-1 border-gray-200 dark:border-gray-700" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
                  >
                    Đăng Xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {supplierSidebar.isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={toggleSupplierMobileSidebar}
        >
          <div
            className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-gray-900">
                  EcoFashion
                </span>
              </div>
              <button
                onClick={toggleSupplierMobileSidebar}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Mobile Menu Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Dashboard */}
              <Link
                to="/supplier/dashboard"
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === "/supplier/dashboard"
                    ? "text-brand-500 bg-brand-50"
                    : "text-gray-700 hover:text-brand-500 hover:bg-gray-50"
                }`}
                onClick={toggleSupplierMobileSidebar}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span>Bảng Điều Khiển</span>
              </Link>

              {/* Materials Section */}
              <div>
                <button
                  onClick={() => setMaterialsMenuOpen(!materialsMenuOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:text-brand-500 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
                      />
                    </svg>
                    <span>Vật Liệu</span>
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      materialsMenuOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {materialsMenuOpen && (
                  <div className="ml-8 mt-2 space-y-1">
                    <Link
                      to="/supplier/dashboard/materials"
                      className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                        location.pathname === "/supplier/dashboard/materials"
                          ? "text-brand-500 bg-brand-50"
                          : "text-gray-600 hover:text-brand-500 hover:bg-gray-50"
                      }`}
                      onClick={toggleSupplierMobileSidebar}
                    >
                      Tất Cả Vật Liệu
                    </Link>
                    <Link
                      to="/supplier/dashboard/materials/add"
                      className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                        location.pathname ===
                        "/supplier/dashboard/materials/add"
                          ? "text-brand-500 bg-brand-50"
                          : "text-gray-600 hover:text-brand-500 hover:bg-gray-50"
                      }`}
                      onClick={toggleSupplierMobileSidebar}
                    >
                      <span>Thêm Vật Liệu</span>
                      <span className="px-1.5 py-0.5 text-xs font-medium text-green-600 bg-green-100 rounded">
                        NEW
                      </span>
                    </Link>
                    <Link
                      to="/supplier/dashboard/material-types"
                      className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                        location.pathname ===
                        "/supplier/dashboard/material-types"
                          ? "text-brand-500 bg-brand-50"
                          : "text-gray-600 hover:text-brand-500 hover:bg-gray-50"
                      }`}
                      onClick={toggleSupplierMobileSidebar}
                    >
                      Các Loại Vải
                    </Link>
                    <Link
                      to="/supplier/dashboard/materials/inventory"
                      className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                        location.pathname ===
                        "/supplier/dashboard/materials/inventory"
                          ? "text-brand-500 bg-brand-50"
                          : "text-gray-600 hover:text-brand-500 hover:bg-gray-50"
                      }`}
                      onClick={toggleSupplierMobileSidebar}
                    >
                      Quản Lý Kho
                    </Link>
                  </div>
                )}
              </div>

              {/* Orders Section */}
              <div>
                <button
                  onClick={() => setOrdersMenuOpen(!ordersMenuOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:text-brand-500 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <span>Đơn Hàng</span>
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      ordersMenuOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {ordersMenuOpen && (
                  <div className="ml-8 mt-2 space-y-1">
                    <Link
                      to="/supplier/dashboard/orders"
                      className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                        location.pathname === "/supplier/dashboard/orders"
                          ? "text-brand-500 bg-brand-50"
                          : "text-gray-600 hover:text-brand-500 hover:bg-gray-50"
                      }`}
                      onClick={toggleSupplierMobileSidebar}
                    >
                      Tất Cả Đơn Hàng
                    </Link>
                    <Link
                      to="/supplier/dashboard/orders/pending"
                      className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                        location.pathname ===
                        "/supplier/dashboard/orders/pending"
                          ? "text-brand-500 bg-brand-50"
                          : "text-gray-600 hover:text-brand-500 hover:bg-gray-50"
                      }`}
                      onClick={toggleSupplierMobileSidebar}
                    >
                      Đơn Hàng Chờ
                    </Link>
                    <Link
                      to="/supplier/dashboard/orders/completed"
                      className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                        location.pathname ===
                        "/supplier/dashboard/orders/completed"
                          ? "text-brand-500 bg-brand-50"
                          : "text-gray-600 hover:text-brand-500 hover:bg-gray-50"
                      }`}
                      onClick={toggleSupplierMobileSidebar}
                    >
                      Đơn Hàng Hoàn Thành
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <MaterialDetailModal
        open={detailOpen}
        materialId={detailId}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
};

export default SupplierHeader;
