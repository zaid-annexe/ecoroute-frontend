import { useState } from "react";
import MapView from "./MapView";
import { resolveLocation, computeRoutes, VEHICLE_CONFIG, KNOWN_CITIES } from "./utils/geoUtils";
import LoginPage from "./components/LoginPage";
import QueryModal from "./components/QueryModal";
import heroImg from "./assets/hero.png";
import "./App.css";

const PRESET_ROUTES = [
  { from: "Lucknow", to: "Kanpur", label: "Lucknow ➔ Kanpur" },
  { from: "Delhi", to: "Agra", label: "Delhi ➔ Agra" },
  { from: "Mumbai", to: "Pune", label: "Mumbai ➔ Pune" },
  { from: "Bengaluru", to: "Mysuru", label: "Bengaluru ➔ Mysuru" },
];

function getQueryMatch(route, queryText) {
  if (!queryText || !queryText.trim()) return null;
  const q = queryText.toLowerCase();
  if ((q.includes("carbon") || q.includes("eco") || q.includes("green") || q.includes("saving")) && route.id === "green") {
    return "🌟 Top match for carbon & eco query";
  }
  if ((q.includes("fast") || q.includes("speed") || q.includes("quick") || q.includes("express")) && route.id === "fast") {
    return "⚡ Top match for fastest arrival query";
  }
  if ((q.includes("toll") || q.includes("bypass") || q.includes("cruise") || q.includes("highway")) && route.id === "fuel") {
    return "🛣️ Top match for bypass & cruising query";
  }
  if ((q.includes("ev") || q.includes("electric") || q.includes("charg")) && route.id === "green") {
    return "⚡ Recommended for EV charging corridors";
  }
  return null;
}

function getInitialParams() {
  if (typeof window === "undefined") {
    return { from: "Lucknow", to: "Kanpur", vehicle: "Car", query: "" };
  }
  try {
    const params = new URLSearchParams(window.location.search);
    const fromParam = params.get("from") || params.get("origin") || "Lucknow";
    const toParam = params.get("to") || params.get("destination") || "Kanpur";
    const vehicleParam = params.get("vehicle");
    const validVehicle = vehicleParam && VEHICLE_CONFIG[vehicleParam] ? vehicleParam : "Car";
    const queryParam = params.get("query") || "";
    return { from: fromParam, to: toParam, vehicle: validVehicle, query: queryParam };
  } catch {
    return { from: "Lucknow", to: "Kanpur", vehicle: "Car", query: "" };
  }
}

