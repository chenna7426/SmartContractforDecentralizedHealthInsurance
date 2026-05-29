import React from "react";

function LoadingSpinner({ label = "Loading..." }) {
  return (
    <span className="spinner-wrapper" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
      <span className="spinner-icon" style={{ 
        height: '1rem', 
        width: '1rem', 
        animation: 'spin 1s linear infinite', 
        borderRadius: '9999px', 
        border: '2px solid rgba(255,255,255,0.7)', 
        borderTopColor: '#ffffff' 
      }} />
      {label}
    </span>
  );
}

export default LoadingSpinner;
