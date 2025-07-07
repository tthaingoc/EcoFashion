import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { SimpleHomePage } from '@/features/home/HomePage';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import VerifyOTP from '@/pages/VerifyOTP';
import Dashboard from '@/pages/Dashboard';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';
import { ROUTES } from './routes';

const router = createBrowserRouter([
  // Auth routes (outside MainLayout)
  {
    path: ROUTES.LOGIN,
    element: <Login />,
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
