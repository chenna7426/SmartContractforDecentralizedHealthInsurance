import React from 'react';
import './ProtectedRoute.css';

function ProtectedRoute({ isAllowed, children, fallback }) {
  if (isAllowed) {
    return children;
  }

  return (
    <div className="protected-route-shell">
      <div className="protected-route-card">
        <h2>Access Restricted</h2>
        <p>
          {fallback || 'Please connect your wallet and sign in to view this secured page.'}
        </p>
        <div className="protected-route-actions">
          <a href="#wallet">Connect Wallet</a>
          <button type="button">Sign In</button>
        </div>
      </div>
    </div>
  );
}

export default ProtectedRoute;
