import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { SimpleHomePage } from "@/features/pages/HomePage";
import { LoginPage } from "@/features/auth/LoginPage";
import Signup from "@/features/pages/Signup";
import VerifyOTP from "@/features/pages/VerifyOTP";
import Dashboard from "@/features/pages/Dashboard";
import { UnauthorizedPage } from "@/features/pages/UnauthorizedPage";
import { ROUTES } from "./routes";

const router = createBrowserRouter([
  // Auth routes (outside MainLayout)
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.SIGNUP,
    element: <Signup />,
  },
  {
    path: ROUTES.VERIFY_OTP,
    element: <VerifyOTP />,
  },
  {
    path: ROUTES.DASHBOARD,
    element: <Dashboard />,
  },
  {
    path: ROUTES.UNAUTHORIZED,
    element: <UnauthorizedPage />,
  },
  // Main app routes
  {
    path: ROUTES.HOME,
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <SimpleHomePage />,
      },
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
