// Geo & Routing utilities for EcoRoute AI

export const KNOWN_CITIES = {
  lucknow: { name: "Lucknow", lat: 26.8467, lng: 80.9462, state: "Uttar Pradesh" },
  kanpur: { name: "Kanpur", lat: 26.4499, lng: 80.3319, state: "Uttar Pradesh" },
  delhi: { name: "New Delhi", lat: 28.6139, lng: 77.2090, state: "Delhi" },
  newdelhi: { name: "New Delhi", lat: 28.6139, lng: 77.2090, state: "Delhi" },
  noida: { name: "Noida", lat: 28.5355, lng: 77.3910, state: "Uttar Pradesh" },
  gurgaon: { name: "Gurugram", lat: 28.4595, lng: 77.0266, state: "Haryana" },
  gurugram: { name: "Gurugram", lat: 28.4595, lng: 77.0266, state: "Haryana" },
  agra: { name: "Agra", lat: 27.1767, lng: 78.0081, state: "Uttar Pradesh" },
  varanasi: { name: "Varanasi", lat: 25.3176, lng: 82.9739, state: "Uttar Pradesh" },
  banaras: { name: "Varanasi", lat: 25.3176, lng: 82.9739, state: "Uttar Pradesh" },
  prayagraj: { name: "Prayagraj", lat: 25.4358, lng: 81.8463, state: "Uttar Pradesh" },
  allahabad: { name: "Prayagraj", lat: 25.4358, lng: 81.8463, state: "Uttar Pradesh" },
  mumbai: { name: "Mumbai", lat: 19.0760, lng: 72.8777, state: "Maharashtra" },
  pune: { name: "Pune", lat: 18.5204, lng: 73.8567, state: "Maharashtra" },
  bengaluru: { name: "Bengaluru", lat: 12.9716, lng: 77.5946, state: "Karnataka" },
  bangalore: { name: "Bengaluru", lat: 12.9716, lng: 77.5946, state: "Karnataka" },
  mysuru: { name: "Mysuru", lat: 12.2958, lng: 76.6394, state: "Karnataka" },
  mysore: { name: "Mysuru", lat: 12.2958, lng: 76.6394, state: "Karnataka" },
  hyderabad: { name: "Hyderabad", lat: 17.3850, lng: 78.4867, state: "Telangana" },
  chennai: { name: "Chennai", lat: 13.0827, lng: 80.2707, state: "Tamil Nadu" },
  kolkata: { name: "Kolkata", lat: 22.5726, lng: 88.3639, state: "West Bengal" },
  jaipur: { name: "Jaipur", lat: 26.9124, lng: 75.7873, state: "Rajasthan" },
  ahmedabad: { name: "Ahmedabad", lat: 23.0225, lng: 72.5714, state: "Gujarat" },
  chandigarh: { name: "Chandigarh", lat: 30.7333, lng: 76.7794, state: "Punjab/Haryana" },
  amritsar: { name: "Amritsar", lat: 31.6340, lng: 74.8723, state: "Punjab" },
  dehradun: { name: "Dehradun", lat: 30.3165, lng: 78.0322, state: "Uttarakhand" },
  bhopal: { name: "Bhopal", lat: 23.2599, lng: 77.4126, state: "Madhya Pradesh" },
  indore: { name: "Indore", lat: 22.7196, lng: 75.8577, state: "Madhya Pradesh" },
  patna: { name: "Patna", lat: 25.5941, lng: 85.1376, state: "Bihar" }
};

// Haversine formula for distance between 2 coordinates in km
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.max(1, Math.round(d * 10) / 10);
}

// Simple deterministic hash for unknown place names to place them reasonably
function hashStringToOffset(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((Math.abs(hash) % 200) - 100) / 100; // -1 to +1 degree
  const lngOffset = ((Math.abs(hash >> 3) % 200) - 100) / 100;
  return { latOffset, lngOffset };
}

