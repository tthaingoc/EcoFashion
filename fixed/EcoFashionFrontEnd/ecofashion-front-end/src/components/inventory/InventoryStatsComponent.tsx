import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import { 
  CubeIcon, 
  CurrencyDollarIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  PuzzlePieceIcon,
  ClockIcon,
  SparklesIcon,
  BoltIcon
} from '@heroicons/react/24/solid';
import type { WarehouseType, InventoryStatsProps, StatCard, StatsConfig } from '../../types/inventory.types';

const formatCurrency = (n: number) => (n * 1000).toLocaleString('vi-VN') + 'đ';

const getStatsConfig = (data: any): StatsConfig => {
  return {
    material: [
      {
        label: 'Số vật liệu',
        value: data?.summary?.totalDistinctMaterials ?? '—',
        icon: 'CubeIcon',
        color: 'green'
      },
      {
        label: 'Tồn kho hiện tại',
        value: data?.summary?.totalOnHand ?? '—',
        icon: 'CubeIcon', 
        color: 'blue'
      },
      {
        label: 'Giá trị tồn kho',
        value: data?.summary?.totalInventoryValue ? formatCurrency(data.summary.totalInventoryValue) : '—',
        icon: 'CurrencyDollarIcon',
        color: 'indigo'
      },
      {
        label: 'Dưới ngưỡng',
        value: data?.summary?.lowStockCount ?? '—',
        icon: 'ExclamationTriangleIcon',
        color: 'yellow'
      },
      {
        label: 'Hết hàng',
        value: data?.summary?.stockoutCount ?? '—',
        icon: 'XCircleIcon',
        color: 'red'
      }
    ],
    product: [
      {
        label: 'Tổng sản phẩm',
        value: data?.summary?.totalProducts ?? '—',
        icon: 'PuzzlePieceIcon',
        color: 'purple'
      },
      {
        label: 'Đã hoàn thành',
        value: data?.summary?.totalCompleted ?? '—',
        icon: 'CheckCircleIcon',
        color: 'green'
      },
      {
        label: 'Đang sản xuất',
        value: data?.summary?.totalProducing ?? '—',
        icon: 'ClockIcon',
        color: 'orange'
      },
      {
        label: 'Giá trị tồn kho',
        value: data?.summary?.totalInventoryValue ? formatCurrency(data.summary.totalInventoryValue) : '—',
        icon: 'CurrencyDollarIcon',
        color: 'indigo'
      }
    ],
    'designer-material': [
      {
        label: 'Đã mua',
        value: data?.summary?.totalPurchased ?? '—',
        icon: 'SparklesIcon',
        color: 'orange'
      },
      {
        label: 'Đang sử dụng',
        value: data?.summary?.totalUsing ?? '—',
        icon: 'BoltIcon',
        color: 'blue'
      },
      {
        label: 'Tổng chi phí',
        value: data?.summary?.totalCost ? formatCurrency(data.summary.totalCost) : '—',
        icon: 'CurrencyDollarIcon',
        color: 'red'
      },
      {
        label: 'Hiệu suất',
        value: data?.summary?.efficiency ? `${data.summary.efficiency}%` : '—',
        icon: 'BoltIcon',
        color: 'green'
      }
    ],
    all: [
      {
        label: 'Tổng vật liệu',
        value: data?.summary?.totalDistinctMaterials ?? '—',
        icon: 'CubeIcon',
        color: 'green'
      },
      {
        label: 'Tổng sản phẩm',
        value: data?.summary?.totalProducts ?? '—',
        icon: 'PuzzlePieceIcon',
        color: 'purple'
      },
      {
        label: 'Tổng giá trị',
        value: data?.summary?.totalInventoryValue ? formatCurrency(data.summary.totalInventoryValue) : '—',
        icon: 'CurrencyDollarIcon',
        color: 'indigo'
      },
      {
        label: 'Cảnh báo',
        value: (data?.summary?.lowStockCount ?? 0) + (data?.summary?.stockoutCount ?? 0),
        icon: 'ExclamationTriangleIcon',
        color: 'red'
      }
    ]
  };
};

const getStatIcon = (iconName: string) => {
  switch (iconName) {
    case 'CubeIcon':
      return <CubeIcon className="w-6 h-6" />;
    case 'CurrencyDollarIcon':
      return <CurrencyDollarIcon className="w-6 h-6" />;
    case 'ExclamationTriangleIcon':
      return <ExclamationTriangleIcon className="w-6 h-6" />;
    case 'XCircleIcon':
      return <XCircleIcon className="w-6 h-6" />;
    case 'PuzzlePieceIcon':
      return <PuzzlePieceIcon className="w-6 h-6" />;
    case 'ClockIcon':
      return <ClockIcon className="w-6 h-6" />;
    case 'SparklesIcon':
      return <SparklesIcon className="w-6 h-6" />;
    case 'BoltIcon':
      return <BoltIcon className="w-6 h-6" />;
    default:
      return <CubeIcon className="w-6 h-6" />;
  }
};

const getStatColorClasses = (color: string) => {
  switch (color) {
    case 'green':
      return 'bg-green-50 text-green-600 border-green-200';
    case 'blue':
      return 'bg-blue-50 text-blue-600 border-blue-200';
    case 'purple':
      return 'bg-purple-50 text-purple-600 border-purple-200';
    case 'orange':
      return 'bg-orange-50 text-orange-600 border-orange-200';
    case 'indigo':
      return 'bg-indigo-50 text-indigo-600 border-indigo-200';
    case 'yellow':
      return 'bg-yellow-50 text-yellow-600 border-yellow-200';
    case 'red':
      return 'bg-red-50 text-red-600 border-red-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
};

const StatCardComponent: React.FC<{ stat: StatCard; loading: boolean }> = ({ stat, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          {stat.trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${stat.trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {stat.trend.isPositive ? (
                <ArrowTrendingUpIcon className="w-4 h-4" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4" />
              )}
              <span>{Math.abs(stat.trend.value)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg border ${getStatColorClasses(stat.color || 'gray')}`}>
          {getStatIcon(stat.icon || 'CubeIcon')}
        </div>
      </div>
    </div>
  );
};

const InventoryStatsComponent: React.FC<InventoryStatsProps> = ({
  warehouseType,
  data,
  loading
}) => {
  const statsConfig = getStatsConfig(data);
  const stats = statsConfig[warehouseType] || statsConfig.all;

  const getGridCols = () => {
    switch (warehouseType) {
      case 'material':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5';
      case 'product':
      case 'designer-material':
      case 'all':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    }
  };

  return (
    <div className="mb-8">
      <div className={`grid gap-6 ${getGridCols()}`}>
        {stats.map((stat, index) => (
          <StatCardComponent
            key={`${warehouseType}-${index}`}
            stat={stat}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
};

export default InventoryStatsComponent;