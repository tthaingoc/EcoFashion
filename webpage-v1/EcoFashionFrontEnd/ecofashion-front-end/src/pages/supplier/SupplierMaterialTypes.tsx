import React from 'react';
import { useQuery } from '@tanstack/react-query';
import materialService from '../../services/api/materialService';
import type { MaterialTypeModel } from '../../schemas/materialSchema';
import MaterialTypeDetailModal from '../../components/admin/MaterialTypeDetailModal';


const SupplierMaterialTypes: React.FC = () => {
    const { data: types = [], isLoading, error } = useQuery<MaterialTypeModel[]>({
        queryKey: ['supplierMaterialTypes', 'All'],
        queryFn: () => materialService.getAllMaterialTypes(),
    });


    const [detailOpen, setDetailOpen] = React.useState(false);
    const [detailType, setDetailType] = React.useState<MaterialTypeModel | null>(null);


    return (
        <>
            <div className="supplier-material-types-page p-6">
                {/* Header */}
                <div className="header-section mb-6">
                    <h1 className="text-2xl font-bold">Tất Cả Loại Vật Liệu</h1>
                    <p className="text-gray-500">Danh sách các loại vật liệu có sẵn trong hệ thống</p>
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm leading-relaxed">
                        <p className="text-blue-800">
                            <span className="font-medium">Thông tin loại vật liệu:</span>
                            <br />- <span className="font-medium">Hữu cơ</span>: Loại vật liệu thuộc nhóm organic (nguồn gốc/quy trình hữu cơ)
                            <br />- <span className="font-medium">Tái chế</span>: Loại vật liệu thuộc nhóm recycled (có thành phần tái chế)
                            <br />- Nhà cung cấp có thể tham khảo để chọn loại phù hợp khi thêm vật liệu mới
                        </p>
                    </div>
                </div>


                {/* Content */}
                <div className="content-section bg-white rounded shadow">
                    {isLoading ? (
                        <div className="text-center py-12 text-gray-500">Đang tải danh sách loại vật liệu...</div>
                    ) : error ? (
                        <div className="text-center py-12 text-red-500">Lỗi tải danh sách loại vật liệu</div>
                    ) : types.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">Chưa có loại vật liệu nào</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
                            {types.map((type) => (
                                <div key={type.typeId} className="border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-3 pb-3">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate">{type.typeName}</h3>
                                                <p className="text-sm text-gray-500 truncate">{type.category || 'Chưa phân loại'}</p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className={`px-2 py-0.5 rounded text-xs whitespace-nowrap ${type.isActive
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {type.isActive ? 'Active' : 'Không hoạt động'}
                                                </span>
                                                <button
                                                    className="p-1 text-gray-500 hover:text-brand-500 transition-colors"
                                                    title="Xem chi tiết"
                                                    onClick={() => { setDetailType(type); setDetailOpen(true); }}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Material Type Image */}
                                        <div className="mb-3">
                                            <img
                                                src={type.imageUrl || 'https://res.cloudinary.com/dguz8gz6s/image/upload/v1754826927/organic-coton_b9zo4y.webp'}
                                                alt={type.typeName}
                                                className="w-full h-40 object-cover rounded-lg"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://res.cloudinary.com/dguz8gz6s/image/upload/v1754826927/organic-coton_b9zo4y.webp';
                                                }}
                                            />
                                        </div>

                                        {/* Description */}
                                        {type.description && (
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-3">{type.description}</p>
                                        )}

                                        {/* Properties */}
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="p-2 bg-gray-50 rounded text-center">
                                                <span className="text-gray-600">Hữu cơ:</span>
                                                <br />
                                                <span className={`font-medium ${type.isOrganic ? 'text-green-600' : 'text-gray-600'}`}>
                                                    {type.isOrganic ? 'Có' : 'Không'}
                                                </span>
                                            </div>
                                            <div className="p-2 bg-gray-50 rounded text-center">
                                                <span className="text-gray-600">Tái chế:</span>
                                                <br />
                                                <span className={`font-medium ${type.isRecycled ? 'text-blue-600' : 'text-gray-600'}`}>
                                                    {type.isRecycled ? 'Có' : 'Không'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Material Type Detail Modal */}
            <MaterialTypeDetailModal
                open={detailOpen}
                materialType={detailType}
                onClose={() => setDetailOpen(false)}
            />
        </>
    );
};


export default SupplierMaterialTypes;

