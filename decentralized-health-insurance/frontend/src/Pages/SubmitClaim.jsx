import React, { useState } from "react";
import "./SubmitClaim.css";

const STEPS = ["Patient Info", "Claim Details", "Review & Submit"];

const CLAIM_TYPES = [
  { value: "Consultation", icon: "🩺", label: "Consultation" },
  { value: "Surgery", icon: "🏥", label: "Surgery" },
  { value: "Pharmacy", icon: "💊", label: "Pharmacy" },
  { value: "Emergency", icon: "🚨", label: "Emergency" },
  { value: "Dental", icon: "🦷", label: "Dental" },
  { value: "Other", icon: "📋", label: "Other" },
];

function SubmitClaim({
  onSubmit,
  loadingAction,
  walletAddress,
  message,
}) {
  const isConnected = Boolean(walletAddress);

  const [step, setStep] = useState(0);
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
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isConnected) return;
    await onSubmit(formData);
    setSubmitted(true);
  };

  const handleReset = () => {
    setFormData({
      patientName: "",
      policyNumber: "",
      hospitalName: "",
      diagnosis: "",
      description: "",
      amount: "",
      claimType: "Consultation",
      evidenceUrl: "",
    });
    setStep(0);
    setSubmitted(false);
  };

  const selectedClaimType = CLAIM_TYPES.find((t) => t.value === formData.claimType);

  if (submitted && message?.type === "success") {
    return (
      <section className="sc-page" id="submit-claim">
        <div className="sc-success-wrap animate-scale-in">
          <div className="sc-success-icon">✅</div>
          <h2>Claim Submitted!</h2>
          <p>Your claim has been recorded on the blockchain and saved to the database.</p>
          {message?.text && (
            <div className="sc-tx-badge">
              <span>📦</span>
              <span className="sc-tx-text">{message.text}</span>
            </div>
          )}
          <button className="sc-btn sc-btn--primary" onClick={handleReset}>
            Submit Another Claim
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="sc-page" id="submit-claim">
      {/* Hero Header */}
      <div className="sc-hero">
        <div className="sc-hero-badge">Create Request</div>
        <h1 className="sc-hero-title">Submit a Claim</h1>
        <p className="sc-hero-sub">
          Securely submit your health insurance claim on-chain. MetaMask will
          sign the transaction, ensuring full transparency and immutability.
        </p>

        {/* Wallet status banner */}
        {isConnected ? (
          <div className="sc-wallet-banner sc-wallet-banner--ok">
            <span className="sc-wallet-dot sc-wallet-dot--green"></span>
            <span>
              Wallet connected &mdash;&nbsp;
              <code>{walletAddress.slice(0, 8)}…{walletAddress.slice(-6)}</code>
            </span>
          </div>
        ) : (
          <div className="sc-wallet-banner sc-wallet-banner--warn">
            <span>⚠️</span>
            <span>Connect MetaMask to enable claim submission.</span>
          </div>
        )}
      </div>

      {/* Step progress */}
      <div className="sc-stepper">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div className={`sc-step ${i === step ? "sc-step--active" : ""} ${i < step ? "sc-step--done" : ""}`}>
              <div className="sc-step-circle">{i < step ? "✓" : i + 1}</div>
              <span className="sc-step-label">{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`sc-step-line ${i < step ? "sc-step-line--done" : ""}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Form Card */}
      <div className="sc-card animate-fade-in">

        {/* ─── Step 0: Patient Info ─── */}
        {step === 0 && (
          <form className="sc-form" onSubmit={handleNext} id="sc-step-0">
            <h2 className="sc-card-title">Patient Information</h2>
            <p className="sc-card-sub">Provide the patient and policy details.</p>

            <div className="sc-grid">
              <div className="sc-field">
                <label className="sc-label" htmlFor="patientName">Patient Name</label>
                <input
                  id="patientName"
                  type="text"
                  name="patientName"
                  className="sc-input"
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. John Doe"
                  disabled={!isConnected}
                />
              </div>

              <div className="sc-field">
                <label className="sc-label" htmlFor="policyNumber">Policy Number</label>
                <input
                  id="policyNumber"
                  type="text"
                  name="policyNumber"
                  className="sc-input"
                  value={formData.policyNumber}
                  onChange={handleChange}
                  required
                  placeholder="e.g. POL-12345"
                  disabled={!isConnected}
                />
              </div>

              <div className="sc-field sc-field--full">
                <label className="sc-label" htmlFor="hospitalName">Hospital / Clinic Name</label>
                <input
                  id="hospitalName"
                  type="text"
                  name="hospitalName"
                  className="sc-input"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. City General Hospital"
                  disabled={!isConnected}
                />
              </div>
            </div>

            <div className="sc-actions">
              <button
                type="submit"
                className="sc-btn sc-btn--primary"
                disabled={!isConnected}
              >
                Next: Claim Details →
              </button>
            </div>
          </form>
        )}

        {/* ─── Step 1: Claim Details ─── */}
        {step === 1 && (
          <form className="sc-form" onSubmit={handleNext} id="sc-step-1">
            <h2 className="sc-card-title">Claim Details</h2>
            <p className="sc-card-sub">Describe the treatment and claim type.</p>

            {/* Claim type selector */}
            <div className="sc-field sc-field--full">
              <label className="sc-label">Claim Type</label>
              <div className="sc-claim-types">
                {CLAIM_TYPES.map((t) => (
                  <label
                    key={t.value}
                    className={`sc-type-card ${formData.claimType === t.value ? "sc-type-card--selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="claimType"
                      value={t.value}
                      checked={formData.claimType === t.value}
                      onChange={handleChange}
                      disabled={!isConnected}
                    />
                    <span className="sc-type-icon">{t.icon}</span>
                    <span className="sc-type-label">{t.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="sc-grid">
              <div className="sc-field">
                <label className="sc-label" htmlFor="amount">Claim Amount (USD)</label>
                <div className="sc-input-wrap">
                  <span className="sc-input-prefix">$</span>
                  <input
                    id="amount"
                    type="number"
                    name="amount"
                    className="sc-input sc-input--prefixed"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    disabled={!isConnected}
                  />
                </div>
              </div>

              <div className="sc-field">
                <label className="sc-label" htmlFor="evidenceUrl">Evidence URL <span className="sc-optional">(Optional)</span></label>
                <input
                  id="evidenceUrl"
                  type="url"
                  name="evidenceUrl"
                  className="sc-input"
                  value={formData.evidenceUrl}
                  onChange={handleChange}
                  placeholder="https://ipfs.io/ipfs/..."
                  disabled={!isConnected}
                />
              </div>

              <div className="sc-field sc-field--full">
                <label className="sc-label" htmlFor="diagnosis">Diagnosis / Reason</label>
                <textarea
                  id="diagnosis"
                  name="diagnosis"
                  className="sc-textarea"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  required
                  placeholder="Describe the medical condition or reason for claim..."
                  disabled={!isConnected}
                />
              </div>

              <div className="sc-field sc-field--full">
                <label className="sc-label" htmlFor="description">Additional Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="sc-textarea"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Provide additional details about the treatment..."
                  disabled={!isConnected}
                />
              </div>
            </div>

            <div className="sc-actions">
              <button type="button" className="sc-btn sc-btn--ghost" onClick={handleBack}>
                ← Back
              </button>
              <button type="submit" className="sc-btn sc-btn--primary" disabled={!isConnected}>
                Next: Review →
              </button>
            </div>
          </form>
        )}

        {/* ─── Step 2: Review & Submit ─── */}
        {step === 2 && (
          <form className="sc-form" onSubmit={handleSubmit} id="sc-step-2">
            <h2 className="sc-card-title">Review & Submit</h2>
            <p className="sc-card-sub">Please verify all details before signing with MetaMask.</p>

            <div className="sc-review-grid">
              <div className="sc-review-row">
                <span className="sc-review-key">Patient Name</span>
                <span className="sc-review-val">{formData.patientName}</span>
              </div>
              <div className="sc-review-row">
                <span className="sc-review-key">Policy Number</span>
                <span className="sc-review-val">{formData.policyNumber}</span>
              </div>
              <div className="sc-review-row">
                <span className="sc-review-key">Hospital</span>
                <span className="sc-review-val">{formData.hospitalName}</span>
              </div>
              <div className="sc-review-row">
                <span className="sc-review-key">Claim Type</span>
                <span className="sc-review-val">
                  {selectedClaimType?.icon} {selectedClaimType?.label}
                </span>
              </div>
              <div className="sc-review-row">
                <span className="sc-review-key">Claim Amount</span>
                <span className="sc-review-val sc-review-val--amount">
                  ${Number(formData.amount || 0).toFixed(2)}
                </span>
              </div>
              {formData.evidenceUrl && (
                <div className="sc-review-row">
                  <span className="sc-review-key">Evidence URL</span>
                  <a
                    href={formData.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sc-review-link"
                  >
                    {formData.evidenceUrl}
                  </a>
                </div>
              )}
              <div className="sc-review-row sc-review-row--block">
                <span className="sc-review-key">Diagnosis</span>
                <span className="sc-review-val">{formData.diagnosis}</span>
              </div>
              <div className="sc-review-row sc-review-row--block">
                <span className="sc-review-key">Description</span>
                <span className="sc-review-val">{formData.description}</span>
              </div>
            </div>

            {/* Blockchain notice */}
            <div className="sc-blockchain-notice">
              <span className="sc-blockchain-icon">⛓</span>
              <div>
                <strong>Blockchain Transaction</strong>
                <p>
                  Clicking <em>Submit Claim</em> will open MetaMask to sign a
                  transaction on the Hardhat local network. This cannot be
                  undone once confirmed.
                </p>
              </div>
            </div>

            {message?.type === "error" && (
              <div className="sc-error-banner">⚠️ {message.text}</div>
            )}

            <div className="sc-actions">
              <button type="button" className="sc-btn sc-btn--ghost" onClick={handleBack} disabled={loadingAction}>
                ← Back
              </button>
              <button
                type="submit"
                className="sc-btn sc-btn--primary sc-btn--submit"
                disabled={loadingAction || !isConnected}
              >
                {loadingAction ? (
                  <>
                    <span className="sc-spinner"></span>
                    Confirm in MetaMask…
                  </>
                ) : (
                  "🚀 Submit Claim"
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Info cards at bottom */}
      <div className="sc-info-row">
        <div className="sc-info-card">
          <div className="sc-info-icon">🔒</div>
          <h3>Secure & Immutable</h3>
          <p>Claims are hashed and stored on-chain, preventing tampering or data loss.</p>
        </div>
        <div className="sc-info-card">
          <div className="sc-info-icon">⚡</div>
          <h3>Fast Processing</h3>
          <p>Smart contract automation speeds up claim validation and approval decisions.</p>
        </div>
        <div className="sc-info-card">
          <div className="sc-info-icon">📊</div>
          <h3>Full Audit Trail</h3>
          <p>Every status change is logged on-chain for transparent, dispute-free auditing.</p>
        </div>
      </div>
    </section>
  );
}

export default SubmitClaim;
