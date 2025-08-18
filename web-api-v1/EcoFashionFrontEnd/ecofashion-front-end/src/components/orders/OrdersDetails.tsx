import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersService } from '../../services/api/ordersService';
import { formatViDateTime } from '../../utils/date';
import { paymentsService } from '../../services/api/paymentsService';

export default function OrdersDetails() {
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const handlePayAgain = async () => {
    setPayLoading(true);
    setPayError(null);
    try {
      // Nếu là vật liệu thì x1000 khi gửi payment
      const isMaterial = details[0]?.type === 'material';
      const amount = isMaterial ? total : total; // total đã x1000 ở trên
      const { redirectUrl } = await paymentsService.createVnpay({
        orderId: data.orderId,
        amount,
        createdDate: new Date().toISOString(),
        fullName: data.customerName || 'Khach hang',
        description: `Thanh toan lai don hang: ${data.orderId}`,
      });
      if (redirectUrl) window.location.href = redirectUrl;
      else throw new Error('Không tạo được link thanh toán');
    } catch (e: any) {
      setPayError(e?.message || 'Không tạo được link thanh toán');
    } finally {
      setPayLoading(false);
    }
  };
  const { orderId } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (!orderId) return;
        const res = await ordersService.getById(Number(orderId));
        setData((res as any)?.result || res);
        const lines = await ordersService.getDetailsByOrderId(Number(orderId));
        setDetails(lines);
      } catch (e: any) {
        setError(e?.message || 'Không tải được chi tiết đơn');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  if (loading) return <div className="max-w-[1120px] mx-auto p-6">Đang tải chi tiết đơn...</div>;
  if (error) return <div className="max-w-[1120px] mx-auto p-6 text-red-600">{error}</div>;
  if (!data) return null;
  // Nếu có vật liệu thì x1000 cho các giá trị liên quan
  const isMaterial = details[0]?.type === 'material';
  const subtotal = details.reduce((s, d) => s + (d.type === 'material' ? Number(d.unitPrice || 0) * 1000 : Number(d.unitPrice || 0)) * Number(d.quantity || 0), 0);
  const shipping = isMaterial ? Number((data as any).shippingFee ?? 0) * 1000 : Number((data as any).shippingFee ?? 0);
  const discount = isMaterial ? Number((data as any).discount ?? 0) * 1000 : Number((data as any).discount ?? 0);
  const total = isMaterial ? Number((data as any).totalPrice ?? (subtotal + shipping - discount)) * 1000 : Number((data as any).totalPrice ?? (subtotal + shipping - discount));

  return (
    <div className="max-w-[1120px] mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Đơn #{data.orderId}</h1>
        <Link to="/orders" className="text-green-700 hover:underline">Danh sách đơn</Link>
      </div>
      <div className="bg-white border rounded-md p-4 grid md:grid-cols-3 gap-4">
        <div>
          <div className="text-sm text-gray-500">Trạng thái</div>
          <div className="font-medium">{String(data.status)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Thanh toán</div>
          <div className="font-medium">{String(data.paymentStatus || 'Pending')}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Tổng tiền</div>
          <div className="font-semibold text-green-700">{isMaterial ? (Number(data.totalPrice || 0) * 1000).toLocaleString('vi-VN') : Number(data.totalPrice || 0).toLocaleString('vi-VN')} ₫</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Trạng thái vận chuyển</div>
          <div className="font-medium">{data.fulfillmentStatus ? String(data.fulfillmentStatus) : 'Chưa cập nhật'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Ngày đặt</div>
          <div className="font-medium">{(data as any).orderDate ? formatViDateTime((data as any).orderDate) : '-'}</div>
        </div>
      </div>

      <div className="bg-white border rounded-md">
        <div className="px-4 py-3 border-b font-medium">Sản phẩm</div>
        <div className="divide-y">
          {details.map((d) => (
            <div key={d.orderDetailId} className="px-4 py-3 grid grid-cols-12 items-center gap-3">
              <div className="col-span-2">
                {d.imageUrl ? (
                  <img src={d.imageUrl} alt={d.itemName} className="w-16 h-16 object-cover rounded" />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded" />
                )}
              </div>
              <div className="col-span-4">
                <div className="font-medium">{d.itemName}</div>
                <div className="text-sm text-gray-500">{d.type} • NCC/NTK: {d.providerName}</div>
              </div>
              <div className="col-span-2 text-gray-700">{(d.type === 'material' ? Number(d.unitPrice || 0) * 1000 : Number(d.unitPrice || 0)).toLocaleString('vi-VN')} ₫</div>
              <div className="col-span-2 text-gray-700">x {d.quantity}</div>
              <div className="col-span-2 font-semibold text-green-700">{(d.type === 'material' ? Number(d.unitPrice || 0) * 1000 * Number(d.quantity || 0) : Number(d.unitPrice || 0) * Number(d.quantity || 0)).toLocaleString('vi-VN')} ₫</div>
            </div>
          ))}
          {details.length === 0 && (
            <div className="p-4 text-gray-500">Chưa có dòng hàng</div>
          )}
        </div>
      </div>

      <div className="bg-white border rounded-md p-4 grid md:grid-cols-2 gap-4">
        <div className="text-sm text-gray-600">Tổng số dòng: <b>{details.length}</b></div>
        <div className="space-y-2 text-right">
          <div>Tạm tính: <b>{subtotal.toLocaleString('vi-VN')} ₫</b></div>
          <div>Phí vận chuyển: <b>{shipping.toLocaleString('vi-VN')} ₫</b></div>
          <div>Giảm giá: <b>-{discount.toLocaleString('vi-VN')} ₫</b></div>
          <div className="text-lg font-semibold text-green-700">Tổng cộng: {total.toLocaleString('vi-VN')} ₫</div>
          {(String(data.paymentStatus).toLowerCase() !== 'paid' && String(data.paymentStatus).toLowerCase() !== 'success') && (
            <button
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 disabled:opacity-60"
              onClick={handlePayAgain}
              disabled={payLoading}
            >
              {payLoading ? 'Đang xử lý...' : 'Thanh toán tiếp'}
            </button>
          )}
          {payError && <div className="text-red-600 mt-2">{payError}</div>}
        </div>
      </div>
    </div>
  );
}


