# Enhanced Inventory Report - Architecture & Implementation Plan

## 🏗️ **Kiến trúc tổng quan**

```
Enhanced Admin Inventory Report
├── 📁 components/
│   ├── 🎛️ WarehouseFilterComponent.tsx       # Dropdown chọn loại kho + date filter
│   ├── 📊 InventoryStatsComponent.tsx        # KPI cards cho từng loại kho
│   ├── 📋 TransactionHistoryComponent.tsx    # Lịch sử giao dịch + filtering
│   ├── 📈 ActivityChartComponent.tsx         # Biểu đồ hoạt động theo loại kho
│   ├── ⚠️ LowStockAlertComponent.tsx         # Cảnh báo tồn kho thấp
│   ├── 🔍 TransactionDetailModal.tsx         # Modal chi tiết giao dịch
│   └── 🔧 common/
│       ├── LoadingSpinner.tsx
│       ├── EmptyState.tsx
│       └── DataTable.tsx
├── 📁 hooks/
│   ├── useWarehouseData.ts                   # Custom hook tổng hợp data
│   ├── useMaterialInventory.ts               # Hook cho material warehouse
│   ├── useProductInventory.ts                # Hook cho product warehouse (new)
│   └── useDesignerMaterialInventory.ts       # Hook cho designer material (new)
├── 📁 services/
│   ├── materialInventoryService.ts           # Existing
│   ├── productInventoryService.ts            # New - API calls cho product
│   ├── designerMaterialInventoryService.ts   # New - API calls cho designer material
│   └── unifiedInventoryService.ts            # New - Service tổng hợp
├── 📁 types/
│   ├── inventory.types.ts                    # Unified types cho tất cả warehouse
│   ├── material.types.ts                     # Material specific types
│   ├── product.types.ts                      # Product specific types (new)
│   └── designer.types.ts                     # Designer material types (new)
└── 📄 InventoryReport.tsx                    # Main orchestrator component
```

---

## 🎯 **Component Architecture Chi tiết**

### **1. WarehouseFilterComponent.tsx**
```typescript
interface WarehouseFilter {
  type: 'all' | 'material' | 'product' | 'designer-material';
  label: string;
  icon: string;
  description: string;
  color: string;
  apiEndpoint?: string;
}

Props:
- selectedType: WarehouseType
- onTypeChange: (type: WarehouseType) => void
- dateRange: { from: string, to: string }
- onDateChange: (from: string, to: string) => void

Features:
- 🎨 Dropdown với preview icons và descriptions
- 📅 Date range picker integrated
- 🏷️ Color-coded filter tags
- 📱 Responsive design
```

### **2. InventoryStatsComponent.tsx**
```typescript
interface StatsConfig {
  material: StatCard[];      // 5 cards: materials, stock, value, low, out
  product: StatCard[];       // 4 cards: products, completed, producing, value  
  'designer-material': StatCard[]; // 4 cards: purchased, using, cost, efficiency
  all: StatCard[];          // 4 cards: overview tất cả warehouse types
}

Props:
- warehouseType: WarehouseType
- data: UnifiedInventoryData
- loading: boolean

Features:
- 🎯 Dynamic stats based on warehouse type
- 📈 Trend indicators (optional)
- 🔢 Formatted currency và quantities
- ⚡ Loading skeletons
```

### **3. TransactionHistoryComponent.tsx**
```typescript
interface TransactionHistoryProps {
  warehouseType: WarehouseType;
  transactions: UnifiedTransactionDto[];
  loading: boolean;
  onViewDetail: (tx: UnifiedTransactionDto) => void;
}

Features:
- 🔍 Advanced filtering (type, date, amount range)
- ↕️ Multi-column sorting
- 🎨 Color-coded transaction types
- 📊 Pagination for large datasets
- 💾 Export to CSV functionality
- 👁️ Quick preview với hover effects
```

### **4. ActivityChartComponent.tsx**
```typescript
interface ChartData {
  material: MaterialActivityData;     // Receipts by supplier
  product: ProductActivityData;       // Production completions
  'designer-material': DesignerActivityData; // Purchase activities
  all: AggregatedActivityData;       // Combined overview
}

Props:
- warehouseType: WarehouseType
- data: ChartData[warehouseType]
- timeRange: { from: string, to: string }

Features:
- 📊 Different chart types per warehouse:
  - Material: Bar chart nhập kho by supplier
  - Product: Line chart production timeline  
  - Designer Material: Pie chart purchase distribution
  - All: Multi-series overview chart
```

