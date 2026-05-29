import React from 'react';
import './Policies.css';
import PolicyCard from '../components/PolicyCard';

const policies = [
  {
    name: 'Basic Care Plan',
    description: 'Ideal for routine outpatient visits and prescription reimbursements.',
    premium: 29,
    coverage: 5000,
    duration: '12 months',
  },
  {
    name: 'Family Coverage',
    description: 'Balanced protection for families with emergency and inpatient benefits.',
    premium: 59,
    coverage: 10000,
    duration: '12 months',
  },
  {
    name: 'Premium Support',
    description: 'Enhanced coverage with specialist consultations and high-limit reimbursements.',
    premium: 89,
    coverage: 20000,
    duration: '12 months',
  },
];

function Policies() {
  return (
    <section className="policies-page" id="policies">
      <div className="policies-inner">
        <h1>Insurance Plans</h1>
        <p>Browse sample policies and choose the coverage that matches your healthcare needs.</p>

        <div className="policies-grid">
          {policies.map((policy) => (
            <PolicyCard key={policy.name} policy={policy} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Policies;
