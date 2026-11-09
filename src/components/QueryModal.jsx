import { useState, useEffect } from "react";
import "./QueryModal.css";

const INITIAL_QUERIES = [
  {
    id: "ECO-101",
    category: "Route Calculation",
    subject: "How does the Green Route save up to 22% CO₂?",
    message: "Does the green route just pick the shortest path, or does it account for traffic, stoplights, and highway gradients?",
    status: "Answered",
    timestamp: "Today at 10:15 AM",
    response: "EcoRoute AI models engine operating load rather than pure distance. By analyzing continuous speed corridors, elevation contours, and congestion frequency, it selects routes that reduce stop-and-go engine idling by up to 25%, significantly lowering fuel burn.",
    user: "Aarav Sharma"
  },
  {
    id: "ECO-102",
    category: "EV & Charging",
    subject: "Are EV charging stations included along the route?",
    message: "If I choose Electric Vehicle, does the system optimize routes for chargers?",
    status: "Answered",
    timestamp: "Yesterday at 4:30 PM",
    response: "Yes! When Electric Vehicle (EV) is selected, our algorithm calculates power consumption based on highway speed and recommends routes through major corridors equipped with high-power DC fast chargers.",
    user: "Priya Patel"
  },
  {
    id: "ECO-103",
    category: "Cost & Fuel Calculation",
    subject: "How is the fuel cost calculated in Rupees (₹)?",
    message: "What baseline fuel price and mileage are used for cars and bikes?",
    status: "Answered",
    timestamp: "2 days ago",
    response: "We calculate fuel cost dynamically using baseline figures: Petrol/Diesel at ~₹7.5/km (approx 14 km/L at ₹102/L), EV at ~₹1.8/km (based on ₹8/kWh tariffs), and 2-wheelers at ~₹2.2/km.",
    user: "Vikram Malhotra"
  }
];

function generateAIResponse(category, subject, message) {
  const text = (subject + " " + message).toLowerCase();

  if (text.includes("ev") || text.includes("electric") || text.includes("charg")) {
    return "Thank you for your query! For Electric Vehicles, EcoRoute AI accounts for battery discharge rates at varying highway speeds and elevation gradients. We are currently integrating live fast-charger status with real-time station availability across major national highways.";
  }
  if (text.includes("cost") || text.includes("rupee") || text.includes("price") || text.includes("fuel")) {
    return "Our cost calculation engine estimates fuel consumption using dynamic vehicle profiles (ICE car: ~₹7.5/km, EV: ~₹1.8/km, Motorbike: ~₹2.2/km, Cycle: ₹0). You can customize your vehicle profile in the route planner.";
  }
  if (text.includes("login") || text.includes("account") || text.includes("password")) {
    return "Your account session is managed securely. You can use Quick Demo Login or continue as a guest anytime to test all features without requiring password resets.";
  }
  if (text.includes("traffic") || text.includes("speed") || text.includes("delay")) {
    return "EcoRoute AI incorporates continuous speed analysis. Fast routes prioritize highway speeds, while Green routes prioritize smooth steady momentum to avoid stop-and-go idling where fuel consumption spikes by up to 40%.";
  }
  if (text.includes("export") || text.includes("download") || text.includes("gpx") || text.includes("save")) {
    return "You can view route waypoints and turn sequences directly on the interactive map visualizer. GPX and KML export options for GPS devices and Android Auto/Apple CarPlay integration are scheduled for the next release!";
  }

  return `Thank you for your query regarding "${subject}". Our EcoRoute AI Support team has logged your query under ticket #${Math.floor(1000 + Math.random() * 9000)}. Your question has been analyzed and our automated dispatch verified standard navigation telemetry. A detailed report has been filed to your profile.`;
}