---

## 🔗 **Data Flow Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    InventoryReport.tsx                      │
│                   (Main Orchestrator)                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │   useWarehouseData()    │  ← Custom hook tổng hợp
         │   - Manage state        │
         │   - Coordinate API calls│
         │   - Handle loading      │
         └────────────┬────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
┌───▼───┐        ┌────▼────┐       ┌────▼────┐
│Material│        │Product  │       │Designer │
│Inventory│       │Inventory│       │Material │
│Service  │       │Service  │       │Inventory│
└───┬───┘        └────┬────┘       └────┬────┘
    │                 │                 │
┌───▼───┐        ┌────▼────┐       ┌────▼────┐
│Backend │        │Backend  │       │Backend  │
│API     │        │API      │       │API      │
│/material│       │/product │       │/designer│
└───────┘        └─────────┘       └─────────┘
```

---

## 🛠️ **Implementation Plan**

### **Phase 1: Foundation (1-2 days)**
```typescript
// 1. Create unified types
interface UnifiedInventoryData {
  type: WarehouseType;
  summary: InventorySummaryDto;
  transactions: UnifiedTransactionDto[];
  lowStockItems: LowStockItemDto[];
  activityData: ActivityDataDto[];
}

// 2. Setup base components structure
- WarehouseFilterComponent (completed)
- InventoryStatsComponent (completed) 
- Basic layout và routing

// 3. Enhance existing Material warehouse
- Add proper TypeScript types
- Integrate with new component structure
```

### **Phase 2: Product Warehouse (2-3 days)**
```typescript
// 1. Backend API Development
interface ProductInventoryController {
  getProductSummary(from, to, designerId?): Promise<ProductSummaryDto>;
  getProductTransactions(filters): Promise<ProductTransactionDto[]>;
  getLowStockProducts(limit): Promise<LowStockProductDto[]>;
  getProductionActivity(from, to): Promise<ProductActivityDto[]>;
}

// 2. Frontend Service
class ProductInventoryService {
  async getSummary(params): Promise<ProductSummaryDto>;
  async getTransactions(params): Promise<ProductTransactionDto[]>;
  async getLowStock(params): Promise<LowStockProductDto[]>;
  async getActivity(params): Promise<ProductActivityDto[]>;
}

// 3. Component Integration
- Update InventoryStatsComponent for product stats
- Add ProductTransactionHistory 
- Create ProductActivityChart
```

### **Phase 3: Designer Material Warehouse (2-3 days)**
```typescript
// 1. Backend Enhancement
interface DesignerMaterialInventoryController {
  getDesignerMaterialSummary(): Promise<DesignerMaterialSummaryDto>;
  getDesignerMaterialTransactions(): Promise<DesignerMaterialTransactionDto[]>;
  getDesignerMaterialUsage(): Promise<MaterialUsageDto[]>;
}

// 2. Frontend Service
class DesignerMaterialInventoryService {
  async getSummary(designerId): Promise<DesignerMaterialSummaryDto>;
  async getTransactions(designerId, filters): Promise<DesignerMaterialTransactionDto[]>;
  async getUsageAnalytics(designerId): Promise<MaterialUsageDto[]>;
}

// 3. Component Integration
- DesignerMaterialStats
- DesignerMaterialTransactionHistory
- MaterialUsageChart
```

### **Phase 4: Advanced Features (2-3 days)**
```typescript
// 1. Advanced Filtering & Search
interface AdvancedFilters {
  warehouseType: WarehouseType[];
  dateRange: { from: Date, to: Date };
  suppliers?: string[];
  designers?: string[];
  materials?: number[];
  products?: number[];
  transactionTypes?: string[];
  amountRange?: { min: number, max: number };
}

// 2. Export & Reporting
interface ExportService {
  exportToCSV(data: UnifiedInventoryData): void;
  exportToPDF(data: UnifiedInventoryData): void;
  generateInventoryReport(filters: AdvancedFilters): Promise<ReportDto>;
}

