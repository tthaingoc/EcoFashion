import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import Navigation from "./components/Navigation";
import FooterInfo from "./pages/FooterInfo";
import Homepages from "./pages/Homepages";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOTP from "./components/VerifyOTP";
import FashionList from "./pages/design/FashionList";
import DesignDetail from "./pages/design/DesignDetail";
import DesingBrandProfile from "./pages/design/DesignBrandProfile";
import ApplyDesigner from "./pages/apply/ApplyDesigner";
import ApplySupplier from "./pages/apply/ApplySupplier";
import MyApplications from "./pages/apply/MyApplications";
import DesignerProfile from "./pages/designer/DesignerProfile";
import DesignerDetailedProfile from "./pages/designer/DesignerDetailedProfile";
import DesginerDashboared from "./pages/designer/DesignerDashboard";
import SupplierProfile from "./pages/supplier/SupplierProfile";
import SupplierDetailedProfile from "./pages/supplier/SupplierDetailedProfile";
import SupplierDashboard from "./pages/supplier/SupplierDashboard";
import SupplierDashboardHome from "./pages/supplier/SupplierDashboardHome";
import SupplierMaterials from "./pages/supplier/SupplierMaterials";
import SupplierInventory from "./pages/supplier/SupplierInventory";
import SupplierOrders from "./pages/supplier/SupplierOrders";
import SupplierOrdersPending from "./pages/supplier/SupplierOrdersPending";
import SupplierOrdersCompleted from "./pages/supplier/SupplierOrdersCompleted";
import MaterialDetailPage from "./pages/material/MaterialDetailPage";
import AddMaterial from "./pages/supplier/AddMaterial";
import CustomerProfile from "./pages/customer/CustomerProfile";
import Explore from "./pages/explore/Explore";
import AddDesignDraft from "./pages/design/AddDesignDraft";

import ExploreDesigners from "./pages/explore/ExploreDesigners";
import ExploreSuppliers from "./pages/explore/ExploreSuppliers";
import DesignerLandingPage from "./pages/explore/DesignerLandingPage";
import SupplierLandingPage from "./pages/explore/SupplierLandingPage";
import DashboardHome from "./pages/admin/DashboardHome";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ApplicationManagement from "./pages/admin/ApplicationManagement";
import MaterialsAll from "./pages/admin/MaterialsAll";
import MaterialsPending from "./pages/admin/MaterialsPending";
import MaterialsApproved from "./pages/admin/MaterialsApproved";
import MaterialTypesAll from "./pages/admin/MaterialTypesAll";
import InventoryReport from "./pages/admin/InventoryReport";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import BusinessInfor from "./pages/BusinessInfor";
import Cart from "./pages/shop/cart";
import CheckoutTailwind from "./pages/checkout/CheckoutTailwind";
import CheckoutConfirmTailwind from "./pages/checkout/CheckoutConfirmTailwind";
import CheckoutResultPageTailwind from "./pages/checkout/CheckoutResultTailwind";
import FlexibleCheckoutPage from "./pages/checkout/FlexibleCheckoutPage";
import OrdersPage from "./pages/shop/OrdersPage";
import OrdersDetails from "./components/orders/OrdersDetails";
import OrdersList from "./components/orders/OrdersList";
import ShipmentDashboardTailwind from "./pages/shipment/ShipmentDashboardTailwind";
import WalletPageTailwind from "./pages/wallet/WalletPageTailwind";
import VNPaySuccess from "./pages/payment/VNPaySuccess";
import { useAuthStore } from "./store/authStore";
import { useCartStore } from "./store/cartStore";
import { ConfirmProvider } from "material-ui-confirm";

