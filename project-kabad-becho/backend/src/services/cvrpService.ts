import { OptimizationRequest, PickupRequest, RouteDetail, RouteStop } from '../models/types';
import { haversineDistance, routeHaversineDistance } from '../utils/haversine';
import { fetchRouteInfo } from '../utils/routeService';

export class CvrpEngine {
  constructor(private req: OptimizationRequest) {}

  public async optimize(): Promise<{ [timeSlot: string]: RouteDetail[] }> {
    const { depot, vehicleCapacity, requests, vehicles } = this.req;

    // 1. Validation & Preprocessing
    const validRequests = requests.filter(r => {
      return (
        r.lat && r.lng && 
        r.quantity > 0 && 
        r.quantity <= vehicleCapacity && 
        r.timeSlot && 
        r.scrapType
      );
    });

    // 2. Partition by Time Slot and Scrap Type
    // ADHERES TO CONSTRAINTS: Ensures different scrap types aren't mixed in the same truck load
    // grouped: { timeSlot: { scrapType: [ requests ] } }
    const grouped: Record<string, Record<string, PickupRequest[]>> = {};

    for (const r of validRequests) {
      if (!grouped[r.timeSlot]) grouped[r.timeSlot] = {};
      if (!grouped[r.timeSlot][r.scrapType]) grouped[r.timeSlot][r.scrapType] = [];
      grouped[r.timeSlot][r.scrapType].push(r);
    }

    const availableVehicles = [...vehicles.filter(v => v.status === 'available')];
    const results: Record<string, RouteDetail[]> = {};

    for (const timeSlot in grouped) {
      results[timeSlot] = [];
      const scrapGroups = grouped[timeSlot];

      for (const scrapType in scrapGroups) {
        let nodes = scrapGroups[scrapType];

        // Merge identical locations / duplicates
        nodes = this.mergeDuplicates(nodes);

        // Run Clarke-Wright for this group
        const routes = this.clarkeWright(nodes, depot, vehicleCapacity);

        // Enrich Routes
        for (const route of routes) {
          results[timeSlot].push(await this.enrichRoute(route, depot));
        }
      }

      // Vehicle Assignment heuristic for this timeslot
      // We assign routes to available vehicles. If overflow occurs, we reuse or create virtual vehicles.
      this.assignVehicles(results[timeSlot], availableVehicles);
    }

    return results;
  }

  private mergeDuplicates(nodes: PickupRequest[]): PickupRequest[] {
    const mergedMap = new Map<string, PickupRequest>();
    for (const node of nodes) {
      // Key by coordinate string
      const coordKey = `${node.lat.toFixed(5)}_${node.lng.toFixed(5)}`;
      if (mergedMap.has(coordKey)) {
        const existing = mergedMap.get(coordKey)!;
        existing.quantity += node.quantity;
        // Keep highest priority
        existing.priority = Math.max(existing.priority || 0, node.priority || 0);
        // We can comma-separate IDs to denote cluster.
        existing.id = existing.id.includes(node.id) ? existing.id : `${existing.id},${node.id}`;
      } else {
        mergedMap.set(coordKey, { ...node });
      }
    }
    // Prioritize processing: sort by priority DESC
    return Array.from(mergedMap.values()).sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  private clarkeWright(nodes: PickupRequest[], depot: any, capacity: number): PickupRequest[][] {
    const n = nodes.length;
    if (n === 0) return [];
    if (n === 1) return [[nodes[0]]];

    // 1. Compute all pairwise savings
    const savings: { i: number; j: number; saving: number }[] = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const s =
          haversineDistance(depot, nodes[i]) +
          haversineDistance(depot, nodes[j]) -
          haversineDistance(nodes[i], nodes[j]);
        
        // Add a tiny bit of "noise" (0.1%) to break ties and allow for alternative routes
        // This makes the algorithm stochastic rather than purely deterministic
        const noise = (Math.random() - 0.5) * (s * 0.001);
        savings.push({ i, j, saving: s + noise });
      }
    }

    // Sort savings descending
    savings.sort((a, b) => b.saving - a.saving);

    // 2. Initialize star solution
    let routes: (PickupRequest[] | null)[] = nodes.map(node => [node]);
    let routeQty: number[] = nodes.map(node => node.quantity);
    let routeOf: number[] = Array.from({ length: n }, (_, k) => k);

    const endpoints = (ri: number) => {
      const r = routes[ri];
      if (!r) return { head: '', tail: '' };
      return { head: r[0].id, tail: r[r.length - 1].id };
    };

    // 3. Greedy merge
    for (const { i, j } of savings) {
      const ri = routeOf[i];
      const rj = routeOf[j];

      if (ri === rj) continue; // Already same route
      if (!routes[ri] || !routes[rj]) continue;

      // Constraint 3 - Capacity
      if (routeQty[ri] + routeQty[rj] > capacity) continue;

      // Endpoint check
      const ciId = nodes[i].id;
      const cjId = nodes[j].id;
      const epsI = endpoints(ri);
      const epsJ = endpoints(rj);

      if (ciId !== epsI.head && ciId !== epsI.tail) continue;
      if (cjId !== epsJ.head && cjId !== epsJ.tail) continue;

      // Orient: ci becomes tail of ri, cj becomes head of rj
      if (ciId === epsI.head) routes[ri]!.reverse();
      if (cjId === epsJ.tail) routes[rj]!.reverse();

      // Merge
      const newRoute = [...routes[ri]!, ...routes[rj]!];
      routes[ri] = newRoute;
      routeQty[ri] += routeQty[rj];
      routes[rj] = null;
      routeQty[rj] = 0;
      
      // Update route map
      for (const req of newRoute) {
        const k = nodes.findIndex(n => n.id === req.id);
        if (k !== -1) routeOf[k] = ri;
      }
    }

    return routes.filter(r => r !== null) as PickupRequest[][];
  }

  private async enrichRoute(routeItems: PickupRequest[], depot: any): Promise<RouteDetail> {
    const stops: RouteStop[] = [];
    const depotStop: RouteStop = { id: depot.id, lat: depot.lat, lng: depot.lng, quantity: 0, type: 'depot' };
    
    stops.push(depotStop);
    for (const item of routeItems) {
      stops.push({
        id: item.id.split(',')[0], // Primary block id
        requestIds: item.id.split(','),
        lat: item.lat,
        lng: item.lng,
        quantity: item.quantity,
        type: 'request'
      });
    }
    stops.push({ ...depotStop }); // End at depot

    const qty = routeItems.reduce((sum, r) => sum + r.quantity, 0);
    const estDist = routeHaversineDistance(stops);

    const mapData = await fetchRouteInfo(stops);

    return {
      stops,
      totalQuantity: qty,
      estimatedDistanceKm: estDist,
      realDistanceKm: mapData.distance || estDist, // Fallback to Haversine
      polyline: mapData.polyline
    };
  }

  private assignVehicles(routes: RouteDetail[], availableVehicles: any[]) {
    // Assign vehicles safely
    let vIdx = 0;
    for (const route of routes) {
      if (availableVehicles.length > 0) {
        // Round robin assignment if multiple trips needed
        route.vehicleId = availableVehicles[vIdx % availableVehicles.length].id;
        vIdx++;
      } else {
        route.vehicleId = 'VIRTUAL_TRUCK_1';
      }
    }
  }
}
