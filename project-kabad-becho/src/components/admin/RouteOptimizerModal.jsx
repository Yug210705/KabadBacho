import React, { useState, useEffect } from 'react';
import { Truck, X, Route as RouteIcon, Target, Loader2 } from 'lucide-react';
import LiveMap from '../User/LiveMap';
import { db } from '../../firebase';
import { collection, getDocs, query, where, writeBatch, doc } from 'firebase/firestore';

const RouteOptimizerModal = ({ isOpen, onClose, requests }) => {
  const [loading, setLoading] = useState(false);
  const [routesData, setRoutesData] = useState(null);
  const [error, setError] = useState('');
  const [availableDrivers, setAvailableDrivers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const fetchDrivers = async () => {
        try {
          const q = query(collection(db, "users"), where("role", "==", "kabadi"));
          const querySnapshot = await getDocs(q);
          const drivers = [];
          querySnapshot.forEach((doc) => {
            drivers.push({ id: doc.id, name: doc.data().displayName || doc.data().name || 'Driver' });
          });
          // Fallback if no drivers found
          if (drivers.length === 0) {
             drivers.push({ id: 'V1', name: 'Virtual Driver 1' });
             drivers.push({ id: 'V2', name: 'Virtual Driver 2' });
          }
          setAvailableDrivers(drivers);
        } catch (err) {
          console.error("Failed to fetch drivers:", err);
          setAvailableDrivers([{ id: 'V1', name: 'Virtual Driver 1' }, { id: 'V2', name: 'Virtual Driver 2' }]);
        }
      };
      fetchDrivers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOptimize = async () => {
    setLoading(true);
    setError('');

    // Prepare payload
    const payload = {
      depot: { id: "INDORE_DEPOT", lat: 22.7411, lng: 75.8355 },
      vehicleCapacity: 800,
      vehicles: availableDrivers.map((d, index) => ({ id: d.id, status: "available" })),
      requests: requests.filter(r => r.status === 'pending' || r.status === 'accepted').map(r => ({
        id: r.id,
        lat: r.location?.lat || 22.7196,
        lng: r.location?.lng || 75.8577,
        quantity: parseInt(r.quantity) || parseInt(r.weight) || 50,
        timeSlot: r.preferredTime?.toLowerCase().includes('am') || r.time?.toLowerCase().includes('morning') ? 'morning' : 'evening',
        scrapType: r.scrapType || 'mixed',
        priority: r.status === 'accepted' ? 2 : 1,
        userName: r.userName || r.name || 'Customer',
        address: r.address || 'N/A'
      }))
    };

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
      const res = await fetch(`${backendUrl}/optimize-routes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.status === 'success') {
        setRoutesData(data.data);
      } else {
        setError(data.message || 'Optimization failed');
      }
    } catch (err) {
      setError('Failed to connect to Optimization Engine. Ensure the backend is running on port 4000.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndAssign = async () => {
    try {
      const batch = writeBatch(db);
      let hasUpdates = false;

      Object.keys(routesData).forEach(timeSlot => {
        routesData[timeSlot].forEach(route => {
          route.stops.forEach(stop => {
            if (stop.type === 'request' && stop.requestIds) {
              stop.requestIds.forEach(reqId => {
                const reqRef = doc(db, "orders", reqId);
                batch.update(reqRef, {
                  status: 'accepted',
                  driverId: route.vehicleId,
                  assignedDate: new Date().toLocaleString()
                });
                hasUpdates = true;
              });
            }
          });
        });
      });

      if (hasUpdates) {
        await batch.commit();
        alert("Successfully committed optimized routes. Drivers will now see their assigned shifts.");
      } else {
        alert("No requests were assigned.");
      }
      onClose();
    } catch (error) {
      console.error("Error assigning routes:", error);
      alert("Failed to assign routes. Ensure you have permissions and network connectivity.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center z-[100] p-4 py-10 overflow-auto">
      <div className="bg-white rounded-xl w-full max-w-5xl shadow-2xl flex flex-col min-h-full">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#f0f9f1] rounded-t-xl sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-[#2e7d32] flex items-center gap-2">
              <RouteIcon className="text-[#4CAF50]" /> AI Route Optimization Engine
            </h2>
            <p className="text-sm text-[#4CAF50] font-medium mt-1">Clarke-Wright CVRP Algorithm (Haversine & Real-world Constraints)</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 flex-1 flex flex-col">
          {!routesData && !loading && (
            <div className="text-center py-20 flex flex-col items-center">
              <Target size={64} className="text-[#81C784] mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">Ready to Optimize {requests.length} Requests?</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Our AI-driven engine groups requests by time slot and scrap type, then calculates the most efficient vehicle routing using the Clarke-Wright savings algorithm.
              </p>
              <button 
                onClick={handleOptimize}
                className="bg-[#4CAF50] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#388E3C] shadow-lg shadow-green-500/30 transition transform hover:scale-105 flex items-center gap-2"
              >
                <RouteIcon /> Run Optimization
              </button>
              {error && <p className="text-red-500 mt-4 text-sm font-semibold bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}
            </div>
          )}

          {loading && (
            <div className="text-center py-24 flex flex-col items-center flex-1 justify-center">
              <Loader2 className="animate-spin text-[#4CAF50] mx-auto mb-4" size={48} />
              <p className="text-[#2e7d32] font-semibold text-xl">Computing Optimal Routes...</p>
              <p className="text-gray-500 text-sm mt-2 animate-pulse">Running Clarke-Wright Savings Heuristic</p>
            </div>
          )}

          {routesData && !loading && (
            <div className="flex flex-col h-full space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 max-h-[50vh] overflow-y-auto">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 sticky top-0 bg-gray-50 pb-2 border-b border-gray-200">Generated Itineraries</h3>
                  
                  {Object.keys(routesData).length === 0 && <p className="text-gray-500 italic">No routes generated.</p>}

                  {Object.keys(routesData).map(timeSlot => (
                    <div key={timeSlot} className="mb-6">
                      <h4 className="font-bold text-[#388E3C] uppercase text-sm mb-3 tracking-wider border-l-4 border-[#4CAF50] pl-2">{timeSlot} Shift</h4>
                      <div className="space-y-4">
                        {routesData[timeSlot].map((route, idx) => (
                          <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-gray-700 flex items-center gap-1"><Truck size={16} className="text-[#2196F3]"/> {route.vehicleId}</span>
                              <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100">{route.totalQuantity} kg load</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-3 font-semibold">Dist: <span className="text-gray-800">{route.estimatedDistanceKm.toFixed(2)} km</span></p>
                            
                            <div className="ml-2 border-l-2 border-dashed border-gray-300 pl-4 space-y-3 relative">
                              {route.stops.map((stop, sIdx) => (
                                <div key={sIdx} className="relative">
                                  <div className={`absolute -left-[21px] top-1 w-2 h-2 rounded-full ${stop.type === 'depot' ? 'bg-[#4CAF50] ring-2 ring-[#C8E6C9]' : 'bg-[#FF9800] ring-2 ring-[#FFE0B2]'}`}></div>
                                  <p className="text-sm font-semibold text-gray-800 leading-tight">
                                    {stop.type === 'depot' ? 'Central Depot' : `${stop.userName || stop.id}`}
                                  </p>
                                  {stop.type !== 'depot' && stop.address && (
                                    <p className="text-xs text-gray-500 mt-0.5">{stop.address}</p>
                                  )}
                                  {stop.quantity > 0 && <p className="text-xs text-gray-500 mt-0.5">Collect {stop.quantity} kg</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm flex flex-col h-full bg-white">
                  <LiveMap 
                    routeStops={Object.values(routesData).flatMap(r => r).flatMap(route => route.stops)}
                    complexRoute={Object.values(routesData).flatMap(r => r).flatMap(route => route.polyline || [])}
                  />
                </div>
                
                {/* Save and Assign Button */}
                <div className="mt-8 flex justify-end gap-4">
                   <button 
                     onClick={() => setRoutesData(null)}
                     className="px-6 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition"
                   >
                     Reset
                   </button>
                   <button 
                     onClick={handleSaveAndAssign}
                     className="px-8 py-3 bg-[#2E7D32] text-white font-bold rounded-xl shadow-lg hover:bg-[#1B5E20] transition transform active:scale-95"
                   >
                     Save & Assign to Drivers
                   </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteOptimizerModal;
