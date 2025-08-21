import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { CalendarIcon, CubeIcon, SparklesIcon, PuzzlePieceIcon, Squares2X2Icon } from '@heroicons/react/24/solid';
import type { WarehouseType, WarehouseFilter, WarehouseFilterProps } from '../../types/inventory.types';

const warehouseFilters: WarehouseFilter[] = [
  {
    type: 'all',
    label: 'Tất cả kho',
    icon: 'Squares2X2Icon',
    description: 'Tổng quan tất cả loại kho',
    color: 'blue',
    apiEndpoint: '/unified'
  },
  {
    type: 'material',
    label: 'Kho nguyên liệu',
    icon: 'CubeIcon', 
    description: 'Quản lý nguyên liệu từ nhà cung cấp',
    color: 'green',
    apiEndpoint: '/materials'
  },
  {
    type: 'product',
    label: 'Kho sản phẩm',
    icon: 'PuzzlePieceIcon',
    description: 'Sản phẩm hoàn thành và đang sản xuất',
    color: 'purple',
    apiEndpoint: '/products'
  },
  {
    type: 'designer-material',
    label: 'Kho NVL Designer',
    icon: 'SparklesIcon',
    description: 'Nguyên liệu được designer mua',
    color: 'orange',
    apiEndpoint: '/designer-materials'
  }
];

const getWarehouseIcon = (iconName: string) => {
  switch (iconName) {
    case 'Squares2X2Icon':
      return <Squares2X2Icon className="w-5 h-5" />;
    case 'CubeIcon':
      return <CubeIcon className="w-5 h-5" />;
    case 'PuzzlePieceIcon':
      return <PuzzlePieceIcon className="w-5 h-5" />;
    case 'SparklesIcon':
      return <SparklesIcon className="w-5 h-5" />;
    default:
      return <CubeIcon className="w-5 h-5" />;
  }
};

const getColorClasses = (color: string, isSelected: boolean = false) => {
  const baseClasses = 'transition-colors duration-200';
  
  if (isSelected) {
    switch (color) {
      case 'blue':
        return `${baseClasses} bg-blue-50 text-blue-700 border-blue-200`;
      case 'green':
        return `${baseClasses} bg-green-50 text-green-700 border-green-200`;
      case 'purple':
        return `${baseClasses} bg-purple-50 text-purple-700 border-purple-200`;
      case 'orange':
        return `${baseClasses} bg-orange-50 text-orange-700 border-orange-200`;
      default:
        return `${baseClasses} bg-gray-50 text-gray-700 border-gray-200`;
    }
  }
  
  return `${baseClasses} bg-white text-gray-600 border-gray-200 hover:bg-gray-50`;
};

const WarehouseFilterComponent: React.FC<WarehouseFilterProps> = ({
  selectedType,
  onTypeChange,
  dateRange,
  onDateChange
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const selectedFilter = warehouseFilters.find(f => f.type === selectedType) || warehouseFilters[0];

  const handleFilterSelect = (filter: WarehouseFilter) => {
    onTypeChange(filter.type);
    setIsDropdownOpen(false);
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(new Date(e.target.value).toISOString(), dateRange.to);
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(dateRange.from, new Date(e.target.value).toISOString());
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Warehouse Type Filter */}
        <div className="relative">
          <label className="block text-xs text-gray-500 mb-2">Loại kho</label>
          <div className="relative">
            <button
              className={`flex items-center gap-3 px-4 py-3 border rounded-lg min-w-[250px] text-left ${getColorClasses(selectedFilter.color, true)}`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {getWarehouseIcon(selectedFilter.icon)}
              <div className="flex-1">
                <div className="font-medium text-sm">{selectedFilter.label}</div>
                <div className="text-xs opacity-75">{selectedFilter.description}</div>
              </div>
              {isDropdownOpen ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {warehouseFilters.map((filter) => (
                  <button
                    key={filter.type}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-gray-100 last:border-b-0 ${getColorClasses(filter.color, filter.type === selectedType)}`}
                    onClick={() => handleFilterSelect(filter)}
                  >
                    {getWarehouseIcon(filter.icon)}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{filter.label}</div>
                      <div className="text-xs opacity-75">{filter.description}</div>
                    </div>
                    {filter.type === selectedType && (
                      <div className={`w-2 h-2 rounded-full bg-${filter.color}-500`} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-2">Từ ngày</label>
            <div className="relative">
              <input
                type="datetime-local"
                className="form-input pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={dateRange.from.slice(0, 16)}
                onChange={handleDateFromChange}
              />
              <CalendarIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 mb-2">Đến ngày</label>
            <div className="relative">
              <input
                type="datetime-local"
                className="form-input pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={dateRange.to.slice(0, 16)}
                onChange={handleDateToChange}
              />
              <CalendarIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Filter Tags */}
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getColorClasses(selectedFilter.color, true)}`}>
            {getWarehouseIcon(selectedFilter.icon)}
            {selectedFilter.label}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            <CalendarIcon className="w-3 h-3" />
            {new Date(dateRange.from).toLocaleDateString('vi-VN')} - {new Date(dateRange.to).toLocaleDateString('vi-VN')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WarehouseFilterComponent;
