import React from 'react';
import './HospitalDashboard.css';

function HospitalDashboard() {
  const metrics = [
    { title: 'Claims Submitted', value: '18' },
    { title: 'Awaiting Review', value: '4' },
    { title: 'Approved This Week', value: '11' },
    { title: 'Average Response Time', value: '2h' },
  ];

  return (
    <section className="hospital-dashboard-page">
      <div className="hospital-dashboard-inner">
        <h1>Hospital Dashboard</h1>
        <p>Monitor claim volume, review status, and accelerate patient support coordination.</p>

        <div className="hospital-dashboard-grid">
          {metrics.map((item) => (
            <div key={item.title} className="hospital-dashboard-card">
              <h2>{item.title}</h2>
              <p>{item.value}</p>
            </div>
          ))}
        </div>

        <div className="hospital-dashboard-card" style={{ marginTop: '1.5rem' }}>
          <h3>Clinical workflow timeline</h3>
          <ul>
            <li>Claim intake from the patient portal.</li>
            <li>Diagnosis validation and documentation checks.</li>
            <li>Approval status updates for finance and compliance teams.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default HospitalDashboard;
