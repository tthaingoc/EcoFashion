import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ordersService, type OrderModel } from '../../services/api/ordersService';
import { formatViDateTime } from '../../utils/date';

const formatVND = (n: number) => n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
// Helper: No more x1000 multiplier since backend has correct VND prices
const formatMaterialVND = (n: number, type?: string) => formatVND(n);

const getFulfillmentStatusColor = (status?: string, paymentStatus?: string) => {
  // Auto-fix: nếu đã paid nhưng fulfillment = none, hiển thị màu xanh
  if (paymentStatus?.toLowerCase() === 'paid' && (!status || status.toLowerCase() === 'none')) {
    return 'bg-green-100 text-green-700';
  }
  
  switch (status?.toLowerCase()) {
    case 'delivered': return 'bg-green-100 text-green-700';
    case 'shipped': return 'bg-blue-100 text-blue-700';
    case 'processing': return 'bg-yellow-100 text-yellow-700';
    case 'canceled': return 'bg-red-100 text-red-700';
    case 'none':
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getFulfillmentStatusLabel = (status?: string, paymentStatus?: string) => {
  // If paid but no fulfillment status set, show as processing
  if (paymentStatus?.toLowerCase() === 'paid' && (!status || status.toLowerCase() === 'none')) {
    return '📦 Đang xử lý';
  }
  
  switch (status?.toLowerCase()) {
    case 'delivered': return '✅ Đã giao hàng';
    case 'shipped': return '🚚 Đang vận chuyển';
    case 'processing': return '📦 Đang xử lý';
    case 'canceled': return '❌ Đã hủy';
    case 'none':
    default: return '⏳ Chưa xử lý';
  }
};

export default function OrdersList() {
  const [orders, setOrders] = useState<OrderModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await ordersService.getAll();
        setOrders(data);
      } catch (e: any) {
        setError(e?.message || 'Không tải được danh sách đơn');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-6">Đang tải đơn hàng...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  // Lọc theo status
  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(o => o.status && o.status.toLowerCase() === statusFilter);

  // Các trạng thái có thể chọn
  const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'shipped', label: 'Đang vận chuyển' },
    { value: 'delivered', label: 'Đã giao hàng' },
    { value: 'returned', label: 'Đã trả hàng' },
  ];

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const data = await ordersService.getAll();
      setOrders(data);
    } catch (e: any) {
      setError(e?.message || 'Không tải được danh sách đơn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border rounded-md">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="text-sm text-gray-600 font-semibold">Danh sách đơn hàng ({filteredOrders.length})</div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-3 py-1 text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 disabled:opacity-50"
          >
            {loading ? '🔄' : '↻'} Làm mới
          </button>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-12 px-4 py-3 border-b text-sm text-gray-600">
        <div className="col-span-2">Mã đơn</div>
        <div className="col-span-2">Ngày đặt</div>
        <div className="col-span-2">Người bán</div>
        <div className="col-span-2">Tổng tiền</div>
        <div className="col-span-2">Thanh toán</div>
        <div className="col-span-2">Vận chuyển</div>
      </div>
      {filteredOrders.map((o) => (
        <button
          key={o.orderId}
          className="grid grid-cols-12 px-4 py-3 border-b items-center w-full text-left hover:bg-gray-50"
          onClick={() => navigate(`/orders/${o.orderId}`)}
        >
          <div className="col-span-2 font-medium">#{o.orderId}</div>
          <div className="col-span-2 text-sm text-gray-700">{o.orderDate ? formatViDateTime(o.orderDate) : '-'}</div>
          <div className="col-span-2 text-sm text-gray-700 flex items-center gap-2">
            {o.sellerAvatarUrl ? (
              <img src={o.sellerAvatarUrl} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200" />
            )}
            <span>{o.sellerName || '—'}</span>
          </div>
          <div className="col-span-2 font-semibold text-green-700">{formatMaterialVND(Number(o.totalPrice || 0), o.sellerType === 'Supplier' ? 'material' : undefined)}</div>
          <div className="col-span-2">
            <span className={`px-2 py-1 rounded text-xs ${String(o.paymentStatus || '').toLowerCase()==='paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              {o.paymentStatus || 'Pending'}
            </span>
          </div>
          <div className="col-span-2">
            <span className={`px-2 py-1 rounded text-xs ${getFulfillmentStatusColor(o.fulfillmentStatus, o.paymentStatus)}`}>
              {getFulfillmentStatusLabel(o.fulfillmentStatus, o.paymentStatus)}
            </span>
          </div>
        </button>
      ))}
      {filteredOrders.length === 0 && <div className="p-6 text-center text-gray-500">Không có đơn hàng phù hợp</div>}
    </div>
  );
}


