import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import Navigation from "./components/Navigation";
import "react-toastify/dist/ReactToastify.css";

//Pages
import Homepages from "./pages/Homepages";

import About from "./pages/About";
import FooterInfo from "./pages/FooterInfo";
import DesignDetail from "./pages/design/DesignDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOTP from "./components/VerifyOTP";
import DesignerProfile from "./pages/designer/DesignerProfile";
import SupplierProfile from "./pages/supplier/SupplierProfile";
import CustomerProfile from "./pages/customer/CustomerProfile";
import Dashboard from "./pages/admin/Dashboard";
import ApplicationManagement from "./pages/admin/ApplicationManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthContextProvider } from "./services/user/AuthContext";
import { ToastContainer } from "react-toastify";
import BusinessInfor from "./pages/BusinessInfor";
import Contact from "./pages/Contact";
import DesginerDashboared from "./pages/designer/DesignerDashboard";
import SupplierDashboard from "./pages/supplier/SupplierDashboard";
import ApplyDesigner from "./pages/apply/ApplyDesigner";
import ApplySupplier from "./pages/apply/ApplySupplier";
import MyApplications from "./pages/apply/MyApplications";
import ExploreDesigners from "./pages/explore/ExploreDesigners";
import DesignerLandingPage from "./pages/explore/DesignerLandingPage";
import ExploreSuppliers from "./pages/explore/ExploreSuppliers";
import SupplierLandingPage from "./pages/explore/SupplierLandingPage";
import FashionList from "./pages/design/FashionList";
import DesingBrandProfile from "./pages/design/DesignBrandProfile";
import AddDesign from "./pages/design/AddDesign";
import Explore from "./pages/explore/Explore";
import MaterialDetails from "./pages/material/MaterialDetails";
function App() {
  const location = useLocation();
  // Hide Nav and Footer on these routes
  const hideLayout = ["/login", "/signup","/explore"].includes(location.pathname) ||
    location.pathname.endsWith("/profile");

  return (
    <AuthContextProvider>
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
          <Route path="/material/:id" element={<MaterialDetails />} />

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
              <ProtectedRoute allowedRoles={["designer"]}>
                <DesignerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/designer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["designer"]}>
                <DesginerDashboared />
              </ProtectedRoute>
            }
          />
          <Route
            path="/designer/dashboard/add"
            element={
              <ProtectedRoute allowedRoles={["designer"]}>
                <AddDesign />
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
          <Route
            path="/supplier/dashboard"
            element={
              <ProtectedRoute allowedRoles={["supplier"]}>
                <SupplierDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier/inventory"
            element={
              <ProtectedRoute allowedRoles={["supplier"]}>
                <SupplierDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supplier/orders"
            element={
              <ProtectedRoute allowedRoles={["supplier"]}>
                <SupplierDashboard />
              </ProtectedRoute>
            }
          />

          {/* ===== CUSTOMER ROUTES ===== */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["customer", "user"]}>
                <CustomerProfile />
              </ProtectedRoute>
            }
          />

          {/* ===== EXPLORE ROUTES ===== */}
          <Route path="/explore" element={<Explore />} />
          <Route path="/explore/designers" element={<ExploreDesigners />} />
          <Route path="/explore/designers/:id" element={<DesignerLandingPage />} />
          <Route path="/explore/suppliers" element={<ExploreSuppliers />} />
          <Route path="/explore/suppliers/:id" element={<SupplierLandingPage />} />

          {/* ===== ADMIN ROUTES ===== */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/applications"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ApplicationManagement />
              </ProtectedRoute>
            }
          />
        </Routes>
        {!hideLayout && <FooterInfo />}
        <ToastContainer />
      </div>
    </AuthContextProvider>
  );
}

export default App;
