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
}

export interface PickupRequest {
  id: string;
  lat: number;
  lng: number;
  quantity: number;
  timeSlot: string; // 'morning' | 'evening'
  scrapType: string; // e.g., 'metal', 'plastic', 'e-waste'
  priority?: number; // Higher is merged earlier
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
}

export interface RouteDetail {
  vehicleId?: string;
  stops: RouteStop[];
  totalQuantity: number;
  estimatedDistanceKm: number; // Haversine based
  realDistanceKm?: number; // Google Maps based
  polyline?: string; // Google Maps encoded polyline
}

export interface OptimizationResponse {
  status: 'success' | 'error';
  message?: string;
  data?: {
    [timeSlot: string]: RouteDetail[];
  };
}
