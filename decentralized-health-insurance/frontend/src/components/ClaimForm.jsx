import React, { useState } from "react";
import "./ClaimForm.css";

function ClaimForm({ onSubmit, loading, isConnected, walletAddress }) {
  const [formData, setFormData] = useState({
    patientName: "",
    policyNumber: "",
    hospitalName: "",
    diagnosis: "",
    description: "",
    amount: "",
    claimType: "Consultation",
    evidenceUrl: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isConnected) {
      alert("Please connect your MetaMask wallet first.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="claim-form-shell animate-fade-in">
      <p className="home-section-label">Create Request</p>
      <h2 className="claim-form-shell__title">Submit a Claim</h2>
      <p className="claim-form-shell__desc">
        Fill out the details below. This will record your claim in the database and issue a transaction on the blockchain via MetaMask.
      </p>

      {isConnected ? (
        <div className="claim-wallet-note">
          <div className="claim-wallet-note__icon">✅</div>
          <div className="claim-wallet-note__content">
            <h4>Wallet connected securely</h4>
            <p>Your transactions will be signed by <code>{walletAddress}</code>.</p>
          </div>
        </div>
      ) : (
        <div className="claim-wallet-note" style={{ background: '#fff7ed', borderColor: '#fed7aa' }}>
          <div className="claim-wallet-note__icon">⚠️</div>
          <div className="claim-wallet-note__content">
            <h4 style={{ color: '#9a3412' }}>MetaMask not connected</h4>
            <p style={{ color: '#c2410c' }}>You must connect your wallet before you can submit a claim. The form is disabled.</p>
          </div>
        </div>
      )}

      <form className="claim-form" onSubmit={handleSubmit}>
        <div className="claim-form-field">
          <label className="claim-label">Patient Name</label>
          <input
            type="text"
            name="patientName"
            className="claim-input"
            value={formData.patientName}
            onChange={handleChange}
            required
            placeholder="John Doe"
            disabled={!isConnected}
          />
        </div>

        <div className="claim-form-field">
          <label className="claim-label">Policy Number</label>
          <input
            type="text"
            name="policyNumber"
            className="claim-input"
            value={formData.policyNumber}
            onChange={handleChange}
            required
            placeholder="POL-12345"
            disabled={!isConnected}
          />
        </div>

        <div className="claim-form-field">
          <label className="claim-label">Hospital Name</label>
          <input
            type="text"
            name="hospitalName"
            className="claim-input"
            value={formData.hospitalName}
            onChange={handleChange}
            required
            placeholder="City General Hospital"
            disabled={!isConnected}
          />
        </div>

        <div className="claim-form-field">
          <label className="claim-label">Claim Type</label>
          <select
            name="claimType"
            className="claim-select"
            value={formData.claimType}
            onChange={handleChange}
            disabled={!isConnected}
          >
            <option value="Consultation">Consultation</option>
            <option value="Surgery">Surgery</option>
            <option value="Pharmacy">Pharmacy</option>
            <option value="Emergency">Emergency</option>
            <option value="Dental">Dental</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="claim-form-field">
          <label className="claim-label">Claim Amount ($)</label>
          <input
            type="number"
            name="amount"
            className="claim-input"
            value={formData.amount}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            placeholder="150.00"
            disabled={!isConnected}
          />
        </div>

        <div className="claim-form-field">
          <label className="claim-label">Evidence URL (Optional)</label>
          <input
            type="url"
            name="evidenceUrl"
            className="claim-input"
            value={formData.evidenceUrl}
            onChange={handleChange}
            placeholder="https://ipfs.io/ipfs/..."
            disabled={!isConnected}
          />
        </div>

        <div className="claim-form-field claim-form-field--full">
          <label className="claim-label">Diagnosis / Reason</label>
          <textarea
            name="diagnosis"
            className="claim-textarea"
            value={formData.diagnosis}
            onChange={handleChange}
            required
            placeholder="Describe the medical condition..."
            disabled={!isConnected}
          ></textarea>
        </div>

        <div className="claim-form-field claim-form-field--full">
          <label className="claim-label">Description</label>
          <textarea
            name="description"
            className="claim-textarea"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Provide additional details about the treatment or claim..."
            disabled={!isConnected}
          ></textarea>
        </div>

        <button
          type="submit"
          className="claim-submit-btn"
          disabled={loading || !isConnected}
        >
          {loading ? "Confirm in MetaMask..." : "Submit Claim"}
        </button>

        <p className="claim-form-disclaimer">
          Note: Submitting a claim will prompt MetaMask to sign a transaction on the Hardhat local network.
        </p>
      </form>
    </div>
  );
}

export default ClaimForm;
