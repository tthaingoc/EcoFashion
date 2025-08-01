import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { SupplierService, type SupplierModel } from "../../services/api/supplierService";
import NavbarOne from "../../components/navbar/navbar-one";
import bg from '../../assets/pictures/homepage/banner.jpg'
import AccountTab from "../../components/account/account-tab";
import ScrollToTop from "../../components/scroll-to-top";
import { LuMail, LuMapPin, LuPhoneCall } from "react-icons/lu";
import Aos from "aos";

export default function MyProfile() {
  const [supplier, setSupplier] = useState<SupplierModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Aos.init();
    const fetchSupplier = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await SupplierService.getSupplierProfile();
        setSupplier(data);
      } catch (err: any) {
        setError(err.message || "Không thể tải thông tin nhà cung cấp.");
      } finally {
        setLoading(false);
      }
    };
    fetchSupplier();
  }, []);

  // Xác định banner và avatar
  const bannerUrl = supplier?.bannerUrl && supplier.bannerUrl.trim() ? supplier.bannerUrl : bg;
  const avatarUrl = supplier?.avatarUrl && supplier.avatarUrl.trim() ? supplier.avatarUrl : "/assets/default-avatar.png";

  return (
    <>
      <NavbarOne/>
      <div className="flex items-center gap-4 flex-wrap bg-overlay p-14 sm:p-16 before:bg-title before:bg-opacity-70" style={{backgroundImage:`url(${bannerUrl})`}}>
        <div className="text-center w-full flex flex-col items-center">
          {/* Avatar */}
          <img
            src={avatarUrl}
            alt="Avatar"
            className="rounded-full w-24 h-24 object-cover border-4 border-white mb-4 shadow-lg"
            onError={e => { (e.currentTarget as HTMLImageElement).src = "/assets/default-avatar.png"; }}
          />
          <h2 className="text-white text-8 md:text-[40px] font-normal leading-none text-center">My Profile</h2>
          <ul className="flex items-center justify-center gap-[10px] text-base md:text-lg leading-none font-normal text-white mt-3 md:mt-4">
            <li><Link to="/">Trang chủ</Link></li>
            <li>/</li>
            <li className="text-primary">Trang cá nhân</li>
          </ul>
        </div>
      </div>

      <div className="s-py-100">
        <div className="container-fluid">
          <div className="max-w-[1720px] mx-auto flex items-start gap-8 md:gap-12 2xl:gap-24 flex-col md:flex-row my-profile-navtab">
            <div className="w-full md:w-[200px] lg:w-[300px] flex-none" data-aos="fade-up" data-aos-delay="100">
              <AccountTab/>
            </div>
            <div className="w-full md:w-auto md:flex-1 overflow-auto">
              <div className="w-full max-w-[951px] bg-[#F8F8F9] dark:bg-dark-secondary p-5 sm:p-8 lg:p-[50px]">
                {loading ? (
                  <div className="text-center py-10">Đang tải thông tin...</div>
                ) : error ? (
                  <div className="text-center text-red-500 py-10">{error}</div>
                ) : (
                  <>
                    <div data-aos="fade-up" data-aos-delay="200" className="flex items-center gap-4">
                      {/* Avatar nhỏ trước tên */}
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="rounded-full w-12 h-12 object-cover border-2 border-gray-300 shadow"
                        onError={e => { (e.currentTarget as HTMLImageElement).src = "/assets/default-avatar.png"; }}
                      />
                      <h3 className="font-semibold leading-none">
                        {supplier?.supplierName || supplier?.user?.fullName || "Nhà cung cấp"}
                      </h3>
                    </div>
                    <span className="leading-none mt-3 block">
                      {supplier?.bio || "Nhà cung cấp chuyên nghiệp"}
                    </span>
                    <div className="mt-5 sm:mt-8 md:mt-10 grid gap-4 sm:gap-6" data-aos="fade-up" data-aos-delay="400">
                      {supplier?.phoneNumber && (
                        <div className="flex items-center gap-2">
                          <LuPhoneCall className="text-primary size-5"/>
                          <span className="leading-none font-medium text-base sm:text-lg">{supplier.phoneNumber}</span>
                        </div>
                      )}
                      {supplier?.email && (
                        <div className="flex items-center gap-2">
                          <LuMail className="text-primary size-5"/>
                          <span className="leading-none font-medium text-base sm:text-lg">{supplier.email}</span>
                        </div>
                      )}
                      {supplier?.address && (
                        <div className="flex items-center gap-2">
                          <LuMapPin className="text-primary size-5"/>
                          <span className="leading-none font-medium text-base sm:text-lg">{supplier.address}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ScrollToTop/>
    </>
  )
}

