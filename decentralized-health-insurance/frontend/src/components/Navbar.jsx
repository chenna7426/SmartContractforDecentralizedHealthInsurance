import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import "./Navbar.css";

function Navbar({
  walletAddress = "",
  isConnected = false,
  onConnect,
  authUser,
  onLogout,
  isConnecting = false,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdmin = authUser?.role?.toLowerCase() === "admin";
  const navItems = authUser
    ? [
        { label: "Home", to: "/" },
        { label: "Dashboard", to: "/dashboard" },
        ...(isAdmin ? [{ label: "Manage Claims", to: "/manage-claims" }] : []),
        { label: "Submit Claim", to: "/submit-claim", highlight: true },
      ]
    : [
        { label: "Home", to: "/" },
        { label: "Login", to: "/login" },
        { label: "Register", to: "/register" },
      ];
  const username = authUser?.name || authUser?.email || "";
  const truncatedUsername = username.length > 14
    ? `${username.slice(0, 11)}...`
    : username;
  const truncatedWallet = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "";
  const closeMenu = () => setIsMenuOpen(false);

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

        <button
          type="button"
          className="navbar__menu-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          aria-controls="main-navigation"
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Nav links */}
        <nav
          id="main-navigation"
          className={`navbar__nav${isMenuOpen ? " navbar__nav--open" : ""}`}
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeMenu}
              className={({ isActive }) =>
                `navbar__link${item.highlight ? " navbar__link--claim" : ""}${isActive ? item.highlight ? " navbar__link--claim-active" : " navbar__link--active" : ""}`
              }
            >
              {item.highlight ? "🩺 " : ""}{item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right-side actions */}
        {authUser && (
          <div className={`navbar__actions${isMenuOpen ? " navbar__actions--open" : ""}`}>
            <span className="navbar__user-badge" title={username}>
              <span className="navbar__badge-text">{truncatedUsername}</span>
            </span>

            {isConnected ? (
              <span className="navbar__wallet-badge" title={walletAddress}>
                <span className="navbar__badge-text">{truncatedWallet}</span>
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
                  "Connect Wallet"
                )}
              </button>
            )}

            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `navbar__link navbar__link--admin${isActive ? " navbar__link--active" : ""}`
                }
              >
                Admin Panel
              </NavLink>
            )}

            <button
              type="button"
              className="navbar__logout-btn"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
