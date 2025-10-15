import React from 'react';
import { useQuery } from '@tanstack/react-query';
import materialService from '../../services/api/materialService';
import type { MaterialDetailResponse } from '../../schemas/materialSchema';

type Props = {
  open: boolean;
  materialId: number | null;
  onClose: () => void;
};

const Badge: React.FC<{ label: string; colorClass: string }> = ({ label, colorClass }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>{label}</span>
);

// Helper để mapping màu và icon cho status
const getStatusColorBenchmark = (status: string) => {
  switch (status) {
    case 'Excellent': return 'text-green-600';
    case 'Good': return 'text-yellow-600';
    case 'Average': return 'text-orange-500';
    case 'Needs Improvement': return 'text-red-600';
    case 'Certified': return 'text-green-600';
    case 'Not Certified': return 'text-red-600';
    default: return 'text-gray-600';
  }
};
const statusIcon = (status: string) => {
  switch (status) {
    case 'Excellent': return '✅';
    case 'Good': return '👍';
    case 'Average': return '⚠️';
    case 'Needs Improvement': return '❌';
    case 'Certified': return '🏅';
    case 'Not Certified': return '🚫';
    default: return '';
  }
};

// Thêm helper cho icon tròn
const CircleIcon = ({ color }: { color: string }) => (
  <span
    style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', background: color, marginRight: 4 }}
    aria-label={color === 'green' ? 'Có' : 'Không'}
  />
);

// Thêm helper cho icon tiêu chí
const criterionIcon = (name: string) => {
  switch (name) {
    case 'Carbon Footprint':
      return <span title="Carbon Footprint" className="inline-block mr-1 align-middle">🌱</span>;
    case 'Water Usage':
      return <span title="Water Usage" className="inline-block mr-1 align-middle">💧</span>;
    case 'Waste Diverted':
      return <span title="Waste Diverted" className="inline-block mr-1 align-middle">♻️</span>;
    case 'Organic Certification':
      return <span title="Organic Certification" className="inline-block mr-1 align-middle">🏅</span>;
    case 'Transport':
      return <span title="Transport" className="inline-block mr-1 align-middle">🚚</span>;
    default:
      return null;
  }
};

// Helper cho badge đánh giá sinh động
const levelBadge = (level?: string) => {
  if (!level) return null;
  switch (level) {
    case 'Xuất sắc':
      return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold"><span>🌟</span>Xuất sắc</span>;
    case 'Tốt':
      return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold"><span>👍</span>Tốt</span>;
    case 'Trung bình':
      return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold"><span>⚠️</span>Trung bình</span>;
    default:
      return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold"><span>❌</span>Cần cải thiện</span>;
  }
};