//import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const syncCart = useCartStore((s) => s.syncFromServer);

  useEffect(() => {
    if (isAuthenticated) {
      // Đồng bộ giỏ hàng từ server ngay khi người dùng đã đăng nhập
      syncCart().catch((err) => console.warn("Sync cart failed:", err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Hide layout for dashboard pages
  const hideLayout =
    location.pathname.includes("/login") ||
    location.pathname.includes("/signup") ||
    location.pathname.includes("/verify-otp") ||
    location.pathname.includes("/supplier/dashboard") ||
    // location.pathname.includes("/designer/dashboard") ||
    location.pathname.includes("/admin/dashboard");

  // Hide footer for dashboard pages
  const hideFooter =
    location.pathname.includes("/login") ||
    location.pathname.includes("/signup") ||
    location.pathname.includes("/verify-otp") ||
    location.pathname.includes("/supplier/dashboard") ||
    // location.pathname.includes("/designer/dashboard") ||
    location.pathname.includes("/admin/dashboard");

  return (
    <div className="app">
      {!hideLayout && <Navigation />}
      <Routes>
        {/* ===== PUBLIC ROUTES ===== */}
        <Route path="/" element={<Homepages />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />

        {/* ===== CHECKOUT and ORDERS ROUTES ===== */}
        <Route
          path="/checkout/confirm"
          element={
            <ProtectedRoute allowedRoles={["customer", "supplier", "designer"]}>
              <CheckoutConfirmTailwind />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRoles={["customer", "supplier", "designer"]}>
              <CheckoutTailwind />
            </ProtectedRoute>
          }
        />
        <Route
          path="/flexible-checkout"
          element={
            <ProtectedRoute allowedRoles={["customer", "supplier", "designer"]}>
              <FlexibleCheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/result"
          element={
            <ProtectedRoute allowedRoles={["customer", "supplier", "designer"]}>
              <CheckoutResultPageTailwind />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute
              allowedRoles={["customer", "supplier", "designer", "admin"]}
            >
              <OrdersPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<OrdersList />} />
          <Route path=":orderId" element={<OrdersDetails />} />
        </Route>

        {/* ===== SHIPMENT ROUTES ===== */}
        <Route
          path="/shipment"
          element={
            <ProtectedRoute allowedRoles={["admin", "supplier", "designer"]}>
              <ShipmentDashboardTailwind />
            </ProtectedRoute>
          }
        />
        {/* Removed standalone tracking page; tracking handled within Tailwind dashboard */}

        {/* ===== WALLET ROUTES ===== */}
        <Route
          path="/wallet"
          element={
            <ProtectedRoute
              allowedRoles={["customer", "supplier", "designer", "admin"]}
            >
              <WalletPageTailwind />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/vnpay-success"
          element={
            <ProtectedRoute
              allowedRoles={["customer", "supplier", "designer", "admin"]}
            >
              <VNPaySuccess />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />

        {/* ===== DESIGN and MATERIAL ROUTES ===== */}
        <Route path="/fashion" element={<FashionList />} />
        <Route path="/detail/:id/:designerId" element={<DesignDetail />} />
        <Route path="/brand/:id" element={<DesingBrandProfile />} />
        <Route path="/material/:id" element={<MaterialDetailPage />} />

        {/* ===== APPLICATION ROUTES ===== */}
        <Route path="/businessinfor" element={<BusinessInfor />} />
        <Route
          path="/apply/designer"
          element={
            <ProtectedRoute allowedRoles={["customer", "user", "supplier"]}>
              <ApplyDesigner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/apply/supplier"
          element={
            <ProtectedRoute allowedRoles={["customer", "user", "designer"]}>
              <ApplySupplier />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-applications"
          element={
            <ProtectedRoute
              allowedRoles={["customer", "user", "designer", "supplier"]}
            >
              <MyApplications />
            </ProtectedRoute>
          }
        />

        {/* ===== DESIGNER ROUTES ===== */}
        <Route
          path="/designer/profile"
          element={
            <ProtectedRoute requiredRole={"designer"}>
              <DesignerProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/designer/dashboard"
          element={
            <ProtectedRoute requiredRole={"designer"}>
              <DesginerDashboared />
            </ProtectedRoute>
          }
        />

        <Route
          path="/designer/dashboard/create"
          element={
            <ProtectedRoute requiredRole={"designer"}>
              <AddDesignDraft />
            </ProtectedRoute>
          }
        />
        <Route
          path="/designer/detailed-profile"
          element={
            <ProtectedRoute requiredRole="designer">
              <DesignerDetailedProfile />
            </ProtectedRoute>
          }
        />

        {/* ===== SUPPLIER ROUTES ===== */}
        <Route
          path="/supplier/profile"
          element={
            <ProtectedRoute allowedRoles={["supplier"]}>
              <SupplierProfile />
            </ProtectedRoute>
          }
        />
        {/* ===== EXPLORE ROUTES ===== */}
        <Route path="/explore" element={<Explore />} />
        <Route path="/explore/designers" element={<ExploreDesigners />} />
        <Route path="/explore/suppliers" element={<ExploreSuppliers />} />
        <Route path="/explore/designer/:id" element={<DesignerLandingPage />} />
        <Route path="/explore/supplier/:id" element={<SupplierLandingPage />} />

        {/* ===== SUPPLIER ROUTES ===== */}
        <Route
          path="/supplier/profile"
          element={
            <ProtectedRoute requiredRole="supplier">
              <SupplierProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier/detailed-profile"
          element={
            <ProtectedRoute requiredRole="supplier">
              <SupplierDetailedProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier/dashboard"
          element={
            <ProtectedRoute requiredRole="supplier">
              <SupplierDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<SupplierDashboardHome />} />
          <Route path="materials" element={<SupplierMaterials />} />
          <Route path="materials/add" element={<AddMaterial />} />
          <Route path="materials/inventory" element={<SupplierInventory />} />
          <Route path="orders" element={<SupplierOrders />} />
          <Route path="orders/pending" element={<SupplierOrdersPending />} />
          <Route
            path="orders/completed"
            element={<SupplierOrdersCompleted />}
          />
        </Route>

        {/* ===== EXPLORE ROUTES ===== */}
        <Route path="/explore" element={<Explore />} />
        <Route path="/explore/designers" element={<ExploreDesigners />} />
        <Route
          path="/explore/designers/:id"
          element={<DesignerLandingPage />}
        />
        <Route path="/explore/suppliers" element={<ExploreSuppliers />} />
        <Route
          path="/explore/suppliers/:id"
          element={<SupplierLandingPage />}
        />
        {/* ===== ADMIN ROUTES ===== */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="applications" element={<ApplicationManagement />} />
          <Route path="material-types" element={<MaterialTypesAll />} />
          <Route path="materials" element={<MaterialsAll />} />
          <Route path="materials/pending" element={<MaterialsPending />} />
          <Route path="materials/approved" element={<MaterialsApproved />} />
          <Route path="analytics/inventory" element={<InventoryReport />} />
        </Route>

        {/* Allow direct access to /admin/applications for admin */}
        <Route
          path="/admin/applications"
          element={
            <ProtectedRoute requiredRole="admin">
              <ApplicationManagement />
            </ProtectedRoute>
          }
        />

        {/* ===== CUSTOMER ROUTES ===== */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerProfile />
            </ProtectedRoute>
          }
        />
      </Routes>

      {!hideFooter && <FooterInfo />}
      <ToastContainer />
    </div>
  );
}

export default App;
