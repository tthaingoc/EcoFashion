import "./SupplierLandingPage.css";
import { useState, useEffect } from "react";
// Utility function to fallback image URL safely
function safeImageUrl(
  url?: string,
  fallback: string = "/assets/default-image.jpg"
): string {
  return typeof url === "string" && url.trim() ? url : fallback;
}
import { useParams, useNavigate } from "react-router-dom";
import {
  SupplierService,
  type SupplierPublic,
} from "../../services/api/supplierService";
import { materialService } from "../../services/api/materialService";
import type { MaterialDetailDto } from "../../schemas/materialSchema";
import { toast } from "react-toastify";

export default function SupplierLandingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supplierData, setSupplierData] = useState<SupplierPublic | null>(null);
  const [materials, setMaterials] = useState<MaterialDetailDto[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);

  useEffect(() => {
    const loadSupplierData = async () => {
      if (!id) {
        setError("Invalid supplier ID");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await SupplierService.getSupplierPublicProfile(id);
        setSupplierData(data);
      } catch (error: any) {
        const errorMessage =
          error.message || "Không thể tải thông tin nhà cung cấp";
        setError(errorMessage);
        toast.error(errorMessage, { position: "bottom-center" });
      } finally {
        setLoading(false);
      }
    };
    loadSupplierData();
  }, [id]);

  useEffect(() => {
    const loadMaterials = async () => {
      if (!id) return;
      try {
        setLoadingMaterials(true);
        const data = await materialService.getAllMaterialsWithFilters({
          supplierId: id,
          publicOnly: true,
        });
        setMaterials(data);
      } catch (error: any) {
        console.error("Failed to load materials:", error);
      } finally {
        setLoadingMaterials(false);
      }
    };
    loadMaterials();
  }, [id]);

  if (loading) {
    return (
      <div className="supplier-container">
        <div className="supplier-loading">
          Đang tải thông tin nhà cung cấp...
        </div>
      </div>
    );
  }
  if (error || !supplierData) {
    return (
      <div className="supplier-container">
        <button
          className="supplier-back-btn"
          onClick={() => navigate("/explore/suppliers")}
        >
          ← Quay lại danh sách
        </button>
        <div className="supplier-error">
          {error || "Không tìm thấy thông tin nhà cung cấp"}
        </div>
        <button
          className="supplier-back-btn"
          onClick={() => navigate("/explore/suppliers")}
        >
          ← Quay lại danh sách
        </button>
      </div>
    );
  }
  return (
    <div className="supplier-container">
      <button
        className="supplier-back-btn"
        onClick={() => navigate("/explore/suppliers")}
      >
        ← Quay lại danh sách
      </button>
      <div
        className="supplier-banner"
        style={{
          backgroundImage: `url(${safeImageUrl(
            supplierData.bannerUrl,
            "/assets/default-banner.jpg"
          )})`,
        }}
      >
        <div className="supplier-banner-overlay" />
        <div className="supplier-banner-content">
          <img
            className="supplier-avatar"
            src={safeImageUrl(
              supplierData.avatarUrl,
              "/assets/default-avatar.png"
            )}
            alt="avatar"
            onError={(e) => {
              if (
                e.currentTarget.src !==
                window.location.origin + "/assets/default-avatar.png"
              ) {
                e.currentTarget.src = "/assets/default-avatar.png";
              }
            }}
          />
          <div className="supplier-banner-info">
            <h2>
              {supplierData.supplierName ||
                supplierData.userFullName ||
                "Nhà cung cấp"}
            </h2>
            <div className="supplier-banner-tags">
              <span className="supplier-chip">🏢 Nhà Cung Cấp</span>
              <span className="supplier-chip-outline">
                Thành viên từ {new Date(supplierData.createdAt).getFullYear()}
              </span>
              <span className="supplier-rating">
                ⭐ {supplierData.rating?.toFixed(1) || "0"} (
                {supplierData.reviewCount || 0} đánh giá)
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="supplier-content-section">
        <div className="supplier-main-info">
          <div className="supplier-card">
            <h3 className="supplier-section-title">🏢 Giới thiệu</h3>
            <div className="supplier-bio">
              {supplierData.bio ||
                "Nhà cung cấp chuyên nghiệp với nhiều năm kinh nghiệm trong lĩnh vực cung cấp nguyên liệu và dịch vụ chất lượng cao, cam kết mang đến những sản phẩm tốt nhất cho khách hàng."}
            </div>
            <div className="supplier-tags">
              <span className="supplier-tag">🌱 Nguyên liệu bền vững</span>
              <span className="supplier-tag">🏢 Uy tín cao</span>
              <span className="supplier-tag">✔️ Chất lượng đảm bảo</span>
            </div>
          </div>
          {supplierData.portfolioUrl && (
            <div className="supplier-card">
              <h3 className="supplier-section-title">🌐 Portfolio</h3>
              <a
                className="supplier-portfolio-btn"
                href={supplierData.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Xem Portfolio
              </a>
            </div>
          )}
          {supplierData.certificates && (
            <div className="supplier-card">
              <h3 className="supplier-section-title">
                🎖️ Chứng chỉ & Giải thưởng
              </h3>
              <div className="supplier-certificates">
                {supplierData.certificates}
              </div>
            </div>
          )}
        </div>
        <div className="supplier-side-info">
          <div className="supplier-card">
            <h3 className="supplier-section-title">📞 Thông tin liên hệ</h3>
            <div className="supplier-contact-list">
              {supplierData.email && (
                <div className="supplier-contact-item">
                  <span className="supplier-contact-label">Email:</span>
                  <span>{supplierData.email}</span>
                </div>
              )}
              {supplierData.phoneNumber && (
                <div className="supplier-contact-item">
                  <span className="supplier-contact-label">Số điện thoại:</span>
                  <span>{supplierData.phoneNumber}</span>
                </div>
              )}
              {supplierData.address && (
                <div className="supplier-contact-item">
                  <span className="supplier-contact-label">Địa chỉ:</span>
                  <span>{supplierData.address}</span>
                </div>
              )}
            </div>
          </div>
          <div className="supplier-card">
            <h3 className="supplier-section-title">📊 Thống kê</h3>
            <div className="supplier-stats-list">
              <div className="supplier-stats-item">
                <span>Đánh giá trung bình:</span>
                <span className="supplier-rating">
                  {supplierData.rating?.toFixed(1) || "0"}/5
                </span>
              </div>
              <div className="supplier-stats-item">
                <span>Tổng đánh giá:</span>
                <span className="supplier-rating">
                  {supplierData.reviewCount || 0}
                </span>
              </div>
              <div className="supplier-stats-item">
                <span>Thành viên từ:</span>
                <span>{new Date(supplierData.createdAt).getFullYear()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Materials Section */}
      <div className="supplier-content-section">
        <div className="supplier-card" style={{ gridColumn: "1 / -1" }}>
          <h3 className="supplier-section-title">
            📦 Vật Liệu Của Nhà Cung Cấp
          </h3>
          {loadingMaterials ? (
            <div className="text-center py-8 text-gray-500">
              Đang tải vật liệu...
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nhà cung cấp chưa có vật liệu nào
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {materials.map((material) => (
                <div
                  key={material.materialId}
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/material/${material.materialId}`)}
                >
                  {material.imageUrls && (
                    <img
                      src={material.imageUrls[1]}
                      alt={material.name}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                      onError={(e) => {
                        e.currentTarget.src = "/assets/default-image.jpg";
                      }}
                    />
                  )}
                  <h4 className="font-semibold text-lg mb-2">
                    {material.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Loại : {material.materialTypeName}
                  </p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-brand-600 font-semibold">
                      {material.pricePerUnit?.toLocaleString("vi-VN")} VNĐ/mét
                    </span>
                    <span className="text-sm text-gray-500">
                      Còn {material.quantityAvailable} mét vải
                    </span>
                  </div>
                  {material.sustainabilityScore !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        Điểm bền vững:
                      </span>
                      <span
                        className={`font-semibold ${
                          material.sustainabilityScore >= 70
                            ? "text-green-600"
                            : material.sustainabilityScore >= 50
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {material.sustainabilityScore.toFixed(1)}/100
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
