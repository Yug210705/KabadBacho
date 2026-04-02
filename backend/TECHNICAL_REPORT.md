# Technical Deep Dive: Kabad Becho Optimization Engine

This document provides a technical explanation of the backend architecture, the routing algorithm, and how the entire system solves the Capacitated Vehicle Routing Problem (CVRP) for scrap collection.

---

## 1. The Core Problem: CVRP
Collect scrap from $N$ customers using $M$ vehicles with limited capacity, while minimizing total travel distance. 
Unlike a simple Traveling Salesman Problem (TSP), CVRP adds two main constraints:
1. **Vehicle Capacity**: A truck cannot pick up more than it can carry.
2. **Time/Type Constraints**: Each collection has a preferred time (Morning/Evening) and must be kept separate by scrap type (e.g., Metal vs. Plastic).

---

## 2. The Algorithm: Clarke–Wright Savings
To solve this efficiently, we implemented the **Clarke–Wright Savings Algorithm**, a greedy heuristic that works by calculating the "savings" of merging two routes.

### How it works:
1. **Initial State (Star Routes)**: Imagine every single pickup has its own dedicated truck going from the **Depot -> Pickup -> Depot**.
2. **Calculate Savings ($S_{ij}$)**: For every pair of pickup locations ($i$ and $j$), we calculate how much distance we save if we visit them in one trip ($Depot \to i \to j \to Depot$) instead of two separate trips.
   - Formula: $S_{ij} = d(Depot, i) + d(Depot, j) - d(i, j)$
3. **Merge Greedy**: We sort all possible pairs by their "Savings" in descending order.
4. **Validation**: We merge a pair $i$ and $j$ into a single route ONLY if:
   - They are at the end points of their current routes.
   - The combined quantity does not exceed the **Vehicle Capacity**.
   - They belong to the same **Scrap Category**.

---

## 3. Backend Implementation Workflow
The `CvrpEngine` (`backend/src/services/cvrpService.ts`) executes the following lifecycle for every optimization request:

### Step A: Partitioning & Preprocessing
The engine first groups requests by **Time Slot** and **Scrap Type**. This ensures that:
- Morning pickups are never scheduled for evening trucks.
- "Plastic" pickups are never mixed with "Metal" in the same sub-route unless explicitly allowed.

### Step B: Location Merging (Clustering)
If three different neighbors in the same building all request a pickup, the engine "merges" them into a single **Stop**. 
- It sums their total quantity.
- It calculates a single GPS coordinate for the group.
- This prevents the truck from "driving around the block" three times for the same building.

### Step C: The Clarke-Wright Loop
The engine runs the savings calculation described above for each partition. It outputs a collection of `Routes`, where each route is a list of `Stops`.

### Step D: Route Enrichment (The Road Logic)
The output of Clarke-Wright is just a sequence of coordinates. To make it "real," we pass every route through the **OSRM Route Service**:
1. **Snap to Roads**: It converts coordinate points into a real driving path.
2. **Polyline Generation**: It returns an encoded string (Polyline) that represents the exact curves of the road.
3. **Road Distance**: It replaces "straight-line" distance with "actual driving distance" in km.

---

## 4. Real-Time Logic (Frontend Sync)
Once the backend calculates these routes, it pushes them to the frontend via the API.
- **Leaflet Integration**: The `polyline` from the backend is fed directly into the map.
- **Dynamic ETA**: As the driver moves, the frontend recalculates the remaining distance to the next stop using the same OSRM logic, giving the user a highly accurate "Time to Pickup."

---

### Implementation Summary
| Component | Responsibility | Technology |
|:---|:---|:---|
| **Logic Layer** | CVRP & Priority Management | TypeScript Engine |
| **Algorithm** | Clarke-Wright Heuristic | Custom implementation |
| **Road Mapping** | Real road distance & Polylines | OSRM API |
| **Tracking** | Driver location & status sync | Firebase Firestore |
