import React from 'react';
import { useSearchParams } from 'react-router-dom';
import FlexibleCheckoutCart from '../../components/checkout/FlexibleCheckoutCart';

// Trang Flexible Checkout - Cho phép thanh toán linh hoảt theo lựa chọn hoặc nhóm
const FlexibleCheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const checkoutSessionId = searchParams.get('sessionId'); // Lấy session ID từ URL parameters

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Component xử lý giỏ hàng thanh toán linh hoạt */}
      <FlexibleCheckoutCart 
        checkoutSessionId={checkoutSessionId || undefined}
        onPaymentSuccess={(orderGroupId) => {
          // Điều hướng đến trang thành công hoặc danh sách đơn hàng
          window.location.href = `/orders?success=true&orderGroupId=${orderGroupId}`;
        }}
      />
    </div>
  );
};

export default FlexibleCheckoutPage;