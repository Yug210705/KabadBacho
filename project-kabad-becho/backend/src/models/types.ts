export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Depot extends GeoPoint {
  id: string;
}

export interface Vehicle {
  id: string;
  status: string; // 'available', etc.
  name?: string;
}

export interface PickupRequest {
  id: string;
  lat: number;
  lng: number;
  quantity: number;
  timeSlot: string; // 'morning' | 'evening'
  scrapType: string; // e.g., 'metal', 'plastic', 'e-waste'
  priority?: number; // Higher is merged earlier
  userName?: string;
  address?: string;
}

export interface OptimizationRequest {
  depot: Depot;
  vehicleCapacity: number;
  vehicles: Vehicle[];
  requests: PickupRequest[];
}

export interface RouteStop {
  id: string;
  lat: number;
  lng: number;
  quantity: number;
  type?: 'depot' | 'request';
  requestIds?: string[]; // In case we merged overlapping requests
  sequenceNumber?: number; // Order in which the pickup person visits this stop
  userName?: string;
  address?: string;
}

export interface RouteDetail {
  vehicleId?: string;
  driverName?: string;
  shiftSlot?: string; // 'morning' | 'evening'
  scrapType?: string; // The scrap type for this route (no mixing)
  stops: RouteStop[];
  totalQuantity: number;
  estimatedDistanceKm: number; // Haversine based
  realDistanceKm?: number; // OSRM road-aware distance
  polyline?: string; // OSRM road-aware polyline
}

export interface OptimizationResponse {
  status: 'success' | 'error';
  message?: string;
  data?: {
    [timeSlot: string]: RouteDetail[];
  };
}
