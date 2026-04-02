import React, { useState, useEffect } from 'react';
import { 
  Menu, X, LayoutDashboard, Users, Briefcase, DollarSign, 
  MessageSquare, Settings, ClipboardList, LogOut 
} from 'lucide-react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [adminProfile, setAdminProfile] = useState({ 
    name: auth.currentUser?.displayName || 'Admin User', 
    email: auth.currentUser?.email || 'admin@kabadibecho.com' 
  });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAdminProfile({
          name: user.displayName || 'Admin User',
          email: user.email || 'admin@portal.com'
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Analytics & Reports', 
      path: '/admin/analytics' 
    },
    { 
      icon: ClipboardList, 
      label: 'User Requests', 
      path: '/admin/requests' 
    },
    { 
      icon: Users, 
      label: 'User Management', 
      path: '/admin/users' 
    },
    { 
      icon: DollarSign, 
      label: 'Payments & Pricing', 
      path: '/admin/payments' 
    },
    { 
      icon: MessageSquare, 
      label: 'Complaints & Support', 
      path: '/admin/complaints' 
    },
    
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    // Clear authentication token from localStorage
    localStorage.removeItem('token');
    auth.signOut(); // Ensure Firebase signout
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#F1F8E9]">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-md z-40 flex items-center px-4 lg:px-6">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <div className="flex items-center ml-4">
          <img src="/KabadBecho2.jpg" alt="Kabad Becho" className="h-12" />
          <span className="ml-3 text-xl font-bold text-[#66BB6A]">Admin Dashboard</span>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-[#5D4037]">{adminProfile.name}</p>
            <p className="text-xs text-gray-500">{adminProfile.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-[#5D4037] text-white rounded-lg hover:bg-[#4e362e] transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 bg-white shadow-xl transition-all duration-300 z-30 ${
          isSidebarOpen ? 'w-64' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-20'
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

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300 ${
          isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
