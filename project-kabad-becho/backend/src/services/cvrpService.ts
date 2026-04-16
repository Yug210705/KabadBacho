import { OptimizationRequest, PickupRequest, RouteDetail, RouteStop } from '../models/types';
import { haversineDistance, routeHaversineDistance } from '../utils/haversine';
import { fetchRouteInfo } from '../utils/routeService';

/**
 * Clarke-Wright Parallel Savings Heuristic — CVRP Engine
 * 
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  STRICT CONSTRAINTS ENFORCED:                                   ║
 * ║  1. Separate van per scrap type — NO mixing on one vehicle      ║
 * ║  2. Morning/Evening time slots = independent problems           ║
 * ║  3. Vehicle capacity = 800 kg — merge rejected if > 800 kg     ║
 * ║  4. Every pickup visited exactly ONCE per slot                  ║
 * ║  5. Every route starts and ends at the depot                    ║
 * ║  6. Savings list sorted DESCENDING; only feasible merges        ║
 * ║  7. Each driver assigned to exactly ONE shift (morning OR eve)  ║
 * ║  8. Sequence numbers assigned to each stop in visit order       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 * 
 * Locations: Real lat/lng from Nominatim/OpenStreetMap
 * Road distances: OSRM (Open Source Routing Machine)
 */
export class CvrpEngine {
  constructor(private req: OptimizationRequest) {}

