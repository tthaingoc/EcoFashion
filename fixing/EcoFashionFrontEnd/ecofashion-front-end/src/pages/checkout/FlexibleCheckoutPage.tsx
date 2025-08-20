import React from 'react';
import { useSearchParams } from 'react-router-dom';
import FlexibleCheckoutCart from '../../components/checkout/FlexibleCheckoutCart';

const FlexibleCheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const checkoutSessionId = searchParams.get('sessionId');

  return (
    <div className="min-h-screen bg-gray-50">
      <FlexibleCheckoutCart 
        checkoutSessionId={checkoutSessionId || undefined}
        onPaymentSuccess={(orderGroupId) => {
          // Navigate to success page or orders
          window.location.href = `/orders?success=true&orderGroupId=${orderGroupId}`;
        }}
      />
    </div>
  );
};

export default FlexibleCheckoutPage;