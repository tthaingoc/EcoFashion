import React from "react";
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
import DesginerDashboared from "./pages/designer/DesignerDashboard";
import SupplierProfile from "./pages/supplier/SupplierProfile";
import SupplierDashboard from "./pages/supplier/SupplierDashboard";
import SupplierDashboardHome from "./pages/supplier/SupplierDashboardHome";
import SupplierMaterials from "./pages/supplier/SupplierMaterials";
import MaterialDetailPage from "./pages/material/MaterialDetailPage";
import AddMaterial from "./pages/supplier/AddMaterial";
import CustomerProfile from "./pages/customer/CustomerProfile";
import Explore from "./pages/explore/Explore";
import ExploreDesigners from "./pages/explore/ExploreDesigners";
import ExploreSuppliers from "./pages/explore/ExploreSuppliers";
import DesignerLandingPage from "./pages/explore/DesignerLandingPage";
import SupplierLandingPage from "./pages/explore/SupplierLandingPage";
import AddDesign from "./pages/design/AddDesign";
import DashboardHome from "./pages/admin/DashboardHome";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ApplicationManagement from "./pages/admin/ApplicationManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import BusinessInfor from "./pages/BusinessInfor";


function App() {
  const location = useLocation();
  
  // Hide layout for dashboard pages
  const hideLayout = 
    location.pathname.includes("/login") ||
    location.pathname.includes("/signup") ||
    location.pathname.includes("/verify-otp") ||
    location.pathname.includes("/admin/dashboard") ||
    location.pathname.includes("/supplier/dashboard") ||
    location.pathname.includes("/designer/dashboard");
  
  // Hide footer for dashboard pages
  const hideFooter = 
    location.pathname.includes("/login") ||
    location.pathname.includes("/signup") ||
    location.pathname.includes("/verify-otp") ||
    location.pathname.includes("/admin/dashboard") ||
    location.pathname.includes("/supplier/dashboard") ||
    location.pathname.includes("/designer/dashboard");

  return (
    <div className="app">
      {!hideLayout && <Navigation />}
      <Routes>
        {/* ===== PUBLIC ROUTES ===== */}
        <Route path="/" element={<Homepages />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />

        {/* ===== DESIGN and MATERIAL ROUTES ===== */}
        <Route path="/fashion" element={<FashionList />} />
        <Route path="/detail/:id" element={<DesignDetail />} />
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

        {/* ===== EXPLORE ROUTES ===== */}
        <Route path="/explore" element={<Explore />} />
        <Route path="/explore/designers" element={<ExploreDesigners />} />
        <Route path="/explore/suppliers" element={<ExploreSuppliers />} />
        <Route path="/explore/designer/:id" element={<DesignerLandingPage />} />
        <Route path="/explore/supplier/:id" element={<SupplierLandingPage />} />

        {/* ===== DESIGNER ROUTES ===== */}
        <Route
          path="/designer/profile"
          element={
            <ProtectedRoute requiredRole="designer">
              <DesignerProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/designer/dashboard"
          element={
            <ProtectedRoute requiredRole="designer">
              <DesginerDashboared />
            </ProtectedRoute>
          }
        />

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
        </Route>

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

        {/* ===== DESIGN ROUTES ===== */}
        <Route
          path="/design/add"
          element={
            <ProtectedRoute requiredRole="designer">
              <AddDesign />
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
