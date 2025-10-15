import apiClient, { handleApiResponse } from './baseApi';

export interface AdminUserItem {
  userId: number;
  fullName: string;
  email: string;
  phone?: string | null;
  username?: string | null;
  role: string;
  roleId: number;
  status: string;
  createdAt: string;
}

class AdminUserService {
  private readonly BASE = '/User';

  async getAllUsers(): Promise<AdminUserItem[]> {
    const response = await apiClient.get<any>(`${this.BASE}/all`);
    const data = handleApiResponse<any>(response);
    const list: AdminUserItem[] = (Array.isArray(data) ? data : data.result || data.data || []) as AdminUserItem[];
    return list;
  }
}

export default new AdminUserService();


