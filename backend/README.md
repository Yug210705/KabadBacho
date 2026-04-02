# Production-Grade CVRP Pickup Optimization Engine

A high-performance Node.js backend optimization engine that solves a real-world Capacitated Vehicle Routing Problem (CVRP) for your scrap logistics business, integrated natively into your admin dashboard.

## 🧱 1. Architecture Overview
We've introduced a robust standalone Express backend service (`/backend`) coupled with a React UI modal on the frontend that orchestrates the execution and analysis of the optimization.

- **Backend:** Node.js + TypeScript + Express.
- **Frontend Integration:** Added to `UserRequests.jsx` with a dedicated new stateful component `RouteOptimizerModal.jsx`.
- **Live Maps:** Enhanced your current `LiveMap.jsx` to parse generated routing nodes into `polylines` and visually map the output trajectory.

## 🧠 2. Clarke-Wright Parallel Savings Heuristic Implementation
Taking heavy inspiration from `ScrapLink_ClarkeWright_Indore.ipynb`, the Engine strictly adheres to mathematical constraints without sacrificing execution speed.

### Constraints Honored:
1. **Time Slot & Scrap Type Consistency (Grouping Mechanism)**
   Requests are segmented dynamically. We do not mix *morning* pick-ups with *evening*, nor *metal* scrap with *e-waste*.
2. **Deterministic Vehicle Capacity Limit (800kg)**
   During every greedy merge sequence (merging Route A and Route B), the engine preemptively gauges if the total cumulative load breaches 800.
3. **Endpoint Proximity Checks**
   Nodes cannot be sandwiched within pre-allocated routes. Only terminal nodes of currently built routes are candidates to accept incoming node connections.

### Distance Methodology
- **Pre-Computation (`Haversine`)**: Distance arrays map pairwise distances leveraging spherical trigonometries (Haversine format).
- **Secondary Enhancement (`Google Maps - Stub`)**: Ready hook in `utils/googleMaps.ts` that will query `directions API` if an API key is plugged into `.env`. Failing that, logic seamlessly defaults to Haversine fallback to guarantee deterministic completion without crashing.

## 🔌 3. API Contract Schema
The robust implementation mirrors the contract spec.

**MANDATORY INPUT:**
POST `/optimize-routes`

## 🛠️ 4. How to Bring Online

Since this logic executes securely on the backend layer, you must run the server for the AI generation to take place:

1. **Launch the Node.js API**
   Open a terminal:
   ```bash
   cd backend
   npm run dev
   ```
   *Note: This will bind the engine to `localhost:4000`.*

2. **Trigger Frontend Execution**
   - Click "Optimize Routes" inside the User Requests Dashboard to interface with this backend.
