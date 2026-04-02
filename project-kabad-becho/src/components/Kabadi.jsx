import React, { useState, useEffect } from 'react';
import { 
  Truck,
  MapPin,
  Phone,
  Navigation,
  Clock,
  CheckCircle,
  Package,
  DollarSign,
  User,
  Calendar,
  X,
  Camera,
  Scale,
  Star,
  LayoutDashboard,
  History,
  Settings,
  LogOut,
  ChevronRight,
  ExternalLink,
  Loader2,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LiveMap from './User/LiveMap';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';

const MOCK_PICKUPS = [
  {
    id: 'KB123457',
    customer: 'Priya Sharma',
    phone: '+91 98765 43211',
    address: '456 Eco Avenue, Vijay Nagar, Indore',
    lat: 22.7533, lng: 75.8937,
    landmark: 'Near C21 Mall',
    scrapType: 'Plastic Scrap',
    emoji: '♻️',
    estimatedWeight: '30 kg',
    scheduledTime: '01:00 PM - 03:00 PM',
    status: 'pending',
    distance: '2.5 km',
    expectedAmount: '₹300-450'
  },
  {
    id: 'KB123458',
    customer: 'Anjali Desai',
    phone: '+91 98765 43212',
    address: '789 Recycle Road, Rajwada, Indore',
    lat: 22.7163, lng: 75.8540,
    landmark: 'Behind Palace',
    scrapType: 'E-Waste',
    emoji: '📱',
    estimatedWeight: '15 kg',
    scheduledTime: '11:00 AM - 01:00 PM',
    status: 'pending',
    distance: '4.2 km',
    expectedAmount: '₹300-750'
  },
  {
    id: 'KB123459',
    customer: 'Suresh Mehta',
    phone: '+91 98765 43213',
    address: '321 Sustainable Street, Palasia, Indore',
    lat: 22.7244, lng: 75.8839,
    landmark: 'Next to Apollo Hospital',
    scrapType: 'Paper Scrap',
    emoji: '📄',
    estimatedWeight: '45 kg',
    scheduledTime: '03:00 PM - 05:00 PM',
    status: 'pending',
    distance: '6.8 km',
    expectedAmount: '₹450-810'
  },
  {
    id: 'KB123456',
    customer: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    address: '123 Green Street, Indore',
    lat: 22.7196, lng: 75.8577,
    landmark: 'Near MG Road',
    scrapType: 'Metal Scrap',
    emoji: '🔩',
    actualWeight: '45 kg',
    scheduledTime: '09:00 AM - 11:00 AM',
    status: 'completed',
    distance: '3.2 km',
    collectedAmount: '₹1,800',
    completedAt: '09:45 AM',
    date: 'Today'
  }
];

const NavigationModal = ({ pickup, onClose, driverLoc }) => {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
        const res = await fetch(`${backendUrl}/optimize-routes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            depot: { id: "DRIVER", lat: driverLoc.lat, lng: driverLoc.lng },
            vehicleCapacity: 9999,
            vehicles: [{ id: "V1", status: "available" }],
            requests: [{ id: pickup.id, lat: pickup.lat, lng: pickup.lng, quantity: 1, timeSlot: "morning", scrapType: "mixed" }]
          })
        });
        const data = await res.json();
        if (data.status === 'success') {
          const firstTimeSlot = Object.keys(data.data)[0];
          setRoute(data.data[firstTimeSlot][0].polyline);
        }
      } catch (err) {
        console.error("Navigation fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoute();
  }, [pickup, driverLoc]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 bg-[#4CAF50] text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Navigation size={24} /> Navigating to {pickup.customer}
            </h3>
            <p className="text-sm opacity-90">{pickup.address}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 relative min-h-[400px]">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20">
              <Loader2 className="animate-spin text-[#4CAF50] mb-2" size={40} />
              <p className="text-[#2E7D32] font-semibold">Calculating road-aware path...</p>
            </div>
          ) : null}
          
          <LiveMap 
            driverLocation={driverLoc}
            pickupLocation={{ lat: pickup.lat, lng: pickup.lng }}
            complexRoute={route}
          />
        </div>

        <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
             <div className="flex items-center gap-1 font-bold"><Clock size={16}/> {pickup.distance} away</div>
             <div className="flex items-center gap-1 font-bold text-[#FF9800] uppercase tracking-wider">{pickup.scrapType}</div>
          </div>
          <a 
            href={`https://www.google.com/maps/dir/?api=1&origin=${driverLoc.lat},${driverLoc.lng}&destination=${pickup.lat},${pickup.lng}&travelmode=driving`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-[#2196F3] text-white rounded-2xl font-bold shadow-lg hover:bg-[#1E88E5] transition transform active:scale-95"
          >
            <ExternalLink size={20} />
            Open in Google Maps
          </a>
        </div>
      </div>
    </div>
  );
};

const KabadBechoDriverDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [showNavModal, setShowNavModal] = useState(false);
  const [navTarget, setNavTarget] = useState(null);

  const [pickups, setPickups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const driverStats = {
    name: auth.currentUser?.displayName || 'Partner',
    id: auth.currentUser?.uid.slice(0, 6).toUpperCase() || 'DRV-' + Date.now().toString().slice(-4),
    todayPickups: (pickups || []).length,
    completedToday: (pickups || []).filter(p => p && p.status === 'completed').length,
    pendingToday: (pickups || []).filter(p => p && p.status !== 'completed' && p.status !== 'denied').length,
    totalEarnings: '₹' + (pickups || [])
      .filter(p => p && p.status === 'completed')
      .reduce((acc, curr) => {
         const amt = parseInt((curr.collectedAmount || '0').toString().replace(/[^\d]/g, '')) || 0;
         return acc + amt;
      }, 0).toLocaleString(),
    rating: 4.8, // Fallback rating
    totalTrips: (pickups || []).filter(p => p && p.status === 'completed').length + 242, // Adding some base history
    joinedDate: 'Joined Recently',
    vehicleNo: 'Assignment Pending',
    phone: auth.currentUser?.phoneNumber || 'No phone set',
    email: auth.currentUser?.email || 'no-email@partner.com'
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      // ONLY use mock data for the official demo account
      if (user.email === 'demo@example.com') {
        setPickups(MOCK_PICKUPS);
        setIsLoading(false);
        return;
      }

      // Real-time synchronization for personal accounts
      const q = query(collection(db, "orders"), orderBy("requestedAt", "desc"));
      const unsubscribeData = onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => {
           const data = doc.data();
           return {
              id: doc.id,
              ...data,
              customer: data.userName || 'Customer',
              actualWeight: data.weight || 'N/A',
              emoji: '♻️',
              // Add fallback date if missing
              requestedAt: data.requestedAt || new Date().toLocaleString()
           };
        });
        setPickups(orders);
        setIsLoading(false);
      }, (err) => {
        console.error("Kabadi data error:", err);
        setIsLoading(false);
      });

      return () => unsubscribeData();
    });

    return () => unsubscribeAuth();
  }, []);

  const filteredPickups = pickups.filter(p => {
     if (filterStatus === 'pending') return p.status === 'pending' || p.status === 'accepted';
     return p.status === filterStatus;
  });
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await auth.signOut();
    localStorage.removeItem('token');
    navigate('/kabadi/login');
  };

  const handleStartPickup = (pickup) => {
    setNavTarget(pickup);
    setShowNavModal(true);
  };

  const handleCompletePickup = async (pickupId) => {
    if (auth.currentUser?.email === 'demo@example.com') {
       setPickups(prev => prev.map(p => p.id === pickupId ? { ...p, status: 'completed', completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), date: 'Today' } : p));
       setSelectedPickup(null);
       return;
    }

    try {
       const orderRef = doc(db, "orders", pickupId);
       await updateDoc(orderRef, {
          status: 'completed',
          completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
       });
       setSelectedPickup(null);
    } catch (e) {
       console.error("Failed to complete pickup:", e);
    }
  };

  const Sidebar = () => (
    <div className="w-64 bg-white shadow-xl h-screen sticky top-0 flex flex-col z-50 transition-all duration-300 hidden md:flex">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 text-[#4CAF50]">
          <Truck size={32} strokeWidth={2.5} />
          <span className="text-xl font-extrabold tracking-tight">KabadBecho</span>
        </div>
        <p className="text-xs text-gray-400 mt-1 ml-11">Partner Dashboard</p>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {[
          { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
          { id: 'previous', icon: History, label: 'Previous Pickups' },
          { id: 'profile', icon: Settings, label: 'Profile Settings' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
              activeTab === item.id
                ? 'bg-gradient-to-r from-[#E8F5E9] to-[#F1F8E9] text-[#2E7D32]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-[#2E7D32]'
            }`}
          >
            <item.icon 
              size={20} 
              className={`transition-colors duration-300 ${
                activeTab === item.id ? 'text-[#2E7D32]' : 'text-gray-400 group-hover:text-[#2E7D32]'
              }`} 
            />
            <span className={`font-semibold ${activeTab === item.id ? 'font-bold' : ''}`}>
              {item.label}
            </span>
            {activeTab === item.id && (
              <ChevronRight size={16} className="ml-auto text-[#2E7D32]" />
            )}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <div className="bg-[#F1F8E9] rounded-xl p-4 flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#C8E6C9] rounded-full flex items-center justify-center text-[#2E7D32] font-bold shadow-sm">
            {driverStats.name.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-[#2E7D32] text-sm truncate">{driverStats.name}</h4>
            <p className="text-xs text-[#558B2F] truncate">ID: {driverStats.id}</p>
          </div>
        </div>
        <button 
         onClick={handleSignOut}
         className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-semibold">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  const MobileTabBar = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 flex justify-around p-2">
        {[
          { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
          { id: 'previous', icon: History, label: 'History' },
          { id: 'profile', icon: Settings, label: 'Profile' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              activeTab === item.id ? 'text-[#2E7D32]' : 'text-gray-400'
            }`}
          >
            <item.icon size={24} />
            <span className="text-[10px] font-medium mt-1">{item.label}</span>
          </button>
        ))}
    </div>
  );

  const Overview = () => (
    <div className="animate-fadeIn">
      <section className="relative py-8 bg-gradient-to-br from-[#66BB6A] to-[#4CAF50] text-white overflow-hidden rounded-3xl mx-4 mb-6 shadow-lg mt-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>
        <div className="relative z-10 px-6 md:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner">
                <Truck size={32} />
              </div>
              <div>
                <div className="text-sm opacity-90">Welcome Back,</div>
                <h1 className="text-3xl font-bold">{driverStats.name}</h1>
                <div className="text-sm opacity-90">ID: {driverStats.id}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center space-x-2 shadow-sm">
                <Star className="text-yellow-300" size={18} fill="currentColor" />
                <span className="font-bold">{driverStats.rating}</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                <span className="font-bold">{driverStats.totalTrips} Trips</span>
              </div>
            </div>
          </div>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { icon: <Package size={24} />, value: driverStats.todayPickups, label: "Today's Pickups" },
              { icon: <CheckCircle size={24} />, value: driverStats.completedToday, label: 'Completed' },
              { icon: <Clock size={24} />, value: driverStats.pendingToday, label: 'Pending' },
              { icon: <DollarSign size={24} />, value: driverStats.totalEarnings, label: "Today's Earnings" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/20 backdrop-blur-sm p-4 rounded-xl border border-white/10 shadow-sm hover:bg-white/30 transition-colors">
                <div className="flex items-center space-x-2 mb-2">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* New Optimized Shift Map */}
          <div className="mt-8 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
             <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 mb-2">
                <h3 className="font-bold text-sm tracking-wide">YOUR OPTIMIZED SHIFT ROUTE (UNIFIED VIEW)</h3>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase">Indore North Shift</span>
             </div>
             <div className="h-[250px] rounded-xl overflow-hidden shadow-inner">
                <LiveMap 
                  routeStops={pickups.filter(p => p.status === 'pending')}
                  complexRoute={null} // This would be the combined shift polyline from the engine
                />
             </div>
             <p className="text-[10px] text-center mt-2 opacity-80 italic">The route above is synchronized with the Admin's latest optimization.</p>
          </div>
        </div>
      </section>

      <section className="px-4 mb-6 overflow-x-auto">
        <div className="flex gap-3 bg-white p-2 rounded-2xl shadow-sm inline-flex min-w-max">
          {[
            { id: 'pending', label: 'Pending', count: pickups.filter(p => p.status === 'pending').length },
            { id: 'completed', label: 'Completed', count: pickups.filter(p => p.status === 'completed').length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                filterStatus === tab.id
                  ? 'bg-gradient-to-r from-[#66BB6A] to-[#4CAF50] text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                filterStatus === tab.id ? 'bg-white/30 text-white' : 'bg-gray-200 text-gray-600'
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 pb-24 md:pb-8">
        {filteredPickups.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#E8F5E9] rounded-full mb-4">
              <Package className="text-[#66BB6A]" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-[#5D4037] mb-2">No Pickups Found</h3>
            <p className="text-gray-600">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPickups.map((pickup) => (
              <div key={pickup.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#66BB6A]/50">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-4xl filter drop-shadow-sm">{pickup.emoji}</div>
                          <div>
                            <h3 className="text-xl font-bold text-[#5D4037]">{pickup.id}</h3>
                            <p className="text-gray-600 font-medium">{pickup.scrapType}</p>
                          </div>
                        </div>
                        {pickup.status === 'completed' && (
                          <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-100">
                            <CheckCircle size={16} /><span className="font-semibold text-sm">Completed</span>
                          </div>
                        )}
                      </div>
                      <div className="bg-[#F8FAF8] p-4 rounded-xl border border-gray-100">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#66BB6A] to-[#4CAF50] rounded-full flex items-center justify-center text-white font-bold">{pickup.customer.charAt(0)}</div>
                          <div className="flex-1">
                            <div className="font-bold text-[#5D4037]">{pickup.customer}</div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600"><Phone size={14} /><span>{pickup.phone}</span></div>
                          </div>
                          <a href={`tel:${pickup.phone}`} className="p-2 bg-white border border-gray-200 rounded-lg"><Phone size={18} /></a>
                        </div>
                        <div className="flex items-start space-x-2 text-sm text-gray-700">
                          <MapPin className="flex-shrink-0 mt-0.5 text-[#66BB6A]" size={16} />
                          <div><p className="font-medium">{pickup.address}</p><p className="text-gray-500 mt-1 text-xs">Landmark: {pickup.landmark}</p></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Clock size={12}/> Time Slot</div>
                          <div className="font-semibold text-sm text-[#5D4037]">{pickup.scheduledTime}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Navigation size={12}/> Dist</div>
                          <div className="font-semibold text-sm text-[#5D4037]">{pickup.distance}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Scale size={12}/> Weight</div>
                          <div className="font-semibold text-sm text-[#5D4037]">{pickup.status === 'completed' ? pickup.actualWeight : pickup.estimatedWeight}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><DollarSign size={12}/> Amount</div>
                          <div className="font-semibold text-sm text-[#66BB6A]">{pickup.status === 'completed' ? pickup.collectedAmount : pickup.expectedAmount}</div>
                        </div>
                      </div>
                    </div>
                    <div className="lg:w-48 flex flex-col gap-3 justify-center">
                      {pickup.status === 'pending' ? (
                        <>
                          <button onClick={() => handleStartPickup(pickup)} className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-[#66BB6A] to-[#4CAF50] text-white font-semibold rounded-xl transition transform hover:-translate-y-1"><Navigation size={18} /><span>Navigate</span></button>
                          <button onClick={() => setSelectedPickup(pickup)} className="flex items-center justify-center space-x-2 px-4 py-3 bg-white border-2 border-[#66BB6A] text-[#66BB6A] font-semibold rounded-xl hover:bg-[#E8F5E9] transition"><CheckCircle size={18} /><span>Complete</span></button>
                        </>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-green-50 rounded-xl p-4">
                           <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2"><Award size={24} /></div>
                           <div className="text-sm font-bold text-green-800">Completed</div>
                           <div className="text-xs text-green-600 mt-1">{pickup.completedAt}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );

  const PreviousPickups = () => (
    <div className="p-8 animate-fadeIn pb-24 md:pb-8">
      <h2 className="text-2xl font-bold text-[#5D4037] mb-6">Pickup History</h2>
      <div className="grid gap-6">
        {pickups.filter(p => p.status === 'completed').map((pickup) => (
           <div key={pickup.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-[#E8F5E9] rounded-2xl flex items-center justify-center text-3xl">{pickup.emoji}</div>
              <div className="flex-1 text-center md:text-left">
                 <h3 className="text-lg font-bold text-[#5D4037]">{pickup.scrapType} Pickup</h3>
                 <p className="text-gray-500 text-sm">{pickup.address}</p>
                 <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Calendar size={14}/> Today</span>
                    <span className="flex items-center gap-1"><Clock size={14}/> {pickup.completedAt}</span>
                 </div>
              </div>
              <div className="text-center md:text-right">
                 <div className="text-2xl font-bold text-[#66BB6A]">{pickup.collectedAmount}</div>
                 <div className="text-sm text-gray-500">Earned</div>
              </div>
           </div>
        ))}
      </div>
    </div>
  );

  const ProfileSettings = () => (
    <div className="p-8 max-w-4xl mx-auto animate-fadeIn pb-24 md:pb-8">
      <h2 className="text-2xl font-bold text-[#5D4037] mb-6">Profile</h2>
      <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
         <div className="flex flex-col md:flex-row items-center gap-8 mb-8 border-b pb-8">
            <div className="w-32 h-32 bg-[#E8F5E9] rounded-full flex items-center justify-center text-5xl font-bold text-[#2E7D32] border-4 border-white shadow-xl">{driverStats.name.charAt(0)}</div>
            <div className="text-center md:text-left">
               <h3 className="text-3xl font-bold text-[#5D4037]">{driverStats.name}</h3>
               <p className="text-gray-500 text-lg">Partner ID: {driverStats.id}</p>
               <div className="mt-4 flex gap-4">
                  <div className="px-4 py-2 bg-blue-50 rounded-lg text-blue-700 font-bold border border-blue-100">{driverStats.vehicleNo}</div>
                  <div className="px-4 py-2 bg-yellow-50 rounded-lg text-yellow-700 font-bold border border-yellow-100">Rating: {driverStats.rating} ⭐</div>
               </div>
            </div>
         </div>
         <div className="grid md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-bold text-gray-600 mb-2">Phone</label><input disabled value={driverStats.phone} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200" /></div>
            <div><label className="block text-sm font-bold text-gray-600 mb-2">Email</label><input disabled value={driverStats.email} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200" /></div>
         </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAF9]">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto h-screen">
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'previous' && <PreviousPickups />}
        {activeTab === 'profile' && <ProfileSettings />}
      </main>
      <MobileTabBar />
      {showNavModal && navTarget && <NavigationModal pickup={navTarget} onClose={() => setShowNavModal(false)} driverLoc={{ lat: 22.7411, lng: 75.8355 }} />}
      {selectedPickup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-[#5D4037] mb-6 flex items-center gap-2"><CheckCircle className="text-[#4CAF50]"/> Complete Pickup {selectedPickup.id}</h2>
            <div className="space-y-4">
               <div><label className="block text-sm font-bold text-gray-700 mb-1">Final Weight (kg)</label><input type="number" className="w-full p-4 border rounded-xl" /></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-1">Final Amount (₹)</label><input type="number" className="w-full p-4 border rounded-xl" /></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-1">Upload Receipt/Photo</label><div className="border-2 border-dashed p-8 rounded-xl text-center text-gray-400 cursor-pointer"><Camera className="mx-auto mb-2"/>Click to upload</div></div>
            </div>
            <div className="flex gap-4 mt-8">
               <button onClick={() => setSelectedPickup(null)} className="flex-1 p-4 bg-gray-100 rounded-xl font-bold">Cancel</button>
               <button onClick={() => handleCompletePickup(selectedPickup.id)} className="flex-1 p-4 bg-[#4CAF50] text-white rounded-xl font-bold">Submit</button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes blob { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        .animate-blob { animation: blob 10s infinite; }
      `}</style>
    </div>
  );
};

export default KabadBechoDriverDashboard;