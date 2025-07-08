import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, type AuthResponse } from "@/api/auth";

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data: AuthResponse) => {
      // Store auth data in localStorage
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("tokenExpiresAt", data.expiresAt);
      localStorage.setItem("userInfo", JSON.stringify(data.user));

      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    // Let errors propagate to components for handling
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Clear auth data from localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("tokenExpiresAt");
      localStorage.removeItem("userInfo");
    },
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
      // Redirect to login
      window.location.href = "/login";
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
    }) => {
      // TODO: Implement signup API call
      throw new Error("Signup not implemented yet");
    },
    onSuccess: (data: any) => {
      console.log("Signup successful:", data);
    },
  });
};

export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: ({ email, otpCode }: { email: string; otpCode: string }) => {
      // TODO: Implement OTP verification API call
      throw new Error("OTP verification not implemented yet");
    },
    onSuccess: (data: any) => {
      console.log("OTP verification successful:", data);
    },
  });
};

export const useResendOTP = () => {
  return useMutation({
    mutationFn: ({ email }: { email: string }) => {
      // TODO: Implement resend OTP API call
      throw new Error("Resend OTP not implemented yet");
    },
    onSuccess: (data: any) => {
      console.log("OTP resent successfully:", data);
    },
  });
};
