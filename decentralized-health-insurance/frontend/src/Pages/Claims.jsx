import React from 'react';
import './Claims.css';
import ClaimForm from '../components/ClaimForm';
import ClaimList from '../components/ClaimList';
import AdminPanel from '../components/AdminPanel';

function Claims({
  onSubmit,
  loadingAction,
  walletAddress,
  claims,
  claimHistory,
  selectedClaimId,
  onSelectClaim,
  loadingClaims,
  onRefresh,
  onApprove,
  onReject,
  adminWallet,
}) {
  return (
    <section className="claims-page" id="claims">
      <div className="claims-page-inner">
        <div className="claims-page-header">
          <h1>Claim Management</h1>
          <p>Submit, review, and monitor claims from a single workflow dashboard.</p>
        </div>

        <div className="claims-layout">
          <div className="claims-panel">
            <ClaimForm
              onSubmit={onSubmit}
              loading={loadingAction}
              isConnected={Boolean(walletAddress)}
              walletAddress={walletAddress}
            />

            <div className="claims-status-card">
              <h2>Claim lifecycle</h2>
              <ul>
                <li>Claim is stored in MySQL and linked to the blockchain transaction hash.</li>
                <li>Admin decisions update both the backend and smart contract state.</li>
                <li>Claim history is preserved for audit and dispute resolution.</li>
              </ul>
            </div>
          </div>

          <div className="claims-panel">
            <ClaimList
              claims={claims}
              loading={loadingClaims}
              onRefresh={onRefresh}
              selectedClaimId={selectedClaimId}
              onSelectClaim={onSelectClaim}
              claimHistory={claimHistory}
            />

            <div className="claims-tip-card">
              <h2>Best practices</h2>
              <ul>
                <li>Attach evidence URLs and clear diagnosis details.</li>
                <li>Confirm the MetaMask transaction before refreshing the view.</li>
                <li>Use the admin panel to update the claim status after review.</li>
              </ul>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <AdminPanel
            claims={claims}
            loading={loadingAction}
            onApprove={onApprove}
            onReject={onReject}
            adminWallet={adminWallet}
          />
        </div>
      </div>
    </section>
  );
}

export default Claims;
