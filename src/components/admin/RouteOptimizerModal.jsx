import React, { useState, useEffect } from 'react';
import { Truck, X, Route as RouteIcon, Target, Loader2, Hash, MapPin, Clock, Package } from 'lucide-react';
import LiveMap from '../User/LiveMap';
import { db } from '../../firebase';
import { collection, getDocs, query, where, writeBatch, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const RouteOptimizerModal = ({ isOpen, onClose, requests }) => {
  const [loading, setLoading] = useState(false);
  const [routesData, setRoutesData] = useState(null);
  const [error, setError] = useState('');
  const [availableDrivers, setAvailableDrivers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const fetchDrivers = async () => {
        try {
          const q = query(collection(db, "users"), where("role", "==", "kabadi"), where("approvalStatus", "==", "approved"));
          const querySnapshot = await getDocs(q);
          const drivers = [];
          querySnapshot.forEach((doc) => {
            drivers.push({ 
              id: doc.id, 
              name: doc.data().displayName || doc.data().name || 'Driver',
              shift: doc.data().assignedShift || null
            });
          });
          setAvailableDrivers(drivers);
        } catch (err) {
          console.error("Failed to fetch drivers:", err);
          setAvailableDrivers([]);
        }
      };
      fetchDrivers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOptimize = async () => {
    setLoading(true);
    setError('');

    // Filter only requests with real geocoded coordinates (NO hardcoding)
    const validRequests = requests
      .filter(r => r.status === 'pending' || r.status === 'accepted')
      .filter(r => {
        // ONLY use orders that have been properly geocoded with real coordinates
        const lat = r.location?.lat;
        const lng = r.location?.lng;
        if (!lat || !lng) return false;
        if (typeof lat !== 'number' || typeof lng !== 'number') return false;
        // Reject suspicious fallback coordinates
        if (Math.abs(lat) < 1 || Math.abs(lng) < 1) return false;
        return true;
      });

    if (validRequests.length === 0) {
      setError('No requests with valid geocoded addresses found. Ensure pickup addresses have been properly geocoded before optimization.');
      setLoading(false);
      return;
    }

    // Prepare payload — ONLY real coordinates, no fallbacks
    const payload = {
      depot: { id: "INDORE_DEPOT", lat: 22.7411, lng: 75.8355 }, // Admin's depot in Indore
      vehicleCapacity: 800,
      vehicles: availableDrivers.map((d) => ({ id: d.id, status: "available", name: d.name, shift: d.shift })),
      requests: validRequests.map(r => {
        const timeStr = (r.preferredTime || r.time || '').toLowerCase();
        const isEvening = timeStr.includes('pm') || timeStr.includes('afternoon') || timeStr.includes('evening');
        return {
          id: r.id,
          lat: r.location.lat,
          lng: r.location.lng,
          quantity: parseInt(r.quantity) || parseInt(r.weight) || 50,
          timeSlot: isEvening ? 'evening' : 'morning',
          scrapType: r.scrapType || 'mixed',
          priority: r.status === 'accepted' ? 2 : 1,
          userName: r.userName || r.name || 'Customer',
          address: r.address || 'N/A'
        };
      })
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

  /**
   * Save optimized routes to Firestore:
   * 1. Write each route to a 'routes' collection (for pickup persons to read)
   * 2. Update individual orders with driverId + sequence info
   */
  const handleSaveAndAssign = async () => {
    try {
      const batch = writeBatch(db);
      let hasUpdates = false;
      const routeDate = new Date().toISOString().split('T')[0]; // Today's date

      for (const timeSlot of Object.keys(routesData)) {
        const routes = routesData[timeSlot];
        
        for (let routeIdx = 0; routeIdx < routes.length; routeIdx++) {
          const route = routes[routeIdx];
          const routeId = `${routeDate}_${timeSlot}_${routeIdx}`;
          
          // ─── Save route document for pickup persons ───
          const routeRef = doc(db, "routes", routeId);
          batch.set(routeRef, {
            routeId,
            driverId: route.vehicleId,
            driverName: route.driverName || route.vehicleId,
            shiftSlot: timeSlot,
            scrapType: route.scrapType || 'mixed',
            totalQuantity: route.totalQuantity || 0,
            estimatedDistanceKm: route.estimatedDistanceKm || 0,
            realDistanceKm: route.realDistanceKm ?? null,
            polyline: route.polyline ? JSON.stringify(route.polyline) : null,
            stops: route.stops.map(s => ({
              id: s.id,
              lat: s.lat,
              lng: s.lng,
              quantity: s.quantity || 0,
              type: s.type || 'request',
              sequenceNumber: s.sequenceNumber || 0,
              requestIds: s.requestIds || [],
              userName: s.userName || '',
              address: s.address || ''
            })),
            createdAt: serverTimestamp(),
            date: routeDate,
            status: 'assigned'
          });

          // ─── Update individual orders ───
          route.stops.forEach((stop, sIdx) => {
            if (stop.type === 'request' && stop.requestIds) {
              stop.requestIds.forEach(reqId => {
                const reqRef = doc(db, "orders", reqId);
                batch.update(reqRef, {
                  status: 'accepted',
                  driverId: route.vehicleId,
                  driverName: route.driverName || route.vehicleId,
                  assignedDate: new Date().toLocaleString(),
                  routeId: routeId,
                  sequenceNumber: stop.sequenceNumber,
                  shiftSlot: timeSlot,
                  scrapType: route.scrapType
                });
                hasUpdates = true;
              });
            }
          });
        }
      }

      if (hasUpdates) {
        await batch.commit();
        alert("✅ Routes committed successfully!\n\nDrivers will now see their assigned shifts and optimized pickup sequence in their dashboards.");
      } else {
        alert("No requests were assigned.");
      }
      onClose();
    } catch (err) {
      console.error("Failed to commit routes:", err);
      const msg = `Failed to assign routes: ${err?.message || err?.toString()}`;
      setError(msg);
      alert(msg);
    }
  };

  // Count valid geocoded requests
  const geocodedCount = requests.filter(r => 
    (r.status === 'pending' || r.status === 'accepted') && 
    r.location?.lat && r.location?.lng &&
    typeof r.location.lat === 'number' && typeof r.location.lng === 'number'
  ).length;

  const totalPending = requests.filter(r => r.status === 'pending' || r.status === 'accepted').length;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-start z-[100] p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-5xl shadow-2xl flex flex-col my-auto h-fit min-h-[60vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#f0f9f1] rounded-t-xl sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-[#2e7d32] flex items-center gap-2">
              <RouteIcon className="text-[#4CAF50]" /> AI Route Optimization Engine
            </h2>
            <p className="text-sm text-[#4CAF50] font-medium mt-1">Clarke-Wright CVRP Algorithm — Strict Constraint Enforcement</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 flex-1 flex flex-col">
          {!routesData && !loading && (
            <div className="text-center py-16 flex flex-col items-center">
              <Target size={64} className="text-[#81C784] mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">Ready to Optimize {geocodedCount} Requests?</h3>
              
              {/* Constraint Summary */}
              <div className="text-left max-w-md mx-auto mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-sm text-gray-700 mb-3">Constraints Applied:</h4>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  <li className="flex items-center gap-2">✅ Separate van per scrap type — no mixing</li>
                  <li className="flex items-center gap-2">✅ Morning/Evening shifts — independent problems</li>
                  <li className="flex items-center gap-2">✅ Vehicle capacity = 800 kg max</li>
                  <li className="flex items-center gap-2">✅ Each pickup visited exactly once</li>
                  <li className="flex items-center gap-2">✅ Every route starts & ends at depot</li>
                  <li className="flex items-center gap-2">✅ Savings sorted descending — deterministic</li>
                  <li className="flex items-center gap-2">✅ One driver per route only (Drivers can take multiple consecutive routes)</li>
                </ul>
              </div>

              {geocodedCount < totalPending && (
                <p className="text-amber-600 text-sm font-medium mb-4 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  ⚠️ {totalPending - geocodedCount} of {totalPending} pending requests have no geocoded address and will be skipped.
                </p>
              )}

              <button 
                onClick={handleOptimize}
                disabled={geocodedCount === 0}
                className="bg-[#4CAF50] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#388E3C] shadow-lg shadow-green-500/30 transition transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <RouteIcon /> Run Optimization ({geocodedCount} orders)
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
                      <h4 className="font-bold text-[#388E3C] uppercase text-sm mb-3 tracking-wider border-l-4 border-[#4CAF50] pl-2 flex items-center gap-2">
                        <Clock size={14} /> {timeSlot} Shift
                      </h4>
                      <div className="space-y-4">
                        {routesData[timeSlot].map((route, idx) => (
                          <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="font-bold text-gray-700 flex items-center gap-1"><Truck size={16} className="text-[#2196F3]"/> {route.driverName || route.vehicleId}</span>
                                {route.scrapType && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md border border-purple-100 ml-1 uppercase">{route.scrapType}</span>
                                )}
                              </div>
                              <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100">{route.totalQuantity} kg</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-3 font-semibold">
                              Haversine: <span className="text-gray-800">{route.estimatedDistanceKm?.toFixed(2)} km</span>
                              {route.realDistanceKm && route.realDistanceKm !== route.estimatedDistanceKm && (
                                <> | Road: <span className="text-blue-600">{route.realDistanceKm?.toFixed(2)} km</span></>
                              )}
                            </p>
                            
                            {/* Optimized Pickup Sequence — visible to admin */}
                            <div className="ml-2 border-l-2 border-dashed border-gray-300 pl-4 space-y-3 relative">
                              {route.stops.map((stop, sIdx) => (
                                <div key={sIdx} className="relative">
                                  <div className={`absolute -left-[21px] top-1 w-2 h-2 rounded-full ${stop.type === 'depot' ? 'bg-[#4CAF50] ring-2 ring-[#C8E6C9]' : 'bg-[#FF9800] ring-2 ring-[#FFE0B2]'}`}></div>
                                  <div className="flex items-center gap-2">
                                    {stop.sequenceNumber !== undefined && (
                                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${stop.type === 'depot' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                        #{stop.sequenceNumber}
                                      </span>
                                    )}
                                    <p className="text-sm font-semibold text-gray-800 leading-tight">
                                      {stop.type === 'depot' ? '🏭 Central Depot' : `📍 ${stop.userName || stop.id}`}
                                    </p>
                                  </div>
                                  {stop.type !== 'depot' && stop.address && (
                                    <p className="text-xs text-gray-500 mt-0.5 ml-8">{stop.address}</p>
                                  )}
                                  {stop.quantity > 0 && <p className="text-xs text-gray-500 mt-0.5 ml-8">Collect {stop.quantity} kg</p>}
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
