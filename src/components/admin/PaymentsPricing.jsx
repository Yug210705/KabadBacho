import React, { useState, useEffect } from 'react';
import { 
  Search, Edit2, Save, X, DollarSign, Package, 
  TrendingUp, Calendar, FileText, Download, Truck
} from 'lucide-react';
import { db, auth } from '../../firebase';
import { collection, onSnapshot, query, where, doc, updateDoc, getDocs, setDoc } from 'firebase/firestore';

const PaymentsPricing = () => {
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [scrapPrices, setScrapPrices] = useState([]);
  const [paymentRecords, setPaymentRecords] = useState([]);
  const [revenueData, setRevenueData] = useState({
     daily: { total: 0, transactions: 0 },
     monthly: { total: 0, transactions: 0 },
  });

  const DEFAULT_PRICES = [
    { category: 'Plastic (PET)', pricePerKg: 20 },
    { category: 'Plastic (HDPE)', pricePerKg: 18 },
    { category: 'Paper (Newspaper)', pricePerKg: 10 },
    { category: 'Paper (Cardboard)', pricePerKg: 8 },
    { category: 'Metal (Iron)', pricePerKg: 25 },
    { category: 'Metal (Aluminum)', pricePerKg: 80 },
    { category: 'Metal (Copper)', pricePerKg: 450 },
    { category: 'Electronics (Small)', pricePerKg: 35 },
    { category: 'Electronics (Large)', pricePerKg: 50 },
    { category: 'Glass', pricePerKg: 5 },
  ];

  useEffect(() => {
    // 1. Fetch Pricing
    const unsubscribePricing = onSnapshot(collection(db, "pricing"), (snapshot) => {
       if (snapshot.empty) {
          // Initialize if empty
          DEFAULT_PRICES.forEach(async (p, idx) => {
             await setDoc(doc(db, "pricing", (idx + 1).toString()), {
                ...p,
                lastUpdated: new Date().toISOString()
             });
          });
       } else {
          setScrapPrices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
       }
    });

    // 2. Fetch Payment Records (Completed Orders)
    const qPayments = query(collection(db, "orders"), where("status", "in", ["completed", "paid", "accepted"]));
    const unsubscribePayments = onSnapshot(qPayments, (snapshot) => {
       const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
       
       const records = orders.map(o => ({
          id: 'PAY-' + o.id.slice(-4),
          pickupId: o.id,
          userName: o.userName || 'Anonymous',
          scrapType: o.scrapType || 'Mixed',
          quantity: o.weight || o.quantity || '0 kg',
          amount: parseInt((o.collectedAmount || '0').toString().replace(/[^\d]/g, '')) || 0,
          status: o.status === 'completed' ? 'paid' : 'pending',
          paymentDate: o.completedAt || null,
          method: o.paymentMethod || 'TBD'
       }));
       setPaymentRecords(records);

       // 3. Calculate Revenue
       const today = new Date().toISOString().split('T')[0];
       const thisMonth = new Date().toISOString().slice(0, 7);
       
       const dailyRev = records.filter(p => (p.paymentDate && p.paymentDate.split(' ')[0] === today) || p.status === 'paid' && p.paymentDate === today); // simplify
       const monthlyRev = records.filter(p => p.paymentDate && p.paymentDate.includes(thisMonth));

       setRevenueData({
          daily: { 
             total: records.filter(r => r.paymentDate?.includes(today)).reduce((a, b) => a + b.amount, 0),
             transactions: records.filter(r => r.paymentDate?.includes(today)).length
          },
          monthly: {
             total: records.filter(r => r.paymentDate?.includes(thisMonth)).reduce((a, b) => a + b.amount, 0),
             transactions: records.filter(r => r.paymentDate?.includes(thisMonth)).length
          }
       });
    });

    return () => {
       unsubscribePricing();
       unsubscribePayments();
    };
  }, []);

  const totalWeight = paymentRecords.reduce((sum, p) => {
    const qty = p.quantity ? parseFloat(String(p.quantity).replace(/[^0-9.]/g, '')) : 0;
    return sum + (Number.isFinite(qty) ? qty : 0);
  }, 0);

  const uniqueCategories = new Set(paymentRecords.map(p => p.scrapType)).size;

  const handleUpdatePrice = async (id, newPrice) => {
    try {
      const priceRef = doc(db, "pricing", id);
      await updateDoc(priceRef, { 
        pricePerKg: parseFloat(newPrice), 
        lastUpdated: new Date().toISOString() 
      });
      setEditingPriceId(null);
    } catch (e) {
      console.error("Update price error:", e);
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#5D4037]">Payments & Pricing</h1>
          <p className="text-gray-600 mt-1">Manage scrap pricing and transaction records</p>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-linear-to-br from-[#66BB6A] to-[#43A047] text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Daily Revenue</h3>
            <DollarSign size={24} className="opacity-80" />
          </div>
          <p className="text-3xl font-bold">₹{revenueData.daily.total}</p>
          <p className="text-sm opacity-80 mt-1">{revenueData.daily.transactions} transactions</p>
        </div>

        <div className="bg-linear-to-br from-[#5D4037] to-[#4E342E] text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Monthly Revenue</h3>
            <TrendingUp size={24} className="opacity-80" />
          </div>
          <p className="text-3xl font-bold">₹{revenueData.monthly.total}</p>
          <p className="text-sm opacity-80 mt-1">{revenueData.monthly.transactions} transactions</p>
        </div>

        {/* Card 3: Scrap Inventory / Total Weight */}
          <div className="bg-linear-to-br from-[#FB8C00] to-[#F4511E] text-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Total Scrap Collected</h3>
              <Truck size={24} className="opacity-80" />
            </div>
            <p className="text-3xl font-bold">
              {/* Calculating total weight from your records */}
              {totalWeight.toLocaleString()} <span className="text-lg font-normal">kg</span>
            </p>
            <p className="text-sm opacity-80 mt-1">
              Across {uniqueCategories} categories today
            </p>
          </div>
      </div>

      {/* Scrap Price Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-[#5D4037]">Scrap Price Management</h2>
            <p className="text-sm text-gray-600 mt-1">Update prices per kilogram for different scrap categories</p>
          </div>
          <Package className="text-[#66BB6A]" size={32} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scrap Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price per Kg
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scrapPrices.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-[#5D4037]">{item.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingPriceId === item.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">₹</span>
                        <input
                          type="number"
                          defaultValue={item.pricePerKg}
                          id={`price-${item.id}`}
                          className="w-24 px-2 py-1 border border-[#A5D6A7] rounded focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-[#66BB6A]">₹{item.pricePerKg}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(item.lastUpdated).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {editingPriceId === item.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const newPrice = document.getElementById(`price-${item.id}`).value;
                            handleUpdatePrice(item.id, newPrice);
                          }}
                          className="text-[#66BB6A] hover:text-[#4CAF50] p-2 hover:bg-[#E8F5E9] rounded-lg transition-colors"
                          title="Save"
                        >
                          <Save size={18} />
                        </button>
                        <button
                          onClick={() => setEditingPriceId(null)}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingPriceId(item.id)}
                        className="text-[#66BB6A] hover:text-[#4CAF50] p-2 hover:bg-[#E8F5E9] rounded-lg transition-colors"
                        title="Edit Price"
                      >
                        <Edit2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Records */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-[#5D4037]">Payment Records</h2>
            <p className="text-sm text-gray-600 mt-1">Transaction history and payment status</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#66BB6A] text-white rounded-lg hover:bg-[#4CAF50] transition-colors">
            <Download size={18} />
            <span>Export Report</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pickup ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paymentRecords.map((payment) => (
                <tr key={payment.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[#5D4037]">{payment.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#5D4037]">{payment.pickupId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[#5D4037]">{payment.userName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[#5D4037]">{payment.scrapType}</div>
                    <div className="text-xs text-gray-500">{payment.quantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-bold text-[#66BB6A]">₹{payment.amount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      payment.status === 'paid'
                        ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]'
                        : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                    }`}>
                      {payment.status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payment.paymentDate ? (
                      <div>
                        <div className="text-sm text-[#5D4037]">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">{payment.method}</div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">Not yet paid</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPricing;
