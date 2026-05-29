import React from 'react';
import './Loader.css';

function Loader({ text = 'Loading...' }) {
  return (
    <div className="loader-shell" role="status" aria-live="polite">
      <span className="loader-spinner" />
      <span>{text}</span>
    </div>
  );
}

export default Loader;
