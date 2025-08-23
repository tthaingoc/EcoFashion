import React from 'react';
import SupplierOrders from './SupplierOrders';

const SupplierOrdersCompleted: React.FC = () => {
  // This component will use the main SupplierOrders component with completed filter
  
  return (
    <div>
      <SupplierOrders defaultFilter="delivered" />
    </div>
  );
};

export default SupplierOrdersCompleted;