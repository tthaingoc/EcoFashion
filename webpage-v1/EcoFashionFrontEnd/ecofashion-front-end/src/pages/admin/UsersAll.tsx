import React from 'react';
import { useQuery } from '@tanstack/react-query';
import adminUserService, { type AdminUserItem } from '../../services/api/adminUserService';

const roleColor = (role?: string) => {
    const r = (role || '').toLowerCase();
    if (r === 'admin') return 'bg-red-100 text-red-700';
    if (r === 'supplier') return 'bg-green-100 text-green-700';
    if (r === 'designer') return 'bg-purple-100 text-purple-700';
    if (r === 'customer') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
};

const UsersAll: React.FC = () => {
    const { data: users = [], isLoading, error } = useQuery<AdminUserItem[]>({
        queryKey: ['adminUsersAll'],
        queryFn: () => adminUserService.getAllUsers(),
    });

    return (
        <div className="dashboard-main">
            <div className="dashboard-container">
                <div className="dashboard-content">
                    <div className="dashboard-header">
                        <h1 className="dashboard-title">Tất Cả Người Dùng</h1>
                        <p className="dashboard-subtitle">Danh sách tài khoản toàn hệ thống</p>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-body overflow-x-auto">
                            {isLoading ? (
                                <div className="text-gray-500">Đang tải...</div>
                            ) : error ? (
                                <div className="text-red-500">Không thể tải danh sách người dùng</div>
                            ) : users.length === 0 ? (
                                <div className="text-gray-500">Chưa có người dùng</div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SĐT</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((u) => (
                                            <tr key={u.userId}>
                                                <td className="px-4 py-2 text-sm text-gray-900">{u.userId}</td>
                                                <td className="px-4 py-2 text-sm text-gray-900">{u.fullName || '—'}</td>
                                                <td className="px-4 py-2 text-sm text-gray-900">{u.email}</td>
                                                <td className="px-4 py-2 text-sm text-gray-900">{u.phone || '—'}</td>
                                                <td className="px-4 py-2 text-sm text-gray-900">{u.username || '—'}</td>
                                                <td className="px-4 py-2 text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColor(u.role)}`}>{u.role || '—'}</span>
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-900">{u.status}</td>
                                                <td className="px-4 py-2 text-sm text-gray-900">{new Date(u.createdAt).toLocaleString('vi-VN')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsersAll;


