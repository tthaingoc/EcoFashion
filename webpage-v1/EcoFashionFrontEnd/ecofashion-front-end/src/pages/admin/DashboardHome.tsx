import React, { useState, useEffect } from "react";
import {
  BoxCubeIcon,
  ListIcon,
  BoxIcon,
  PieChartIcon,
  UserCircleIcon,
  PlugInIcon,
} from "../../assets/icons/index.tsx"; // Updated import path and icons
import AdminRevenueChart from "../../components/admin/AdminRevenueChart";
import UserRegistrationChart from "../../components/admin/UserRegistrationChart";
import { adminAnalyticsApi, DashboardStats } from "../../services/admin/adminAnalyticsApi";

const DashboardHome: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await adminAnalyticsApi.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const statsData = [
    {
      title: "Total Users",
      value: loading ? "..." : stats?.totalUsers.toString() || "0",
      change: "+12%",
      changeType: "positive",
      icon: <UserCircleIcon className="w-6 h-6" />,
      color: "bg-brand-500",
    },
    {
      title: "Total Designs",
      value: loading ? "..." : stats?.totalDesigns.toString() || "0",
      change: "+8%",
      changeType: "positive",
      icon: <BoxIcon className="w-6 h-6" />,
      color: "bg-success-500",
    },
    {
      title: "Total Materials",
      value: loading ? "..." : stats?.totalMaterials.toString() || "0",
      change: "+15%",
      changeType: "positive",
      icon: <ListIcon className="w-6 h-6" />,
      color: "bg-warning-500",
    },
    {
      title: "Revenue",
      value: loading ? "..." : stats ? formatCurrency(stats.totalRevenue) : "₫0",
      change: "+23%",
      changeType: "positive",
      icon: <PieChartIcon className="w-6 h-6" />,
      color: "bg-purple-500",
    },
  ];

  const quickActions = [
    {
      title: "Review Applications",
      description: "Check pending applications",
      icon: <ListIcon className="w-6 h-6" />,
      color: "bg-brand-500",
    },
    {
      title: "Approve Designs",
      description: "Review submitted designs",
      icon: <BoxIcon className="w-6 h-6" />,
      color: "bg-success-500",
    },
    {
      title: "Manage Users",
      description: "View and manage users",
      icon: <UserCircleIcon className="w-6 h-6" />,
      color: "bg-warning-500",
    },
    {
      title: "Analytics",
      description: "View platform analytics",
      icon: <PieChartIcon className="w-6 h-6" />,
      color: "bg-purple-500",
    },
    {
      title: "Settings",
      description: "Configure platform settings",
      icon: <PlugInIcon className="w-6 h-6" />,
      color: "bg-gray-500",
    },
    {
      title: "Materials",
      description: "Manage materials inventory",
      icon: <BoxCubeIcon className="w-6 h-6" />,
      color: "bg-orange-500",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: "application",
      message: "New designer application submitted by John Doe",
      time: "2 minutes ago",
      status: "pending",
    },
    {
      id: 2,
      type: "design",
      message: "Design 'Summer Collection' approved by admin",
      time: "1 hour ago",
      status: "approved",
    },
    {
      id: 3,
      type: "user",
      message: "New user registered: Sarah Johnson",
      time: "3 hours ago",
      status: "completed",
    },
    {
      id: 4,
      type: "material",
      message: "New material 'Organic Cotton' added to inventory",
      time: "5 hours ago",
      status: "completed",
    },
    {
      id: 5,
      type: "report",
      message: "Monthly analytics report generated",
      time: "1 day ago",
      status: "completed",
    },
  ];

  return (
    <div className="dashboard-main">
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">
              Welcome back! Here's what's happening with your platform.
            </p>
          </div>
          <div className="grid-stats mb-8">
            {statsData.map((stat, index) => (
              <div key={index} className="stats-card hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stats-label">{stat.title}</p>
                    <p className="stats-value">{stat.value}</p>
                  </div>
                  <div className={`stats-icon-container ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="mt-4">
                  <span
                    className={`stats-trend ${
                      stat.changeType === "positive"
                        ? "stats-trend-positive"
                        : "stats-trend-negative"
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-600 ml-1">
                    from last month
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mb-8">
            <AdminRevenueChart />
          </div>
          <div className="mb-8">
            <UserRegistrationChart />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="chart-container">
              <h3 className="chart-title">Quick Actions</h3>
              <div className="grid-actions">
                {quickActions.map((action, index) => (
                  <button key={index} className="quick-action-card">
                    <div
                      className={`quick-action-icon ${action.color} text-white`}
                    >
                      {action.icon}
                    </div>
                    <h4 className="quick-action-title">{action.title}</h4>
                    <p className="quick-action-description">
                      {action.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            <div className="chart-container">
              <h3 className="chart-title">Recent Activity</h3>
              <div className="activity-list">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div
                      className={`activity-dot ${
                        activity.type === "application"
                          ? "activity-dot-order"
                          : activity.type === "design"
                          ? "activity-dot-material"
                          : activity.type === "user"
                          ? "activity-dot-customer"
                          : activity.type === "material"
                          ? "activity-dot-material"
                          : "activity-dot-report"
                      }`}
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

export default DashboardHome;
