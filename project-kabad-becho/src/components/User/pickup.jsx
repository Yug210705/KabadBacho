import React, { useState } from 'react';
import { 
  Truck,
  Package,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  User,
  Calendar,
  DollarSign,
  Search,
  Filter,
  Download,
  Eye,
  AlertCircle,
  Navigation,
  Star,
  MessageSquare,
  X
} from 'lucide-react';
import TrackingModal from './TrackingModal';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const MOCK_PICKUPS = [
  {
    id: 'KB123456',
    date: '2024-12-28',
    time: '09:00 AM - 11:00 AM',
    scrapType: 'Metal Scrap',
    emoji: '🔩',
    weight: '45 kg',
    amount: '₹1,800',
    status: 'completed',
    address: '123 Green Street, Eco City, Mumbai',
    customer: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    driverName: 'Amit Sharma',
    driverPhone: '+91 98765 11111',
    rating: 5,
    statusHistory: [
      { status: 'Booked', time: '10:30 AM', date: '2024-12-27', completed: true },
      { status: 'Confirmed', time: '11:00 AM', date: '2024-12-27', completed: true },
      { status: 'Driver Assigned', time: '08:30 AM', date: '2024-12-28', completed: true },
      { status: 'Out for Pickup', time: '09:00 AM', date: '2024-12-28', completed: true },
      { status: 'Collected', time: '09:45 AM', date: '2024-12-28', completed: true },
      { status: 'Payment Done', time: '09:50 AM', date: '2024-12-28', completed: true }
    ]
  },
  {
    id: 'KB123457',
    date: '2024-12-29',
    time: '01:00 PM - 03:00 PM',
    scrapType: 'Plastic Scrap',
    emoji: '♻️',
    weight: 'Not weighed',
    amount: 'Pending',
    status: 'in-progress',
    address: '456 Eco Avenue, Green Park, Mumbai',
    customer: 'Priya Sharma',
    phone: '+91 98765 43211',
    driverName: 'Vikram Singh',
    driverPhone: '+91 98765 22222',
    rating: null,
    statusHistory: [
      { status: 'Booked', time: '03:30 PM', date: '2024-12-28', completed: true },
      { status: 'Confirmed', time: '03:45 PM', date: '2024-12-28', completed: true },
      { status: 'Driver Assigned', time: '12:30 PM', date: '2024-12-29', completed: true },
      { status: 'Out for Pickup', time: '01:00 PM', date: '2024-12-29', completed: true },
      { status: 'Collected', time: '', date: '', completed: false },
      { status: 'Payment Done', time: '', date: '', completed: false }
    ],
    pickupLocation: { lat: 19.0760, lng: 72.8777 },
    deliveryLocation: { lat: 19.0820, lng: 72.8820 },
    driverLocation: { lat: 19.0780, lng: 72.8795 },
  },
  {
    id: 'KB123458',
    date: '2024-12-30',
    time: '11:00 AM - 01:00 PM',
    scrapType: 'E-Waste',
    emoji: '📱',
    weight: 'Not weighed',
    amount: 'Pending',
    status: 'scheduled',
    address: '789 Recycle Road, Clean City, Mumbai',
    customer: 'Anjali Desai',
    phone: '+91 98765 43212',
    driverName: 'To be assigned',
    driverPhone: '-',
    rating: null,
    statusHistory: [
      { status: 'Booked', time: '05:30 PM', date: '2024-12-28', completed: true },
      { status: 'Confirmed', time: '05:45 PM', date: '2024-12-28', completed: true },
      { status: 'Driver Assigned', time: '', date: '', completed: false },
      { status: 'Out for Pickup', time: '', date: '', completed: false },
      { status: 'Collected', time: '', date: '', completed: false },
      { status: 'Payment Done', time: '', date: '', completed: false }
    ]
  },
  {
    id: 'KB123459',
    date: '2024-12-31',
    time: '03:00 PM - 05:00 PM',
    scrapType: 'Paper Scrap',
    emoji: '📄',
    weight: 'Not weighed',
    amount: 'Pending',
    status: 'scheduled',
    address: '321 Sustainable Street, Eco Zone, Mumbai',
    customer: 'Suresh Mehta',
    phone: '+91 98765 43213',
    driverName: 'To be assigned',
    driverPhone: '-',
    rating: null,
    statusHistory: [
      { status: 'Booked', time: '02:30 PM', date: '2024-12-29', completed: true },
      { status: 'Confirmed', time: '02:45 PM', date: '2024-12-29', completed: true },
      { status: 'Driver Assigned', time: '', date: '', completed: false },
      { status: 'Out for Pickup', time: '', date: '', completed: false },
      { status: 'Collected', time: '', date: '', completed: false },
      { status: 'Payment Done', time: '', date: '', completed: false }
    ]
  }
];

