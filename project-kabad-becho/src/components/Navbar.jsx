import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';
import BookPickup from '../pages/BookPickup';


const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [authRedirectPath, setAuthRedirectPath] = useState('/dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
    };
    
    checkAuth();
    // Listen for storage changes (in case user logs in/out in another tab)
    window.addEventListener('storage', checkAuth);
    // Also check periodically or on route changes
    const interval = setInterval(checkAuth, 1000);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      clearInterval(interval);
    };
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setShowProfileMenu(false);
    setIsMenuOpen(false);
    navigate('/');
  };

  // Helper function to generate clean paths
  const getPath = (item) => {
    if (item === 'Home') return '/';
    if (item === 'About Us') return '/about';
    if (item === 'Contact Us') return '/contact';
    return `/${item.toLowerCase()}`;
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  return (
    <>
      <nav
        className={`fixed w-full top-0 z-50 transition-all duration-500 ${scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-xl py-3'
          : 'bg-white py-5'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between relative">
            {/* Logo - Wrapped in Link to go Home */}
            <Link to="/" className="flex items-center cursor-pointer">
              <img
                src="KabadBecho2.jpg"
                alt="Kabad Becho"
                className={`transition-all duration-500 ${scrolled ? 'h-14' : 'h-16 sm:h-20'
                  }`}
              />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center space-x-2">
              {['Home', 'About Us', 'Services','Contact Us'].map((item) => (
                <Link
                  key={item}
                  to={getPath(item)}
                  className={`px-5 py-2 font-semibold text-base transition-all duration-300 relative group ${location.pathname === getPath(item) ? 'text-[#66BB6A]' : 'text-[#5D4037]'
                    } hover:text-[#66BB6A]`}
                >
                  {item}
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-[#66BB6A] transition-all duration-300 rounded-full ${location.pathname === getPath(item) ? 'w-3/4' : 'w-0 group-hover:w-3/4'
                    }`}></span>
                </Link>
              ))}
            </div>

            {/* Auth Buttons - Desktop */}
            <div className="hidden lg:flex items-center space-x-4">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                      setAuthRedirectPath('/dashboard');
                      setIsAuthModalOpen(true);
                    }}
                    className="px-5 py-2 font-semibold text-[#5D4037] hover:text-[#66BB6A] transition-all duration-300"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setAuthRedirectPath('/dashboard');
                      setIsAuthModalOpen(true);
                    }}
                    className="px-6 py-2 bg-[#66BB6A] text-white font-semibold rounded-full hover:bg-[#4CAF50] transition-al\l duration-300 shadow-md flex items-center justify-center"
                  >
                    Book pickup
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsBookOpen(true)}
                    className="px-6 py-2 bg-[#66BB6A] text-white font-semibold rounded-full hover:bg-[#4CAF50] transition-all duration-300 shadow-md flex items-center justify-center"
                  >
                    Book pickup
                  </button>
                  
                  {/* Profile Dropdown */}
                  <div className="relative profile-menu-container">
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center space-x-2 px-4 py-2 bg-[#E8F5E9] text-[#2E7D32] font-semibold rounded-full hover:bg-[#C8E6C9] transition-all duration-300"
                    >
                      <div className="w-8 h-8 bg-[#66BB6A] rounded-full flex items-center justify-center text-white">
                        <User size={18} />
                      </div>
                      <span className="text-sm">Account</span>
                      <ChevronDown size={16} className={`transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {showProfileMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fadeIn">
                        <div className="p-4 bg-gradient-to-br from-[#E8F5E9] to-white border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-[#66BB6A] rounded-full flex items-center justify-center text-white">
                              <User size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-[#2E7D32] text-sm">Logged In</p>
                              <p className="text-xs text-gray-600">demo@example.com</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-2">
                          <Link
                            to="/dashboard"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-[#E8F5E9] rounded-lg transition-colors"
                          >
                            <User size={16} />
                            <span className="text-sm font-medium">Dashboard</span>
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <LogOut size={16} />
                            <span className="text-sm font-medium">Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-[#5D4037]">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`lg:hidden overflow-hidden transition-all duration-500 ${isMenuOpen ? 'max-h-[500px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
            <div className="pb-4 space-y-2">
              {['Home', 'About Us', 'Services','Contact Us'].map((item) => (
                <Link
                  key={item}
                  to={getPath(item)}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block w-full text-left px-4 py-3 font-semibold rounded-lg transition-colors ${location.pathname === getPath(item)
                    ? 'bg-[#E8F5E9] text-[#66BB6A]'
                    : 'text-[#5D4037] hover:bg-[#E8F5E9]'
                    }`}
                >
                  {item}
                </Link>
              ))}
              
              <div className="pt-4 space-y-2">
                {!isAuthenticated ? (
                  <>
                    <button
                      onClick={() => { 
                        setAuthRedirectPath('/dashboard');
                        setIsAuthModalOpen(true); 
                        setIsMenuOpen(false); 
                      }}
                      className="w-full px-4 py-3 font-semibold text-[#5D4037] border border-[#66BB6A] rounded-lg hover:bg-[#E8F5E9] transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        setAuthRedirectPath('/book-pickup');
                        setIsAuthModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full block text-center px-4 py-3 bg-[#66BB6A] text-white font-semibold rounded-lg hover:bg-[#5CA960] transition-colors"
                    >
                      Book pickup
                    </button>
                  </>
                ) : (
                  <>
                    {/* Logged In Status */}
                    <div className="px-4 py-3 bg-[#E8F5E9] rounded-lg border border-[#C8E6C9]">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#66BB6A] rounded-full flex items-center justify-center text-white">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-[#2E7D32] text-sm">Logged In</p>
                          <p className="text-xs text-gray-600">demo@example.com</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => { setIsMenuOpen(false); setIsBookOpen(true); }}
                      className="w-full block text-center px-4 py-3 bg-[#66BB6A] text-white font-semibold rounded-lg hover:bg-[#5CA960] transition-colors"
                    >
                      Book pickup
                    </button>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-[#5D4037] border border-[#66BB6A] rounded-lg hover:bg-[#E8F5E9] transition-colors font-semibold"
                    >
                      <User size={18} />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors font-semibold"
                    >
                      <LogOut size={18} />
                      <span>Sign Out</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal Component */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        redirectPath={authRedirectPath}
      />

      <BookPickup isOpen={isBookOpen} onClose={() => setIsBookOpen(false)} />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Navbar;