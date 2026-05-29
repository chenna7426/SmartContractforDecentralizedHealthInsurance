import React from "react";
import { NavLink } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import "./Navbar.css";

function Navbar({
  walletAddress = "",
  isConnected = false,
  onConnect,
  onSwitchNetwork,
  authUser,
  onLogout,
  isConnecting = false,
  networkName = "Unknown",
  chainId = null,
  networkMismatch = false,
  adminWallet = null,
}) {
  const isAdmin = authUser?.role?.toLowerCase() === "admin";
  const navItems = [
    { label: "Home", to: "/" },
    { label: "Login", to: "/login" },
    { label: "Register", to: "/register" },
    { label: "Dashboard", to: "/dashboard" },
    ...(isAdmin ? [{ label: "Manage Claims", to: "/manage-claims" }] : []),
  ];

  const submitClaimItem = { label: "Submit Claim", to: "/submit-claim" };

  return (
    <header className="navbar">
      <div className="navbar__inner">
        {/* Brand */}
        <a href="/" className="navbar__brand">
          <div className="navbar__logo">⛓</div>
          <div className="navbar__brand-text">
            Health Insurance DApp
            <span>Decentralized · Secure · Transparent</span>
          </div>
        </a>

        {/* Nav links */}
        <nav className="navbar__nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `navbar__link${isActive ? " navbar__link--active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}

          {/* Submit Claim — highlighted CTA */}
          <NavLink
            to={submitClaimItem.to}
            className={({ isActive }) =>
              `navbar__link navbar__link--claim${isActive ? " navbar__link--claim-active" : ""}`
            }
          >
            🩺 {submitClaimItem.label}
          </NavLink>
          {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `navbar__link navbar__link--admin${isActive ? " navbar__link--active" : ""}`
                }
              >
                Admin Panel
              </NavLink>
            )}
        </nav>

        {/* Right-side actions */}
        <div className="navbar__actions">
          {authUser && (
            <span className="navbar__user-badge">
              {authUser.name || authUser.email}
            </span>
          )}

          <span
            className={`navbar__network-badge${networkMismatch ? " navbar__network-badge--mismatch" : ""}`}
          >
            {networkName} {chainId ? `(${chainId})` : ""}
          </span>

          {networkMismatch && (
            <button
              type="button"
              className="navbar__switch-btn"
              onClick={onSwitchNetwork}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <LoadingSpinner label="Switching…" />
              ) : (
                "Switch to Hardhat"
              )}
            </button>
          )}

          {isConnected ? (
            <span className="navbar__wallet-badge">
              {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
            </span>
          ) : (
            <button
              type="button"
              className="navbar__connect-btn"
              onClick={onConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <LoadingSpinner label="Connecting…" />
              ) : (
                "Connect MetaMask"
              )}
            </button>
          )}

          {authUser && (
            <button
              type="button"
              className="navbar__logout-btn"
              onClick={onLogout}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
