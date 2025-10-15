import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BoxCubeIcon,
  ListIcon,
  BoxIcon,
  PieChartIcon,
  UserCircleIcon,
} from "../../assets/icons/index.tsx";
import SupplierRevenueChart from "../../components/supplier/SupplierRevenueChart";
import { supplierAnalyticsApi } from "../../services/supplier/supplierAnalyticsApi";

const SupplierDashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const [revenueData, setRevenueData] = useState<{
    totalRevenue: number;
    totalOrders: number;
  } | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Fetch revenue data for stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get last 30 days data
        const endDate = new Date().toISOString().split("T")[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];

        const analytics = await supplierAnalyticsApi.getRevenueAnalytics({
          period: "daily",
          startDate,
          endDate,
        });

        setRevenueData({
          totalRevenue: analytics.totalRevenue,
          totalOrders: analytics.totalOrders,
        });
      } catch (error) {
        console.error("Failed to fetch revenue stats:", error);
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    {
      title: "Thêm Vật Liệu",
      description: "Thêm vật liệu mới vào kho",
      icon: <BoxCubeIcon className="text-brand-500" />,
      path: "/supplier/dashboard/materials/add",
    },
    {
      title: "Xem Đơn Hàng",
      description: "Kiểm tra đơn hàng mới",
      icon: <ListIcon className="text-brand-500" />,
      path: "/supplier/dashboard/orders",
    },
    {
      title: "Báo Cáo",
      description: "Xem báo cáo doanh thu",
      icon: <PieChartIcon className="text-brand-500" />,
      path: "/supplier/dashboard",
    },
  ];

  const recentActivity = [
    {
      message: "Đơn hàng #12345 đã được đặt",
      time: "2 phút trước",
      type: "order" as const,
    },
    {
      message: "Vật liệu Cotton đã được thêm vào kho",
      time: "1 giờ trước",
      type: "material" as const,
    },
    {
      message: "Báo cáo tháng 12 đã được tạo",
      time: "3 giờ trước",
      type: "report" as const,
    },
    {
      message: "Khách hàng mới đã đăng ký",
      time: "5 giờ trước",
      type: "customer" as const,
    },
  ];

  return (
    <div className="dashboard-main">
      <div className="dashboard-container">
        <div className="dashboard-content">
          {/* Header */}
          <div className="dashboard-header">
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">
              Chào mừng bạn trở lại! Đây là tổng quan về hoạt động kinh doanh
              của bạn.
            </p>
          </div>

          {/* Charts Grid */}
          <div className="mb-8">
            {/* Revenue Chart */}
            <SupplierRevenueChart />
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <div className="chart-container">
              <h3 className="chart-title">Thao Tác Nhanh</h3>
              <div className="grid-actions">
                {quickActions.map((action, index) => (
                  <div
                    key={index}
                    className="quick-action-card hover-lift cursor-pointer"
                    onClick={() => navigate(action.path)}
                  >
                    <div className="quick-action-icon">{action.icon}</div>
                    <h4 className="quick-action-title">{action.title}</h4>
                    <p className="quick-action-description">
                      {action.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="chart-container">
              <h3 className="chart-title">Hoạt Động Gần Đây</h3>
              <div className="activity-list">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div
                      className={`activity-dot activity-dot-${activity.type}`}
                    ></div>
                    <div className="activity-content">
                      <p className="activity-message">{activity.message}</p>
                      <p className="activity-time">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboardHome;
