import { useState, useEffect, useCallback, useMemo } from 'react';
import { materialService } from '../services/api/materialService';
import { MaterialDetailDto } from '../schemas/materialSchema';

interface UseMaterialState {
  materials: MaterialDetailDto[];
  loading: boolean;
  error: string | null;
}

interface UseMaterialFilters {
  typeId?: number;
  type?: string; // For backward compatibility
  availability?: 'in-stock' | 'limited' | 'out-of-stock';
  sustainableOnly?: boolean;
  minRecycledPercentage?: number;
  supplierId?: string;
  supplierName?: string;
  materialName?: string;
  productionCountry?: string;
  minPrice?: number;
  maxPrice?: number;
  minQuantity?: number;
  hasCertification?: boolean;
  transportMethod?: string;
}

export const useMaterial = (initialFilters: UseMaterialFilters = {}) => {
  console.log('useMaterial hook initialized');
  
  const [state, setState] = useState<UseMaterialState>({
    materials: [],
    loading: false,
    error: null,
  });

  const [filters, setFilters] = useState<UseMaterialFilters>(initialFilters);

  // Apply filters to materials
  const filteredMaterials = useMemo(() => {
    let result = state.materials;

    // Filter by material type
    if (filters.type) {
      result = result.filter((material) => 
        material.materialTypeName?.toLowerCase().includes(filters.type!.toLowerCase())
      );
    }

    // Filter by availability
    if (filters.availability) {
      switch (filters.availability) {
        case 'in-stock':
          result = result.filter((material) => material.quantityAvailable > 0);
          break;
        case 'limited':
          result = result.filter((material) => material.quantityAvailable > 0 && material.quantityAvailable <= 10);
          break;
        case 'out-of-stock':
          result = result.filter((material) => material.quantityAvailable === 0);
          break;
      }
    }

    // Filter by minimum recycled percentage
    if (filters.minRecycledPercentage) {
      result = result.filter((material) => material.recycledPercentage >= filters.minRecycledPercentage!);
    }

    // Filter sustainable materials only
    if (filters.sustainableOnly) {
      result = result.filter((material) => material.recycledPercentage > 0);
    }

    return result;
  }, [state.materials, filters]);

  // Load materials from API with server-side filtering
  const loadMaterials = useCallback(async (useServerFilters = false) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      let materials: MaterialDetailDto[];
      
      if (useServerFilters && Object.keys(filters).length > 0) {
        // Use server-side filtering for better performance
        const serverFilters = {
          typeId: filters.typeId,
          supplierId: filters.supplierId,
          supplierName: filters.supplierName,
          materialName: filters.materialName,
          productionCountry: filters.productionCountry,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          minQuantity: filters.minQuantity,
          hasCertification: filters.hasCertification,
          transportMethod: filters.transportMethod,
          sortBySustainability: true,
          publicOnly: true
        };
        
        materials = await materialService.getAllMaterialsWithFilters(serverFilters);
      } else {
        // Use existing method for backward compatibility
        materials = await materialService.getAllMaterialsWithSustainability();
      }
      
      setState(prev => ({ 
        ...prev, 
        materials, 
        loading: false 
      }));
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred';
      const statusCode = error.response?.status || 'Unknown';
      
      setState(prev => ({ 
        ...prev, 
        error: `Failed to load materials: ${statusCode} - ${errorMessage}`,
        loading: false 
      }));
    }
  }, [filters]);

  // Load materials on mount with delay
  useEffect(() => {
    // Add small delay to ensure API is ready
    const timer = setTimeout(() => {
      loadMaterials();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [loadMaterials]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<UseMaterialFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Get material detail by ID
  const getMaterialDetail = useCallback(async (id: number) => {
    try {
      return await materialService.getMaterialDetail(id);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get material detail');
    }
  }, []);

  // Helper methods for filtering
  const getOrganicMaterials = useCallback(() => {
    return filteredMaterials.filter((material) => 
      material.materialTypeName?.toLowerCase().includes('organic')
    );
  }, [filteredMaterials]);

  const getRecycledMaterials = useCallback(() => {
    return filteredMaterials.filter((material) => 
      material.materialTypeName?.toLowerCase().includes('recycled') ||
      material.recycledPercentage > 0
    );
  }, [filteredMaterials]);

  const getSustainableMaterials = useCallback(() => {
    return filteredMaterials.filter((material) => material.recycledPercentage > 0);
  }, [filteredMaterials]);

  const getAvailableMaterials = useCallback(() => {
    return filteredMaterials.filter((material) => material.quantityAvailable > 0);
  }, [filteredMaterials]);

  // Load materials with server-side filtering (for better performance)
  const loadMaterialsWithServerFilters = useCallback(async () => {
    return loadMaterials(true);
  }, [loadMaterials]);

  // Get materials by type using server-side filtering
  const getMaterialsByType = useCallback(async (typeId: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const materials = await materialService.getMaterialsByType(typeId);
      setState(prev => ({ 
        ...prev, 
        materials, 
        loading: false 
      }));
      return materials;
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred';
      setState(prev => ({ 
        ...prev, 
        error: `Failed to load materials by type: ${errorMessage}`,
        loading: false 
      }));
      throw error;
    }
  }, []);

  return {
    // State
    materials: state.materials,
    filteredMaterials,
    loading: state.loading,
    error: state.error,
    filters,

    // Actions
    loadMaterials,
    loadMaterialsWithServerFilters,
    updateFilters,
    resetFilters,
    getMaterialDetail,
    getMaterialsByType,

    // Helper methods
    getOrganicMaterials,
    getRecycledMaterials,
    getSustainableMaterials,
    getAvailableMaterials,

    // Stats
    totalCount: state.materials.length,
    filteredCount: filteredMaterials.length,
  };
};

export default useMaterial; 