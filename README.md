# ECOROUTE AI: INTELLIGENT SUSTAINABLE ROUTE PLANNING AND CARBON EMISSION ESTIMATOR

An intelligent, multi-vehicle navigation and routing web application engineered to optimize travel routes for **maximum fuel conservation and minimum carbon emissions**, accompanied by real-time fuel expenditure analytics and an integrated query support desk.

---

## 🌿 Overview

Most conventional GPS navigation systems optimize solely for the shortest arrival time (ETA), frequently routing vehicles onto high-speed expressways or congested urban corridors that burn up to 25% more fuel.

**EcoRoute AI** introduces a multi-criteria optimization framework that calculates:
1. **🌿 Green Route:** Lowest emissions and lowest fuel burn via steady-speed corridors.
2. **⚡ Fastest Route:** Express highway prioritization for minimal travel time.
3. **🛣️ Highway Bypass:** Outer ring-road cruise avoiding inner-city traffic signals.

---

## ✨ Key Features

* **Multi-Modal Vehicle Profiles:** Custom emission factors ($kg\text{ }CO_2/\text{km}$) and speed curves for Petrol/Diesel Cars, Electric Vehicles (EV), Motorbikes, and Bicycles.
* **Real-Time Fuel Analytics:** Live trip cost estimations calculated in Indian Rupees (₹) based on vehicle efficiency benchmarks.
* **Smart EV Corridors:** Range and speed-aware battery consumption modeling and highway charging corridor prioritization.
* **Interactive Route Visualizer:** Dynamic OpenStreetMap & Leaflet mapping engine with automatic boundary fitting and custom vector markers.
* **Natural Language Route Queries:** Flexible query preference input (e.g., *"Avoid tolls"*, *"EV charging corridors"*, *"Scenic bypass"*) with instant route matching badges.
* **Dedicated Authentication Portal:** Modern, compact sign-in/sign-up portal featuring **⚡ 1-Click Demo Login** and **👤 Continue as Guest**.
* **Integrated Query Desk & FAQ Hub:** Interactive query desk allowing commuters to submit inquiries, get simulated AI answers with ticket references (`ECO-XXXX`), and browse searchable FAQs.

---

## 🛠️ Technology Stack

* **Frontend Framework:** React 19.3.1 (Functional Components, Hooks)
* **Build Tooling:** Vite 8.3.6 (ES Modules, HMR, Rollup Bundler)
* **Geospatial Mapping:** Leaflet 1.9.4 & React-Leaflet 5.0.0
* **Tile & Geocoding Provider:** OpenStreetMap & Nominatim API
* **Typography & Styling:** Plus Jakarta Sans, CSS3 Grid/Flexbox, Custom Responsive Design System
* **Linting:** ESLint 10 with React Hooks & React Refresh rules

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18.x or 20.x LTS)
* `npm` (bundled with Node.js)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/zaid-annexe/ecoroute-frontend.git
   cd ecoroute-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

4. Build for production:
   ```bash
   npm run build
   ```

---

## 📄 Project Documentation

For complete academic and engineering details including mathematical formulations (Haversine distance, aerodynamic drag scaling, BSFC modeling), system architecture diagrams, and flowcharts, see:
* **[PROJECT_REPORT.md](./PROJECT_REPORT.md)**

---

## 📜 License
This project is developed for academic and sustainable travel engineering purposes.
© 2026 EcoRoute AI: Intelligent Sustainable Route Planning and Carbon Emission Estimator.
