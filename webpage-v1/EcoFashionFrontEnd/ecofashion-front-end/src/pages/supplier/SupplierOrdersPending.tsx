import React from 'react';
import SupplierOrders from './SupplierOrders';

const SupplierOrdersPending: React.FC = () => {
  // This component will use the main SupplierOrders component with pending filter
  // You can customize it further by passing props or using different logic
  
  return (
    <div>
      <SupplierOrders defaultFilter="processing" />
    </div>
  );
};

export default SupplierOrdersPending;