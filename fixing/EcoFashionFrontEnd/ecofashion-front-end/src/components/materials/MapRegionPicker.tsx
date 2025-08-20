import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

// Map configurations for supported countries
const mapConfigs = {
  'Vietnam': {
    geoUrl: '/maps/vietnam-regions.json',
    projectionConfig: { scale: 3200, center: [107.5, 16.5] as [number, number] },
    width: 800,
    height: 1000,
    propertyName: 'NAME_1',
    flag: '🇻🇳'
  },
  'China': {
    geoUrl: '/maps/china-regions.json',
    projectionConfig: { scale: 800, center: [104, 35] as [number, number] },
    width: 900,
    height: 600,
    propertyName: 'NAME_1',
    flag: '🇨🇳'
  },
  'India': {
    geoUrl: '/maps/india-regions.json',
    projectionConfig: { scale: 1200, center: [78, 20] as [number, number] },
    width: 800,
    height: 900,
    propertyName: 'NAME_1',
    flag: '🇮🇳'
  }
};

// Common regions for countries without specific maps
const commonRegions = {
  'Japan': ['Tokyo', 'Osaka', 'Kyoto', 'Nagoya', 'Fukuoka', 'Hiroshima', 'Sendai'],
  'Korea': ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Ulsan'],
  'United States': ['California', 'Texas', 'New York', 'Florida', 'Georgia', 'North Carolina', 'Pennsylvania'],
  'Turkey': ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Adana', 'Gaziantep', 'Konya'],
  'Bangladesh': ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet', 'Barisal', 'Rangpur'],
  'Indonesia': ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Palembang'],
  'Thailand': ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Hua Hin', 'Krabi', 'Koh Samui'],
  'Peru': ['Lima', 'Cusco', 'Arequipa', 'Trujillo', 'Chiclayo', 'Huancayo', 'Iquitos'],
  'Egypt': ['Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan', 'Sharm El Sheikh', 'Hurghada']
};

interface MapRegionPickerProps {
  country: string;
  onSelectRegion: (region: string) => void;
  selectedRegion?: string;
}

export const MapRegionPicker: React.FC<MapRegionPickerProps> = ({ 
  country, 
  onSelectRegion, 
  selectedRegion 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapConfig = mapConfigs[country as keyof typeof mapConfigs];
  const regions = commonRegions[country as keyof typeof commonRegions];

  // Reset error when country changes
  useEffect(() => {
    setError(null);
  }, [country]);

  if (!country) {
    return (
      <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
        <p>Vui lòng chọn quốc gia trước để hiển thị bản đồ khu vực</p>
      </div>
    );
  }

  // Render interactive map for supported countries
  if (mapConfig) {
    return (
      <div className="w-full">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">{mapConfig.flag}</span>
          <h4 className="font-semibold text-gray-800">Chọn khu vực sản xuất tại {country}</h4>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4" style={{ maxWidth: 900, margin: '0 auto' }}>
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Đang tải bản đồ...</span>
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
              <p className="text-red-600">Không thể tải bản đồ: {error}</p>
              <p className="text-sm text-gray-600 mt-1">Vui lòng nhập khu vực thủ công bên dưới</p>
            </div>
          )}
          
          {!isLoading && !error && (
            <>
              <ComposableMap
                projection="geoMercator"
                width={mapConfig.width}
                height={mapConfig.height}
                projectionConfig={mapConfig.projectionConfig}
                style={{ width: '100%', height: 'auto' }}
              >
                <Geographies 
                  geography={mapConfig.geoUrl}
                  onError={(error) => {
                    console.error('Map loading error:', error);
                    setError('Không thể tải dữ liệu bản đồ');
                  }}
                >
                  {({ geographies }) =>
                    geographies.map((geo, idx) => {
                      const regionName = geo.properties[mapConfig.propertyName];
                      const isSelected = selectedRegion === regionName;
                      
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onClick={() => onSelectRegion(regionName)}
                          style={{
                            default: { 
                              fill: isSelected ? "#059669" : `hsl(${(idx * 30) % 360}, 60%, 70%)`, 
                              outline: "black", 
                              cursor: "pointer",
                              stroke: isSelected ? "#047857" : "#000",
                              strokeWidth: isSelected ? 2 : 1
                            },
                            hover: { 
                              fill: isSelected ? "#047857" : "#F53", 
                              outline: "black", 
                              cursor: "pointer",
                              strokeWidth: 2 
                            },
                            pressed: { 
                              fill: "#E42", 
                              outline: "black", 
                              cursor: "pointer",
                              strokeWidth: 2
                            }
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ComposableMap>
              
              <div className="text-xs text-gray-500 mt-3 text-center">
                <p>💡 Nhấp vào vùng trên bản đồ để chọn khu vực sản xuất</p>
                {selectedRegion && (
                  <p className="mt-1 text-green-600 font-medium">
                    ✓ Đã chọn: {selectedRegion}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Render dropdown for countries with predefined regions
  if (regions) {
    return (
      <div className="w-full">
        <div className="mb-3">
          <h4 className="font-semibold text-gray-800 mb-2">Chọn khu vực sản xuất tại {country}</h4>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Khu vực phổ biến
          </label>
          <select
            value={selectedRegion || ''}
            onChange={(e) => onSelectRegion(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Chọn khu vực --</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
          
          <div className="mt-3 text-xs text-gray-500">
            <p>💡 Chọn từ danh sách các khu vực phổ biến hoặc nhập thủ công bên dưới</p>
            {selectedRegion && (
              <p className="mt-1 text-green-600 font-medium">
                ✓ Đã chọn: {selectedRegion}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback for countries without maps or predefined regions
  return (
    <div className="w-full">
      <div className="mb-3">
        <h4 className="font-semibold text-gray-800">Khu vực sản xuất tại {country}</h4>
      </div>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <div className="text-gray-600 mb-2">
          <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p>Chưa có bản đồ chi tiết cho {country}</p>
          <p className="text-sm text-gray-500 mt-1">
            Vui lòng nhập thông tin khu vực vào trường bên dưới
          </p>
        </div>
      </div>
    </div>
  );
};