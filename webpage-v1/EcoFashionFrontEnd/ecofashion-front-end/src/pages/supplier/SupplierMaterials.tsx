import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BoxIcon, ListIcon, PieChartIcon, PlusIcon } from '../../assets/icons/index.tsx';
import { formatViDateTime, parseApiDate } from '../../utils/date';
import MaterialDetailModal from '../../components/admin/MaterialDetailModal';
import { useSupplierMaterials } from '../../hooks/useSupplierMaterials';
import { useAuthStore } from '../../store/authStore';

// Đã xóa import DashboardComponents vì không còn sử dụng

type ApprovalStatus = 'all' | 'Pending' | 'Approved' | 'Rejected';

const SupplierMaterials: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<ApprovalStatus>('all');
  const supplierId = useAuthStore((s) => s.supplierProfile?.supplierId);
  const loadUserProfile = useAuthStore((s) => s.loadUserProfile);
  
  // Load profile if not available
  React.useEffect(() => {
    if (!supplierId) {
      loadUserProfile();
    }
  }, [supplierId, loadUserProfile]);
  
  const { data: materialsResponse, isLoading, error, refetch } = useSupplierMaterials(
    selectedStatus === 'all' ? undefined : selectedStatus
  );

  // Extract materials from API response - backend returns ApiResult<List<MaterialDetailDto>>
  const materials = Array.isArray(materialsResponse) 
    ? materialsResponse 
    : materialsResponse || [];
    

  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <span className="status-badge status-completed">Đã Duyệt</span>;
      case 'Pending':
        return <span className="status-badge status-warning">Chờ Duyệt</span>;
      case 'Rejected':
        return <span className="status-badge status-critical">Từ Chối</span>;
      default:
        return <span className="status-badge status-pending">Không xác định</span>;
    }
  };

  const getAvailabilityBadge = (isAvailable: boolean) => {
    if (isAvailable) {
      return <span className="status-badge status-completed">Còn hàng</span>;
    } else {
      return <span className="status-badge status-critical">Hết hàng</span>;
    }
  };

  // Calculate stats based on current data
  const stats = [
    {
      title: "Tổng Vật Liệu",
      value: materials.length.toString(),
      icon: <BoxIcon className="text-blue-500" />,
      bgColor: "bg-blue-500"
    },
    {
      title: "Chờ Duyệt",
      value: materials.filter(m => m.approvalStatus === 'Pending').length.toString(),
      icon: <ListIcon className="text-orange-500" />,
      bgColor: "bg-orange-500"
    },
    {
      title: "Đã Duyệt",
      value: materials.filter(m => m.approvalStatus === 'Approved').length.toString(),
      icon: <PieChartIcon className="text-green-500" />,
      bgColor: "bg-green-500"
    },
    {
      title: "Bị Từ Chối",
      value: materials.filter(m => m.approvalStatus === 'Rejected').length.toString(),
      icon: <BoxIcon className="text-red-500" />,
      bgColor: "bg-red-500"
    }
  ];

  const formatDate = (dateString: string) => {
    // Chuẩn hóa thời gian về VN để tránh lệch múi giờ, sau đó tính relative
    const d = parseApiDate(dateString);
    const vn = new Date(
      d.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })
    );
    const now = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })
    );
    const diffMs = now.getTime() - vn.getTime();
    const diffInHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const days = Math.floor(diffInHours / 24);
    if (days < 7) return `${days} ngày trước`;
    const weeks = Math.floor(days / 7);
    return `${weeks} tuần trước`;
  };

  const formatPrice = (price: number) => {
    return `${(price * 1000).toLocaleString()} đồng/mét`;
  };

  const formatQuantity = (quantity: number) => {
    return `${quantity}m`;
  };

  // Helper để mapping màu và icon cho đánh giá tổng
  const getSustainabilityStatus = (score?: number) => {
    if (typeof score !== 'number') return { label: '—', color: 'text-gray-500', icon: '' };
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600', icon: '✅' };
    if (score >= 60) return { label: 'Good', color: 'text-yellow-600', icon: '👍' };
    if (score >= 40) return { label: 'Average', color: 'text-orange-500', icon: '⚠️' };
    return { label: 'Needs Improvement', color: 'text-red-600', icon: '❌' };
  };

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  return (
    <>
      <div className="supplier-materials-page p-6">
        {/* Header */}
        <div className="header-section mb-6">
          <h1 className="text-2xl font-bold">Quản Lý Vật Liệu</h1>
          <p className="text-gray-500">Thêm, sửa và quản lý vật liệu trong kho</p>
        </div>

        {/* Stats */}
        <div className="stats-section mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="stats-card p-4 rounded shadow bg-white flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
              <div className={`stats-icon-container ${stat.bgColor}`}>{stat.icon}</div>
            </div>
          ))}
        </div>

        {/* Filter & Actions */}
        <div className="filter-section mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            {/* Filter Tabs */}
            <button onClick={() => setSelectedStatus('all')} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${selectedStatus === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Tất Cả</button>
            <button onClick={() => setSelectedStatus('Pending')} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${selectedStatus === 'Pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Chờ Duyệt</button>
            <button onClick={() => setSelectedStatus('Approved')} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${selectedStatus === 'Approved' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Đã Duyệt</button>
            <button onClick={() => setSelectedStatus('Rejected')} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${selectedStatus === 'Rejected' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Từ Chối</button>
          </div>
          <Link to="/supplier/dashboard/materials/add" className="btn-primary flex items-center gap-2 w-fit">
            <PlusIcon className="w-4 h-4" /> Thêm Vật Liệu
          </Link>
        </div>

        {/* Table/List */}
        <div className="table-section bg-white rounded shadow p-4">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Đang tải danh sách vật liệu...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">Lỗi tải danh sách vật liệu</div>
          ) : materials.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Chưa có vật liệu nào</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Vật Liệu</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Loại</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Giá</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Đánh Giá</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Trạng Thái</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Kho</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Cập Nhật</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material) => {
                  const sustainability = getSustainabilityStatus(material.sustainabilityScore);
                  return (
                    <tr key={material.materialId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {material.imageUrls && material.imageUrls.length > 0 ? (
                            <img 
                              src={material.imageUrls[0]} 
                              alt={material.name || 'Material'} 
                              className="w-12 h-12 object-cover rounded-lg"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/default-material.jpg';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <BoxIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {material.name || 'Unnamed Material'}
                            </p>
                            {material.sustainabilityScore && (
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs font-medium text-green-600">
                                  Bền vững: {Math.round(material.sustainabilityScore)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 align-top">
                        <span className="font-medium text-gray-900 block">{material.materialTypeName}</span>
                        {material.productionCountry && (
                          <span className="mt-1 block ml-0 pl-0 text-gray-500 text-xs">
                            <span className="inline-block align-middle mr-1 text-base" title="Quốc gia">🌍</span>
                            {material.productionCountry}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 align-top">
                        {(() => {
                          const price = material.pricePerUnit.toLocaleString() || 0;
                          //const priceValue = (price * 1000).toLocaleString();
                          return (
                            <>
                              <span className="text-base font-bold text-gray-900 block">{price}</span>
                              <span className="block text-xs text-gray-500 mt-1">đồng/mét</span>
                            </>
                          );
                        })()}
                      </td>
                      <td className={`py-3 px-4 font-semibold flex items-center gap-1 ${sustainability.color}`}>
                        {sustainability.icon} {sustainability.label}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(material.approvalStatus || 'Unknown')}
                      </td>
                      <td className="py-3 px-4">
                        {getAvailabilityBadge(material.isAvailable ?? false)}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <span className="text-xs text-gray-500">
                            {material.lastUpdated ? formatDate(material.lastUpdated) : 'N/A'}
                          </span>
                          {material.createdAt && (
                            <p className="text-xs text-gray-400 mt-1">
                              Tạo: {formatDate(material.createdAt)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setDetailId(material.materialId); setDetailOpen(true); }}
                            className="p-1 text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
                            title="Xem chi tiết"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* Modal */}
      <MaterialDetailModal open={detailOpen} materialId={detailId} onClose={() => setDetailOpen(false)} />
    </>
  );
};

export default SupplierMaterials; 