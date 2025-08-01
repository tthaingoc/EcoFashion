import React from 'react';
import { Link } from 'react-router-dom';
import { BoxIcon, ListIcon, PieChartIcon, PlusIcon } from '../../assets/icons/index.tsx';

const SupplierMaterials: React.FC = () => {
  const materials = [
    {
      name: "Cotton Tái Chế",
      quantity: "500m",
      price: "45.000đ/m",
      status: "in-stock",
      category: "Vải tự nhiên",
      lastUpdated: "2 giờ trước"
    },
    {
      name: "Denim Organic",
      quantity: "300m",
      price: "85.000đ/m",
      status: "low-stock",
      category: "Vải denim",
      lastUpdated: "1 ngày trước"
    },
    {
      name: "Linen Hữu Cơ",
      quantity: "200m",
      price: "120.000đ/m",
      status: "in-stock",
      category: "Vải tự nhiên",
      lastUpdated: "3 ngày trước"
    },
    {
      name: "Bamboo Fabric",
      quantity: "150m",
      price: "95.000đ/m",
      status: "out-of-stock",
      category: "Vải sinh thái",
      lastUpdated: "1 tuần trước"
    },
    {
      name: "Hemp Canvas",
      quantity: "400m",
      price: "75.000đ/m",
      status: "in-stock",
      category: "Vải canvas",
      lastUpdated: "5 giờ trước"
    },
    {
      name: "Modal Blend",
      quantity: "250m",
      price: "65.000đ/m",
      status: "low-stock",
      category: "Vải tổng hợp",
      lastUpdated: "2 ngày trước"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <span className="status-badge status-completed">Còn hàng</span>;
      case 'low-stock':
        return <span className="status-badge status-warning">Sắp hết</span>;
      case 'out-of-stock':
        return <span className="status-badge status-critical">Hết hàng</span>;
      default:
        return <span className="status-badge status-pending">Không xác định</span>;
    }
  };

  const stats = [
    {
      title: "Tổng Vật Liệu",
      value: "6",
      icon: <BoxIcon className="text-blue-500" />,
      bgColor: "bg-blue-500"
    },
    {
      title: "Còn Hàng",
      value: "3",
      icon: <ListIcon className="text-green-500" />,
      bgColor: "bg-green-500"
    },
    {
      title: "Sắp Hết",
      value: "2",
      icon: <PieChartIcon className="text-orange-500" />,
      bgColor: "bg-orange-500"
    },
    {
      title: "Hết Hàng",
      value: "1",
      icon: <BoxIcon className="text-red-500" />,
      bgColor: "bg-red-500"
    }
  ];

  return (
    <div className="dashboard-main">
      <div className="dashboard-container">
        <div className="dashboard-content">
          {/* Header */}
          <div className="dashboard-header">
            <h1 className="dashboard-title">Quản Lý Vật Liệu</h1>
            <p className="dashboard-subtitle">Thêm, sửa và quản lý vật liệu trong kho</p>
          </div>

          {/* Stats */}
          <div className="grid-stats mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="stats-card hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stats-label">{stat.title}</p>
                    <p className="stats-value">{stat.value}</p>
                  </div>
                  <div className={`stats-icon-container ${stat.bgColor}`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Materials List */}
          <div className="chart-container">
            <div className="flex items-center justify-between mb-6">
              <h3 className="chart-title">Danh Sách Vật Liệu</h3>
              <Link to="/supplier/dashboard/materials/add" className="btn-primary">
                <PlusIcon className="w-4 h-4 mr-2" />
                Thêm Vật Liệu
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Tên Vật Liệu</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Danh Mục</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Số Lượng</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Giá</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Trạng Thái</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Cập Nhật</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((material, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{material.name}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{material.category}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{material.quantity}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{material.price}</span>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(material.status)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{material.lastUpdated}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1 text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierMaterials; 