const KabadBechoTrackPickup = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [pickups, setPickups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      const q = query(collection(db, "orders"), where("userId", "==", user.uid));
      const unsubscribeData = onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          emoji: '♻️', // Generic fallback
          statusHistory: doc.data().statusHistory || [
            { status: 'Booked', time: '', date: '', completed: true },
            { status: 'Confirmed', time: '', date: '', completed: doc.data().status !== 'pending' }
          ]
        }));
        setPickups(orders);
        setIsLoading(false);
      });

      return () => unsubscribeData();
    });

    return () => unsubscribeAuth();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'from-[#66BB6A] to-[#4CAF50]';
      case 'in-progress':
        return 'from-[#FFA726] to-[#FF9800]';
      case 'scheduled':
        return 'from-[#42A5F5] to-[#2196F3]';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return { text: 'Completed', icon: <CheckCircle size={16} />, bg: 'bg-green-100', text_color: 'text-green-700' };
      case 'in-progress':
        return { text: 'In Progress', icon: <Truck size={16} />, bg: 'bg-orange-100', text_color: 'text-orange-700' };
      case 'scheduled':
        return { text: 'Scheduled', icon: <Clock size={16} />, bg: 'bg-blue-100', text_color: 'text-blue-700' };
      default:
        return { text: 'Unknown', icon: <AlertCircle size={16} />, bg: 'bg-gray-100', text_color: 'text-gray-700' };
    }
  };

  const filteredPickups = (pickups || []).filter(pickup => {
    if (!pickup) return false;
    const id = (pickup.id || '').toString().toLowerCase();
    const type = (pickup.scrapType || '').toString().toLowerCase();
    const search = searchQuery.toLowerCase();
    
    const matchesSearch = id.includes(search) || type.includes(search);
    const matchesFilter = filterStatus === 'all' || pickup.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-[#E8F5E9] to-white">
      {/* Header */}
      <section className="relative py-12 bg-linear-to-br from-[#66BB6A] to-[#4CAF50] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Navigation size={18} />
                <span className="font-semibold text-sm">Dashboard</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-2">
                Track Your Pickups
              </h1>
              <p className="text-xl text-green-50">
                Monitor your scrap collection status in real-time
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">
                <div className="text-sm text-green-100">Total Pickups</div>
                <div className="text-2xl font-bold">{pickups.length}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">
                <div className="text-sm text-green-100">Completed</div>
                <div className="text-2xl font-bold">{pickups.filter(p => p.status === 'completed').length}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="text-gray-400" size={20} />
              </div>
              <input
                type="text"
                placeholder="Search by Booking ID or Scrap Type"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66BB6A] transition-all duration-300"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              {['all', 'scheduled', 'in-progress', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 capitalize ${
                    filterStatus === status
                      ? 'bg-linear-to-r from-[#66BB6A] to-[#4CAF50] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All' : status.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pickups Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPickups.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[#E8F5E9] rounded-full mb-4">
                <Package className="text-[#66BB6A]" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-[#5D4037] mb-2">No Pickups Found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredPickups.map((pickup) => {
                const statusBadge = getStatusBadge(pickup.status);
                return (
                  <div
                    key={pickup.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-[#66BB6A]"
                  >
                    {/* Header */}
                    <div className={`bg-linear-to-r ${getStatusColor(pickup.status)} p-6 text-white`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-4xl">{pickup.emoji}</div>
                          <div>
                            <div className="text-sm opacity-90">Booking ID</div>
                            <div className="text-xl font-bold">{pickup.id}</div>
                          </div>
                        </div>
                        <div className={`${statusBadge.bg} ${statusBadge.text_color} px-4 py-2 rounded-full flex items-center space-x-2 font-semibold`}>
                          {statusBadge.icon}
                          <span className="text-sm">{statusBadge.text}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar size={16} />
                          <span>{pickup.date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock size={16} />
                          <span>{pickup.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-4">
                      {/* Scrap Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#E8F5E9] p-4 rounded-xl">
                          <div className="text-sm text-gray-600 mb-1">Scrap Type</div>
                          <div className="font-bold text-[#5D4037]">{pickup.scrapType}</div>
                        </div>
                        <div className="bg-[#E8F5E9] p-4 rounded-xl">
                          <div className="text-sm text-gray-600 mb-1">Weight</div>
                          <div className="font-bold text-[#5D4037]">{pickup.weight}</div>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                        <MapPin className="text-[#66BB6A] shrink-0 mt-1" size={18} />
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Pickup Address</div>
                          <div className="text-sm font-medium text-gray-700">{pickup.address}</div>
                        </div>
                      </div>

                      {/* Driver Info */}
                      {pickup.status !== 'scheduled' && pickup.driverName && (
                        <div className="flex items-center space-x-3 p-4 bg-linear-to-r from-[#E8F5E9] to-white rounded-xl border-l-4 border-[#66BB6A]">
                          <div className="w-12 h-12 bg-linear-to-br from-[#66BB6A] to-[#4CAF50] rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {(pickup.driverName || '?').charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-gray-600">Driver</div>
                            <div className="font-bold text-[#5D4037]">{pickup.driverName}</div>
                            {pickup.driverPhone && pickup.driverPhone !== '-' && (
                              <div className="text-sm text-gray-600">{pickup.driverPhone}</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Amount */}
                      <div className="flex items-center justify-between p-4 bg-linear-to-r from-[#66BB6A]/10 to-[#4CAF50]/10 rounded-xl">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="text-[#66BB6A]" size={20} />
                          <span className="text-gray-700 font-medium">Total Amount</span>
                        </div>
                        <div className="text-2xl font-bold text-[#66BB6A]">{pickup.amount}</div>
                      </div>

                      {/* Rating (for completed) */}
                      {pickup.status === 'completed' && pickup.rating && (
                        <div className="flex items-center justify-center space-x-2 p-3 bg-yellow-50 rounded-xl">
                          <span className="text-sm text-gray-700 font-medium">Your Rating:</span>
                          <div className="flex space-x-1">
                            {[...Array(5)].map((_, idx) => (
                              <Star
                                key={idx}
                                size={18}
                                className={idx < pickup.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        {pickup.status === 'in-progress' || pickup.status === 'Out for Pickup' ? (
                          <button
                            onClick={() => setSelectedPickup(pickup)}
                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-linear-to-r from-[#FF9800] to-[#F57C00] text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-pulse"
                          >
                            <Navigation size={18} />
                            <span>Track Live</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedPickup(pickup)}
                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-linear-to-r from-[#66BB6A] to-[#4CAF50] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                          >
                            <Eye size={18} />
                            <span>View Details</span>
                          </button>
                        )}
                        
                        {pickup.status !== 'scheduled' && (
                          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-white border-2 border-[#66BB6A] text-[#66BB6A] font-semibold rounded-xl hover:bg-[#E8F5E9] transition-all duration-300">
                            <Phone size={18} />
                            <span className="sm:hidden">Call Driver</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      {selectedPickup && (
        <TrackingModal 
          selectedPickup={selectedPickup} 
          onClose={() => setSelectedPickup(null)} 
          getStatusColor={getStatusColor} 
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-blob {
          animation: blob 7s ease-in-out infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default KabadBechoTrackPickup;