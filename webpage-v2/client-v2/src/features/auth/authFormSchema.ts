import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
  password: z.string().min(3, 'Mật khẩu phải có ít nhất 3 ký tự'),
});

export const signupSchema = z.object({
  email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  fullname: z.string().min(1, 'Họ tên là bắt buộc'),
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  phone: z.string().optional(),
});

export const verifyOTPSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  otpCode: z
    .string()
    .min(6, 'Mã OTP phải có 6 chữ số')
    .max(6, 'Mã OTP phải có 6 chữ số'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type VerifyOTPFormData = z.infer<typeof verifyOTPSchema>;
