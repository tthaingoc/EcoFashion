import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";

import React, { useEffect, useState } from "react";
import { useAuth } from "../services/user/AuthContext";
import { useNavigate } from "react-router-dom";

export default function BusinessInfor() {
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");

    if (tab === "designer") setTabIndex(0);
    else if (tab === "supplier") setTabIndex(1);
  }, [location.search]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const { user } = useAuth();
  const navigate = useNavigate();
  const handleClick = (type: any) => {
    switch (type) {
      case "desginer":
        navigate("/apply/designer");
        break;
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ width: "80%", margin: "0 auto", paddingBottom: "30px" }}>
        <Box
          sx={{
            width: "100%",
            background: "rgba(241, 245, 249, 1)",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {/* Tabs */}
          <Tabs
            variant="fullWidth"
            value={tabIndex}
            onChange={handleChange}
            textColor="primary"
            sx={{
              width: "100%",
              margin: "auto",
            }}
          >
            <Tab
              label="Dành Cho Nhà Thiết Kế"
              sx={{
                "&.Mui-selected": {
                  color: "primary.main",
                  fontWeight: "bold",
                },
              }}
            />
            <Tab
              label="Dành Cho Nhà Cung Cấp"
              sx={{
                "&.Mui-selected": {
                  color: "primary.main",
                  fontWeight: "bold",
                },
              }}
            />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {tabIndex === 0 && (
          <Box sx={{ display: "flex" }}>
            <Box sx={{ px: 3, py: 4, width: "100%", mx: "auto" }}>
              {/* Header */}
              <Typography variant="h5" fontWeight="bold" mb={2}>
                Dành Cho Nhà Thiết Kế
              </Typography>

              <Box
                sx={{
                  backgroundColor: "#D1FADF",
                  borderRadius: 2,
                  p: 3,
                  mb: 4,
                }}
              >
                <Typography variant="h6" fontWeight="bold" mb={1}>
                  Thiết Kế Trang Phục Bền Vững Cùng Với EcoFashion
                </Typography>
                <Typography mb={2}>
                  Tham gia cộng đồng các nhà thiết kế thân thiện với môi trường
                  và giới thiệu sản phẩm thời trang từ vật liệu tái chế của bạn
                  đến mọi người.
                </Typography>
                {user?.role.toLocaleLowerCase() === "customer" && (
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: "#12B76A" }}
                    onClick={() => handleClick("desginer")}
                  >
                    Trở thành nhà thiết kế
                  </Button>
                )}
              </Box>

              {/* Benefits Section */}
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Lợi ích dành cho Nhà Thiết Kế
              </Typography>

              <Grid container spacing={2}>
                <Grid>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                        Tiếp Cận Nguồn Nguyên Liệu Tái Chế
                      </Typography>
                      <Typography variant="body2">
                        Kết nối trực tiếp với các nhà cung cấp nguyên liệu tái
                        chế chất lượng cao cho thiết kế thời trang bền vững của
                        bạn.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                        Thị Trường Trong Nước
                      </Typography>
                      <Typography variant="body2">
                        Trưng bày và bán các sản phẩm thời trang bền vững của
                        bạn đến khách hàng quan tâm đến môi trường trên toàn
                        nước.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                        Công Cụ Thiết Kế
                      </Typography>
                      <Typography variant="body2">
                        Sử dụng các công cụ chuyên dụng của chúng tôi để tạo và
                        trực quan hóa thiết kế của bạn với vật liệu tái chế.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                        Cộng Đồng Nhà Thiết Kế
                      </Typography>
                      <Typography variant="body2">
                        Kết nối với các nhà thiết kế cùng chí hướng, chia sẻ ý
                        tưởng và hợp tác trong các dự án thời trang bền vững.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                        Bán Hàng và Phát Triển
                      </Typography>
                      <Typography variant="body2">
                        Bắt đầu bán sản phẩm của bạn cho khách hàng quan tâm đến
                        môi trường và phát triển thương hiệu thời trang bền vững
                        của bạn.
                      </Typography>
                    </CardContent>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Hoa hồng:
                        <Typography variant="body2">
                          Nhận 5% hoa hồng trên mỗi đơn hàng thành công, giúp
                          bạn tăng thu nhập khi mở rộng kinh doanh.
                        </Typography>
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* How it Works */}
              <Typography variant="h6" fontWeight="bold" mt={5} mb={2}>
                Cách Thức Hoạt Động
              </Typography>

              <Grid container spacing={2}>
                {[
                  {
                    step: 1,
                    title: "Tạo Hồ Sơ Nhà Thiết Kế Của Bạn",
                    desc: "Đăng ký và tạo hồ sơ nhà thiết kế của bạn, giới thiệu chuyên môn và bộ sưu tập thời trang đến với cộng đồng.",
                  },
                  {
                    step: 2,
                    title: "Tìm Nguồn Nguyên Liệu Tái Chế",
                    desc: "Duyệt qua hệ sinh thái nguồn nguyên liệu thân thiện với môi trường hoặc kết nối với các nhà cung cấp để đặt hàng những loại vải phù hợp.",
                  },
                  {
                    step: 3,
                    title: "Tạo và Tải Lên Sản Phẩm",
                    desc: "Tải lên các thiết kế thời trang bền vững của bạn lên hệ thống để giới thiệu đến cộng đồng yêu thích thời trang bền vững.",
                  },
                  {
                    step: 4,
                    title: "Bán Hàng và Phát Triển",
                    desc: "Bán sản phẩm của bạn cho những khách hàng quan tâm đến môi trường và phát triển thương hiệu của bạn.",
                  },
                ].map((step, idx) => (
                  <Grid key={idx}>
                    <Card variant="outlined" sx={{ height: "100%" }}>
                      <CardContent>
                        <Typography
                          variant="h6"
                          color="primary"
                          fontWeight="bold"
                          mb={1}
                        >
                          {step.step}. {step.title}
                        </Typography>
                        <Typography variant="body2">{step.desc}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* CTA */}
              <Box
                mt={5}
                p={4}
                sx={{
                  textAlign: "center",
                  backgroundColor: "#D1FADF",
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Sẵn Sàng Tham Gia EcoFashion
                </Typography>
                <Typography mb={2}>
                  Bắt đầu hành trình trở thành nhà thiết kế thời trang bền vững
                  của bạn ngay hôm nay.
                </Typography>
                {user?.role.toLocaleLowerCase() === "customer" && (
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: "#12B76A" }}
                    onClick={() => handleClick("desginer")}
                  >
                    Trở thành nhà thiết kế
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        )}
        {tabIndex === 1 && (
          <Box sx={{ width: "100%" }}>
            <Box sx={{ display: "flex" }}>
              <Box sx={{ px: 3, py: 4, width: "100%", mx: "auto" }}>
                {/* Header */}

                <Typography variant="h5" fontWeight="bold" mb={2}>
                  Dành Cho Nhà Cung Cấp
                </Typography>

                <Box
                  sx={{
                    backgroundColor: " #2563eb",
                    borderRadius: 2,
                    p: 3,
                    mb: 4,
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    mb={1}
                    color="white"
                  >
                    Cung Cấp Vật Liệu Chất Lượng Thân Thiện Với Môi Trường
                  </Typography>
                  <Typography mb={2} color="white">
                    Tham gia nền tảng của chúng tôi để giới thiệu và bán các vật
                    liệu tái chế của bạn đến các nhà thiết kế thời trang thân
                    thiện với môi trường trên toàn thế giới.
                  </Typography>
                  {user?.role.toLocaleLowerCase() === "customer" && (
                    <Button
                      variant="contained"
                      sx={{ backgroundColor: "white", color: "#2563eb" }}
                    >
                      Trở thành nhà cung cấp
                    </Button>
                  )}
                </Box>

                {/* Benefits Section */}
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Lợi ích dành cho Nhà Cung Cấp
                </Typography>

                <Grid container spacing={2}>
                  <Grid>
                    <Card variant="outlined" sx={{ height: "100%" }}>
                      <CardContent>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          mb={1}
                        >
                          Tiếp Cận Trực Tiếp
                        </Typography>
                        <Typography variant="body2">
                          Kết nối trực tiếp với khách hàng trang đang tìm kiếm
                          vật liệu bền vững và tái chế.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid>
                    <Card variant="outlined" sx={{ height: "100%" }}>
                      <CardContent>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          mb={1}
                        >
                          Trưng Bày Vật Liệu
                        </Typography>
                        <Typography variant="body2">
                          Giới thiệu các vật liệu tái chế của bạn với thông số
                          kỹ thuật chi tiết và chỉ số bền vững.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid>
                    <Card variant="outlined" sx={{ height: "100%" }}>
                      <CardContent>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          mb={1}
                        >
                          Tác Động Bền Vững
                        </Typography>
                        <Typography variant="body2">
                          Theo dõi và trình bày tác động môi trường của các vật
                          liệu tái chế của bạn.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid>
                    <Card variant="outlined" sx={{ height: "100%" }}>
                      <CardContent>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          mb={1}
                        >
                          Bán Hàng và Phát Triển
                        </Typography>
                        <Typography variant="body2">
                          Bắt đầu bán sản phẩm của bạn cho khách hàng quan tâm
                          đến môi trường và phát triển thương hiệu thời trang
                          bền vững của bạn.
                        </Typography>
                      </CardContent>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Hoa hồng:
                          <Typography variant="body2">
                            Nhận 5% hoa hồng trên mỗi đơn hàng thành công, giúp
                            bạn tăng thu nhập khi mở rộng kinh doanh.
                          </Typography>
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* How it Works */}
                <Typography variant="h6" fontWeight="bold" mt={5} mb={2}>
                  Cách Thức Hoạt Động
                </Typography>

                <Grid container spacing={2}>
                  {[
                    {
                      step: 1,
                      title: "Tạo Hồ Sơ Nhà Cung Cấp Của Bạn",
                      desc: "Đăng ký và tạo hồ sơ nhà cung cấp, giới thiệu các vật liệu tái chế và các hoạt động bền vững của bạn.",
                    },
                    {
                      step: 2,
                      title: "Đăng Tải Vật Liệu Của Bạn",
                      desc: "Thêm các vật liệu tái chế của bạn vào chợ trực tuyến với thông số kỹ thuật chi tiết, giá cả và tình trạng sẵn có.",
                    },
                    {
                      step: 3,
                      title: "Kết Nối Với Khách Hàng",
                      desc: "Nhận các yêu cầu và đơn hàng từ khách hàng quan tâm đến vật liệu tái chế của bạn.",
                    },
                    {
                      step: 4,
                      title: "Phát Triển Doanh Nghiệp Của Bạn",
                      desc: "Mở rộng kinh doanh vật liệu tái chế bằng cách kết nối với nhiều nhà thiết kế hơn và theo dõi tác động của bạn.",
                    },
                  ].map((step, idx) => (
                    <Grid key={idx}>
                      <Card variant="outlined" sx={{ height: "100%" }}>
                        <CardContent>
                          <Typography
                            variant="h6"
                            color="primary"
                            fontWeight="bold"
                            mb={1}
                          >
                            {step.step}. {step.title}
                          </Typography>
                          <Typography variant="body2">{step.desc}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {/* CTA */}

                <Box
                  mt={5}
                  p={4}
                  sx={{
                    textAlign: "center",
                    backgroundColor: "#D1FADF",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    Sẵn Sàng Tham Gia EcoFashion
                  </Typography>
                  <Typography mb={2}>
                    Bắt đầu kết nối với những khách hàng tiềm năng bền vững ngay
                    hôm nay.
                  </Typography>
                  {user?.role.toLocaleLowerCase() === "customer" && (
                    <Button
                      variant="contained"
                      sx={{ backgroundColor: "#12B76A" }}
                    >
                      Trở thành nhà cung cấp
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
