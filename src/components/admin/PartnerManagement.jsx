import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle, XCircle, Clock, Truck, Search, 
  MapPin, Phone, Mail, AlertTriangle, Filter, Save
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const PartnerManagement = () => {
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('approvals'); // 'approvals' or 'shifts'

  useEffect(() => {
    // Specifically subscribe to partners (kabadi role)
    const q = query(collection(db, "users"), where("role", "==", "kabadi"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().displayName || doc.data().name || 'Unknown Partner',
        email: doc.data().email,
        phone: doc.data().phone || 'N/A',
        address: doc.data().address || 'N/A',
        approvalStatus: doc.data().approvalStatus || 'pending', // pending, approved, rejected
        assignedShift: doc.data().assignedShift || null, // morning, evening
        createdAt: doc.data().createdAt?.toDate()?.toLocaleDateString() || 'N/A'
      }));
      setPartners(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (partnerId, newStatus) => {
    try {
      const partnerRef = doc(db, "users", partnerId);
      await updateDoc(partnerRef, {
        approvalStatus: newStatus
      });
    } catch (err) {
      console.error("Error updating approval status:", err);
      alert("Failed to update status.");
    }
  };

  const handleUpdateShift = async (partnerId, shift) => {
    try {
      const partnerRef = doc(db, "users", partnerId);
      await updateDoc(partnerRef, {
        assignedShift: shift
      });
    } catch (err) {
      console.error("Error setting shift:", err);
      alert("Failed to assign shift.");
    }
  };

  const filteredPartners = partners.filter(p => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(search) || 
                          p.email.toLowerCase().includes(search) || 
                          p.id.toLowerCase().includes(search);
                          
    if (activeTab === 'approvals') {
      return matchesSearch && p.approvalStatus !== 'approved'; 
    } else {
      return matchesSearch && p.approvalStatus === 'approved';
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#5D4037] flex items-center gap-2">
            <Truck className="text-[#66BB6A]" /> Partner Management
          </h1>
          <p className="text-gray-600 mt-1">Approve registrations and organize pickup shifts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-3 font-semibold text-sm transition-all relative ${
            activeTab === 'approvals' ? 'text-[#2E7D32]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Partner Approvals
          {partners.filter(p => p.approvalStatus === 'pending').length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {partners.filter(p => p.approvalStatus === 'pending').length}
            </span>
          )}
          {activeTab === 'approvals' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4CAF50] rounded-t-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('shifts')}
          className={`px-4 py-3 font-semibold text-sm transition-all relative ${
            activeTab === 'shifts' ? 'text-[#2E7D32]' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Shift Assignments
          {activeTab === 'shifts' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4CAF50] rounded-t-full"></div>
          )}
        </button>
      </div>

      {/* Header controls (Search) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search partners by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#66BB6A] outline-none"
          />
        </div>
      </div>

      {/* Table block */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full border-4 border-[#4CAF50] border-t-transparent animate-spin mb-3"></div>
            Loading partners...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f0f9f1] border-b border-[#C8E6C9]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#2E7D32] uppercase tracking-wider">Partner details</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#2E7D32] uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#2E7D32] uppercase tracking-wider">Registered</th>
                  {activeTab === 'approvals' ? (
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#2E7D32] uppercase tracking-wider">Status / Actions</th>
                  ) : (
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#2E7D32] uppercase tracking-wider">Assigned Shift</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPartners.map(partner => (
                  <tr key={partner.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32] font-bold">
                          {partner.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[#4E342E]">{partner.name}</p>
                          <p className="text-xs text-gray-500 font-mono tracking-tighter" title="Partner ID">{partner.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                        <Mail size={14} className="text-gray-400" /> {partner.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone size={14} className="text-gray-400" /> {partner.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">
                      {partner.createdAt}
                    </td>

                    {/* DYNAMIC LAST COLUMN CONTENT */}
                    <td className="px-6 py-4">
                      {activeTab === 'approvals' ? (
                        // APPROVAL TAB ACTIONS
                        <div className="flex items-center gap-2">
                          {partner.approvalStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(partner.id, 'approved')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4CAF50] text-white text-xs font-bold rounded-lg hover:bg-[#388E3C] transition shadow-sm"
                              >
                                <CheckCircle size={14} /> Approve
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(partner.id, 'rejected')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-lg hover:bg-red-200 transition"
                              >
                                <XCircle size={14} /> Reject
                              </button>
                            </>
                          )}
                          {partner.approvalStatus === 'rejected' && (
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold px-2 py-1 bg-red-50 text-red-600 rounded border border-red-100">
                                Rejected
                              </span>
                              <button
                                onClick={() => handleUpdateStatus(partner.id, 'pending')}
                                className="text-xs text-gray-500 hover:text-gray-700 underline"
                              >
                                Reset to Pending
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        // SHIFT ASSIGNMENT ACTIONS
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <select
                              value={partner.assignedShift || ''}
                              onChange={(e) => handleUpdateShift(partner.id, e.target.value)}
                              className="pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#66BB6A] cursor-pointer appearance-none"
                            >
                              <option value="" disabled>Select Shift</option>
                              <option value="morning">Morning Shift</option>
                              <option value="evening">Evening Shift</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                               <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                          </div>
                          {!partner.assignedShift && (
                            <span className="text-xs text-orange-500 flex items-center gap-1 font-semibold">
                              <AlertTriangle size={12} /> Unassigned
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPartners.length === 0 && (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <Users className="text-gray-300" size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">No partners found</h3>
                <p className="text-sm text-gray-500">
                  {activeTab === 'approvals' 
                    ? 'All partner registrations have been processed.' 
                    : 'No approved partners exist yet to assign shifts.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerManagement;