export default function QueryModal({ isOpen, onClose, user = null }) {
  const [activeTab, setActiveTab] = useState("submit"); // "submit" | "history" | "faq"
  const [queries, setQueries] = useState(() => {
    try {
      const saved = localStorage.getItem("ecoroute_queries");
      return saved ? JSON.parse(saved) : INITIAL_QUERIES;
    } catch {
      return INITIAL_QUERIES;
    }
  });

  const [category, setCategory] = useState("Route Calculation");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [contactName, setContactName] = useState(user?.name || "Guest Traveler");
  const [contactEmail, setContactEmail] = useState(user?.email || "guest@ecoroute.ai");
  const [priority, setPriority] = useState("Normal");
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [expandedQueryId, setExpandedQueryId] = useState(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem("ecoroute_queries", JSON.stringify(queries));
    } catch (e) {
      console.warn("Storage sync error:", e);
    }
  }, [queries]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleSubmitQuery(e) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    const ticketId = `ECO-${Math.floor(2000 + Math.random() * 8000)}`;
    const aiResponse = generateAIResponse(category, subject, message);

    const newQuery = {
      id: ticketId,
      category,
      subject: subject.trim(),
      message: message.trim(),
      status: "Answered",
      timestamp: "Just now",
      response: aiResponse,
      user: contactName || "Traveler",
      priority,
    };

    const updated = [newQuery, ...queries];
    setQueries(updated);
    setSubmittedTicket(newQuery);
    setExpandedQueryId(ticketId);

    // Reset inputs
    setSubject("");
    setMessage("");
  }

  const filteredQueries = queries.filter((q) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      q.subject.toLowerCase().includes(term) ||
      q.message.toLowerCase().includes(term) ||
      q.category.toLowerCase().includes(term) ||
      q.response.toLowerCase().includes(term) ||
      q.id.toLowerCase().includes(term)
    );
  });

  return (
    <div className="query-modal-overlay" onClick={onClose}>
      <div
        className="query-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="query-modal-title"
      >
        {/* Modal Header */}
        <div className="query-modal-header">
          <div className="query-header-info">
            <span className="query-badge-icon">💬</span>
            <div>
              <h3 id="query-modal-title">EcoRoute Query & Support Desk</h3>
              <p>Submit questions, request route inquiries, or browse FAQs</p>
            </div>
          </div>
          <button
            type="button"
            className="query-close-btn"
            onClick={onClose}
            aria-label="Close Query Dialog"
          >
            ✕
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="query-nav-tabs">
          <button
            type="button"
            className={`query-tab-btn ${activeTab === "submit" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("submit");
              setSubmittedTicket(null);
            }}
          >
            ✍️ Submit a Query
          </button>
          <button
            type="button"
            className={`query-tab-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            📋 Inquiries & FAQs ({queries.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="query-modal-body">
          {activeTab === "submit" && (
            <div>
              {submittedTicket ? (
                <div className="query-success-card">
                  <div className="success-header">
                    <span className="success-icon">✅</span>
                    <div>
                      <h4>Query Submitted Successfully!</h4>
                      <p className="ticket-id">Ticket Reference: <strong>{submittedTicket.id}</strong></p>
                    </div>
                  </div>

                  <div className="query-detail-box">
                    <div className="query-q">
                      <strong>Your Query:</strong> {submittedTicket.subject}
                    </div>
                    <div className="query-p">
                      <em>"{submittedTicket.message}"</em>
                    </div>
                    <div className="query-answer-box">
                      <div className="ai-badge">🤖 Instant AI Support Response</div>
                      <p>{submittedTicket.response}</p>
                    </div>
                  </div>

                  <div className="query-actions">
                    <button
                      type="button"
                      className="primary-btn-sm"
                      onClick={() => setSubmittedTicket(null)}
                    >
                      + Ask Another Query
                    </button>
                    <button
                      type="button"
                      className="secondary-btn-sm"
                      onClick={() => setActiveTab("history")}
                    >
                      View All Queries ➔
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitQuery} className="query-form">
                  <div className="query-form-row">
                    <div className="query-form-group">
                      <label htmlFor="query-category">Query Category</label>
                      <select
                        id="query-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="Route Calculation">🗺️ Route Calculation & Waypoints</option>
                        <option value="Carbon Footprint">🌱 Carbon & Emission Metrics</option>
                        <option value="EV & Charging">⚡ EV Charging & Vehicle Types</option>
                        <option value="Cost & Fuel">⛽ Fuel Prices & Estimations</option>
                        <option value="Account & Login">🔐 Account, Login & Access</option>
                        <option value="Feature Request">💡 Feature Request / Suggestion</option>
                        <option value="General Support">❓ General Inquiry</option>
                      </select>
                    </div>

                    <div className="query-form-group">
                      <label htmlFor="query-priority">Urgency</label>
                      <select
                        id="query-priority"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                      >
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="query-form-group">
                    <label htmlFor="query-subject">Subject / Title</label>
                    <input
                      id="query-subject"
                      type="text"
                      placeholder="e.g. How does EcoRoute optimize routes for electric scooters?"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>

                  <div className="query-form-group">
                    <label htmlFor="query-message">Describe Your Query in Detail</label>
                    <textarea
                      id="query-message"
                      rows={4}
                      placeholder="Provide details about your query, route points, vehicle type, or specific question..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>

                  <div className="query-form-row">
                    <div className="query-form-group">
                      <label htmlFor="contact-name">Your Name</label>
                      <input
                        id="contact-name"
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="query-form-group">
                      <label htmlFor="contact-email">Email Address</label>
                      <input
                        id="contact-email"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="query-form-footer">
                    <span className="query-hint">
                      ⚡ Instant AI answers provided for common travel queries.
                    </span>
                    <button type="submit" className="query-submit-btn">
                      Submit Query ➔
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="query-history-pane">
              <div className="query-search-bar">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search queries by keyword, category, or ticket ID..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
                {searchFilter && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() => setSearchFilter("")}
                  >
                    ✕
                  </button>
                )}
              </div>

              {filteredQueries.length === 0 ? (
                <div className="query-empty-state">
                  <span className="empty-icon">📂</span>
                  <p>No queries match your search filter.</p>
                  <button
                    type="button"
                    className="secondary-btn-sm"
                    onClick={() => setSearchFilter("")}
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                <div className="query-list">
                  {filteredQueries.map((q) => {
                    const isExpanded = expandedQueryId === q.id;
                    return (
                      <div
                        key={q.id}
                        className={`query-card-item ${isExpanded ? "expanded" : ""}`}
                        onClick={() =>
                          setExpandedQueryId(isExpanded ? null : q.id)
                        }
                      >
                        <div className="query-card-header">
                          <div className="query-card-meta">
                            <span className="ticket-tag">{q.id}</span>
                            <span className="category-pill">{q.category}</span>
                            <span className="status-pill answered">{q.status}</span>
                          </div>
                          <span className="query-time">{q.timestamp}</span>
                        </div>

                        <h4 className="query-card-title">{q.subject}</h4>
                        <p className="query-card-snippet">{q.message}</p>

                        {isExpanded && (
                          <div className="query-card-expanded">
                            <div className="sender-info">
                              Asked by: <strong>{q.user || "Traveler"}</strong>
                            </div>
                            <div className="ai-response-box">
                              <div className="ai-header">
                                <span className="ai-chip">🤖 EcoRoute AI Response</span>
                              </div>
                              <p>{q.response}</p>
                            </div>
                          </div>
                        )}

                        <div className="query-expand-hint">
                          {isExpanded ? "Click to collapse ▲" : "Click to view response ▼"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