const MaterialDetailModal: React.FC<Props> = ({ open, materialId, onClose }) => {
  const { data, isLoading, error } = useQuery<MaterialDetailResponse>({
    queryKey: ['materialDetail', materialId],
    enabled: open && !!materialId,
    queryFn: () => materialService.getMaterialDetail(materialId as number),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
    refetchOnWindowFocus: false,
  });

  if (!open) return null;

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-96 p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Đang tải thông tin vật liệu...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-96 p-6">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Lỗi tải dữ liệu</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Không thể tải thông tin vật liệu</p>
            <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  const status = data?.approvalStatus || 'N/A';
  const statusColor = status === 'Approved' ? 'bg-green-100 text-green-700' : status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-7xl mx-4 max-h-[90vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b pb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Thông Tin Vật Liệu</h3>
            {data && (
              <p className="text-sm text-gray-500 dark:text-gray-400">#{data.materialId} • {data.materialTypeName}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label="Đóng">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Top section (Material Info) */}
        <div className="material-info-section flex flex-col md:flex-row gap-4">
          <div className="md:w-1/3">
            {data?.imageUrls && data.imageUrls.length > 0 ? (
              <img src={data.imageUrls[0]} alt={data.name || ''} className="w-full h-48 object-cover rounded-lg border" />
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">No Image</div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{data?.name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">{data?.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Nhà cung cấp:</span> <span className="ml-2 text-gray-900 dark:text-white">{data?.supplier?.supplierName || data?.supplier?.supplierId || '—'}</span></div>
              <div><span className="text-gray-500">Giá:</span> <span className="ml-2 text-gray-900 dark:text-white">{data?.pricePerUnit ? data.pricePerUnit.toLocaleString() : '—'}đ/m</span></div>

              <div><span className="text-gray-500">Quốc gia:</span> <span className="ml-2 text-gray-900 dark:text-white">{data?.productionCountry || '—'}</span></div>
              <div><span className="text-gray-500">Nơi sản xuất:</span> <span className="ml-2 text-gray-900 dark:text-white">{data?.productionRegion || '—'}</span></div>

              <div><span className="text-gray-500">Loại vật liệu vải:</span> <span className="ml-2 text-gray-900 dark:text-white">{data?.materialTypeName || '—'}</span></div>
              <div><span className="text-gray-500">Quy trình sản xuất:</span> <span className="ml-2 text-gray-900 dark:text-white">{data?.manufacturingProcess || '—'}</span></div>
              <div><span className="text-gray-500">Chứng chỉ bền vững:</span> <span className="ml-2 text-gray-900 dark:text-white">{data?.certificationDetails || '—'}</span></div>
              <div><span className="text-gray-500">Link dẫn chứng:</span> <span className="ml-2 text-gray-900 dark:text-white">{data?.documentationUrl || '—'}</span></div>
            </div>
            {data?.productionCountry && (
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                <span className="inline-block align-middle text-base">🌍</span>
                <span>{data.productionCountry}</span>
              </div>
            )}
            {/* Khoảng cách dự tính và phương thức vận chuyển dưới quốc gia */}
            {(data?.transportDistance || data?.transportMethod) && (
              <div className="flex flex-col gap-1 ml-6 text-xs text-gray-500">
                {data.transportDistance && (
                  <div>Khoảng cách dự tính: <span className="font-semibold text-gray-800 dark:text-white">{data.transportDistance} km</span></div>
                )}
                {data.transportMethod && (
                  <div>Phương thức vận chuyển: <span className="font-semibold text-gray-800 dark:text-white">{data.transportMethod}</span></div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Table Section */}
        <div className="mb-6">
          {data?.criterionDetails && data.criterionDetails.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">So sánh với chuẩn & mức cải thiện</h4>
                <div className="flex items-center justify-end gap-2 mt-2">
                  <span className="text-base font-semibold">Tổng điểm:</span>
                  {typeof data.sustainabilityScore === 'number' && (
                    <span className={`text-lg font-bold flex items-center gap-1 ${data.sustainabilityScore >= 80 ? 'text-green-600' :
                        data.sustainabilityScore >= 60 ? 'text-yellow-600' :
                          data.sustainabilityScore >= 40 ? 'text-orange-500' :
                            'text-red-600'
                      }`}>
                      {data.sustainabilityScore >= 80 ? '🌟' :
                        data.sustainabilityScore >= 60 ? '👍' :
                          data.sustainabilityScore >= 40 ? '⚠️' :
                            '❌'}
                      {data.sustainabilityScore}%
                    </span>
                  )}
                  {levelBadge(data.sustainabilityLevel)}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left p-2 md:p-3">Tiêu chí</th>
                      <th className="text-left p-2 md:p-3">Thực tế</th>
                      <th className="text-left p-2 md:p-3">Chuẩn</th>
                      <th className="text-left p-2 md:p-3">Đơn vị</th>
                      <th className="text-left p-2 md:p-3">Cải thiện</th>
                      <th className="text-left p-2 md:p-3">Điểm</th>
                      <th className="text-left p-2 md:p-3">Đánh giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.criterionDetails.map((c, idx) => {
                      let improvement = '';
                      if (["Carbon Footprint", "Water Usage"].includes(c.criterionName) && c.benchmarkValue > 0) {
                        improvement = ((c.benchmarkValue - c.actualValue) / c.benchmarkValue * 100).toFixed(1) + '%';
                      } else if (c.criterionName === "Waste Diverted" && c.benchmarkValue > 0) {
                        improvement = ((c.actualValue - c.benchmarkValue) / c.benchmarkValue * 100).toFixed(1) + '%';
                      } else if (c.criterionName === 'Organic Certification') {
                        improvement = c.actualValue === 100 ? 'Đã đạt' : 'Cần chứng chỉ';
                      } else {
                        improvement = c.criterionName === 'Transport' ? 'Không áp dụng' : '—';
                      }
                      return (
                        <tr key={idx} className="border-t border-gray-100 dark:border-gray-800">
                          <td className="p-2 md:p-3 font-bold">
                            <div className="flex items-center gap-2">
                              {criterionIcon(c.criterionName)}
                              <span className="whitespace-nowrap">{c.criterionName}</span>
                            </div>
                          </td>
                          <td className="p-2 md:p-3">
                            {c.criterionName === 'Organic Certification'
                              ? <div className="flex items-center gap-2">
                                <span>{c.actualValue === 100 ? '100' : '0'}</span>
                                {c.actualValue === 100
                                  ? <CircleIcon color="green" />
                                  : <CircleIcon color="red" />}
                              </div>
                              : <>{c.actualValue ?? '—'}</>}
                          </td>
                          <td className="p-2 md:p-3">
                            {c.criterionName === 'Organic Certification'
                              ? <div className="flex items-center gap-2">
                                <span>{c.benchmarkValue ?? '100'}</span>
                                <CircleIcon color="green" />
                              </div>
                              : <>{c.benchmarkValue ?? '—'}</>}
                          </td>
                          <td className="p-2 md:p-3">{c.unit || '—'}</td>
                          <td className={`p-2 md:p-3 ${(() => {
                            if (improvement === 'Không áp dụng' || improvement === '—') return 'text-gray-400';
                            if (improvement === 'Đã đạt') return 'text-green-600 font-semibold';
                            if (improvement === 'Cần chứng chỉ') return 'text-red-600 font-semibold';
                            const num = parseFloat(improvement);
                            if (!isNaN(num)) {
                              if (num > 0) return 'text-green-600 font-semibold';
                              if (num < 0) return 'text-red-600 font-semibold';
                              return 'text-gray-500 font-semibold';
                            }
                            return '';
                          })()}`}>
                            {improvement}
                          </td>
                          <td className={`p-2 md:p-3 ${(() => {
                            if (c.score === undefined || c.score === null) return 'text-gray-400';
                            const score = typeof c.score === 'string' ? parseFloat(c.score) : c.score;
                            if (!isNaN(score)) {
                              if (score >= 80) return 'text-green-600 font-semibold';
                              if (score >= 60) return 'text-yellow-600 font-semibold';
                              if (score >= 40) return 'text-orange-500 font-semibold';
                              return 'text-red-600 font-semibold';
                            }
                            return '';
                          })()}`}>
                            {c.score !== undefined && c.score !== null
                              ? (typeof c.score === 'string' ? parseFloat(c.score).toFixed(2) : c.score.toFixed(2))
                              : '—'}
                          </td>
                          <td className={`p-2 md:p-3 font-semibold ${getStatusColorBenchmark(c.status)}`}>
                            <div className="flex items-center gap-1 whitespace-nowrap">
                              {statusIcon(c.status)} {c.status}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Admin Note Section */}
        {typeof data?.adminNote !== 'undefined' && (
          <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500">Ghi chú của quản trị viên</p>
            <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{data.adminNote || '—'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialDetailModal;


