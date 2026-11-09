import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Create custom stylish SVG/Div markers (no broken image asset issues)
function createPinIcon(label, bgColor, borderColor = "#ffffff") {
  return L.divIcon({
    className: "eco-map-pin",
    html: `
      <div style="
        background: ${bgColor};
        width: 34px;
        height: 34px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6px 14px rgba(0, 0, 0, 0.28);
        border: 2.5px solid ${borderColor};
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-weight: 800;
          font-size: 13px;
          line-height: 1;
          letter-spacing: -0.5px;
        ">${label}</span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32],
  });
}

const originIcon = createPinIcon("A", "#10b981", "#ffffff");
const destIcon = createPinIcon("B", "#ef4444", "#ffffff");

// Component to dynamically fit bounds when origin, destination or points change
function MapBoundsUpdater({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    try {
      if (points.length === 1) {
        map.setView(points[0], 13, { animate: true });
      } else {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 15,
          animate: true,
        });
      }
    } catch (e) {
      console.warn("Bounds update error:", e);
    }
  }, [points, map]);

  return null;
}

function MapView({
  originPoint = { lat: 26.8467, lng: 80.9462, name: "Lucknow" },
  destPoint = null,
  routes = [],
  selectedRouteId = "green",
  onSelectRoute = () => {},
}) {
  const center = [originPoint.lat, originPoint.lng];

  // Collect points for auto-bounding
  const boundPoints = [];
  if (originPoint) boundPoints.push([originPoint.lat, originPoint.lng]);
  if (destPoint) boundPoints.push([destPoint.lat, destPoint.lng]);

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  return (
    <div className="map-wrapper">
      <div className="map-toolbar">
        <div className="map-legend">
          <span className="legend-item">
            <span className="legend-dot green"></span> 🌿 Green Route
          </span>
          <span className="legend-item">
            <span className="legend-dot blue"></span> ⚡ Fastest Route
          </span>
          <span className="legend-item">
            <span className="legend-dot orange"></span> 🛣️ Highway Bypass
          </span>
        </div>
        {activeRoute && (
          <div className="map-active-badge">
            Viewing: <strong>{activeRoute.name}</strong> ({activeRoute.distanceKm} km · {activeRoute.durationMinutes} min)
          </div>
        )}
      </div>

      <div className="map-container">
        <MapContainer
          center={center}
          zoom={12}
          scrollWheelZoom={true}
          style={{ height: "460px", width: "100%", zIndex: 1 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapBoundsUpdater points={boundPoints} />

          {/* Render non-selected routes in background */}
          {routes
            .filter((route) => route.id !== selectedRouteId)
            .map((route) => (
              <Polyline
                key={route.id}
                positions={route.points}
                pathOptions={{
                  color: route.color,
                  weight: 4,
                  opacity: 0.45,
                  dashArray: "6, 8",
                }}
                eventHandlers={{
                  click: () => onSelectRoute(route.id),
                }}
              />
            ))}

          {/* Render active selected route prominently on top */}
          {activeRoute && activeRoute.points && (
            <Polyline
              key={`active-${activeRoute.id}`}
              positions={activeRoute.points}
              pathOptions={{
                color: activeRoute.color,
                weight: 6,
                opacity: 0.95,
              }}
            />
          )}

          {/* Start Point Marker */}
          {originPoint && (
            <Marker position={[originPoint.lat, originPoint.lng]} icon={originIcon}>
              <Popup>
                <div className="map-popup">
                  <div className="popup-tag start">START POINT (A)</div>
                  <h4>{originPoint.name}</h4>
                  <p>Starting departure point</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Destination Point Marker */}
          {destPoint && (
            <Marker position={[destPoint.lat, destPoint.lng]} icon={destIcon}>
              <Popup>
                <div className="map-popup">
                  <div className="popup-tag end">DESTINATION (B)</div>
                  <h4>{destPoint.name}</h4>
                  <p>Target arrival destination</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      <div className="map-footer-hint">
        💡 Tip: Click on any route line or route card to inspect time, distance, and CO₂ savings.
      </div>
    </div>
  );
}

export default MapView;
