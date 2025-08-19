import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCheckoutWizard } from '../../store/checkoutWizardStore';
import { ordersService } from '../../services/api/ordersService';

const CheckoutResultTailwind: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const wizard = useCheckoutWizard();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'success' | 'failed' | 'pending' | null>(null);

  useEffect(() => {
    const confirm = async () => {
      const orderIdFromQuery = Number(searchParams.get('orderId'));
      if (orderIdFromQuery && !Number.isNaN(orderIdFromQuery)) {
        wizard.goToOrder(orderIdFromQuery);
      }
      const current = wizard.orders[wizard.currentIndex];
      if (!current) {
        navigate('/orders');
        return;
      }
      try {
        setLoading(true);
        const resp = await ordersService.getById(current.orderId);
        const s = (resp as any)?.result?.paymentStatus || (resp as any)?.paymentStatus || (resp as any)?.status;
        const normalized = String(s || '').toLowerCase();
        if (normalized === 'paid' || normalized === 'processing') {
          wizard.markStatus(current.orderId, 'Paid');
          setStatus('success');
        } else if (normalized === 'failed') {
          wizard.markStatus(current.orderId, 'Failed');
          setStatus('failed');
        } else {
          wizard.markStatus(current.orderId, 'Pending');
          setStatus('pending');
        }
      } catch (e: any) {
        setError(e?.message || 'Không xác nhận được trạng thái đơn');
      } finally {
        setLoading(false);
        setTimeout(() => {
          wizard.next();
          const hasNext = wizard.currentIndex < wizard.orders.length - 1;
          navigate(hasNext ? '/checkout' : '/orders');
        }, 3000);
      }
    };
    confirm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = wizard.orders[wizard.currentIndex];
  const completed = wizard.orders.filter(o => wizard.statusByOrderId[o.orderId] === 'Paid').length;
  const hasNext = wizard.currentIndex < wizard.orders.length - 1;

  const renderIcon = () => {
    if (loading) return (
      <div className="flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full" />
      </div>
    );
    if (error) return <span className="text-red-600 text-5xl">!</span>;
    if (status === 'success') return <span className="text-green-600 text-5xl">✓</span>;
    if (status === 'failed') return <span className="text-red-600 text-5xl">✕</span>;
    return <span className="text-yellow-500 text-5xl">…</span>;
  };

  const title = loading
    ? 'Đang xác nhận thanh toán...'
    : error
    ? 'Có lỗi xảy ra'
    : status === 'success'
    ? 'Thanh toán thành công!'
    : status === 'failed'
    ? 'Thanh toán thất bại'
    : 'Đang xử lý thanh toán';

  const message = loading
    ? 'Vui lòng đợi trong giây lát'
    : error || (current ? `Đơn hàng #${current.orderId}` : '');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow p-8 text-center border border-gray-100">
          <div className="mb-4 flex justify-center">{renderIcon()}</div>
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          <p className="text-gray-600 mb-6">{message}</p>

          {!loading && current && (
            <div className={`rounded-lg p-4 mb-6 ${status === 'success' ? 'bg-green-50 border border-green-200' : status === 'failed' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <p className="text-sm">
                <span className="font-medium">Mã đơn hàng:</span> #{current.orderId}
              </p>
            </div>
          )}

          {!loading && (
            <div className="space-y-1 text-sm text-gray-600">
              <div>Đã hoàn thành {completed}/{wizard.orders.length} đơn hàng</div>
              <div className="font-medium text-blue-600">{hasNext ? 'Đang chuyển đến đơn hàng tiếp theo...' : 'Đang chuyển đến trang đơn hàng...'}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutResultTailwind;


