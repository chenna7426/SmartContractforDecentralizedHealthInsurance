import React, { useEffect, useCallback } from "react";
import AdminPanel from "../components/AdminPanel";
import "./Dashboard.css"; // Reuse dashboard page styles for layout

function AdminPage({
  claims,
  loadingAction,
  onApprove,
  onReject,
  adminWallet,
  walletAddress,
  loadClaims,
}) {
  // Load all admin claims when the page mounts
  useEffect(() => {
    if (loadClaims) {
      loadClaims();
    }
  }, [loadClaims]);

  // Wrap approve/reject to refresh the list afterwards
  const handleApprove = useCallback(async (claim) => {
    await onApprove(claim);
    if (loadClaims) loadClaims();
  }, [onApprove, loadClaims]);

  const handleReject = useCallback(async (claim) => {
    await onReject(claim);
    if (loadClaims) loadClaims();
  }, [onReject, loadClaims]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero" style={{ background: "linear-gradient(135deg, #b45309 0%, #92400e 100%)", boxShadow: "0 24px 60px rgba(180,83,9,.25)" }}>
        <div className="dashboard-hero__eyebrow" style={{ color: "#fef3c7" }}>Admin access only</div>
        <h1 className="dashboard-hero__title">Admin Panel</h1>
        <p className="dashboard-hero__desc" style={{ color: "#fde68a" }}>
          Review, approve, and reject pending claims submitted by users. Actions taken here require the admin wallet to sign a transaction on the blockchain.
        </p>
      </div>
      
      <div className="admin-page-content" style={{ marginTop: "2rem" }}>
        <AdminPanel
          claims={claims}
          loading={loadingAction}
          onApprove={handleApprove}
          onReject={handleReject}
          adminWallet={adminWallet}
          walletAddress={walletAddress}
        />
      </div>
    </div>
  );
}

export default AdminPage;