  public async optimize(): Promise<{ [timeSlot: string]: RouteDetail[] }> {
    const { depot, vehicleCapacity, requests, vehicles } = this.req;

    // ═══════════════════════════════════════════════════
    // 1. VALIDATION & PREPROCESSING — reject invalid data
    // ═══════════════════════════════════════════════════
    const validRequests = requests.filter(r => {
      return (
        r.lat && r.lng && 
        typeof r.lat === 'number' && typeof r.lng === 'number' &&
        r.quantity > 0 && 
        r.quantity <= vehicleCapacity && 
        r.timeSlot && 
        r.scrapType
      );
    });

    // ═══════════════════════════════════════════════════════════════════
    // 2. PARTITION BY TIME SLOT AND SCRAP TYPE (Constraints 1 & 2)
    //    Morning and Evening are COMPLETELY INDEPENDENT problems.
    //    Within each slot, each scrap type gets its OWN set of routes
    //    — no mixing of scrap categories on one vehicle.
    // ═══════════════════════════════════════════════════════════════════
    const grouped: Record<string, Record<string, PickupRequest[]>> = {};

    for (const r of validRequests) {
      if (!grouped[r.timeSlot]) grouped[r.timeSlot] = {};
      if (!grouped[r.timeSlot][r.scrapType]) grouped[r.timeSlot][r.scrapType] = [];
      grouped[r.timeSlot][r.scrapType].push(r);
    }

    // Track which vehicles are already consumed (one driver = one shift only)
    const availableVehicles = [...vehicles.filter(v => v.status === 'available')];
    const usedDriverIds = new Set<string>();
    const results: Record<string, RouteDetail[]> = {};

    for (const timeSlot in grouped) {
      results[timeSlot] = [];
      const scrapGroups = grouped[timeSlot];

      for (const scrapType in scrapGroups) {
        let nodes = scrapGroups[scrapType];

        // Merge identical locations / duplicates (Constraint 4 — each visited once)
        nodes = this.mergeDuplicates(nodes);

        // ═════════════════════════════════════════════════
        // 3. RUN CLARKE-WRIGHT for this scrap type group
        //    (Constraints 3, 5, 6 enforced inside)
        // ═════════════════════════════════════════════════
        const routes = this.clarkeWright(nodes, depot, vehicleCapacity);

        // Enrich each route with OSRM road data + sequence numbers
        for (const route of routes) {
          const enriched = await this.enrichRoute(route, depot, scrapType, timeSlot);
          results[timeSlot].push(enriched);
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // 4. VEHICLE/DRIVER ASSIGNMENT (Constraint 7)
      //    Each driver is assigned to exactly one shift.
      //    Round-robin from available pool, skip already-used drivers.
      // ═══════════════════════════════════════════════════════════════
      this.assignVehicles(results[timeSlot], availableVehicles, usedDriverIds);
    }

    return results;
  }

  /**
   * Merge requests at identical coordinates into clusters.
   * Constraint 4 — every pickup visited exactly once.
   */
  private mergeDuplicates(nodes: PickupRequest[]): PickupRequest[] {
    const mergedMap = new Map<string, PickupRequest>();
    for (const node of nodes) {
      const coordKey = `${node.lat.toFixed(5)}_${node.lng.toFixed(5)}`;
      if (mergedMap.has(coordKey)) {
        const existing = mergedMap.get(coordKey)!;
        existing.quantity += node.quantity;
        existing.priority = Math.max(existing.priority || 0, node.priority || 0);
        existing.id = existing.id.includes(node.id) ? existing.id : `${existing.id},${node.id}`;
        // Preserve metadata
        if (node.userName && !existing.userName) existing.userName = node.userName;
        if (node.address && !existing.address) existing.address = node.address;
      } else {
        mergedMap.set(coordKey, { ...node });
      }
    }
    // Sort by priority DESC for processing
    return Array.from(mergedMap.values()).sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  /**
   * Clarke-Wright Parallel Savings Heuristic
   * 
   * Enforces:
   *  - Constraint 3: capacity ≤ 800 kg
   *  - Constraint 5: every route starts/ends at depot (star → merge)
   *  - Constraint 6: savings sorted descending, only feasible merges
   *  - NO noise/randomness — purely deterministic
   */
  private clarkeWright(nodes: PickupRequest[], depot: any, capacity: number): PickupRequest[][] {
    const n = nodes.length;
    if (n === 0) return [];
    if (n === 1) return [[nodes[0]]];

    // ─── Step 1: Compute ALL pairwise savings ───
    // s(i,j) = d(depot,i) + d(depot,j) - d(i,j)
    const savings: { i: number; j: number; saving: number }[] = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const s =
          haversineDistance(depot, nodes[i]) +
          haversineDistance(depot, nodes[j]) -
          haversineDistance(nodes[i], nodes[j]);
        
        // Constraint 6: NO noise — strictly deterministic savings
        savings.push({ i, j, saving: s });
      }
    }

    // Constraint 6: Sort savings DESCENDING
    savings.sort((a, b) => b.saving - a.saving);

    // ─── Step 2: Initialize star solution (each node = its own route) ───
    // Constraint 5: each route implicitly starts/ends at depot
    let routes: (PickupRequest[] | null)[] = nodes.map(node => [node]);
    let routeQty: number[] = nodes.map(node => node.quantity);
    let routeOf: number[] = Array.from({ length: n }, (_, k) => k);

    const endpoints = (ri: number) => {
      const r = routes[ri];
      if (!r) return { head: '', tail: '' };
      return { head: r[0].id, tail: r[r.length - 1].id };
    };

    // ─── Step 3: Greedy merge — only feasible merges accepted ───
    for (const { i, j } of savings) {
      const ri = routeOf[i];
      const rj = routeOf[j];

      // Already same route — skip
      if (ri === rj) continue;
      if (!routes[ri] || !routes[rj]) continue;

      // ──── Constraint 3: CAPACITY CHECK (800 kg) ────
      if (routeQty[ri] + routeQty[rj] > capacity) continue;

      // ──── ENDPOINT CHECK (can only merge at route endpoints) ────
      const ciId = nodes[i].id;
      const cjId = nodes[j].id;
      const epsI = endpoints(ri);
      const epsJ = endpoints(rj);

      if (ciId !== epsI.head && ciId !== epsI.tail) continue;
      if (cjId !== epsJ.head && cjId !== epsJ.tail) continue;

      // Orient: ci becomes tail of ri, cj becomes head of rj
      if (ciId === epsI.head) routes[ri]!.reverse();
      if (cjId === epsJ.tail) routes[rj]!.reverse();

      // Merge route rj into ri
      const newRoute = [...routes[ri]!, ...routes[rj]!];
      routes[ri] = newRoute;
      routeQty[ri] += routeQty[rj];
      routes[rj] = null;
      routeQty[rj] = 0;
      
      // Update route membership map
      for (const req of newRoute) {
        const k = nodes.findIndex(n => n.id === req.id);
        if (k !== -1) routeOf[k] = ri;
      }
    }

    return routes.filter(r => r !== null) as PickupRequest[][];
  }

  /**
   * Enrich a route with:
   *  - Depot as first and last stop (Constraint 5)
   *  - Sequence numbers for each stop
   *  - OSRM road distance and polyline
   *  - Scrap type and shift metadata
   */
  private async enrichRoute(
    routeItems: PickupRequest[], 
    depot: any, 
    scrapType: string, 
    timeSlot: string
  ): Promise<RouteDetail> {
    const stops: RouteStop[] = [];
    
    // Constraint 5: Start at depot (sequence 0)
    const depotStop: RouteStop = { 
      id: depot.id, 
      lat: depot.lat, 
      lng: depot.lng, 
      quantity: 0, 
      type: 'depot',
      sequenceNumber: 0
    };
    stops.push(depotStop);

    // Add pickup stops with sequence numbers
    for (let idx = 0; idx < routeItems.length; idx++) {
      const item = routeItems[idx];
      stops.push({
        id: item.id.split(',')[0], // Primary request id
        requestIds: item.id.split(','),
        lat: item.lat,
        lng: item.lng,
        quantity: item.quantity,
        type: 'request',
        sequenceNumber: idx + 1, // 1-indexed sequence
        userName: item.userName,
        address: item.address
      });
    }

    // Constraint 5: End at depot
    stops.push({ 
      ...depotStop, 
      sequenceNumber: routeItems.length + 1 
    });

    const qty = routeItems.reduce((sum, r) => sum + r.quantity, 0);
    const estDist = routeHaversineDistance(stops);

    // Fetch real-world road data from OSRM
    const mapData = await fetchRouteInfo(stops);

    return {
      stops,
      totalQuantity: qty,
      estimatedDistanceKm: estDist,
      realDistanceKm: mapData.distance || estDist, // Fallback to Haversine
      polyline: mapData.polyline,
      scrapType,
      shiftSlot: timeSlot
    };
  }

  /**
   * Assign vehicles/drivers to routes.
   * Constraint 7: Each driver serves exactly ONE shift.
   */
  private assignVehicles(
    routes: RouteDetail[], 
    availableVehicles: any[], 
    usedDriverIds: Set<string>
  ) {
    let virtualCounter = 1;

    for (const route of routes) {
      // Find the next available driver NOT already used in another shift
      const availableDriver = availableVehicles.find(v => !usedDriverIds.has(v.id));
      
      if (availableDriver) {
        route.vehicleId = availableDriver.id;
        route.driverName = availableDriver.name || availableDriver.id;
        usedDriverIds.add(availableDriver.id);
      } else {
        // All real drivers used — assign a virtual placeholder
        route.vehicleId = `VIRTUAL_TRUCK_${virtualCounter}`;
        route.driverName = `Virtual Driver ${virtualCounter}`;
        virtualCounter++;
      }
    }
  }
}
