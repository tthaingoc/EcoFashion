import { useCallback, useEffect, useRef } from 'react';
import { useCartStore } from '../store/cartStore.improved';
import { useAuthStore } from '../store/authStore';

/**
 * Enhanced cart hook with automatic sync and optimizations
 */
export const useCart = () => {
  const store = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSyncRef = useRef<number>(0);

  // Auto-sync when authenticated
  useEffect(() => {
    if (isAuthenticated && !store.lastSyncAt) {
      store.syncFromServer();
    }
  }, [isAuthenticated, store.lastSyncAt, store.syncFromServer]);

  // Debounced sync for rapid operations
  const debouncedSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    
    syncTimeoutRef.current = setTimeout(() => {
      const now = Date.now();
      if (now - lastSyncRef.current > 30000) { // 30s cooldown
        store.syncFromServer();
        lastSyncRef.current = now;
      }
    }, 2000); // 2s debounce
  }, [store.syncFromServer]);

  // Enhanced add to cart with validation
  const addToCart = useCallback(async (materialId: number, quantity: number) => {
    if (!isAuthenticated) {
      throw new Error('Vui lòng đăng nhập để thêm vào giỏ hàng');
    }
    
    if (quantity <= 0) {
      throw new Error('Số lượng phải lớn hơn 0');
    }

    await store.addToCart({ materialId, quantity });
    debouncedSync();
  }, [isAuthenticated, store.addToCart, debouncedSync]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    items: store.items,
    loading: store.loading,
    error: store.error,
    
    // Computed
    totalCount: store.getTotalCount(),
    itemCount: store.getItemCount(),
    subtotal: store.getSubtotal(),
    groupedItems: store.getItemsGroupedBySeller(),
    isEmpty: store.items.length === 0,
    
    // Actions
    addToCart,
    updateQuantity: store.updateQuantity,
    increaseQuantity: store.increaseQuantity,
    decreaseQuantity: store.decreaseQuantity,
    removeFromCart: store.removeFromCart,
    clearCart: store.clearCart,
    syncFromServer: store.syncFromServer,
    clearError: store.clearError,
    
    // Utils
    hasItemsWithPriceChanges: store.items.some(item => item.priceChanged),
    getItemById: (id: string) => store.items.find(item => item.id === id),
  };
};

/**
 * Hook for cart item operations
 */
export const useCartItem = (itemId: string) => {
  const store = useCartStore();
  const item = store.items.find(i => i.id === itemId);
  
  const updateQuantity = useCallback((quantity: number) => {
    return store.updateQuantity(itemId, quantity);
  }, [store.updateQuantity, itemId]);
  
  const increase = useCallback(() => {
    return store.increaseQuantity(itemId);
  }, [store.increaseQuantity, itemId]);
  
  const decrease = useCallback(() => {
    return store.decreaseQuantity(itemId);
  }, [store.decreaseQuantity, itemId]);
  
  const remove = useCallback(() => {
    return store.removeFromCart(itemId);
  }, [store.removeFromCart, itemId]);
  
  return {
    item,
    updateQuantity,
    increase,
    decrease,
    remove,
    loading: store.loading,
  };
};
