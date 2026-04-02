import React, { useState, useEffect } from "react";
import {
  History,
  Wallet,
  Leaf,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  Award,
  TrendingUp
} from "lucide-react";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";

const SERVICE_HISTORY = [
  { id: 101, date: "2023-10-25", type: "Paper & Cardboard", weight: "12 kg", amount: "₹144", status: "Completed", receipt: "REC-001" },
  { id: 102, date: "2023-11-02", type: "Metal Scrap", weight: "5 kg", amount: "₹150", status: "Completed", receipt: "REC-002" },
  { id: 103, date: "2023-11-10", type: "Plastic Waste", weight: "8 kg", amount: "₹80", status: "Completed", receipt: "REC-003" },
  { id: 104, date: "2023-11-15", type: "Mixed E-Waste", weight: "2 kg", amount: "₹200", status: "Completed", receipt: "REC-004" },
  { id: 105, date: "2023-11-22", type: "Old Books", weight: "15 kg", amount: "₹180", status: "Completed", receipt: "REC-005" },
  { id: 106, date: "2023-12-01", type: "Glass Bottles", weight: "10 kg", amount: "₹50", status: "Completed", receipt: "REC-006" },
  { id: 107, date: "2023-12-05", type: "Iron Scrap", weight: "20 kg", amount: "₹600", status: "Completed", receipt: "REC-007" }
];

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [serviceHistory, setServiceHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 5;

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Show mock data ONLY for demo account
      if (user.email === 'demo@example.com') {
        setServiceHistory(SERVICE_HISTORY);
        setIsLoading(false);
        return;
      }

      // Real-time Firestore query for other users
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, where("userId", "==", user.uid), orderBy("date", "desc"));
      
      const unsubscribeData = onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setServiceHistory(orders);
        setIsLoading(false);
      }, (err) => {
        console.warn("Firestore error in dashboard:", err);
        setIsLoading(false);
      });

      return () => unsubscribeData();
    });

    return () => unsubscribeAuth();
  }, []);

  // Calculate stats from serviceHistory
  const stats = serviceHistory.reduce((acc, item) => {
    const amount = parseInt(item.amount?.replace(/[^\d]/g, '') || 0);
    const weight = parseInt(item.weight?.replace(/[^\d]/g, '') || 0);
    return {
      totalEarnings: acc.totalEarnings + amount,
      totalWeight: acc.totalWeight + weight
    };
  }, { totalEarnings: 0, totalWeight: 0 });

  const totalPages = Math.max(1, Math.ceil(serviceHistory.length / itemsPerPage));
  const indexOfLast = currentPage * itemsPerPage;
  const currentItems = serviceHistory.slice(indexOfLast - itemsPerPage, indexOfLast);

  const goalMax = 500;
  const goalProgress = Math.min((stats.totalWeight / goalMax) * 100, 100);

  const handleView = (id) => {
    console.log("View receipt:", id);
    alert(`Viewing receipt for pickup ID: ${id}`);
  };

  const handleDownload = (id) => {
    console.log("Download receipt:", id);
    alert(`Downloading receipt for pickup ID: ${id}`);
  };

  return (
    <>
      {/* HERO / STATS */}
                <div className="bg-linear-to-br from-[#2E7D32] to-[#66BB6A] rounded-3xl p-8 text-white shadow-2xl shadow-green-900/10 mb-10 relative overflow-hidden group">

        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-900/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

        <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold border border-white/10 flex items-center gap-1 mb-4">
              <Award size={12} /> {stats.totalWeight > 100 ? "Gold Member" : "Eco Explorer"}
            </span>

            <h1 className="text-3xl lg:text-5xl font-extrabold mb-4">
              Hello, <span className="text-green-100">{auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || "Green Hero"}!</span> 🌱
            </h1>

            <p className="text-green-50 text-lg max-w-lg mb-8">
              Your recycling efforts {stats.totalWeight > 0 ? "are making a real difference." : "are about to start! Make your first pickup today."}
            </p>

            <div className="bg-white/10 rounded-2xl p-5 border border-white/10 max-w-md">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-green-100">Contribution Goal</span>
                <span className="text-2xl font-bold">
                  {stats.totalWeight} <span className="text-sm text-green-200">/ {goalMax} kg</span>
                </span>
              </div>

              <div className="h-3 bg-black/20 rounded-full overflow-hidden mb-2">
                <div
                                        className="h-full bg-linear-to-r from-[#AED581] to-[#C5E1A5] rounded-full transition-all duration-1000"
                  style={{ width: `${goalProgress}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-green-200">
                <span>{stats.totalWeight > 200 ? "Current Level: Eco Warrior" : "Current Level: Seedling"}</span>
                <span className="flex items-center gap-1">
                  Next: {stats.totalWeight > 200 ? "Earth Guardian" : "Eco Warrior"} <ChevronRight size={10} />
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-6 rounded-2xl border border-white/10">
              <Wallet size={20} className="mb-3" />
              <p className="text-green-200 text-sm">Total Earnings</p>
              <h3 className="text-3xl font-bold">₹ {stats.totalEarnings.toLocaleString()}</h3>
              <p className="text-xs mt-2 flex items-center gap-1">
                <TrendingUp size={12} /> Live tracking enabled
              </p>
            </div>

            <div className="bg-white/10 p-6 rounded-2xl border border-white/10">
              <Leaf size={20} className="mb-3" />
              <p className="text-green-200 text-sm">Waste Recycled</p>
              <h3 className="text-3xl font-bold">{stats.totalWeight} kg</h3>
              <p className="text-xs mt-2">Saved {Math.floor(stats.totalWeight / 20)} trees</p>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-lg border overflow-hidden">
        <div className="p-8 border-b flex justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2 text-[#1B5E20]">
            <History className="text-[#66BB6A]" /> Recent Pickups & Receipts
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase">
                <th className="p-5">Date</th>
                <th className="p-5">Waste Type</th>
                <th className="p-5">Weight</th>
                <th className="p-5">Earnings</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentItems.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-5">{item.date}</td>
                  <td className="p-5 font-semibold">{item.type}</td>
                  <td className="p-5">{item.weight}</td>
                  <td className="p-5 font-bold text-[#2E7D32]">{item.amount}</td>
                  <td className="p-5 text-green-700">{item.status}</td>

                  <td className="p-5 text-center">
                    <button onClick={() => handleView(item.id)} className="p-2 mr-2 hover:bg-green-100 rounded">
                      <Eye size={18} />
                    </button>
                    <button onClick={() => handleDownload(item.id)} className="p-2 hover:bg-green-100 rounded">
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t flex justify-between">
          <p>
            Page <b>{currentPage}</b> of <b>{totalPages}</b>
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              <ChevronLeft size={16} /> Prev
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
