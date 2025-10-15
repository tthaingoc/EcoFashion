import { Link } from "react-router-dom";
import { useEffect } from "react";
import bg from "../../assets/pictures/homepage/banner.jpg";
import logo2 from "../../assets/pictures/homepage/logo2.png";
import AccountTab from "../../components/account/account-tab";
import ScrollToTop from "../../components/scroll-to-top";
import { LuMail, LuPhoneCall, LuUser } from "react-icons/lu";
import Aos from "aos";
import { useAuthStore } from "../../store/authStore";

export default function CustomerProfile() {
  const { user } = useAuthStore();

  useEffect(() => {
    Aos.init();
  }, []);

  // Xác định banner và avatar
  const bannerUrl = bg;
  const avatarUrl =
    user?.avatarUrl && user.avatarUrl.trim()
      ? user.avatarUrl
      : logo2;

  // Thông tin hiển thị từ user
  const displayName = user?.fullName || user?.username || "Khách hàng";
  const displayEmail = user?.email || "Chưa cập nhật";
  const displayPhone = user?.phone || "Chưa cập nhật";
  const displayUsername = user?.username || "Chưa cập nhật";

  return (
    <>
      <div
        className="flex items-center gap-4 flex-wrap bg-overlay p-14 sm:p-16 before:bg-title before:bg-opacity-70"
        style={{ backgroundImage: `url(${bannerUrl})` }}
      >
        <div className="text-center w-full flex flex-col items-center">
          {/* Avatar */}
          <img
            src={avatarUrl}
            alt="Avatar"
            className="rounded-full w-24 h-24 object-cover border-4 border-white mb-4 shadow-lg"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = logo2;
            }}
          />
          <h2 className="text-white text-8 md:text-[40px] font-normal leading-none text-center">
            Hồ Sơ Của Tôi
          </h2>
          <ul className="flex items-center justify-center gap-[10px] text-base md:text-lg leading-none font-normal text-white mt-3 md:mt-4">
            <li>
              <Link to="/">Trang chủ</Link>
            </li>
            <li>/</li>
            <li className="text-primary">Hồ sơ cá nhân</li>
          </ul>
        </div>
      </div>

      <div className="s-py-100">
        <div className="container-fluid">
          <div className="max-w-[1720px] mx-auto flex items-start gap-8 md:gap-12 2xl:gap-24 flex-col md:flex-row my-profile-navtab">
            <div
              className="w-full md:w-[200px] lg:w-[300px] flex-none"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <AccountTab />
            </div>
            <div className="w-full md:w-auto md:flex-1 overflow-auto">
              <div className="w-full max-w-[951px] bg-[#F8F8F9] dark:bg-dark-secondary p-5 sm:p-8 lg:p-[50px]">
                <div
                  data-aos="fade-up"
                  data-aos-delay="200"
                  className="flex items-center gap-4"
                >
                  {/* Avatar nhỏ trước tên */}
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="rounded-full w-12 h-12 object-cover border-2 border-gray-300 shadow"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = logo2;
                    }}
                  />
                  <h3 className="font-semibold leading-none">{displayName}</h3>
                </div>
                <span className="leading-none mt-3 block text-gray-600 dark:text-gray-400">
                  Thông tin khách hàng
                </span>
                <div
                  className="mt-5 sm:mt-8 md:mt-10 grid gap-4 sm:gap-6"
                  data-aos="fade-up"
                  data-aos-delay="400"
                >
                  {displayUsername !== "Chưa cập nhật" && (
                    <div className="flex items-center gap-2">
                      <LuUser className="text-primary size-5" />
                      <span className="leading-none font-medium text-base sm:text-lg">
                        {displayUsername}
                      </span>
                    </div>
                  )}
                  {displayEmail !== "Chưa cập nhật" && (
                    <div className="flex items-center gap-2">
                      <LuMail className="text-primary size-5" />
                      <span className="leading-none font-medium text-base sm:text-lg">
                        {displayEmail}
                      </span>
                    </div>
                  )}
                  {displayPhone !== "Chưa cập nhật" && (
                    <div className="flex items-center gap-2">
                      <LuPhoneCall className="text-primary size-5" />
                      <span className="leading-none font-medium text-base sm:text-lg">
                        {displayPhone}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ScrollToTop />
    </>
  );
}
