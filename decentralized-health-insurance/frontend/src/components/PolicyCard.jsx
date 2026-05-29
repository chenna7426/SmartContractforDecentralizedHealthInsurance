import React from 'react';
import './PolicyCard.css';

function PolicyCard({ policy }) {
  return (
    <article className="policy-card">
      <h3>{policy.name}</h3>
      <p>{policy.description}</p>
      <div className="policy-meta">
        <span className="policy-tag">Premium: ${policy.premium}</span>
        <span className="policy-tag">Coverage: ${policy.coverage}</span>
        <span className="policy-tag">Duration: {policy.duration}</span>
      </div>
      <button type="button" className="policy-cta">View Policy</button>
    </article>
  );
}

export default PolicyCard;
