import React from 'react';
import './AdminDashboard.css';
import AdminPanel from '../components/AdminPanel';

function AdminDashboard({ claims, loading, onApprove, onReject, adminWallet }) {
  return (
    <section className="admin-dashboard-page" id="admin">
      <div className="admin-dashboard-inner">
        <h1>Admin Dashboard</h1>
        <p>Review all pending claims, approve them, or reject them with full audit visibility.</p>

        <div className="admin-dashboard-grid">
          <div className="admin-dashboard-card">
            <h2>Admin Overview</h2>
            <ul>
              <li>Pending claims are highlighted for review.</li>
              <li>Approvals update the claim status on-chain.</li>
              <li>History is stored in MySQL for compliance tracking.</li>
            </ul>
          </div>

          <div className="admin-dashboard-card">
            <h3>Current Admin Wallet</h3>
            <p>{adminWallet || 'Set the admin wallet in your environment variables.'}</p>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <AdminPanel
            claims={claims}
            loading={loading}
            onApprove={onApprove}
            onReject={onReject}
            adminWallet={adminWallet}
          />
        </div>
      </div>
    </section>
  );
}

export default AdminDashboard;
