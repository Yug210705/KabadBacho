import React, { useState } from 'react';
import { 
  Search, Filter, Eye, Ban, CheckCircle, User, 
  Phone, MapPin, Package, AlertTriangle, History 
} from 'lucide-react';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      const q = query(collection(db, "users"));
      const unsubscribeData = onSnapshot(q, (snapshot) => {
        const usersList = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().displayName || doc.data().name || 'User',
          ...doc.data(),
          status: doc.data().status || 'active',
          joinedDate: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString(),
          lastActive: doc.data().lastLogin?.toDate()?.toISOString() || new Date().toISOString(),
          totalPickups: 0, // Would need aggregate query for real counts
          activePickups: 0,
          pickupHistory: []
        }));
        setUsers(usersList);
        setIsLoading(false);
      });

      return () => unsubscribeData();
    });

    return () => unsubscribeAuth();
  }, []);

  const filteredUsers = (users || []).filter(user => {
    if (!user) return false;
    const name = (user.name || '').toString().toLowerCase();
    const phone = (user.phone || '').toString();
    const id = (user.id || '').toString().toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = name.includes(search) ||
                          phone.includes(searchTerm) ||
                          id.includes(search);
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleBlockUnblock = (userId) => {
    setUsers(users.map(user =>
      user.id === userId
        ? { ...user, status: user.status === 'active' ? 'blocked' : 'active' }
        : user
    ));
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#5D4037]">User Management</h1>
          <p className="text-gray-600 mt-1">Manage platform users and their activities</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-[#EFEBE9] px-4 py-2 rounded-lg border border-[#D7CCC8]">
            <p className="text-xs text-[#5D4037]">Total Users</p>
            <p className="text-2xl font-bold text-[#4E342E]">{users.length}</p>
          </div>
          <div className="bg-[#E8F5E9] px-4 py-2 rounded-lg border border-[#C8E6C9]">
            <p className="text-xs text-[#2E7D32]">Active</p>
            <p className="text-2xl font-bold text-[#1B5E20]">
              {users.filter(u => u.status === 'active').length}
            </p>
          </div>
          <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-200">
            <p className="text-xs text-red-600">Blocked</p>
            <p className="text-2xl font-bold text-red-700">
              {users.filter(u => u.status === 'blocked').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, phone, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pickups
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
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[#5D4037]">{user.id}</div>
                    <div className="text-xs text-gray-500">
                      Joined: {new Date(user.joinedDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2">
                      <User size={16} className="text-gray-400 mt-1" />
                      <div>
                        <div className="text-sm font-medium text-[#5D4037]">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                        {user.frequentCancellations && (
                          <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                            <AlertTriangle size={12} />
                            <span>Frequent Cancellations</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-[#5D4037] mb-1">
                      <Phone size={14} className="text-gray-400" />
                      {user.phone}
                    </div>
                    <div className="flex items-start gap-2 text-xs text-gray-500">
                      <MapPin size={12} className="text-gray-400 mt-0.5" />
                      <span className="line-clamp-1">{user.address}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[#5D4037]">
                      Total: {user.totalPickups}
                    </div>
                    <div className="text-xs text-gray-500">
                      Active: {user.activePickups}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active'
                          ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]'
                          : 'bg-red-100 text-red-700 border border-red-300'
                      }`}>
                        {user.status === 'active' ? 'Active' : 'Blocked'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Last: {new Date(user.lastActive).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewUserDetails(user)}
                        className="text-[#66BB6A] hover:text-[#4CAF50] p-2 hover:bg-[#E8F5E9] rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleBlockUnblock(user.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.status === 'active'
                            ? 'text-red-600 hover:text-red-800 hover:bg-red-50'
                            : 'text-[#66BB6A] hover:text-[#4CAF50] hover:bg-[#E8F5E9]'
                        }`}
                        title={user.status === 'active' ? 'Block User' : 'Unblock User'}
                      >
                        {user.status === 'active' ? <Ban size={18} /> : <CheckCircle size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-[#5D4037]">User Profile</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Eye size={24} className="rotate-180" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-gray-700">Personal Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">User ID</p>
                      <p className="font-medium">{selectedUser.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="font-medium">{selectedUser.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-medium">{selectedUser.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="font-medium">{selectedUser.address}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-gray-700">Account Status</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                        selectedUser.status === 'active'
                          ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]'
                          : 'bg-red-100 text-red-700 border border-red-300'
                      }`}>
                        {selectedUser.status === 'active' ? 'Active' : 'Blocked'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Joined Date</p>
                      <p className="font-medium">{new Date(selectedUser.joinedDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Active</p>
                      <p className="font-medium">{new Date(selectedUser.lastActive).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Pickups</p>
                      <p className="font-medium text-lg">{selectedUser.totalPickups}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Active Pickups</p>
                      <p className="font-medium text-lg">{selectedUser.activePickups}</p>
                    </div>
                    {selectedUser.frequentCancellations && (
                      <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-2 text-orange-700">
                          <AlertTriangle size={16} />
                          <span className="text-sm font-medium">Frequent Cancellations Flagged</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pickup History */}
              <div>
                <h4 className="font-semibold mb-3 text-gray-700 flex items-center gap-2">
                  <History size={20} />
                  Pickup History
                </h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Request ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Scrap Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedUser.pickupHistory.map((pickup) => (
                        <tr key={pickup.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm font-medium">{pickup.id}</td>
                          <td className="px-4 py-2 text-sm">{pickup.date}</td>
                          <td className="px-4 py-2 text-sm">{pickup.scrapType}</td>
                          <td className="px-4 py-2 text-sm">{pickup.quantity}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              pickup.status === 'completed' ? 'bg-[#EFEBE9] text-[#5D4037]' :
                              pickup.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              pickup.status === 'accepted' ? 'bg-[#E8F5E9] text-[#2E7D32]' :
                              pickup.status === 'denied' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {pickup.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleBlockUnblock(selectedUser.id)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedUser.status === 'active'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-[#66BB6A] text-white hover:bg-[#4CAF50]'
                  }`}
                >
                  {selectedUser.status === 'active' ? 'Block User' : 'Unblock User'}
                </button>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
