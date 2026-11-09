import { useState } from "react";
import "./LoginPage.css";

export default function LoginPage({ onLogin, onOpenQuery }) {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [vehiclePref, setVehiclePref] = useState("Car");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleSignInSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const user = {
        name: email.split("@")[0].replace(/[^a-zA-Z0-9]/g, " ") || "Eco Traveler",
        email: email.trim(),
        vehiclePreference: vehiclePref,
        isGuest: false,
        avatar: "🌱",
      };
      if (rememberMe) {
        localStorage.setItem("ecoroute_user", JSON.stringify(user));
      }
      onLogin(user);
    }, 450);
  }

  function handleSignUpSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill out all registration fields.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const user = {
        name: name.trim(),
        email: email.trim(),
        vehiclePreference: vehiclePref,
        isGuest: false,
        avatar: "⚡",
      };
      if (rememberMe) {
        localStorage.setItem("ecoroute_user", JSON.stringify(user));
      }
      onLogin(user);
    }, 500);
  }

  function handleDemoLogin() {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const demoUser = {
        name: "Eco Navigator",
        email: "demo@ecoroute.ai",
        vehiclePreference: "Electric Vehicle",
        isGuest: false,
        avatar: "🌿",
      };
      localStorage.setItem("ecoroute_user", JSON.stringify(demoUser));
      onLogin(demoUser);
    }, 300);
  }

  function handleGuestLogin() {
    const guestUser = {
      name: "Guest Explorer",
      email: "guest@ecoroute.local",
      vehiclePreference: "Car",
      isGuest: true,
      avatar: "👤",
    };
    onLogin(guestUser);
  }

  return (
    <div className="login-screen">
      <div className="login-backdrop-glow"></div>

      <div className="login-container">
        {/* Left Side: Minimal Brand Showcase */}
        <div className="login-brand-panel minimal">
          <div className="brand-panel-header">
            <div className="login-logo">
              <span className="login-logo-icon">🌿</span>
              <div className="logo-text-group">
                <span className="login-logo-text">EcoRoute</span>
                <span className="login-logo-tag">AI</span>
              </div>
            </div>
            <p className="minimal-tagline">Intelligent Sustainable Route Planning & Carbon Emission Estimator</p>
          </div>

          <div className="minimal-features">
            <div className="minimal-badge">
              <span className="min-icon">🌱</span>
              <span>22% Less Carbon</span>
            </div>
            <div className="minimal-badge">
              <span className="min-icon">⚡</span>
              <span>Smart EV Corridors</span>
            </div>
            <div className="minimal-badge">
              <span className="min-icon">💰</span>
              <span>Real-time Fuel Stats</span>
            </div>
          </div>

          <div className="minimal-panel-footer">
            <span className="eco-leaf-bullet">🍃</span>
            <span>Sustainable Mobility</span>
          </div>
        </div>

        {/* Right Side: Authentication Box & Query Option */}
        <div className="login-form-panel">
          <div className="form-panel-header">
            <div className="login-tabs">
              <button
                type="button"
                className={`login-tab-btn ${mode === "signin" ? "active" : ""}`}
                onClick={() => {
                  setMode("signin");
                  setError("");
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`login-tab-btn ${mode === "signup" ? "active" : ""}`}
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
              >
                Create Account
              </button>
            </div>
          </div>

          {error && <div className="login-error-alert">{error}</div>}

          {mode === "signin" ? (
            <form onSubmit={handleSignInSubmit} className="auth-form">
              <div className="input-group">
                <label htmlFor="login-email">Email or Username</label>
                <div className="input-field-wrap">
                  <span className="field-icon-lead">📧</span>
                  <input
                    id="login-email"
                    type="text"
                    placeholder="e.g. traveler@ecoroute.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <div className="label-row">
                  <label htmlFor="login-pass">Password</label>
                  <button
                    type="button"
                    className="forgot-pass-btn"
                    onClick={() => {
                      alert("Demo mode: You can enter any password or use the 1-Click Demo Login!");
                    }}
                  >
                    Forgot?
                  </button>
                </div>
                <div className="input-field-wrap">
                  <span className="field-icon-lead">🔒</span>
                  <input
                    id="login-pass"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-options-row">
                <label className="checkbox-wrap">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>

              <button
                type="submit"
                className="submit-auth-btn"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In to EcoRoute AI ➔"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUpSubmit} className="auth-form">
              <div className="input-group">
                <label htmlFor="reg-name">Full Name</label>
                <div className="input-field-wrap">
                  <span className="field-icon-lead">👤</span>
                  <input
                    id="reg-name"
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="reg-email">Email Address</label>
                <div className="input-field-wrap">
                  <span className="field-icon-lead">📧</span>
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="reg-pass">Create Password</label>
                <div className="input-field-wrap">
                  <span className="field-icon-lead">🔒</span>
                  <input
                    id="reg-pass"
                    type="password"
                    placeholder="At least 4 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="reg-veh">Primary Vehicle</label>
                <div className="input-field-wrap">
                  <span className="field-icon-lead">🚗</span>
                  <select
                    id="reg-veh"
                    value={vehiclePref}
                    onChange={(e) => setVehiclePref(e.target.value)}
                  >
                    <option value="Car">🚗 Petrol / Diesel Car</option>
                    <option value="Electric Vehicle">⚡ Electric Vehicle (EV)</option>
                    <option value="Bike">🛵 Motorbike / Scooter</option>
                    <option value="Bicycle">🚲 Bicycle</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="submit-auth-btn"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Free Account ➔"}
              </button>
            </form>
          )}

          {/* Quick Access Actions */}
          <div className="divider-row">
            <span>OR QUICK ACCESS</span>
          </div>

          <div className="quick-access-buttons">
            <button
              type="button"
              className="demo-login-btn"
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              ⚡ 1-Click Demo Login
            </button>
            <button
              type="button"
              className="guest-login-btn"
              onClick={handleGuestLogin}
            >
              👤 Continue as Guest
            </button>
          </div>

          {/* Dedicated Query Option Card */}
          <div className="login-query-card">
            <div className="query-card-text">
              <span className="query-card-icon">💬</span>
              <div>
                <strong>Have a question or query?</strong>
                <span>Ask our support desk or explore common inquiries</span>
              </div>
            </div>
            <button
              type="button"
              className="open-query-btn"
              onClick={onOpenQuery}
            >
              Submit Query ➔
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

