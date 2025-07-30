// API Services Index
// Export all services from a single entry point

// ===== Core API utilities =====
export { apiClient, ApiError } from "./baseApi";
export type { BaseApiResponse } from "./baseApi";

// ===== Authentication service =====
export { AuthService } from "./authService";
export type {
  LoginRequest,
  SignupRequest,
  VerifyOTPRequest,
  ResendOTPRequest,
  User,
  AuthResponse,
  SignupResponse,
  OTPResponse,
} from "./authService";

// ===== Designer service =====
export { DesignerService } from "./designerService";
export type {
  DesignerProfile,
  CreateDesignerRequest,
  UpdateDesignerRequest,
  DesignerResponse,
  DesignerListResponse,
} from "./designerService";

// ===== Design service =====
export { DesignService } from "./designService";

// ===== Supplier service =====
export { SupplierService } from "./supplierService";

// ===== Material service =====
export { materialService } from "./materialService";

// ===== Application service =====
export { applicationService } from "./applicationService";

// ===== API objects for backward compatibility =====
import { AuthService } from "./authService";
import { DesignerService } from "./designerService";
import { DesignService } from "./designService";
import { materialService } from "./materialService";
import { SupplierService } from "./supplierService";
import { applicationService } from "./applicationService";
import { apiClient } from "./baseApi";

export const authApi = {
  login: AuthService.login.bind(AuthService),
  register: AuthService.signup.bind(AuthService),
  verifyOTP: AuthService.verifyOTP.bind(AuthService),
  resendOTP: AuthService.resendOTP.bind(AuthService),
  logout: AuthService.logout.bind(AuthService),
  getCurrentUser: AuthService.getCurrentUser.bind(AuthService),
  isAuthenticated: AuthService.isAuthenticated.bind(AuthService),
  getToken: AuthService.getToken.bind(AuthService),
};

export const designerApi = {
  getProfile: DesignerService.getDesignerProfile.bind(DesignerService),
  getById: DesignerService.getDesignerById.bind(DesignerService),
  create: DesignerService.createDesignerProfile.bind(DesignerService),
  update: DesignerService.updateDesignerProfile.bind(DesignerService),
  delete: DesignerService.deleteDesignerProfile.bind(DesignerService),
  getAll: DesignerService.getAllDesigners.bind(DesignerService),
  uploadImage: DesignerService.uploadDesignerImage.bind(DesignerService),
  updateStatus: DesignerService.updateDesignerStatus.bind(DesignerService),
  getStats: DesignerService.getDesignerStats.bind(DesignerService),
};

export const materialApi = {
  getAll: materialService.getAllMaterials.bind(materialService),
  getDetail: materialService.getMaterialDetail.bind(materialService),
  createWithSustainability: materialService.createMaterialWithSustainability.bind(materialService),
  delete: materialService.deleteMaterial.bind(materialService),
  getSustainability: materialService.getMaterialSustainability.bind(materialService),
  getAllMaterialTypes: materialService.getAllMaterialTypes.bind(materialService),
};

// ===== Default export (keep existing compatibility) =====
export default apiClient;
