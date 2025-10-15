// Route configuration constants
export const ROUTES = {
  // Public routes
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  VERIFY_OTP: "/verify-otp",
  FORGOT_PASSWORD: "/forgot-password",

  // Protected routes
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  ORDERS: "/orders",
  WISHLIST: "/wishlist",

  // Product routes
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/products/:id",

  // Designer routes
  DESIGNERS: "/designers",
  DESIGNER_PROFILE: "/designer/:slug",

  // Role-specific routes
  REGISTER_DESIGNER: "/register/designer",
  REGISTER_SUPPLIER: "/register/supplier",
  ADMIN_DASHBOARD: "/admin",

  // Error routes
  UNAUTHORIZED: "/unauthorized",
  NOT_FOUND: "/404",
} as const;

// Role-based access configuration
export const ROLE_ACCESS = {
  ADMIN: ["admin", "Admin"], // Support both cases
  DESIGNER: ["designer", "Designer"],
  SUPPLIER: ["supplier", "Supplier"],
  CUSTOMER: ["customer", "user", "Customer", "User"],
  AUTHENTICATED: [], // Any authenticated user
} as const;