// 3. Real-time Updates (Optional)
interface RealtimeUpdates {
  subscribeToInventoryChanges(warehouseType: WarehouseType): Observable<InventoryUpdate>;
  showNotifications(updates: InventoryUpdate[]): void;
}
```

---

## 📊 **Database Schema Extensions**

### **Cần thêm cho Product Warehouse:**
```sql
-- Product Inventory Transactions Table
CREATE TABLE ProductInventoryTransactions (
    TransactionId INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL,
    WarehouseId INT NOT NULL,
    TransactionType NVARCHAR(50) NOT NULL, -- 'Production', 'Sale', 'Return', 'Damage'
    QuantityChange INT NOT NULL,
    BeforeQty INT NOT NULL,
    AfterQty INT NOT NULL,
    OrderId INT NULL,
    Note NVARCHAR(500),
    CreatedByUserId INT,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (ProductId) REFERENCES Products(ProductId),
    FOREIGN KEY (WarehouseId) REFERENCES Warehouses(WarehouseId)
);

-- Designer Material Purchase Transactions
CREATE TABLE DesignerMaterialPurchases (
    PurchaseId INT IDENTITY(1,1) PRIMARY KEY,
    DesignerId UNIQUEIDENTIFIER NOT NULL,
    MaterialId INT NOT NULL,
    SupplierId UNIQUEIDENTIFIER NOT NULL,
    Quantity DECIMAL(10,2) NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    TotalCost DECIMAL(18,2) NOT NULL,
    PurchaseDate DATETIME2 NOT NULL,
    Status NVARCHAR(50) NOT NULL, -- 'Ordered', 'Received', 'Used'
    
    FOREIGN KEY (DesignerId) REFERENCES Designers(DesignerId),
    FOREIGN KEY (MaterialId) REFERENCES Materials(MaterialId),
    FOREIGN KEY (SupplierId) REFERENCES Suppliers(SupplierId)
);
```

---

## 🎨 **UI/UX Design Patterns**

### **Color Coding System:**
```css
/* Warehouse Type Colors */
.warehouse-all { 
  --primary: #3B82F6;      /* Blue */
  --bg: #EFF6FF; 
}

.warehouse-material { 
  --primary: #10B981;      /* Green */
  --bg: #ECFDF5; 
}

.warehouse-product { 
  --primary: #8B5CF6;      /* Purple */
  --bg: #F5F3FF; 
}

.warehouse-designer-material { 
  --primary: #F59E0B;      /* Orange */
  --bg: #FFFBEB; 
}

/* Transaction Type Colors */
.transaction-in { @apply text-green-600 bg-green-50; }
.transaction-out { @apply text-red-600 bg-red-50; }
.transaction-transfer { @apply text-blue-600 bg-blue-50; }
.transaction-adjust { @apply text-yellow-600 bg-yellow-50; }
```

### **Responsive Breakpoints:**
```css
/* Mobile First Design */
.inventory-grid {
  @apply grid grid-cols-1;           /* Mobile: 1 column */
  @apply md:grid-cols-2;             /* Tablet: 2 columns */
  @apply lg:grid-cols-4;             /* Desktop: 4 columns */
  @apply xl:grid-cols-5;             /* Large: 5 columns (material only) */
}

