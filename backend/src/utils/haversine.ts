import { GeoPoint } from '../models/types';

export function haversineDistance(p1: GeoPoint, p2: GeoPoint): number {
  if (p1.lat === p2.lat && p1.lng === p2.lng) return 0;

  const R = 6371.0; // Earth's radius in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180.0;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180.0;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180.0) *
      Math.cos((p2.lat * Math.PI) / 180.0) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
      
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function routeHaversineDistance(route: GeoPoint[]): number {
  if (route.length < 2) return 0;
  let dist = 0;
  for (let i = 0; i < route.length - 1; i++) {
    dist += haversineDistance(route[i], route[i + 1]);
  }
  return dist;
}
