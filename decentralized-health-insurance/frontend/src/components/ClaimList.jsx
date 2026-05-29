import React from "react";
import "./ClaimList.css";

function ClaimList({ claims = [], loading, onRefresh, onSelectClaim, selectedClaimId, claimHistory = {} }) {
  if (loading) {
    return <div className="claim-list-shell"><div className="claim-list-loading">Loading claims from database...</div></div>;
  }

  return (
    <div className="claim-list-shell">
      <div className="claim-list-header">
        <div>
          <p className="home-section-label">Audit Trail</p>
          <h2 className="claim-list-title">Recent Claims</h2>
        </div>
        <button className="claim-list-refresh" onClick={onRefresh}>
          Refresh List
        </button>
      </div>

      {claims.length === 0 ? (
        <div className="claim-list-empty">
          No claims found for your account.
        </div>
      ) : (
        <div className="claim-list-grid">
          {claims.map((claim) => (
            <div key={claim.id} className="claim-list-card">
              <div className="claim-list-card-header">
                <div>
                  <h3 className="claim-list-card-title">{claim.patient_name || claim.patientName}</h3>
                  <p className="claim-list-card-subtitle">
                    Claim #{claim.id} • {claim.claim_type || claim.claimType}
                  </p>
                </div>
                <span className={`badge badge--${claim.status.toLowerCase()}`}>
                  {claim.status}
                </span>
              </div>

              <div className="claim-list-meta">
                <div>
                  <span>Hospital</span>
                  {claim.hospital_name || claim.hospitalName}
                </div>
                <div>
                  <span>Amount</span>
                  ${Number(claim.claim_amount || claim.amount || 0).toFixed(2)}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span>Diagnosis</span>
                  {claim.diagnosis}
                </div>
              </div>

              <button
                className="claim-history-toggle"
                onClick={() => onSelectClaim(selectedClaimId === claim.id ? null : claim.id)}
              >
                {selectedClaimId === claim.id ? "Hide History" : "View Immutable History"}
              </button>

              {selectedClaimId === claim.id && (
                <div className="claim-list-history">
                  <h4 className="claim-list-history-title">On-Chain Audit Log</h4>
                  
                  {(!claimHistory[claim.id] || claimHistory[claim.id].length === 0) ? (
                    <p style={{ fontSize: '.85rem', color: '#64748b' }}>No history records found for this claim.</p>
                  ) : (
                    <div className="claim-list-history-items">
                      {claimHistory[claim.id].map((history) => (
                        <div key={history.id} className={`claim-list-history-item claim-list-history-item--${history.status.toLowerCase()}`}>
                          <div className="claim-list-history-header">
                            <span className="claim-list-history-status" style={{
                              color: history.status === 'Pending' ? '#b45309' : history.status === 'Approved' ? '#059669' : '#e11d48'
                            }}>
                              {history.status}
                            </span>
                            <span className="claim-list-history-date">
                              {new Date(history.updated_at).toLocaleString()}
                            </span>
                          </div>
                          
                          {history.transaction_hash && (
                            <div className="claim-list-history-hash">
                              <strong>Tx:</strong> {history.transaction_hash}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ClaimList;
