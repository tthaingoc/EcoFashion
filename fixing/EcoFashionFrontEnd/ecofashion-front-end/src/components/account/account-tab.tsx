import { useEffect, useState } from 'react'
import OrdersList from '../orders/OrdersList'
import { Link } from 'react-router-dom'

export default function AccountTab() {
    const [current , setCurrent] = useState<string>('')
    const [activeTab, setActiveTab] = useState<string>('profile')

    useEffect(()=>{
        setCurrent(window.location.pathname)
        // Nếu pathname là /order-history thì set tab
        if(window.location.pathname === '/order-history') setActiveTab('orders')
        else setActiveTab('profile')
    },[])


  return (
        <div className="flex gap-8">
                  <ul className="divide-y dark:divide-paragraph text-title dark:text-white text-base sm:text-lg lg:text-xl flex flex-col justify-center leading-none min-w-[220px]">
                          <li className={` py-3 lg:py-6 pl-6 lg:pl-12 ${activeTab === 'profile' && (current === '/supplier/profile' || current === '/designer/profile') ? 'active text-primary' :''}`}>
                                  <Link className="duration-300 hover:text-primary" to={current.includes('designer') ? "/designer/profile" : "/supplier/profile"} onClick={()=>setActiveTab('profile')}>Trang Cá Nhân</Link>
                          </li>
                          <li className={`py-3 lg:py-6 pl-6 lg:pl-12 ${activeTab === 'profile' && (current === '/supplier/detailed-profile' || current === '/designer/detailed-profile') ? 'active text-primary' :''}`}>
                                  <Link className="duration-300 hover:text-primary" to={current.includes('designer') ? "/designer/detailed-profile" : "/supplier/detailed-profile"} onClick={()=>setActiveTab('profile')}>Thông tin chi tiết</Link>
                          </li>
                          <li className={`py-3 lg:py-6 pl-6 lg:pl-12 ${activeTab === 'profile' && current === '/edit-account' ? 'active text-primary' :''}`}>
                                  <Link className="duration-300 hover:text-primary" to="/edit-account" onClick={()=>setActiveTab('profile')}>Chỉnh sửa tài khoản</Link>
                          </li>        
                                  <li className={`py-3 lg:py-6 pl-6 lg:pl-12 ${current === '/orders' ? 'active text-primary' :''}`}>
                                          <Link className="duration-300 hover:text-primary" to="/orders">Lịch sử đặt hàng</Link>
                                  </li>
                          <li className={`py-3 lg:py-6 pl-6 lg:pl-12 ${activeTab === 'profile' && current === '/wishlist' ? 'active text-primary' :''}`}>
                                  <Link className="duration-300 hover:text-primary" to="/wishlist" onClick={()=>setActiveTab('profile')}>Wishlist</Link>
                          </li>
                          <li className={`py-3 lg:py-6 pl-6 lg:pl-12 ${activeTab === 'profile' && current === '/login' ? 'active text-primary' :''}`}>
                                  <Link className="duration-300 hover:text-primary" to="/login" onClick={()=>setActiveTab('profile')}>Logout</Link>
                          </li>
                  </ul>
            <div className="flex-1">
                {activeTab === 'orders' ? (
                    <OrdersList />
                ) : (
                    <div className="p-6"> {/* Nội dung trang cá nhân hoặc các tab khác */} </div>
                )}
            </div>
        </div>
    )
}
