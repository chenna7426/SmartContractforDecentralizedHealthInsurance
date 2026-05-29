import React from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

function Dashboard({ user, walletAddress = "", isConnected = false, claimStats = {} }) {
  const stats = {
    pending: claimStats.pending ?? 0,
    approved: claimStats.approved ?? 0,
    rejected: claimStats.rejected ?? 0,
  };

  return (
    <section className="dashboard-page">
      <div className="dashboard-hero">
        <div className="dashboard-hero__eyebrow">Protected dashboard</div>
        <h1 className="dashboard-hero__title">Welcome back, {user?.name || "User"}</h1>
        <p className="dashboard-hero__desc">
          Your session is active and the dashboard is now protected. Use the cards below to review your account status and connected wallet.
        </p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="dashboard-card__eyebrow">Account details</div>
          
          <div className="dashboard-details">
            <p><strong>Name:</strong> {user?.name || "N/A"}</p>
            <p><strong>Email:</strong> {user?.email || "N/A"}</p>
            <p><strong>Session status:</strong> Active</p>
            <p>
              <strong>Wallet:</strong>{" "}
              {isConnected ? (
                <span className="dashboard-wallet">{walletAddress}</span>
              ) : (
                "MetaMask not connected"
              )}
            </p>
          </div>

          <div className="dashboard-actions">
            <Link to="/" className="dashboard-btn-primary">
              Open Home workflow
            </Link>
            <Link to="/login" className="dashboard-btn-secondary">
              Switch account
            </Link>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card__eyebrow">Quick metrics</div>
          
          <div className="dashboard-stats-grid">
            <div className="dashboard-stat dashboard-stat--pending">
              <div className="dashboard-stat__label">Pending</div>
              <div className="dashboard-stat__value">{stats.pending}</div>
            </div>
            <div className="dashboard-stat dashboard-stat--approved">
              <div className="dashboard-stat__label">Approved</div>
              <div className="dashboard-stat__value">{stats.approved}</div>
            </div>
            <div className="dashboard-stat dashboard-stat--rejected">
              <div className="dashboard-stat__label">Rejected</div>
              <div className="dashboard-stat__value">{stats.rejected}</div>
            </div>
          </div>

          <div className="dashboard-tip">
            <p><strong>Tip:</strong> Keep your MetaMask wallet connected while submitting or approving claims so the blockchain transaction is signed immediately.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
