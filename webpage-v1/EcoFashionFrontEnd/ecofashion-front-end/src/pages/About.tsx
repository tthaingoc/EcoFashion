import { Box, Typography, Paper, Avatar, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Typewriter from "typewriter-effect";

const teamMembers = [
  {
    name: "Tài",
    role: "Leader",
    avatar: "https://via.placeholder.com/100",
  },
  {
    name: "Vinh",
    role: "Member",
    avatar: "https://via.placeholder.com/100",
  },
  {
    name: "Tuấn",
    role: "Member",
    avatar: "https://via.placeholder.com/100",
  },
  {
    name: "Năng",
    role: "Member",
    avatar: "https://via.placeholder.com/100",
  },
];

function AboutPage() {
  window.scrollTo(0, 0);
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        padding: 4,
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: 2,
        minHeight: "100vh",
      }}
    >
      {/* Title Section */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          marginBottom: 2,
          color: "#333",
          textAlign: "center",
        }}
      >
        Về Chúng Tôi
      </Typography>

      {/* Typing Animation with Custom Color */}
      <Typography variant="h6" sx={{ marginBottom: 2, textAlign: "center" }}>
        <span style={{ color: "#00796b", fontWeight: "bold" }}>
          <Typewriter
            options={{
              strings: [
                "Chúng tôi mang đến phong cách thời trang bền vững vào từng thiết kế cao cấp, kèm hướng dẫn chăm sóc tận tâm.",
              ],
              autoStart: true,
              loop: true,
              delay: 50,
              deleteSpeed: 50,
            }}
          />
        </span>
      </Typography>
      {/* Our History Card */}
      <Paper
        elevation={3}
        sx={{
          marginTop: 4,
          padding: 3,
          backgroundColor: "#ffffff",
          borderRadius: "8px",
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", marginBottom: 2, color: "#00796b" }}
        >
          Lịch Sử
        </Typography>
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.6 }}>
          Được thành lập vào năm 2025, EcoFashion bắt đầu như một nhóm nhỏ với
          sứ mệnh chia sẻ niềm đam mê thời trang bền vững. Qua những năm, chúng
          tôi đã mở rộng bộ sưu tập và hiện phục vụ khách hàng trên toàn cầu.
          Cam kết về chất lượng và sự hài lòng của khách hàng vẫn luôn là trọng
          tâm trong mọi hoạt động của chúng tôi.
        </Typography>
      </Paper>

      {/* Our Values Card */}
      <Paper
        elevation={3}
        sx={{
          marginTop: 4,
          padding: 3,
          backgroundColor: "#ffffff",
          borderRadius: "8px",
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", marginBottom: 2, color: "#00796b" }}
        >
          Giá Trị Cốt Lõi
        </Typography>
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.6 }}>
          Chúng tôi tôn trọng những giá trị sau, định hướng mọi hoạt động của
          mình:
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 1 }}>
          <strong>Chất Lượng:</strong> Chúng tôi đảm bảo chất lượng cao nhất
          trong mọi thiết kế và vật liệu cung cấp.
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 1 }}>
          <strong>Bền Vững:</strong> Chúng tôi áp dụng các phương pháp thân
          thiện với môi trường trong hoạt động của mình.
        </Typography>
        <Typography variant="body1">
          <strong>Cộng Đồng:</strong> Chúng tôi tin vào việc xây dựng một cộng
          đồng yêu thời trang bền vững thông qua sự tương tác và giáo dục.
        </Typography>
      </Paper>

      {/* Team Section */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: "bold",
          marginTop: 4,
          marginBottom: 2,
          color: "#444",
          textDecoration: "underline",
        }}
      >
        Gặp Gỡ Đội Ngũ Của Chúng Tôi
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 4,
          justifyContent: "center",
        }}
      >
        {teamMembers.map((member) => (
          <Box key={member.name}>
            <Paper
              elevation={4}
              sx={{
                padding: 2,
                textAlign: "center",
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: 10,
                  backgroundColor: "#e0f7fa",
                },
              }}
            >
              <Avatar
                alt={member.name}
                src={member.avatar}
                sx={{
                  width: 100,
                  height: 100,
                  margin: "0 auto",
                  border: "2px solid #90caf9",
                  boxShadow: 1,
                }}
              />
              <Typography
                variant="h6"
                sx={{ marginTop: 2, color: "#333", fontWeight: "bold" }}
              >
                {member.name}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ fontStyle: "italic", color: "#555" }}
              >
                {member.role}
              </Typography>
            </Paper>
          </Box>
        ))}
      </Box>

      {/* Mission Statement Section */}
      <Box
        sx={{
          marginTop: 4,
          backgroundColor: "#e0f7fa",
          borderRadius: "8px",
          padding: 2,
          boxShadow: 1,
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", marginBottom: 2, color: "#00796b" }}
        >
          Sứ Mệnh Của Chúng Tôi
        </Typography>
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.6 }}>
          Sứ mệnh của chúng tôi là xây dựng một cộng đồng trân trọng vẻ đẹp của
          các thiết kế thời trang sinh thái và cung cấp cho họ những nguồn lực
          cần thiết để phát triển. Chúng tôi luôn nỗ lực trở thành điểm đến tin
          cậy cho mọi thông tin về thiết kế và vật liệu thời trang bền vững.
        </Typography>
      </Box>
    </Box>
  );
}

export default AboutPage;