.transaction-table {
  @apply overflow-x-auto;            /* Horizontal scroll on mobile */
  @apply text-sm md:text-base;       /* Responsive text size */
}
```

---

## 🚀 **Performance Optimizations**

### **1. Data Fetching Strategy:**
```typescript
// Smart loading based on warehouse type
const useWarehouseData = (type: WarehouseType, filters: Filters) => {
  const materialQuery = useQuery({
    queryKey: ['material-inventory', filters],
    queryFn: () => materialInventoryService.getSummary(filters),
    enabled: type === 'all' || type === 'material',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const productQuery = useQuery({
    queryKey: ['product-inventory', filters],
    queryFn: () => productInventoryService.getSummary(filters),
    enabled: type === 'all' || type === 'product',
    staleTime: 5 * 60 * 1000,
  });

  // Parallel fetching khi type = 'all'
  // Conditional fetching khi type specific
};
```

### **2. Component Optimization:**
```typescript
// Lazy loading components
const TransactionHistoryComponent = lazy(() => import('./TransactionHistoryComponent'));
const ActivityChartComponent = lazy(() => import('./ActivityChartComponent'));

// Memoization for expensive calculations
const processedTransactions = useMemo(() => {
  return transactions.map(tx => ({
    ...tx,
    typeText: getTransactionTypeText(tx),
    colorClass: getTransactionColor(tx),
    formattedDate: formatViDateTime(tx.createdAt)
  }));
}, [transactions]);
```

### **3. Caching Strategy:**
```typescript
// Service Worker cho API caching
const cacheConfig = {
  'inventory-summary': { ttl: 5 * 60 * 1000 },      // 5 minutes
  'inventory-transactions': { ttl: 2 * 60 * 1000 },  // 2 minutes
  'inventory-low-stock': { ttl: 10 * 60 * 1000 },    // 10 minutes
};
```

---

## 🔧 **Development Tools & Setup**

### **Recommended Tech Stack:**
```json
{
  "frontend": {
    "framework": "React 18 + TypeScript",
    "styling": "Tailwind CSS",
    "state": "@tanstack/react-query",
    "charts": "Recharts hoặc Chart.js",
    "icons": "Lucide React",
    "dates": "date-fns",
    "forms": "React Hook Form + Zod"
  },
  "backend": {
    "framework": ".NET Core 8",
    "database": "SQL Server",
    "orm": "Entity Framework Core",
    "api": "RESTful APIs + SignalR (realtime)",
    "auth": "JWT + Role-based"
  },
  "development": {
    "ide": "VS Code + GitHub Copilot",
    "version-control": "Git + GitHub",
    "api-testing": "Postman hoặc Thunder Client",
    "database": "SQL Server Management Studio"
  }
}
```

### **File Structure Implementation:**
```
src/
├── pages/admin/
│   └── InventoryReport.tsx                    # Main page
├── components/inventory/
│   ├── WarehouseFilterComponent.tsx
│   ├── InventoryStatsComponent.tsx  
│   ├── TransactionHistoryComponent.tsx
│   ├── ActivityChartComponent.tsx
│   ├── LowStockAlertComponent.tsx
│   ├── TransactionDetailModal.tsx
│   └── common/
│       ├── LoadingSpinner.tsx
│       ├── EmptyState.tsx
│       └── DataTable.tsx
├── hooks/inventory/
│   ├── useWarehouseData.ts
│   ├── useMaterialInventory.ts
│   ├── useProductInventory.ts
│   └── useDesignerMaterialInventory.ts
├── services/api/
│   ├── materialInventoryService.ts
│   ├── productInventoryService.ts
│   ├── designerMaterialInventoryService.ts
│   └── unifiedInventoryService.ts
├── types/
│   ├── inventory.types.ts
│   ├── material.types.ts
│   ├── product.types.ts
│   └── designer.types.ts
└── utils/
    ├── date.ts
    ├── currency.ts
    └── export.ts
```

---

## 📝 **Next Steps**

### **Immediate Actions:**
1. **Setup project structure** theo kiến trúc trên
2. **Implement WarehouseFilterComponent** với full functionality
3. **Enhance existing Material warehouse** integration
4. **Create unified type definitions** cho tất cả warehouse types

### **Medium Term:**
1. **Develop Product warehouse** backend APIs
2. **Implement Product inventory** frontend components  
3. **Add Designer Material** warehouse support
4. **Advanced filtering** và search capabilities

### **Long Term:**
1. **Real-time updates** với SignalR
2. **Advanced analytics** và forecasting
3. **Mobile app** support
4. **Integration với accounting** systems

---

## 💡 **Key Benefits**

✅ **Unified Management**: Admin quản lý tất cả loại kho từ 1 interface

✅ **Modular Architecture**: Dễ maintain và extend cho warehouse types mới

✅ **Type Safety**: Full TypeScript support cho robust development  

✅ **Performance**: Smart loading và caching strategies

✅ **User Experience**: Intuitive filtering và responsive design

✅ **Scalability**: Architecture support cho future enhancements

---

Kiến trúc này sẽ cho phép bạn có một **Inventory Management System** hoàn chỉnh, scalable và maintainable! 🚀