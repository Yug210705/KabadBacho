import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom icons using emojis
const createEmojiIcon = (emoji, color = '#66BB6A') => new L.divIcon({
  html: `<div style="font-size: 20px; background: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3); border: 2px solid ${color};">${emoji}</div>`,
  className: 'custom-emoji-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

const driverIcon = createEmojiIcon('🚚', '#2196F3');
const pickupIcon = createEmojiIcon('📍', '#FF9800');
const deliveryIcon = createEmojiIcon('🏭', '#4CAF50');
const routeIcon = createEmojiIcon('♻️', '#9C27B0');

const MapBounds = ({ locations }) => {
  const map = useMap();
  useEffect(() => {
    if (locations && locations.length > 0) {
      const validLocations = locations.filter(loc => loc && loc.lat && loc.lng);
      if (validLocations.length > 1) {
        const bounds = L.latLngBounds(validLocations.map(loc => [loc.lat, loc.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
      } else if (validLocations.length === 1) {
        map.setView([validLocations[0].lat, validLocations[0].lng], 13);
      }
    }
  }, [locations, map]);
  return null;
};

const LiveMap = ({ driverLocation, pickupLocation, deliveryLocation, routeStops = [], complexRoute = null }) => {
  console.log("LiveMap props:", { driverLocation, pickupLocation, deliveryLocation, routeStops, complexRoute });

  const defaultCenter = { lat: 22.7196, lng: 75.8577 }; // Indore Default
  const centerCandidate = routeStops.length > 0 ? routeStops[0] : (pickupLocation && pickupLocation.lat ? pickupLocation : defaultCenter);
  
  // Ensure we have valid numbers
  const center = {
    lat: Number(centerCandidate?.lat) || defaultCenter.lat,
    lng: Number(centerCandidate?.lng) || defaultCenter.lng
  };

  const activeLocations = [driverLocation, pickupLocation, deliveryLocation, ...routeStops]
    .filter(loc => loc && typeof loc.lat === 'number' && typeof loc.lng === 'number');

  console.log("Active locations for bounds:", activeLocations);

  // Extract route positions for the polyline (fallback to straight lines)
  const straightLinePositions = routeStops
    .filter(s => s && typeof s.lat === 'number' && typeof s.lng === 'number')
    .map(s => [s.lat, s.lng]);

  return (
    <div className="w-full h-full min-h-[300px] rounded-xl overflow-hidden border-2 border-[#66BB6A] z-0 relative">
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', zIndex: 1, minHeight: '300px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Real Road Path (From OSRM) */}
        {complexRoute && complexRoute.length > 0 && (
          <Polyline positions={complexRoute} pathOptions={{ color: '#2E7D32', weight: 4, opacity: 0.8 }} />
        )}

        {/* Fallback Straight Dotted Line (If no roads available) */}
        {!complexRoute && straightLinePositions.length > 1 && (
          <Polyline positions={straightLinePositions} pathOptions={{ color: '#2196F3', weight: 3, dashArray: '5, 10' }} />
        )}

        {/* Draw Route Stops */}
        {routeStops.map((stop, idx) => (
          (typeof stop.lat === 'number' && typeof stop.lng === 'number') ? (
            <Marker 
              key={`stop-${idx}`} 
              position={[stop.lat, stop.lng]} 
              icon={stop.type === 'depot' ? deliveryIcon : routeIcon}
            >
              <Popup>
                <strong>{(stop.type || 'PICKUP').toUpperCase()}:</strong> {stop.id} <br/>
                Quantity: {stop.quantity || 'N/A'} kg
              </Popup>
            </Marker>
          ) : null
        ))}

        {/* Legacy single points */}
        {!routeStops.length && pickupLocation && typeof pickupLocation.lat === 'number' && (
          <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={pickupIcon}>
            <Popup>Pickup Location</Popup>
          </Marker>
        )}
        {!routeStops.length && deliveryLocation && typeof deliveryLocation.lat === 'number' && (
          <Marker position={[deliveryLocation.lat, deliveryLocation.lng]} icon={deliveryIcon}>
            <Popup>Delivery Warehouse</Popup>
          </Marker>
        )}

        {/* Driver location */}
        {driverLocation && typeof driverLocation.lat === 'number' && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
            <Popup>Driver Location</Popup>
          </Marker>
        )}

        <MapBounds locations={activeLocations} />
      </MapContainer>
    </div>
  );
};

export default LiveMap;
