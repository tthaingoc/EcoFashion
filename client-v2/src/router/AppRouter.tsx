import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { SimpleHomePage } from '@/features/home/HomePage';
import { LoginPage } from '@/features/auth/LoginPage';
import { SignupPage } from '@/features/auth/SignupPage';
import { VerifyOTPPage } from '@/features/auth/VerifyOTPPage';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';

const router = createBrowserRouter([
  // Auth routes (outside MainLayout)
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/verify-otp',
    element: <VerifyOTPPage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  // Main app routes
  {
    path: '/',
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
