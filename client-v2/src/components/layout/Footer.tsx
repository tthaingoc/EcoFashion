import React from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Leaf,
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">EcoFashion</span>
            </Link>
            <p className="text-gray-300 text-sm">
              Nền tảng thời trang bền vững hàng đầu Việt Nam, kết nối những
              người yêu thích thời trang với các nhà thiết kế và nhà cung cấp có
              trách nhiệm với môi trường.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/products"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link
                  to="/designers"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Nhà thiết kế
                </Link>
              </li>
              <li>
                <Link
                  to="/suppliers"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Nhà cung cấp
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link
                  to="/sustainability"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Phát triển bền vững
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/help"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Đổi trả hàng
                </Link>
              </li>
              <li>
                <Link
                  to="/size-guide"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Hướng dẫn size
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Câu hỏi thường gặp
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Liên hệ</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">
                  123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">1900 123 456</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">hello@ecofashion.vn</span>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2">Đăng ký nhận tin</h4>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-1 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-l-md focus:outline-none focus:border-green-500 text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-r-md transition-colors"
                >
                  Gửi
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="text-sm text-gray-400">
              © 2024 EcoFashion. Tất cả quyền được bảo lưu.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link
                to="/privacy"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Chính sách bảo mật
              </Link>
              <Link
                to="/terms"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Điều khoản sử dụng
              </Link>
              <Link
                to="/cookies"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Chính sách Cookie
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
