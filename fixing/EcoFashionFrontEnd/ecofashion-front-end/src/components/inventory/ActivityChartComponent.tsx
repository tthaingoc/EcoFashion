import React from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import type { ActivityChartProps, WarehouseType } from '../../types/inventory.types';

const COLORS = {
  primary: '#3B82F6',
  green: '#10B981',
  purple: '#8B5CF6',
  orange: '#F59E0B',
  red: '#EF4444',
  yellow: '#F59E0B',
  indigo: '#6366F1'
};

const PIE_COLORS = [COLORS.primary, COLORS.green, COLORS.purple, COLORS.orange, COLORS.red, COLORS.yellow];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString('vi-VN')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const MaterialActivityChart: React.FC<{ data: any[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Không có dữ liệu hoạt động
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="label" 
            fontSize={12}
            stroke="#6b7280"
          />
          <YAxis 
            fontSize={12}
            stroke="#6b7280"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="value" 
            fill={COLORS.green} 
            name="Nhập kho (m)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const ProductActivityChart: React.FC<{ data: any[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Không có dữ liệu hoạt động
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="label" 
            fontSize={12}
            stroke="#6b7280"
          />
          <YAxis 
            fontSize={12}
            stroke="#6b7280"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="completed" 
            stroke={COLORS.green} 
            strokeWidth={3}
            name="Hoàn thành"
            dot={{ fill: COLORS.green, strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="inProduction" 
            stroke={COLORS.orange} 
            strokeWidth={3}
            name="Đang sản xuất"
            dot={{ fill: COLORS.orange, strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const DesignerActivityChart: React.FC<{ data: any[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Không có dữ liệu hoạt động
      </div>
    );
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices < 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const AggregatedActivityChart: React.FC<{ data: any[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Không có dữ liệu hoạt động
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="label" 
            fontSize={12}
            stroke="#6b7280"
          />
          <YAxis 
            fontSize={12}
            stroke="#6b7280"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="materials" 
            fill={COLORS.green} 
            name="Nguyên liệu"
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            dataKey="products" 
            fill={COLORS.purple} 
            name="Sản phẩm"
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            dataKey="designerMaterials" 
            fill={COLORS.orange} 
            name="NVL Designer"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const getChartTitle = (warehouseType: WarehouseType) => {
  switch (warehouseType) {
    case 'material':
      return 'Nhập kho theo nhà cung cấp';
    case 'product':
      return 'Tiến độ sản xuất theo thời gian';
    case 'designer-material':
      return 'Phân bố mua hàng theo loại';
    case 'all':
      return 'Tổng quan hoạt động tất cả kho';
    default:
      return 'Biểu đồ hoạt động';
  }
};

const getChartDescription = (warehouseType: WarehouseType) => {
  switch (warehouseType) {
    case 'material':
      return 'Thống kê số lượng nguyên liệu nhập kho từ các nhà cung cấp';
    case 'product':
      return 'Theo dõi tiến độ hoàn thành và sản xuất sản phẩm';
    case 'designer-material':
      return 'Phân tích xu hướng mua nguyên liệu của designer';
    case 'all':
      return 'Tổng quan hoạt động của tất cả các loại kho';
    default:
      return 'Biểu đồ thống kê hoạt động kho';
  }
};

const ActivityChartComponent: React.FC<ActivityChartProps> = ({
  warehouseType,
  data,
  timeRange
}) => {
  const renderChart = () => {
    if (!data) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          Đang tải dữ liệu...
        </div>
      );
    }

    switch (warehouseType) {
      case 'material':
        return <MaterialActivityChart data={data.receiptsBySupplier || []} />;
      case 'product':
        return <ProductActivityChart data={data.productionTimeline || []} />;
      case 'designer-material':
        return <DesignerActivityChart data={data.purchaseDistribution || []} />;
      case 'all':
        return <AggregatedActivityChart data={data.overview || []} />;
      default:
        return <MaterialActivityChart data={data.receiptsBySupplier || []} />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {getChartTitle(warehouseType)}
          </h3>
          <div className="text-sm text-gray-500">
            {new Date(timeRange.from).toLocaleDateString('vi-VN')} - {new Date(timeRange.to).toLocaleDateString('vi-VN')}
          </div>
        </div>
        <p className="text-sm text-gray-600">
          {getChartDescription(warehouseType)}
        </p>
      </div>
      
      {renderChart()}
    </div>
  );
};

export default ActivityChartComponent;