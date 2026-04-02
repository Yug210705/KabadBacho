import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Eye, MessageSquare, AlertCircle, 
  CheckCircle2, Clock, User, FileText, Tag
} from 'lucide-react';
import { db, auth } from '../../firebase';
import { collection, onSnapshot, query, where, doc, updateDoc, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';

const ComplaintsSupport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const MOCK_COMPLAINTS = [
    {
      id: 'CMP001',
      userId: 'USR001',
      userName: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      issueType: 'Payment Issue',
      subject: 'Payment not received for pickup REQ001',
      description: 'I completed the pickup on Jan 2nd but haven\'t received payment yet. The pickup ID was REQ001.',
      status: 'open',
      priority: 'high',
      createdAt: '2025-01-05 10:30 AM',
      updatedAt: '2025-01-05 10:30 AM',
      assignedTo: null,
      adminNotes: [],
      relatedPickupId: 'REQ001'
    },
    {
      id: 'CMP002',
      userId: 'USR002',
      userName: 'Priya Sharma',
      phone: '+91 87654 32109',
      issueType: 'Pickup Delay',
      subject: 'Driver arrived 2 hours late',
      description: 'The scheduled pickup time was 2-4 PM but the driver arrived at 6 PM. This caused inconvenience.',
      status: 'in-progress',
      priority: 'medium',
      createdAt: '2025-01-04 06:15 PM',
      updatedAt: '2025-01-05 09:00 AM',
      assignedTo: 'Support Team A',
      adminNotes: [
        { timestamp: '2025-01-05 09:00 AM', note: 'Contacted driver for explanation', admin: 'Admin' }
      ],
      relatedPickupId: 'REQ002'
    },
    {
      id: 'CMP003',
      userId: 'USR003',
      userName: 'Amit Patel',
      phone: '+91 76543 21098',
      issueType: 'Pricing Dispute',
      subject: 'Lower price offered than expected',
      description: 'The website showed ₹50/kg for electronics but I was only paid ₹35/kg.',
      status: 'resolved',
      priority: 'medium',
      createdAt: '2025-01-03 11:20 AM',
      updatedAt: '2025-01-04 02:30 PM',
      assignedTo: 'Support Team B',
      adminNotes: [
        { timestamp: '2025-01-03 02:00 PM', note: 'Checked pricing table, user was right', admin: 'Admin' },
        { timestamp: '2025-01-04 02:30 PM', note: 'Additional payment of ₹120 processed', admin: 'Admin' }
      ],
      relatedPickupId: 'REQ003'
    },
    {
        id: 'CMP004',
        userId: 'USR005',
        userName: 'Vikram Singh',
        phone: '+91 54321 09876',
        issueType: 'App/Website Issue',
        subject: 'Unable to schedule pickup',
        description: 'The website keeps showing error when I try to select a pickup date. Getting "Server Error 500".',
        status: 'in-progress',
        priority: 'high',
        createdAt: '2025-01-05 08:45 AM',
        updatedAt: '2025-01-05 11:00 AM',
        assignedTo: 'Tech Team',
        adminNotes: [
          { timestamp: '2025-01-05 11:00 AM', note: 'Escalated to development team', admin: 'Admin' }
        ],
        relatedPickupId: null
      },
      {
        id: 'CMP005',
        userId: 'USR004',
        userName: 'Sneha Reddy',
        phone: '+91 65432 10987',
        issueType: 'Service Quality',
        subject: 'Driver was unprofessional',
        description: 'The pickup driver was rude and didn\'t handle the items carefully.',
        status: 'open',
        priority: 'low',
        createdAt: '2025-01-05 03:20 PM',
        updatedAt: '2025-01-05 03:20 PM',
        assignedTo: null,
        adminNotes: [],
        relatedPickupId: 'REQ004'
      },
  ];

  useEffect(() => {
    const isDemo = auth.currentUser?.email === 'demo@example.com';
    if (isDemo) {
      setComplaints(MOCK_COMPLAINTS);
      setLoading(false);
      return;
    }

    const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
       const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()?.toLocaleString() || new Date().toLocaleString(),
          updatedAt: doc.data().updatedAt?.toDate()?.toLocaleString() || new Date().toLocaleString()
       }));
       setComplaints(list);
       setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (complaintId, newStatus) => {
    if (auth.currentUser?.email === 'demo@example.com') {
       setComplaints(complaints.map(c => c.id === complaintId ? { ...c, status: newStatus } : c));
       return;
    }
    try {
      const docRef = doc(db, "complaints", complaintId);
      await updateDoc(docRef, { 
        status: newStatus, 
        updatedAt: serverTimestamp() 
      });
    } catch (e) {
      console.error("Update status error:", e);
    }
  };

  const handleAddNote = async (complaintId, note) => {
    if (auth.currentUser?.email === 'demo@example.com') {
        setComplaints(complaints.map(c => c.id === complaintId ? { ...c, adminNotes: [...(c.adminNotes || []), { note, timestamp: new Date().toLocaleString(), admin: 'Admin' }] } : c));
        return;
    }
    try {
      const complaint = complaints.find(c => c.id === complaintId);
      const newNotes = [...(complaint.adminNotes || []), { 
        note, 
        timestamp: new Date().toLocaleString(), 
        admin: 'Admin' 
      }];
      const docRef = doc(db, "complaints", complaintId);
      await updateDoc(docRef, { 
        adminNotes: newNotes, 
        updatedAt: serverTimestamp() 
      });
    } catch (e) {
      console.error("Add note error:", e);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'in-progress': 'bg-blue-100 text-blue-700 border-blue-300',
      resolved: 'bg-green-100 text-green-700 border-green-300',
    };
    return colors[status] || '';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-orange-100 text-orange-700',
      high: 'bg-red-100 text-red-700',
    };
    return colors[priority] || '';
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          complaint.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          complaint.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || complaint.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });


  const viewComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#5D4037]">Complaints & Support</h1>
          <p className="text-gray-600 mt-1">Handle user issues and support tickets</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-600">Open</p>
            <p className="text-2xl font-bold text-yellow-700">
              {complaints.filter(c => c.status === 'open').length}
            </p>
          </div>
          <div className="bg-[#EFEBE9] px-4 py-2 rounded-lg border border-[#D7CCC8]">
            <p className="text-xs text-[#5D4037]">In Progress</p>
            <p className="text-2xl font-bold text-[#4E342E]">
              {complaints.filter(c => c.status === 'in-progress').length}
            </p>
          </div>
          <div className="bg-[#E8F5E9] px-4 py-2 rounded-lg border border-[#C8E6C9]">
            <p className="text-xs text-[#2E7D32]">Resolved</p>
            <p className="text-2xl font-bold text-[#1B5E20]">
              {complaints.filter(c => c.status === 'resolved').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by subject, user, or ID..."
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
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent appearance-none"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Complaint ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
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
              {filteredComplaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[#5D4037]">{complaint.id}</div>
                    <div className="text-xs text-gray-500">{complaint.createdAt}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2">
                      <User size={16} className="text-gray-400 mt-1" />
                      <div>
                        <div className="text-sm font-medium text-[#5D4037]">{complaint.userName}</div>
                        <div className="text-xs text-gray-500">{complaint.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} className="text-gray-400" />
                      <span className="text-sm text-[#5D4037]">{complaint.issueType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[#5D4037] line-clamp-2 max-w-xs">
                      {complaint.subject}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      complaint.status === 'in-progress' 
                        ? 'bg-[#EFEBE9] text-[#5D4037] border-[#D7CCC8]' 
                        : complaint.status === 'resolved'
                        ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]'
                        : getStatusColor(complaint.status)
                    }`}>
                      {complaint.status === 'in-progress' ? 'In Progress' : complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => viewComplaintDetails(complaint)}
                      className="text-[#66BB6A] hover:text-[#4CAF50] p-2 hover:bg-[#E8F5E9] rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredComplaints.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No complaints found</p>
          </div>
        )}
      </div>

      {/* Complaint Detail Modal */}
      {showDetailModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-[#5D4037]">Complaint Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Eye size={24} className="rotate-180" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-gray-700">Complaint Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Complaint ID</p>
                      <p className="font-medium">{selectedComplaint.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Issue Type</p>
                      <p className="font-medium">{selectedComplaint.issueType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Created At</p>
                      <p className="font-medium">{selectedComplaint.createdAt}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Updated</p>
                      <p className="font-medium">{selectedComplaint.updatedAt}</p>
                    </div>
                    {selectedComplaint.relatedPickupId && (
                      <div>
                        <p className="text-xs text-gray-500">Related Pickup</p>
                        <p className="font-medium text-[#66BB6A]">{selectedComplaint.relatedPickupId}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-gray-700">User Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">User ID</p>
                      <p className="font-medium">{selectedComplaint.userId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="font-medium">{selectedComplaint.userName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-medium">{selectedComplaint.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject & Description */}
              <div>
                <h4 className="font-semibold mb-3 text-gray-700">Complaint Details</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Subject</p>
                    <p className="font-medium text-[#5D4037]">{selectedComplaint.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Description</p>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700">{selectedComplaint.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Status</p>
                  <select
                    value={selectedComplaint.status}
                    onChange={(e) => handleUpdateStatus(selectedComplaint.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent"
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Priority</p>
                  <span className={`inline-block px-4 py-2 rounded-lg text-sm font-medium ${getPriorityColor(selectedComplaint.priority)}`}>
                    {selectedComplaint.priority.charAt(0).toUpperCase() + selectedComplaint.priority.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Assigned To</p>
                  <p className="font-medium">{selectedComplaint.assignedTo || 'Not assigned'}</p>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <h4 className="font-semibold mb-3 text-gray-700 flex items-center gap-2">
                  <FileText size={20} />
                  Admin Notes
                </h4>
                <div className="space-y-3 mb-4">
                  {selectedComplaint.adminNotes.length > 0 ? (
                    selectedComplaint.adminNotes.map((note, index) => (
                      <div key={index} className="bg-[#EFEBE9] p-4 rounded-lg border border-[#D7CCC8]">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-medium text-[#5D4037]">{note.admin}</span>
                          <span className="text-xs text-[#8D6E63]">{note.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-700">{note.note}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No admin notes yet</p>
                  )}
                </div>

                {/* Add Note */}
                <div>
                  <textarea
                    id="new-note"
                    placeholder="Add internal admin note..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent mb-2"
                    rows="3"
                  />
                  <button
                    onClick={() => {
                      const noteText = document.getElementById('new-note').value;
                      if (noteText.trim()) {
                        handleAddNote(selectedComplaint.id, noteText);
                        document.getElementById('new-note').value = '';
                      }
                    }}
                    className="px-4 py-2 bg-[#5D4037] text-white rounded-lg hover:bg-[#4E342E] transition-colors"
                  >
                    Add Note
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedComplaint.id, 'resolved');
                    setShowDetailModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-[#66BB6A] text-white rounded-lg hover:bg-[#4CAF50] transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  <span>Mark as Resolved</span>
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
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

export default ComplaintsSupport;
