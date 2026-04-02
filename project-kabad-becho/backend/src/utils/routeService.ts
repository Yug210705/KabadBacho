import { RouteStop } from '../models/types';

/**
 * Fetches routing info from OSRM (Open Source Routing Machine).
 * Free, no API key needed, and compatible with Leaflet on the frontend.
 * Falls back gracefully if the request fails.
 */
export async function fetchRouteInfo(stops: RouteStop[]): Promise<{ distance?: number; polyline?: string }> {
  try {
    if (stops.length < 2) return {};

    // Build OSRM coordinates string: lng,lat;lng,lat;...
    const coordinates = stops.map(s => `${s.lng},${s.lat}`).join(';');

    const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      // OSRM GeoJSON returns [lng, lat], we swap to [lat, lng] for Leaflet
      const routeCoords = route.geometry.coordinates.map((coord: any) => [coord[1], coord[0]]);
      
      return {
        distance: route.distance / 1000, // Convert meters to km
        polyline: routeCoords // Now a list of [lat, lng]
      };
    }

    return {};
  } catch (error) {
    console.warn('OSRM routing failed, falling back to Haversine:', error);
    return {};
  }
}
