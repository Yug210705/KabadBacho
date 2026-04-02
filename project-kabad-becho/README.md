# Project Kabad Becho ♻️

A production-grade scrap collection and logistics platform featuring an AI-driven optimization engine.

## 🚀 Deployment Guide

### 1. Frontend (Vite + React)
**Deploy on:** [Vercel](https://vercel.com)
1.  Connect your GitHub repository to Vercel.
2.  **Project Type**: Vite.
3.  **Build Command**: `npm run build`
4.  **Output Directory**: `dist`
5.  **Environment Variables**:
    -   `VITE_BACKEND_URL`: Put the URL of your deployed backend here (e.g., `https://kabad-becho-api.onrender.com`).
    -   Add any Firebase keys used in `firebase.js`.

### 2. Backend (Node.js + Express)
**Deploy on:** [Render](https://render.com) (Recommended)
1.  Create a **New Web Service** on Render.
2.  **Root Directory**: `backend`
3.  **Build Command**: `npm install && npm run build`
4.  **Start Command**: `npm start`
5.  **Environment Variables**:
    -   `PORT`: `4000`
    -   `GOOGLE_MAPS_API_KEY`: (Optional if using OSRM, but keep for future use)

## 🛠️ Local Setup

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
npm install
npm run dev
```

---

## 🏗️ Architecture
- **Optimization**: Clarke-Wright Savings Algorithm (Custom TS implementation).
- **Routing**: Road-aware geometry calculation using OSRM.
- **Sync**: Real-time location updates via Firebase Firestore.
- **Maps**: Interactive Leaflet maps with custom emoji markers.
