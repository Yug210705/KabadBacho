import React, { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, History, Wallet, User, LogOut, X, Menu } from "lucide-react";
import BookPickup from '../../pages/BookPickup';

const UserLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBookOpen, setIsBookOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
    { icon: History, label: "Track Pickups", path: "/dashboard/pickup" },
    { icon: Wallet, label: "Service", path: "/dashboard/UserService" },
    { icon: User, label: "Profile Settings", path: "/dashboard/setting" },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    // Clear authentication token from localStorage
    localStorage.removeItem('token');
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#F1F8E9]">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-md z-40 flex items-center px-4 lg:px-6">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="ml-4 flex items-center">
          <img src="/KabadBecho2.jpg" className="h-12" />
          <span className="ml-3 text-xl font-bold text-[#66BB6A]">User Dashboard</span>
        </div>

        <div className="ml-auto flex gap-4 items-center">
          <button
            onClick={() => setIsBookOpen(true)}
            className="px-6 py-2 bg-[#66BB6A] text-white font-semibold rounded-full hover:bg-[#4CAF50] transition-all duration-300 shadow-md flex items-center justify-center"
          >
            Book pickup
          </button>
          <button
            onClick={handleLogout}
            className="flex gap-2 px-4 py-2 bg-[#5D4037] text-white rounded-lg hover:bg-[#4E362E]"
          >
            <LogOut size={18} /> Logout
          </button>
          
        </div>
      </header>

      {/* SIDEBAR */}
      <aside
        className={`fixed top-16 bottom-0 left-0 bg-white shadow-xl transition-all z-30 ${
          isSidebarOpen ? "w-64" : "w-0 -translate-x-full lg:translate-x-0 lg:w-20"
        }`}
      >
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
               <Link
                              key={item.path}
                              to={item.path}
                              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                active
                                  ? 'bg-[#E8F5E9] text-[#66BB6A] font-semibold shadow-sm'
                                  : 'text-[#5D4037] hover:bg-[#FAFAFA]'
                              }`}
                            >
                              <Icon size={20} className={active ? 'text-[#66BB6A]' : 'text-[#5D4037] opacity-70'} />
                              <span className={`${isSidebarOpen ? 'block' : 'hidden lg:hidden'}`}>
                                {item.label}
                              </span>
                            </Link>
            );
          })}
        </nav>
      </aside>

      {/* MAIN AREA + CHILD ROUTES */}
      <main className={`pt-16 transition-all ${isSidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
      <BookPickup isOpen={isBookOpen} onClose={() => setIsBookOpen(false)} />
      
    </div>
  );
};

export default UserLayout;
