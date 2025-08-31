export interface Province {
  code: string;
  name: string;
  districts: District[];
}

export interface District {
  code: string;
  name: string;
  wards: Ward[];
}

export interface Ward {
  code: string;
  name: string;
}

export const VIETNAM_PROVINCES: Province[] = [
  {
    code: "01",
    name: "Hà Nội",
    districts: [
      {
        code: "001",
        name: "Ba Đình",
        wards: [
          { code: "00001", name: "Phúc Xá" },
          { code: "00002", name: "Trúc Bạch" },
          { code: "00003", name: "Vĩnh Phúc" },
          { code: "00004", name: "Cống Vị" },
          { code: "00005", name: "Liễu Giai" },
          { code: "00006", name: "Nguyễn Trung Trực" },
          { code: "00007", name: "Quán Thánh" },
          { code: "00008", name: "Ngọc Hà" },
          { code: "00009", name: "Điện Biên" },
          { code: "00010", name: "Đội Cấn" },
          { code: "00011", name: "Ngọc Khánh" },
          { code: "00012", name: "Kim Mã" },
          { code: "00013", name: "Giảng Võ" },
          { code: "00014", name: "Thành Công" },
        ],
      },
      {
        code: "002",
        name: "Hoàn Kiếm",
        wards: [
          { code: "00015", name: "Phúc Tân" },
          { code: "00016", name: "Đồng Xuân" },
          { code: "00017", name: "Hàng Mã" },
          { code: "00018", name: "Hàng Buồm" },
          { code: "00019", name: "Hàng Đào" },
          { code: "00020", name: "Hàng Bồ" },
          { code: "00021", name: "Cửa Đông" },
          { code: "00022", name: "Lý Thái Tổ" },
          { code: "00023", name: "Hàng Bạc" },
          { code: "00024", name: "Hàng Gai" },
          { code: "00025", name: "Chương Dương Độ" },
          { code: "00026", name: "Hàng Trống" },
          { code: "00027", name: "Cửa Nam" },
          { code: "00028", name: "Hàng Bông" },
          { code: "00029", name: "Tràng Tiền" },
          { code: "00030", name: "Trần Hưng Đạo" },
          { code: "00031", name: "Phan Chu Trinh" },
          { code: "00032", name: "Hàng Bài" },
        ],
      },
      {
        code: "003",
        name: "Đống Đa",
        wards: [
          { code: "00033", name: "Cát Linh" },
          { code: "00034", name: "Văn Miếu" },
          { code: "00035", name: "Quốc Tử Giám" },
          { code: "00036", name: "Láng Thượng" },
          { code: "00037", name: "Ô Chợ Dừa" },
          { code: "00038", name: "Văn Chương" },
          { code: "00039", name: "Hàng Bột" },
          { code: "00040", name: "Nam Đồng" },
          { code: "00041", name: "Trung Phụng" },
          { code: "00042", name: "Quang Trung" },
          { code: "00043", name: "Trung Liệt" },
          { code: "00044", name: "Phương Liên" },
          { code: "00045", name: "Thổ Quan" },
          { code: "00046", name: "Láng Hạ" },
          { code: "00047", name: "Khâm Thiên" },
          { code: "00048", name: "Phương Mai" },
          { code: "00049", name: "Ngã Tư Sở" },
          { code: "00050", name: "Khương Thượng" },
        ],
      },
    ],
  },
  {
    code: "79",
    name: "Thành phố Hồ Chí Minh",
    districts: [
      {
        code: "760",
        name: "Quận 1",
        wards: [
          { code: "26734", name: "Tân Định" },
          { code: "26737", name: "Đa Kao" },
          { code: "26740", name: "Bến Nghé" },
          { code: "26743", name: "Bến Thành" },
          { code: "26746", name: "Nguyễn Thái Bình" },
          { code: "26749", name: "Phạm Ngũ Lão" },
          { code: "26752", name: "Cầu Ông Lãnh" },
          { code: "26755", name: "Cô Giang" },
          { code: "26758", name: "Nguyễn Cư Trinh" },
          { code: "26761", name: "Cầu Kho" },
        ],
      },
      {
        code: "761",
        name: "Quận 2",
        wards: [
          { code: "26764", name: "Thủ Thiêm" },
          { code: "26767", name: "An Phú" },
          { code: "26770", name: "An Khánh" },
          { code: "26773", name: "Bình An" },
          { code: "26776", name: "Bình Khánh" },
          { code: "26779", name: "Bình Trưng Đông" },
          { code: "26782", name: "Bình Trưng Tây" },
          { code: "26785", name: "Cát Lái" },
          { code: "26788", name: "Thạnh Mỹ Lợi" },
          { code: "26791", name: "Thảo Điền" },
        ],
      },
      {
        code: "769",
        name: "Quận Thủ Đức",
        wards: [
          { code: "26857", name: "Linh Chiểu" },
          { code: "26860", name: "Linh Tây" },
          { code: "26863", name: "Linh Xuân" },
          { code: "26866", name: "Linh Trung" },
          { code: "26869", name: "Linh Đông" },
          { code: "26872", name: "Bình Chiểu" },
          { code: "26875", name: "Bình Thọ" },
          { code: "26878", name: "Hiệp Bình Chánh" },
          { code: "26881", name: "Hiệp Bình Phước" },
          { code: "26884", name: "Tam Bình" },
          { code: "26887", name: "Tam Phú" },
        ],
      },
    ],
  },
  {
    code: "48",
    name: "Đà Nẵng",
    districts: [
      {
        code: "490",
        name: "Hải Châu",
        wards: [
          { code: "20194", name: "Thạch Thang" },
          { code: "20197", name: "Hải Châu I" },
          { code: "20200", name: "Hải Châu II" },
          { code: "20203", name: "Phước Ninh" },
          { code: "20206", name: "Hòa Thuận Tây" },
          { code: "20207", name: "Hòa Thuận Đông" },
          { code: "20209", name: "Nam Dương" },
          { code: "20212", name: "Bình Hiên" },
          { code: "20215", name: "Bình Thuận" },
          { code: "20218", name: "Hòa Cường Bắc" },
          { code: "20221", name: "Hòa Cường Nam" },
          { code: "20224", name: "Thanh Bình" },
          { code: "20225", name: "Thuận Phước" },
        ],
      },
    ],
  },
  {
    code: "92",
    name: "Cần Thơ",
    districts: [
      {
        code: "916",
        name: "Ninh Kiều",
        wards: [
          { code: "31117", name: "Cái Khế" },
          { code: "31120", name: "An Hòa" },
          { code: "31123", name: "Thới Bình" },
          { code: "31126", name: "An Nghiệp" },
          { code: "31129", name: "An Cư" },
          { code: "31132", name: "Tân An" },
          { code: "31135", name: "An Phú" },
          { code: "31138", name: "Xuân Khánh" },
          { code: "31141", name: "Hưng Lợi" },
        ],
      },
    ],
  },
  {
    code: "31",
    name: "Hải Phòng",
    districts: [
      {
        code: "323",
        name: "Hồng Bàng",
        wards: [
          { code: "11620", name: "Quán Toan" },
          { code: "11623", name: "Hùng Vương" },
          { code: "11626", name: "Sở Dầu" },
          { code: "11629", name: "Thượng Lý" },
          { code: "11632", name: "Hạ Lý" },
          { code: "11635", name: "Minh Khai" },
          { code: "11638", name: "Trại Chuối" },
        ],
      },
    ],
  },
];

// Helper functions
export const findProvinceByName = (name: string): Province | undefined => {
  return VIETNAM_PROVINCES.find((province) =>
    province.name.toLowerCase().includes(name.toLowerCase())
  );
};

export const findDistrictsByProvince = (provinceCode: string): District[] => {
  const province = VIETNAM_PROVINCES.find((p) => p.code === provinceCode);
  return province?.districts || [];
};

export const findWardsByDistrict = (
  provinceCode: string,
  districtCode: string
): Ward[] => {
  const province = VIETNAM_PROVINCES.find((p) => p.code === provinceCode);
  const district = province?.districts.find((d) => d.code === districtCode);
  return district?.wards || [];
};

export const getAllProvinces = (): Province[] => VIETNAM_PROVINCES;

export const getProvinceNames = (): string[] =>
  VIETNAM_PROVINCES.map((province) => province.name);

export const getDistrictNames = (provinceCode: string): string[] => {
  const districts = findDistrictsByProvince(provinceCode);
  return districts.map((district) => district.name);
};

export const getWardNames = (
  provinceCode: string,
  districtCode: string
): string[] => {
  const wards = findWardsByDistrict(provinceCode, districtCode);
  return wards.map((ward) => ward.name);
};
