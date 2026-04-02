import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Helper: Haversine distance in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Generic updateHistory helper
function updateHistory(history, newStatus) {
  const ordered = ['Booked', 'Confirmed', 'Driver Assigned', 'Out for Pickup', 'Collected', 'Payment Done'];
  const newIdx = ordered.indexOf(newStatus);
  return history.map(h => {
      const hIdx = ordered.indexOf(h.status);
      const now = new Date();
      return {
         ...h,
         completed: hIdx <= newIdx,
         time: (hIdx <= newIdx && !h.completed && hIdx === newIdx) ? now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : h.time,
         date: (hIdx <= newIdx && !h.completed && hIdx === newIdx) ? now.toLocaleDateString() : h.date
      };
  });
}

// Custom hook to manage real-time tracking
export const useRealtimeTracking = (orderId, initialData) => {
  const [trackingData, setTrackingData] = useState(initialData);
  const [eta, setEta] = useState(null);
  
  // 1. Listen to Firestore for realtime updates
  useEffect(() => {
    if (!orderId || !db) return;

    const orderRef = doc(db, 'orders', orderId);
    const unsubscribe = onSnapshot(orderRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTrackingData(prev => ({
          ...prev,
          ...data,
          // Merge history safely
          statusHistory: data.statusHistory || prev.statusHistory
        }));
      }
    }, (err) => {
      console.warn("Firestore listener error:", err);
    });

    return () => unsubscribe();
  }, [orderId]);

  // 2. Geolocation Watcher: Tracks driver location and pushes to Firestore
  useEffect(() => {
    if (!orderId || !navigator.geolocation) return;
    // Only watch if status is active
    if (trackingData.status !== 'Driver Assigned' && trackingData.status !== 'Out for Pickup') return;

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newLoc = { lat: latitude, lng: longitude };
        
        if (db) {
          try {
            const orderRef = doc(db, 'orders', orderId);
            // Dynamic status calc based on proximity
            let newStatus = trackingData.status;
            if (trackingData.pickupLocation) {
              const dist = calculateDistance(latitude, longitude, trackingData.pickupLocation.lat, trackingData.pickupLocation.lng);
              if (dist < 0.2 && trackingData.status !== 'Collected') newStatus = 'Collected';
              else if (dist < 2 && trackingData.status === 'Driver Assigned') newStatus = 'Out for Pickup';
            }

            await updateDoc(orderRef, { driverLocation: newLoc, status: newStatus });
          } catch (e) {
            console.error("Failed to push GPS to Firebase:", e);
          }
        }
      },
      (err) => console.warn("GPS tracking error:", err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [orderId, trackingData.status, trackingData.pickupLocation]);

  // 3. Smooth Animation / Interpolation Engine (Optional: Demo Helper)
  // This smoothly moves the truck toward the pickup location for a high-end feel.
  useEffect(() => {
    if (!trackingData?.driverLocation || !trackingData?.pickupLocation) return;
    if (trackingData.status !== 'Driver Assigned' && trackingData.status !== 'Out for Pickup') return;

    const interval = setInterval(() => {
      setTrackingData(prev => {
        if (!prev.driverLocation || !prev.pickupLocation) return prev;
        
        const latDiff = prev.pickupLocation.lat - prev.driverLocation.lat;
        const lngDiff = prev.pickupLocation.lng - prev.driverLocation.lng;
        
        // If we are essentially there, stop simulation
        if (Math.abs(latDiff) < 0.00005 && Math.abs(lngDiff) < 0.00005) return prev;

        return {
          ...prev,
          driverLocation: {
            lat: prev.driverLocation.lat + (latDiff * 0.01), // Move 1% for smoothness
            lng: prev.driverLocation.lng + (lngDiff * 0.01)
          }
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [trackingData.status]);

  // 4. Calculate ETA
  useEffect(() => {
    if (trackingData?.driverLocation && trackingData?.pickupLocation) {
      if (trackingData.status === 'Collected' || trackingData.status === 'Payment Done') {
        setEta('Arrived');
        return;
      }
      const dist = calculateDistance(trackingData.driverLocation.lat, trackingData.driverLocation.lng, trackingData.pickupLocation.lat, trackingData.pickupLocation.lng);
      const timeMinutes = Math.round((dist / 30) * 60); // 30km/h avg
      setEta(timeMinutes < 1 ? 'Driver arriving now' : `Driver arriving in ${timeMinutes} mins`);
    } else {
      setEta('Calculating...');
    }
  }, [trackingData.driverLocation, trackingData.status]);

  // Status updates (Manual/Admin Override logic)
  const updateStatus = async (newStatus) => {
    if (!db || !orderId) return;
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
    } catch (e) {
      console.warn("Manual update failed:", e);
    }
  };

  return { trackingData, eta, updateStatus };
};