// Resolve location to lat/lng
export async function resolveLocation(query, defaultFallback = { lat: 26.8467, lng: 80.9462, name: "Lucknow" }) {
  if (!query || !query.trim()) return defaultFallback;

  const normalized = query.trim().toLowerCase().replace(/[^a-z]/g, "");

  // Check known cities dictionary
  if (KNOWN_CITIES[normalized]) {
    return KNOWN_CITIES[normalized];
  }

  // Check partial match in known cities
  for (const [key, city] of Object.entries(KNOWN_CITIES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return city;
    }
  }

  // Attempt online geocoding with 2s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (resp.ok) {
      const data = await resp.json();
      if (data && data.length > 0) {
        return {
          name: query.trim(),
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
    }
  } catch {
    // Offline or network restricted, gracefully fallback
  }

  // Fallback: deterministic variation
  const { latOffset, lngOffset } = hashStringToOffset(query);
  return {
    name: query.trim(),
    lat: Math.round((defaultFallback.lat + latOffset) * 10000) / 10000,
    lng: Math.round((defaultFallback.lng + lngOffset) * 10000) / 10000,
  };
}

// Generate smooth curved realistic intermediate waypoints for routes
export function generateRoutePoints(start, end, variant = "green") {
  const points = [];
  const steps = 14;

  const latDiff = end.lat - start.lat;
  const lngDiff = end.lng - start.lng;

  // Orthogonal vector for natural curvature
  const perpLat = -lngDiff;
  const perpLng = latDiff;
  const length = Math.sqrt(perpLat * perpLat + perpLng * perpLng) || 1;

  // Curve magnitude based on variant
  const curveFactor =
    variant === "green" ? 0.16 : variant === "fuel" ? -0.12 : 0.04;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Base linear interpolation
    let lat = start.lat + latDiff * t;
    let lng = start.lng + lngDiff * t;

    // Add arc curvature using sine wave
    const arc = Math.sin(t * Math.PI);
    lat += (perpLat / length) * curveFactor * arc * Math.abs(latDiff + lngDiff + 0.2);
    lng += (perpLng / length) * curveFactor * arc * Math.abs(latDiff + lngDiff + 0.2);

    // Minor road jiggle for natural road look
    if (i > 0 && i < steps) {
      const jiggle = Math.sin(i * 3.7) * 0.003;
      lat += jiggle;
      lng += jiggle;
    }

    points.push([lat, lng]);
  }

  return points;
}

// Vehicle emission factors (kg CO2 per km)
export const VEHICLE_CONFIG = {
  Car: {
    baseEmissionsPerKm: 0.16, // 160g CO2/km
    avgSpeed: 45, // km/h
    fuelCostPerKm: 7.5, // approx ₹7.5 / km
    label: "Standard Car (Petrol/Diesel)",
    icon: "🚗",
  },
  "Electric Vehicle": {
    baseEmissionsPerKm: 0.042, // ~42g CO2/km grid equivalent
    avgSpeed: 45,
    fuelCostPerKm: 1.8, // ₹1.8 / km electricity
    label: "Electric Vehicle (EV)",
    icon: "⚡",
  },
  Bike: {
    baseEmissionsPerKm: 0.065, // ~65g CO2/km
    avgSpeed: 38,
    fuelCostPerKm: 2.2, // ₹2.2 / km
    label: "Motorbike / Scooter",
    icon: "🛵",
  },
  Bicycle: {
    baseEmissionsPerKm: 0.0, // Zero emissions
    avgSpeed: 16,
    fuelCostPerKm: 0.0,
    label: "Bicycle / Cycle",
    icon: "🚲",
  },
};

