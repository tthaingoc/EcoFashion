import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import type { AuthResponse, SignupResponse, OTPResponse } from '@/types/auth';

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data: AuthResponse) => {
      // Store auth data in localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('tokenExpiresAt', data.expiresAt);
      localStorage.setItem('userInfo', JSON.stringify(data.user));

      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: Error) => {
      console.error('Login failed:', error.message);
    },
  });
};

export const useSignup = () => {
  return useMutation({
    mutationFn: ({
      email,
      password,
      fullname,
      username,
      phone,
    }: {
      email: string;
      password: string;
      fullname: string;
      username: string;
      phone?: string;
    }) => authApi.signup(email, password, fullname, username, phone),
    onSuccess: (data: SignupResponse) => {
      console.log('Signup successful:', data.message);
    },
    onError: (error: Error) => {
      console.error('Signup failed:', error.message);
    },
  });
};

export const useVerifyOTP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, otpCode }: { email: string; otpCode: string }) =>
      authApi.verifyOTP(email, otpCode),
    onSuccess: (data: OTPResponse) => {
      console.log('OTP verification successful:', data.message);
      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: Error) => {
      console.error('OTP verification failed:', error.message);
    },
  });
};

export const useResendOTP = () => {
  return useMutation({
    mutationFn: ({ email }: { email: string }) => authApi.resendOTP(email),
    onSuccess: (data: OTPResponse) => {
      console.log('OTP resent successfully:', data.message);
    },
    onError: (error: Error) => {
      console.error('Resend OTP failed:', error.message);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('tokenExpiresAt');
      localStorage.removeItem('userInfo');
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      // Redirect to login
      window.location.href = '/login';
    },
  });
};
