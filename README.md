# SmartRoute — Smart Route Optimization System for Last-Mile Delivery

A production-quality last-mile delivery route optimization platform with real Dijkstra and A* implementations, multi-stop optimization, 2-opt improvement, and a professional enterprise logistics control tower UI.

## Tech Stack

### Frontend
- React.js + Vite
- Tailwind CSS
- React Router
- Mapbox GL JS
- Recharts, Framer Motion, React Icons, React Hot Toast
- Zustand (state management)

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcrypt

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Mapbox access token

### Backend Setup
```bash
cd backend
cp .env.example .env  # Fill in your values
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
cp .env.example .env  # Fill in your values
npm install
npm run dev
```

### Seed Data
```bash
cd backend
npm run seed
```

## Project Structure
```
smart-route/
├── frontend/          # React + Vite frontend
├── backend/           # Express.js backend
├── README.md
├── .gitignore
└── .env.example
```

## Features
- Dashboard / Command Center with live map
- Order, Vehicle, Driver management
- Route optimization with Dijkstra & A*
- Multi-stop sequencing (Nearest Neighbor)
- 2-opt route improvement
- Vehicle assignment with capacity constraints
- Time window validation
- Timeline view
- Algorithm benchmarking
- Live route simulation
- Analytics dashboard
- Dark/Light mode
