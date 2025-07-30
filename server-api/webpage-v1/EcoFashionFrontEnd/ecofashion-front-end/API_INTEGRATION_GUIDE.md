# API Integration Guide - EcoFashion Frontend

## Materials API Endpoints

### 1. Get All Materials with Sustainability Scores
```
GET /api/Materials/WithSustainability
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "materialId": 1,
      "name": "Organic Cotton Premium",
      "description": "Cotton hữu cơ cao cấp...",
      "recycledPercentage": 0,
      "quantityAvailable": 1000,
      "pricePerUnit": 45000,
      "materialTypeName": "Organic Cotton",
      "imageUrls": ["url1", "url2"],
      "sustainabilityScore": 85,
      "sustainabilityLevel": "Xuất sắc",
      "sustainabilityColor": "green",
      "supplier": {
        "supplierId": "supplier1",
        "supplierName": "Supplier One",
        "rating": 4.5,
        "reviewCount": 12
      }
    }
  ]
}
```

### 2. Get All Materials (Basic)
```
GET /api/Materials
```

### 3. Get Material Detail
```
GET /api/Materials/Detail/{id}
```

### 4. Create Material with Sustainability
```
POST /api/Materials/CreateWithSustainability
```

**Request Body:**
```json
{
  "name": "New Material",
  "description": "Description",
  "typeId": 1,
  "quantityAvailable": 100,
  "pricePerUnit": 50000,
  "recycledPercentage": 85,
  "carbonFootprint": 4.2,
  "waterUsage": 8.5,
  "wasteDiverted": 60,
  "hasOrganicCertification": true
}
```

## Frontend Integration

### 1. MaterialCard Component
- Hiển thị sustainability score từ backend
- Hiển thị sustainability level và color
- Fallback calculation nếu không có data từ backend

### 2. MaterialsSection Component
- Hiển thị sustainability stats (Xuất sắc, Tốt, Trung bình, Cần cải thiện)
- Navigation controls cho materials
- Loading và error states

### 3. useMaterial Hook
- Sử dụng API `/WithSustainability` để lấy sustainability scores
- Filtering và pagination support
- Error handling

## Sustainability Score Levels

- **80-100**: Xuất sắc (green)
- **60-79**: Tốt (yellow)  
- **40-59**: Trung bình (orange)
- **0-39**: Cần cải thiện (red)

## Backend Integration

### Database Schema
- `Materials` table với sustainability fields
- `MaterialTypeBenchmarks` cho benchmark data
- `SustainabilityCriteria` cho criteria definitions

### Sample Data
- 12 materials của "Supplier One" làm sample
- Sustainability scores được tính từ backend
- Benchmarks cho từng material type 