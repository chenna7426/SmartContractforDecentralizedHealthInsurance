import React from "react";
import "./AdminPanel.css";

function AdminPanel({ claims, loading, onApprove, onReject, adminWallet, walletAddress }) {
  // Normalize status to handle "Pending", "pending", "PENDING" etc.
  const pendingClaims = claims.filter(
    (claim) => (claim.status || "").toLowerCase() === "pending"
  );

  console.log("Admin Pending Claims:", pendingClaims);
  console.log("All Admin Claims:", claims);

  const isAdmin = adminWallet && walletAddress && adminWallet.toLowerCase() === walletAddress.toLowerCase();

  return (
    <div className="admin-panel-shell">
      <p className="home-section-label">Admin Actions</p>
      <h2 className="home-section-title">Approve or reject pending claims</h2>
      <p className="admin-panel-info">
        Current admin wallet: {adminWallet || "Not configured"}
      </p>

      {!isAdmin ? (
        <div className="admin-panel-alert admin-panel-alert--error">
          <strong>Access Denied:</strong> Only the contract admin can approve or reject pending claims. Please connect with the admin wallet.
        </div>
      ) : pendingClaims.length === 0 ? (
        <div className="admin-panel-alert admin-panel-alert--empty">
          No pending claims available for review.
        </div>
      ) : (
        <div className="admin-panel-list">
          {pendingClaims.map((claim) => (
            <div key={claim.id} className="admin-panel-card">
              <div className="admin-panel-header">
                <div>
                  <p className="admin-panel-title">
                    {claim.patient_name || claim.patientName}
                  </p>
                  <p className="admin-panel-subtitle">
                    Claim #{claim.id} • {claim.claim_type || claim.claimType}
                  </p>
                </div>
                <div className="admin-panel-badge">Pending</div>
              </div>

              <div className="admin-panel-meta">
                <div>
                  <span>Hospital</span>
                  {claim.hospital_name || claim.hospitalName}
                </div>
                <div>
                  <span>Amount</span>
                  ${Number(claim.claim_amount || claim.amount || 0).toFixed(2)}
                </div>
                <div>
                  <span>Diagnosis</span>
                  {claim.diagnosis}
                </div>
              </div>

              <div className="admin-panel-actions">
                <button
                  type="button"
                  onClick={() => onApprove(claim)}
                  disabled={loading}
                  className="admin-action-btn approve"
                >
                  Approve Claim
                </button>
                <button
                  type="button"
                  onClick={() => onReject(claim)}
                  disabled={loading}
                  className="admin-action-btn reject"
                >
                  Reject Claim
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
