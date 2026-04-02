import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Eye, Check, X, Calendar, MapPin, 
  Phone, User, Package, Clock, ChevronDown, Route as RouteIcon
} from 'lucide-react';
import RouteOptimizerModal from './RouteOptimizerModal';
import { auth, db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';

const MOCK_REQUESTS = [
  {
    id: 'REQ001',
    userName: 'Rajesh Kumar',
    phone: '+91 98123 45678',
    address: 'Rajwada Palace area, Indore',
    location: { lat: 22.7163, lng: 75.8540 },
    scrapType: 'Plastic',
    quantity: 120,
    preferredDate: '2025-01-05',
    preferredTime: '10:00 AM - 12:00 PM',
    status: 'pending',
    requestedAt: '2025-01-02 09:30 AM',
  },
  {
    id: 'REQ002',
    userName: 'Priya Sharma',
    phone: '+91 87654 32109',
    address: 'Vijay Nagar, Scheme No 54, Indore',
    location: { lat: 22.7533, lng: 75.8937 },
    scrapType: 'Metal',
    quantity: 250,
    preferredDate: '2025-01-06',
    preferredTime: '02:00 PM - 04:00 PM',
    status: 'accepted',
    requestedAt: '2025-01-01 02:15 PM',
  },
  {
    id: 'REQ003',
    userName: 'Amit Patel',
    phone: '+91 76543 21098',
    address: 'Bhawarkuan Square, Indore',
    location: { lat: 22.6916, lng: 75.8676 },
    scrapType: 'Electronics',
    quantity: 80,
    preferredDate: '2025-01-04',
    preferredTime: '11:00 AM - 01:00 PM',
    status: 'pending',
    requestedAt: '2024-12-28 11:00 AM',
  },
  {
    id: 'REQ004',
    userName: 'Sneha Reddy',
    phone: '+91 65432 10987',
    address: 'Khajrana Temple Road, Indore',
    location: { lat: 22.7275, lng: 75.8972 },
    scrapType: 'Paper',
    quantity: 300,
    preferredDate: '2025-01-03',
    preferredTime: '09:00 AM - 11:00 AM',
    status: 'pending',
    requestedAt: '2024-12-30 04:45 PM',
  },
  {
    id: 'REQ005',
    userName: 'Vikram Singh',
    phone: '+91 99887 76655',
    address: 'Palasia, Indore',
    location: { lat: 22.7244, lng: 75.8839 },
    scrapType: 'Plastic',
    quantity: 150,
    preferredDate: '2025-01-03',
    preferredTime: '10:00 AM - 12:00 PM',
    status: 'pending',
    requestedAt: '2025-01-01 11:00 AM',
  },
];

const UserRequests = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedScrapType, setSelectedScrapType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real data from Firestore
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    if (user.email === 'demo@example.com') {
      setRequests(MOCK_REQUESTS);
      setIsLoading(false);
      return;
    }

    const q = query(collection(db, "orders"), orderBy("requestedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRequests(orders);
      setIsLoading(false);
    }, (err) => {
      console.error("Firestore error:", err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (requestId, newStatus, extraData = {}) => {
    // If it's pure mock data, don't try to update Firestore
    if (auth.currentUser?.email === 'demo@example.com') {
       setRequests(requests.map(req => req.id === requestId ? { ...req, status: newStatus, ...extraData } : req));
       return;
    }
    
    try {
      const orderRef = doc(db, "orders", requestId);
      await updateDoc(orderRef, { status: newStatus, ...extraData });
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      accepted: 'bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]',
      completed: 'bg-blue-100 text-blue-700 border-blue-300',
      denied: 'bg-red-100 text-red-700 border-red-300',
    };
    return colors[status] || '';
  };

  const filteredRequests = requests.filter(req => {
    const matchesStatus = selectedStatus === 'all' || req.status === selectedStatus;
    const matchesScrapType = selectedScrapType === 'all' || req.scrapType.toLowerCase().includes(selectedScrapType.toLowerCase());
    const matchesSearch = req.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          req.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesScrapType && matchesSearch;
  });

  const handleAccept = (requestId) => {
    handleUpdateStatus(requestId, 'accepted', { assignedDate: new Date().toLocaleString() });
    setShowAssignModal(true);
  };

  const handleDeny = (requestId, reason) => {
    handleUpdateStatus(requestId, 'denied', { deniedReason: reason });
    setShowDenyModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#5D4037]">User Requests Management</h1>
          <p className="text-gray-600 mt-1">Manage scrap pickup requests</p>
        </div>
        <div className="flex gap-2 items-center">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor('pending')}`}>
            {requests.filter(r => r.status === 'pending').length} Pending
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor('accepted')}`}>
            {requests.filter(r => r.status === 'accepted').length} Accepted
          </span>
          <button
            onClick={() => setShowOptimizer(true)}
            className="ml-2 flex items-center gap-1 bg-[#4CAF50] hover:bg-[#388E3C] text-white px-4 py-2 rounded-lg font-medium shadow-sm transition"
          >
            <RouteIcon size={18} /> Optimize Routes
          </button>
        </div>
      </div>

      <RouteOptimizerModal 
        isOpen={showOptimizer} 
        onClose={() => setShowOptimizer(false)} 
        requests={requests}
      />

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="denied">Denied</option>
            </select>
          </div>

          {/* Scrap Type Filter */}
          <div className="relative">
            <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={selectedScrapType}
              onChange={(e) => setSelectedScrapType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent appearance-none"
            >
              <option value="all">All Scrap Types</option>
              <option value="plastic">Plastic</option>
              <option value="paper">Paper</option>
              <option value="metal">Metal</option>
              <option value="electronics">Electronics</option>
            </select>
          </div>

          {/* Date Filter */}
          <input
            type="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scrap Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preferred Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[#5D4037]">{request.id}</div>
                    <div className="text-xs text-gray-500">{request.requestedAt}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2">
                      <User size={16} className="text-gray-400 mt-1" />
                      <div>
                        <div className="text-sm font-medium text-[#5D4037]">{request.userName}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone size={12} />
                          {request.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[#5D4037]">{request.scrapType}</div>
                    <div className="text-xs text-gray-500">{request.quantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#5D4037] flex items-center gap-1">
                      <Calendar size={14} className="text-gray-400" />
                      {request.preferredDate}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} className="text-gray-400" />
                      {request.preferredTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="text-[#66BB6A] hover:text-[#4CAF50] p-2 hover:bg-[#E8F5E9] rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAccept(request.id)}
                            className="text-[#66BB6A] hover:text-[#4CAF50] p-2 hover:bg-[#E8F5E9] rounded-lg transition-colors"
                            title="Accept"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowDenyModal(true);
                            }}
                            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Deny"
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No requests found</p>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {selectedRequest && !showDenyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-[#5D4037]">Request Details</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Admin Override Dropdown */}
              <div className="bg-orange-50 p-4 border border-orange-200 rounded-xl relative">
                 <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">Admin Status Override</div>
                 <label className="block text-sm font-bold text-orange-800 mb-2">Change Status Manually:</label>
                 <select 
                   className="w-full p-2 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                   value={selectedRequest.status}
                   onChange={(e) => {
                     const newStatus = e.target.value;
                     const extra = {};
                     if (newStatus === 'completed' && !selectedRequest.completedAt) extra.completedAt = new Date().toLocaleString();
                     if (newStatus === 'accepted' && !selectedRequest.assignedDate) extra.assignedDate = new Date().toLocaleString();
                     handleUpdateStatus(selectedRequest.id, newStatus, extra);
                     setSelectedRequest({ ...selectedRequest, status: newStatus, ...extra });
                   }}
                 >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="completed">Completed</option>
                    <option value="denied">Denied</option>
                 </select>
              </div>

              {/* Status Timeline */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 text-gray-700">Status Timeline</h4>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className={`h-2 rounded-full ${selectedRequest.status === 'pending' ? 'bg-yellow-400' : 'bg-[#66BB6A]'}`} />
                    <p className="text-xs mt-1 font-medium">Requested</p>
                    <p className="text-xs text-gray-500">{selectedRequest.requestedAt}</p>
                  </div>
                  <div className="flex-1">
                    <div className={`h-2 rounded-full ${['accepted', 'completed'].includes(selectedRequest.status) ? 'bg-[#66BB6A]' : 'bg-gray-200'}`} />
                    <p className="text-xs mt-1 font-medium">Accepted</p>
                    {selectedRequest.assignedDate && (
                      <p className="text-xs text-gray-500">{selectedRequest.assignedDate}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`h-2 rounded-full ${selectedRequest.status === 'completed' ? 'bg-[#5D4037]' : selectedRequest.status === 'denied' ? 'bg-red-400' : 'bg-gray-200'}`} />
                    <p className="text-xs mt-1 font-medium">
                      {selectedRequest.status === 'denied' ? 'Denied' : 'Completed'}
                    </p>
                    {selectedRequest.completedAt && (
                      <p className="text-xs text-gray-500">{selectedRequest.completedAt}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div>
                <h4 className="font-semibold mb-3 text-gray-700">User Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="text-gray-400" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="font-medium">{selectedRequest.userName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="text-gray-400" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-medium">{selectedRequest.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 md:col-span-2">
                    <MapPin className="text-gray-400 mt-1" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="font-medium">{selectedRequest.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrap Information */}
              <div>
                <h4 className="font-semibold mb-3 text-gray-700">Scrap Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Package className="text-gray-400" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">Scrap Type</p>
                      <p className="font-medium">{selectedRequest.scrapType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Package className="text-gray-400" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">Quantity</p>
                      <p className="font-medium">{selectedRequest.quantity}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferred Pickup */}
              <div>
                <h4 className="font-semibold mb-3 text-gray-700">Preferred Pickup</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-gray-400" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-medium">{selectedRequest.preferredDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="text-gray-400" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">Time</p>
                      <p className="font-medium">{selectedRequest.preferredTime}</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedRequest.deniedReason && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-700 mb-2">Denial Reason</h4>
                  <p className="text-sm text-red-600">{selectedRequest.deniedReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Deny Modal */}
      {showDenyModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-[#5D4037]">Deny Request</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600">Select a reason for denying request {selectedRequest.id}:</p>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                <option value="">Select reason...</option>
                <option value="Location out of service area">Location out of service area</option>
                <option value="Insufficient quantity">Insufficient quantity</option>
                <option value="Scrap type not accepted">Scrap type not accepted</option>
                <option value="Duplicate request">Duplicate request</option>
                <option value="Other">Other</option>
              </select>
              <textarea
                placeholder="Additional notes (optional)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows="3"
              />
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowDenyModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeny(selectedRequest.id, 'Location out of service area')}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Deny Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRequests;
