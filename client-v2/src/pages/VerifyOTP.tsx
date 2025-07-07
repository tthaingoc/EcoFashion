import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/api/auth';
import { Mail, Lock, ArrowLeft } from 'lucide-react';

// Validation schema
const otpSchema = z.object({
  otpCode: z
    .string()
    .min(6, 'Mã OTP phải có 6 chữ số')
    .max(6, 'Mã OTP phải có 6 chữ số')
    .regex(/^[0-9]{6}$/, 'Mã OTP chỉ chứa số'),
});

type OTPFormData = z.infer<typeof otpSchema>;

const VerifyOTP: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  // Get email from navigation state
  const email = location.state?.email || '';
  const message = location.state?.message || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
  });

  // If no email, redirect to signup
  React.useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  const onSubmit = async (data: OTPFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await authApi.verifyOTP(email, data.otpCode);
      setSuccess('Xác thực thành công! Đang chuyển hướng...');

      // Redirect to login page after success
      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Tài khoản đã được kích hoạt. Vui lòng đăng nhập.',
          },
        });
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Xác thực OTP thất bại');
      reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError(null);
    setResendSuccess(null);

    try {
      await authApi.resendOTP(email);
      setResendSuccess('Mã OTP mới đã được gửi đến email của bạn');
    } catch (err: any) {
      setError(err.message || 'Không thể gửi lại mã OTP');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToSignup = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Xác Thực Email
            </h1>
            <p className="text-gray-600">
              Vui lòng nhập mã OTP đã được gửi đến email
            </p>
            <p className="text-green-600 font-medium mt-1">{email}</p>
          </div>

          {/* Message from signup */}
          {message && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">{message}</p>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}

          {/* Resend Success Alert */}
          {resendSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">{resendSuccess}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* OTP Code */}
            <div>
              <label
                htmlFor="otpCode"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mã OTP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="otpCode"
                  type="text"
                  maxLength={6}
                  {...register('otpCode')}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg tracking-widest ${
                    errors.otpCode ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="123456"
                />
              </div>
              {errors.otpCode && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.otpCode.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang xác thực...
                </div>
              ) : (
                'Xác Thực'
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-3">
              Không nhận được mã OTP?
            </p>
            <button
              onClick={handleResendOTP}
              disabled={isResending}
              className="text-green-600 hover:text-green-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
            </button>
          </div>

          {/* Back to Signup */}
          <div className="mt-6 text-center">
            <button
              onClick={handleBackToSignup}
              className="flex items-center justify-center text-gray-600 hover:text-gray-700 text-sm mx-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Quay lại đăng ký
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