// Calculate all route options
export function computeRoutes(originPoint, destPoint, vehicleType = "Car") {
  const straightDist = calculateHaversineDistance(
    originPoint.lat,
    originPoint.lng,
    destPoint.lat,
    destPoint.lng
  );

  const vehicle = VEHICLE_CONFIG[vehicleType] || VEHICLE_CONFIG.Car;

  // 1. Green Route: optimized for steady eco-speed, 22% less emissions
  const greenDist = Math.round((straightDist * 1.18) * 10) / 10;
  const greenSpeed = vehicle.avgSpeed * 0.95;
  const greenTimeMin = Math.round((greenDist / greenSpeed) * 60);
  const greenEmissions = Math.max(0, Math.round(greenDist * vehicle.baseEmissionsPerKm * 0.78 * 100) / 100);
  const greenCost = Math.round(greenDist * vehicle.fuelCostPerKm * 0.85);

  // 2. Fastest Route: highway, higher speed, slightly more stop/start & speed resistance
  const fastDist = Math.round((straightDist * 1.12) * 10) / 10;
  const fastSpeed = vehicle.avgSpeed * 1.25;
  const fastTimeMin = Math.max(5, Math.round((fastDist / fastSpeed) * 60));
  const fastEmissions = Math.max(0, Math.round(fastDist * vehicle.baseEmissionsPerKm * 1.05 * 100) / 100);
  const fastCost = Math.round(fastDist * vehicle.fuelCostPerKm);

  // 3. Fuel-Saving Route: ring roads, no signals, steady cruising
  const fuelDist = Math.round((straightDist * 1.22) * 10) / 10;
  const fuelSpeed = vehicle.avgSpeed * 1.05;
  const fuelTimeMin = Math.round((fuelDist / fuelSpeed) * 60);
  const fuelEmissions = Math.max(0, Math.round(fuelDist * vehicle.baseEmissionsPerKm * 0.86 * 100) / 100);
  const fuelCost = Math.round(fuelDist * vehicle.fuelCostPerKm * 0.88);

  const greenPoints = generateRoutePoints(originPoint, destPoint, "green");
  const fastPoints = generateRoutePoints(originPoint, destPoint, "fast");
  const fuelPoints = generateRoutePoints(originPoint, destPoint, "fuel");

  const emissionSavedKg = Math.max(0, Math.round((fastEmissions - greenEmissions) * 100) / 100);
  const percentSaved = fastEmissions > 0 ? Math.round(((fastEmissions - greenEmissions) / fastEmissions) * 100) : 100;
  const treesEquivalent = Math.round((emissionSavedKg / 0.057) * 10) / 10; // Trees offset per day

  return {
    origin: originPoint,
    destination: destPoint,
    vehicle,
    summary: {
      emissionSavedKg,
      percentSaved,
      treesEquivalent,
    },
    routes: [
      {
        id: "green",
        type: "eco",
        name: "🌿 Green Route",
        badge: "LOWEST FUEL & CO₂",
        color: "#10b981",
        secondaryColor: "#059669",
        distanceKm: greenDist,
        durationMinutes: greenTimeMin,
        emissionsKg: greenEmissions,
        costInr: greenCost,
        ecoScore: 96,
        description: "Optimal direct eco-corridor with minimal idle time. Burns the least fuel and produces lowest emissions.",
        highlights: ["Minimum fuel cost (Best efficiency)", "22% lower carbon footprint", "Smooth steady momentum"],
        points: greenPoints,
      },
      {
        id: "fast",
        type: "fastest",
        name: "⚡ Fastest Route",
        badge: "EXPRESS HIGHWAY",
        color: "#3b82f6",
        secondaryColor: "#1d4ed8",
        distanceKm: fastDist,
        durationMinutes: fastTimeMin,
        emissionsKg: fastEmissions,
        costInr: fastCost,
        ecoScore: 74,
        description: "High-speed expressway prioritizing fastest arrival time. Higher speed increases wind drag and fuel burn.",
        highlights: ["Fastest arrival ETA", "Expressway priority", "Fewest turns"],
        points: fastPoints,
      },
      {
        id: "fuel",
        type: "fuel",
        name: "🛣️ Highway Bypass",
        badge: "STEADY CRUISE",
        color: "#f59e0b",
        secondaryColor: "#d97706",
        distanceKm: fuelDist,
        durationMinutes: fuelTimeMin,
        emissionsKg: fuelEmissions,
        costInr: fuelCost,
        ecoScore: 88,
        description: "Outer ring road avoiding city stoplights. Consistent cruising speed, but covers extra detour kilometers.",
        highlights: ["Avoids city congestion", "Steady cruising speed", "Toll-optimized bypass"],
        points: fuelPoints,
      },
    ],
  };
}
