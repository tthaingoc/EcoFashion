import { create } from 'zustand';
import { cartService, type ServerCartDto } from '../services/api/cartService';

export interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  unit: string; // Đơn vị: "mét", "cái", "kg", etc.
  type: string; // Loại sản phẩm: "material", "product", "design", etc.
  sellerId: string; // Nhà cung cấp/nhà thiết kế
  sellerName?: string;
}

interface CartState {
  items: CartItem[];
  // Nhóm theo seller để hiển thị/checkout từng đơn
  getItemsGroupedBySeller: () => Record<string, CartItem[]>;
  // Server-first actions
  syncFromServer: () => Promise<void>;
  addToCart: (payload: { materialId: number; quantity: number }) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  resetLocal: () => void; // Xoá UI cart, không gọi server
  getTotalCount: () => number;
  getItemCount: () => number; // Số loại sản phẩm khác nhau
  increaseQuantity: (id: string) => Promise<void>;
  decreaseQuantity: (id: string) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  getItemsGroupedBySeller: () => {
    const groups: Record<string, CartItem[]> = {};
    get().items.forEach((item) => {
      if (!groups[item.sellerId]) groups[item.sellerId] = [];
      groups[item.sellerId].push(item);
    });
    return groups;
  },
  syncFromServer: async () => {
    const cart: ServerCartDto = await cartService.getCart();
    const items: CartItem[] = cart.items.map((i) => ({
      id: String(i.cartItemId),
      name: i.materialName || `Material #${i.materialId}`,
      image: i.imageUrl || '',
      price: i.currentPrice || i.unitPriceSnapshot,
      quantity: i.quantity,
      unit: i.unitLabel || 'mét',
      type: 'material',
      sellerId: i.supplierId,
      sellerName: i.supplierName,
    }));
    set({ items });
  },
  addToCart: async ({ materialId, quantity }) => {
    const cart = await cartService.upsertItem({ materialId, quantity });
    const items: CartItem[] = cart.items.map((i) => ({
      id: String(i.cartItemId),
      name: i.materialName || `Material #${i.materialId}`,
      image: i.imageUrl || '',
      price: i.currentPrice || i.unitPriceSnapshot,
      quantity: i.quantity,
      unit: i.unitLabel || 'mét',
      type: 'material',
      sellerId: i.supplierId,
      sellerName: i.supplierName,
    }));
    set({ items });
  },
  removeFromCart: async (id) => {
    const cartItemId = Number(id);
    const cart = await cartService.removeItem(cartItemId);
    const items: CartItem[] = cart.items.map((i) => ({
      id: String(i.cartItemId),
      name: i.materialName || `Material #${i.materialId}`,
      image: i.imageUrl || '',
      price: i.currentPrice || i.unitPriceSnapshot,
      quantity: i.quantity,
      unit: i.unitLabel || 'mét',
      type: 'material',
      sellerId: i.supplierId,
      sellerName: i.supplierName,
    }));
    set({ items });
  },
  clearCart: async () => {
    const cart = await cartService.clear();
    const items: CartItem[] = cart.items.map((i) => ({
      id: String(i.cartItemId),
      name: i.materialName || `Material #${i.materialId}`,
      image: i.imageUrl || '',
      price: i.currentPrice || i.unitPriceSnapshot,
      quantity: i.quantity,
      unit: i.unitLabel || 'mét',
      type: 'material',
      sellerId: i.supplierId,
      sellerName: i.supplierName,
    }));
    set({ items });
  },
  resetLocal: () => set({ items: [] }),
  getTotalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  getItemCount: () => get().items.length, // Số loại sản phẩm khác nhau
  increaseQuantity: async (id) => {
    const item = get().items.find((i) => i.id === id);
    if (!item) return;
    const cart = await cartService.updateQuantity(Number(id), item.quantity + 1);
    const items: CartItem[] = cart.items.map((i) => ({
      id: String(i.cartItemId),
      name: i.materialName || `Material #${i.materialId}`,
      image: i.imageUrl || '',
      price: i.currentPrice || i.unitPriceSnapshot,
      quantity: i.quantity,
      unit: i.unitLabel || 'mét',
      type: 'material',
      sellerId: i.supplierId,
      sellerName: i.supplierName,
    }));
    set({ items });
  },
  decreaseQuantity: async (id) => {
    const item = get().items.find((i) => i.id === id);
    if (!item) return;
    if (item.quantity > 1) {
      const cart = await cartService.updateQuantity(Number(id), item.quantity - 1);
      const items: CartItem[] = cart.items.map((i) => ({
        id: String(i.cartItemId),
        name: i.materialName || `Material #${i.materialId}`,
        image: i.imageUrl || '',
        price: i.currentPrice || i.unitPriceSnapshot,
        quantity: i.quantity,
        unit: i.unitLabel || 'mét',
        type: 'material',
        sellerId: i.supplierId,
        sellerName: i.supplierName,
      }));
      set({ items });
    } else if (item.quantity === 1) {
      await get().removeFromCart(id);
    }
  },
}));
