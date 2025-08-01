import React from 'react';
import { Outlet } from 'react-router-dom';
import SupplierHeader from '../../components/supplier/SupplierHeader';
import SupplierSidebar from '../../components/supplier/SupplierSidebar';
import SupplierBackdrop from '../../components/supplier/SupplierBackdrop';
import { SupplierSidebarProvider, useSupplierSidebar } from '../../services/supplier/SupplierSidebarContext';
import '../../assets/css/dashboard.css';

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSupplierSidebar();

  return (
    <div className="dashboard-layout bg-gray-50 dark:bg-gray-900">
      <div className="dashboard-content-wrapper">
        <SupplierSidebar />
        <SupplierBackdrop />
        <div
          className={`dashboard-main transition-all duration-300 ease-in-out ${
            isExpanded || isHovered ? "expanded" : ""
          } ${isMobileOpen ? "ml-0" : ""}`}
        >
          <SupplierHeader />
          <div className="dashboard-container">
            <div className="dashboard-content">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SupplierDashboard: React.FC = () => {
  return (
    <SupplierSidebarProvider>
      <LayoutContent />
    </SupplierSidebarProvider>
  );
};

export default SupplierDashboard; 