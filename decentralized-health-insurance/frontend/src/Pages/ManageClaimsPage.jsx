import React from "react";
import ClaimList from "../components/ClaimList";
import "./Dashboard.css"; // Reuse dashboard styles for layout

function ManageClaimsPage({
  claims,
  loadingClaims,
  selectedClaimId,
  setSelectedClaimId,
  loadClaims,
  loadClaimHistory,
  claimHistory,
}) {
  return (
    <div className="dashboard-page">
      <div className="dashboard-hero" style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #172554 100%)", boxShadow: "0 24px 60px rgba(30,58,138,.25)" }}>
        <div className="dashboard-hero__eyebrow" style={{ color: "#bfdbfe" }}>Admin access only</div>
        <h1 className="dashboard-hero__title">Manage All Claims</h1>
        <p className="dashboard-hero__desc" style={{ color: "#dbeafe" }}>
          View the complete history of all claims across the decentralized network. Select any claim to see its full immutable audit trail.
        </p>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <ClaimList
          claims={claims}
          loading={loadingClaims}
          onRefresh={loadClaims}
          selectedClaimId={selectedClaimId}
          onSelectClaim={async (claimId) => {
            setSelectedClaimId(claimId);
            if (claimId) {
              await loadClaimHistory(claimId);
            }
          }}
          claimHistory={claimHistory}
        />
      </div>
    </div>
  );
}

export default ManageClaimsPage;