function App() {
  // Authentication state - loads login page first if null
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("ecoroute_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Query Desk Modal state
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);

  // Route calculation states initialized with URL params if provided
  const [initialParams] = useState(getInitialParams);
  const [origin, setOrigin] = useState(initialParams.from);
  const [destination, setDestination] = useState(initialParams.to);
  const [vehicle, setVehicle] = useState(initialParams.vehicle);
  const [routeQuery, setRouteQuery] = useState(initialParams.query);
  const [loading, setLoading] = useState(false);
  const [routeData, setRouteData] = useState(() =>
    computeRoutes(KNOWN_CITIES.lucknow, KNOWN_CITIES.kanpur, initialParams.vehicle)
  );
  const [selectedRouteId, setSelectedRouteId] = useState("green");
  const [errorMsg, setErrorMsg] = useState("");

  // Compute routes on search or selection
  async function handleFindRoutes(startQuery = origin, endQuery = destination, vType = vehicle) {
    if (!startQuery.trim() || !endQuery.trim()) {
      setErrorMsg("Please enter both starting point and destination.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const originLoc = await resolveLocation(startQuery, {
        lat: 26.8467,
        lng: 80.9462,
        name: startQuery,
      });

      const destLoc = await resolveLocation(endQuery, {
        lat: 26.4499,
        lng: 80.3319,
        name: endQuery,
      });

      const calculated = computeRoutes(originLoc, destLoc, vType);
      setRouteData(calculated);
      setSelectedRouteId("green"); // default to recommended eco route
    } catch (err) {
      console.error("Routing calculation error:", err);
      setErrorMsg("Unable to compute route. Please try another location.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    handleFindRoutes(origin, destination, vehicle);
  }

  function handleSwapLocations() {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    if (routeData) {
      handleFindRoutes(destination, temp, vehicle);
    }
  }

  function handleSelectPreset(preset) {
    setOrigin(preset.from);
    setDestination(preset.to);
    handleFindRoutes(preset.from, preset.to, vehicle);
  }

  function handleVehicleChange(newVehicle) {
    setVehicle(newVehicle);
    if (routeData) {
      handleFindRoutes(origin, destination, newVehicle);
    }
  }

  function handleLogout() {
    localStorage.removeItem("ecoroute_user");
    setUser(null);
  }

  const activeRoute =
    routeData?.routes?.find((r) => r.id === selectedRouteId) ||
    routeData?.routes?.[0];

  // If user is not logged in, render the Login Page first
  if (!user) {
    return (
      <>
        <LoginPage
          onLogin={(loggedInUser) => setUser(loggedInUser)}
          onOpenQuery={() => setIsQueryModalOpen(true)}
        />
        <QueryModal
          isOpen={isQueryModalOpen}
          onClose={() => setIsQueryModalOpen(false)}
          user={null}
        />
      </>
    );
  }

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <span className="logo-icon">🌿</span>
            <span className="logo-name">EcoRoute</span>
            <span className="logo-badge">AI</span>
          </div>

          <div className="nav-links">
            <a href="#planner">Plan Route</a>
            <a href="#map">Interactive Map</a>
            <a href="#impact">Eco Impact</a>
            <a href="#features">Features</a>
          </div>

          <div className="nav-actions">
            <button
              type="button"
              className="nav-query-btn"
              onClick={() => setIsQueryModalOpen(true)}
              title="Open Support & Travel Query Desk"
            >
              <span>💬 Queries</span>
              <span className="nav-query-badge">Help</span>
            </button>

            <div className="user-profile-badge" title={`Signed in as ${user.email || user.name}`}>
              <span className="user-avatar">{user.avatar || "👤"}</span>
              <span className="user-name">{user.name || "Traveler"}</span>
            </div>

            <button
              type="button"
              className="logout-btn"
              onClick={handleLogout}
              title="Log out and return to Login Screen"
            >
              Log Out
            </button>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-pill">
                <span className="pill-dot"></span>
                <span>AI-POWERED LOW CARBON NAVIGATION</span>
              </div>
              <h1>
                Travel Smarter.<br />
                <span className="gradient-text">Breathe Greener.</span>
              </h1>
              <p className="hero-desc">
                Discover intelligent navigation optimized for lower fuel
                consumption, reduced carbon footprint, and minimal idle time.
                Compare routes side-by-side with real-time eco analytics.
              </p>

              <div className="hero-actions">
                <a href="#planner" className="primary-btn">
                  Start Planning →
                </a>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setIsQueryModalOpen(true)}
                >
                  Ask a Query 💬
                </button>
              </div>

              <div className="hero-stats">
                <div className="stat-card">
                  <span className="stat-num">22%</span>
                  <span className="stat-label">Avg. CO₂ Reduced</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-card">
                  <span className="stat-num">1.4M+</span>
                  <span className="stat-label">Green Kilometers</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-card">
                  <span className="stat-num">₹1.8k</span>
                  <span className="stat-label">Avg. Monthly Fuel Saved</span>
                </div>
              </div>
            </div>

            <div className="hero-art-wrapper">
              <div className="hero-art-glow"></div>
              <img
                src={heroImg}
                alt="EcoRoute Eco Mobility"
                className="hero-image"
              />
              <div className="floating-badge badge-top">
                <span className="badge-icon">🌱</span>
                <div>
                  <strong>Eco Mode</strong>
                  <span>Low Emissions</span>
                </div>
              </div>
              <div className="floating-badge badge-bottom">
                <span className="badge-icon">⚡</span>
                <div>
                  <strong>EV Optimized</strong>
                  <span>Smart Waypoints</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Planner Section */}
        <section className="planner-section" id="planner">
          <div className="section-container">
            <div className="section-header">
              <span className="section-tag">JOURNEY CALCULATOR</span>
              <h2>Find Your Sustainable Route</h2>
              <p>
                Enter your start and end points to generate eco-optimized routes
                and carbon savings.
              </p>
            </div>

            {/* Popular Route Presets */}
            <div className="presets-container">
              <span className="presets-label">Popular routes:</span>
              <div className="presets-list">
                {PRESET_ROUTES.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`preset-chip ${
                      origin.toLowerCase() === p.from.toLowerCase() &&
                      destination.toLowerCase() === p.to.toLowerCase()
                        ? "active"
                        : ""
                    }`}
                    onClick={() => handleSelectPreset(p)}
                  >
                    📍 {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={onSubmit} className="planner-form">
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="origin-input">
                    <span className="field-icon green">●</span> Starting Point
                  </label>
                  <input
                    id="origin-input"
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="City or location (e.g. Lucknow)"
                    required
                  />
                </div>

                <div className="swap-button-wrapper">
                  <button
                    type="button"
                    className="swap-btn"
                    onClick={handleSwapLocations}
                    title="Swap locations"
                  >
                    ⇄
                  </button>
                </div>

                <div className="form-field">
                  <label htmlFor="dest-input">
                    <span className="field-icon red">●</span> Destination
                  </label>
                  <input
                    id="dest-input"
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Target destination (e.g. Kanpur)"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="vehicle-select">
                    <span className="field-icon blue">❖</span> Vehicle Type
                  </label>
                  <select
                    id="vehicle-select"
                    value={vehicle}
                    onChange={(e) => handleVehicleChange(e.target.value)}
                  >
                    {Object.keys(VEHICLE_CONFIG).map((vKey) => (
                      <option key={vKey} value={vKey}>
                        {VEHICLE_CONFIG[vKey].icon} {VEHICLE_CONFIG[vKey].label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="submit-search-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span> Routing...
                    </>
                  ) : (
                    <>Find Routes ➔</>
                  )}
                </button>
              </div>

              {/* Route Query Option */}
              <div className="route-query-wrapper">
                <div className="route-query-header">
                  <div className="route-query-label">
                    <span>🔍 Route Query & Preferences (Optional)</span>
                  </div>
                  {routeQuery && (
                    <button
                      type="button"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#64748b",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                      onClick={() => setRouteQuery("")}
                    >
                      Clear Query ✕
                    </button>
                  )}
                </div>

                <div className="route-query-input-wrap">
                  <input
                    type="text"
                    className="route-query-input"
                    placeholder="e.g. Avoid tolls, EV charging corridors, scenic cruise, minimum stops..."
                    value={routeQuery}
                    onChange={(e) => setRouteQuery(e.target.value)}
                  />
                </div>

                <div className="query-chip-list">
                  <span style={{ fontSize: "12px", color: "#64748b", alignSelf: "center", marginRight: "4px" }}>
                    Popular queries:
                  </span>
                  {[
                    "🌿 Maximum Carbon Savings",
                    "⚡ EV Fast Charging Corridors",
                    "🚫 Avoid Toll Expressways",
                    "⏱️ Fastest Highway Route",
                    "🌄 Scenic Low-Traffic Route",
                  ].map((tag, idx) => {
                    const cleanTag = tag.slice(3);
                    const isActive = routeQuery.toLowerCase().includes(cleanTag.toLowerCase());
                    return (
                      <button
                        key={idx}
                        type="button"
                        className={`query-tag-pill ${isActive ? "active" : ""}`}
                        onClick={() => {
                          setRouteQuery((prev) => (prev === cleanTag ? "" : cleanTag));
                        }}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {errorMsg && <div className="form-error-banner">{errorMsg}</div>}
            </form>
          </div>
        </section>

        {/* Interactive Map Section */}
        <section className="map-section" id="map">
          <div className="section-container">
            <div className="section-header">
              <span className="section-tag">LIVE NAVIGATION PREVIEW</span>
              <h2>Route Visualizer</h2>
              <p>
                Interactive map displaying waypoints, bypasses, and route
                elevation contours.
              </p>
            </div>

            <MapView
              originPoint={routeData?.origin}
              destPoint={routeData?.destination}
              routes={routeData?.routes || []}
              selectedRouteId={selectedRouteId}
              onSelectRoute={(id) => setSelectedRouteId(id)}
            />
          </div>
        </section>

        {/* Route Comparison Cards */}
        {routeData && (
          <section className="results-section" id="impact">
            <div className="section-container">
              <div className="results-header">
                <div>
                  <span className="section-tag">COMPARATIVE ANALYSIS</span>
                  <h2>Available Route Options</h2>
                  <p>
                    Showing results for <strong>{routeData.origin.name}</strong>{" "}
                    to <strong>{routeData.destination.name}</strong> via{" "}
                    <strong>{routeData.vehicle.label}</strong>
                  </p>
                </div>

                {routeData.summary.percentSaved > 0 && (
                  <div className="eco-badge-card">
                    <span className="eco-badge-icon">🌿</span>
                    <div>
                      <div className="eco-badge-title">
                        Saves {routeData.summary.emissionSavedKg} kg CO₂ ({routeData.summary.percentSaved}%)
                      </div>
                      <div className="eco-badge-subtitle">
                        Equivalent to absorbing power of{" "}
                        <strong>{routeData.summary.treesEquivalent} trees</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="route-cards-grid">
                {routeData.routes.map((r) => {
                  const isSelected = r.id === selectedRouteId;
                  const queryBadge = getQueryMatch(r, routeQuery);

                  return (
                    <div
                      key={r.id}
                      className={`route-card ${isSelected ? "selected" : ""} ${r.type}`}
                      onClick={() => setSelectedRouteId(r.id)}
                    >
                      <div className="card-top-row">
                        <span className="route-badge" style={{ backgroundColor: `${r.color}20`, color: r.color }}>
                          {r.badge}
                        </span>
                        <span className="eco-score-pill">
                          Eco Score: <strong>{r.ecoScore}/100</strong>
                        </span>
                      </div>

                      {queryBadge && (
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#047857",
                            background: "#d1fae5",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            marginTop: "8px",
                            display: "inline-block",
                          }}
                        >
                          {queryBadge}
                        </div>
                      )}

                      <h3 className="route-title">{r.name}</h3>
                      <p className="route-desc">{r.description}</p>

                      <div className="route-metrics">
                        <div className="metric-box">
                          <span className="metric-label">Distance</span>
                          <span className="metric-val">{r.distanceKm} km</span>
                        </div>
                        <div className="metric-box">
                          <span className="metric-label">Est. Time</span>
                          <span className="metric-val">{r.durationMinutes} min</span>
                        </div>
                        <div className="metric-box">
                          <span className="metric-label">CO₂ Footprint</span>
                          <span className="metric-val" style={{ color: r.color }}>
                            {r.emissionsKg} kg
                          </span>
                        </div>
                        <div className="metric-box">
                          <span className="metric-label">Est. Fuel Cost</span>
                          <span className="metric-val">₹{r.costInr}</span>
                        </div>
                      </div>

                      <ul className="route-highlights">
                        {r.highlights.map((h, i) => (
                          <li key={i}>✓ {h}</li>
                        ))}
                      </ul>

                      <button
                        type="button"
                        className={`select-route-btn ${isSelected ? "active" : ""}`}
                        style={{
                          backgroundColor: isSelected ? r.color : "#f1f5f9",
                          color: isSelected ? "#ffffff" : "#334155",
                        }}
                      >
                        {isSelected ? "Selected Route ✓" : "Select This Route"}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Active Route Deep-Dive Info */}
              {activeRoute && (
                <div className="route-detail-banner">
                  <div className="detail-banner-col">
                    <span className="detail-tag">ACTIVE SELECTION</span>
                    <h4>{activeRoute.name} Details</h4>
                    <p>{activeRoute.description}</p>
                  </div>
                  <div className="detail-banner-stats">
                    <div className="d-stat">
                      <span className="d-num">{activeRoute.distanceKm} km</span>
                      <span className="d-lbl">Total Distance</span>
                    </div>
                    <div className="d-stat">
                      <span className="d-num">{activeRoute.durationMinutes} min</span>
                      <span className="d-lbl">Estimated Travel Time</span>
                    </div>
                    <div className="d-stat">
                      <span className="d-num">{activeRoute.emissionsKg} kg</span>
                      <span className="d-lbl">Carbon Emissions</span>
                    </div>
                    <div className="d-stat">
                      <span className="d-num">₹{activeRoute.costInr}</span>
                      <span className="d-lbl">Estimated Energy Cost</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Feature Highlights */}
        <section className="features-section" id="features">
          <div className="section-container">
            <div className="section-header">
              <span className="section-tag">WHY ECOROUTE AI?</span>
              <h2>Engineered for Sustainable Mobility</h2>
              <p>Cutting-edge eco-routing algorithms that save fuel and protect the environment.</p>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon green">🌱</div>
                <h3>Carbon-Aware Routing</h3>
                <p>
                  Calculates continuous speed zones, gradients, and stop-light frequency
                  to minimize stop-and-go engine idling and cut emissions by up to 25%.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon blue">⚡</div>
                <h3>Multi-Vehicle Profiles</h3>
                <p>
                  Custom emission profiles for ICE cars, electric vehicles (EVs),
                  motorcycles, and bicycles with precise energy cost estimation.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon orange">📊</div>
                <h3>Real-Time Analytics</h3>
                <p>
                  Instant metrics comparing travel duration, fuel expenditure in Rupees,
                  and tree absorption offsets on every journey.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Query Desk Button */}
      <button
        type="button"
        className="floating-query-launcher"
        onClick={() => setIsQueryModalOpen(true)}
        title="Need help or have a route query? Open Query Desk"
      >
        <span>💬 Have a Query?</span>
      </button>

      {/* Global Query Modal */}
      <QueryModal
        isOpen={isQueryModalOpen}
        onClose={() => setIsQueryModalOpen(false)}
        user={user}
      />

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo">
              <span className="logo-icon">🌿</span>
              <span className="logo-name">EcoRoute</span>
              <span className="logo-badge">AI</span>
            </div>
            <p>Empowering eco-conscious travelers to reduce their carbon footprint one journey at a time.</p>
          </div>
          <div className="footer-bottom">
            <p>© 2026 EcoRoute AI | Designed for Sustainable Travel & Smart Mobility</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
