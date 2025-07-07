import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, CheckCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-green-600">EcoFashion</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Xin chào, {user.fullname || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-1" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Chào mừng đến với EcoFashion!
                </h2>
                <p className="text-gray-600">
                  Tài khoản của bạn đã được kích hoạt thành công. Khám phá thời
                  trang bền vững cùng chúng tôi.
                </p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <User className="h-6 w-6 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Thông tin tài khoản
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Họ tên
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {user.fullname || 'Chưa cập nhật'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tên đăng nhập
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {user.username || 'Chưa cập nhật'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Số điện thoại
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {user.phone || 'Chưa cập nhật'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Vai trò
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {user.role || 'Customer'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Trạng thái
                </label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Đã kích hoạt
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
