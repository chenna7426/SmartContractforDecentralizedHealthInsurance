import React, { useState } from "react";
import { Link } from "react-router-dom";
import ClaimForm from "../components/ClaimForm";
import ClaimList from "../components/ClaimList";
import "./Home.css";

const features = [
  {
    title: "Fast claim submission",
    text: "Submit new insurance claims with patient, policy, diagnosis, and evidence details in one secure form.",
    icon: "⚡",
    color: "blue"
  },
  {
    title: "Secure blockchain audit",
    text: "Every claim submission and approval is captured on-chain and mirrored in your claim history.",
    icon: "🔗",
    color: "green"
  },
  {
    title: "Protected dashboard access",
    text: "Log in, keep your session active, and move between the public home page and the protected dashboard.",
    icon: "🛡️",
    color: "purple"
  },
];

const insuranceConcepts = [
  {
    icon: "💰",
    color: "blue",
    term: "Premium",
    definition: "The monthly amount you pay to maintain your health insurance policy — whether or not you use any medical services that month.",
    example: "Example: You pay 0.05 ETH each month to keep your policy active."
  },
  {
    icon: "🏥",
    color: "teal",
    term: "Deductible",
    definition: "The amount you must pay out-of-pocket for covered healthcare services before your insurance starts paying its share.",
    example: "Example: Your deductible is 0.5 ETH. After you spend that, insurance covers the rest."
  },
  {
    icon: "🤝",
    color: "green",
    term: "Co-payment",
    definition: "A fixed amount you pay for a specific covered health care service — like a doctor visit or prescription — usually at the time of service.",
    example: "Example: Every GP visit costs you a flat 0.01 ETH co-pay."
  },
  {
    icon: "🛡️",
    color: "purple",
    term: "Coverage",
    definition: "The medical services, treatments, and expenses your insurance policy agrees to pay for, up to the policy's defined limits.",
    example: "Example: Your plan covers hospitalisation, surgery, and specialist consultations."
  },
  {
    icon: "📋",
    color: "amber",
    term: "Claim",
    definition: "A formal request you submit to your insurance provider asking them to pay for medical services you received. On this platform, claims are recorded on the blockchain.",
    example: "Example: After surgery you submit a claim with your diagnosis and hospital bills."
  },
  {
    icon: "📊",
    color: "rose",
    term: "Out-of-Pocket Maximum",
    definition: "The most you will ever have to pay in a plan year. Once you reach this limit, your insurance covers 100% of covered services for the rest of the year.",
    example: "Example: Your out-of-pocket max is 2 ETH. Spend that and you pay nothing more."
  },
];

const patientJourney = [
  {
    step: "01",
    icon: "🔍",
    title: "Choose a Policy",
    desc: "Compare available health insurance plans. Consider premiums, deductibles, coverage scope, and network hospitals before enrolling."
  },
  {
    step: "02",
    icon: "📝",
    title: "Enrol & Pay Premium",
    desc: "Register your details and pay your monthly premium via your MetaMask wallet. Your policy is instantly recorded on the blockchain."
  },
  {
    step: "03",
    icon: "🏨",
    title: "Receive Medical Care",
    desc: "Visit any in-network hospital or specialist. Keep all receipts, diagnosis reports, and treatment documents — you will need them for your claim."
  },
  {
    step: "04",
    icon: "📤",
    title: "Submit a Claim",
    desc: "Fill the claim form with your patient ID, policy number, diagnosis code, treatment cost, and supporting evidence. Submit it on-chain for full transparency."
  },
  {
    step: "05",
    icon: "⚖️",
    title: "Admin Review",
    desc: "Our administrators or smart-contract rules review your claim. You can track the status in real time from your dashboard — no more waiting on hold."
  },
  {
    step: "06",
    icon: "✅",
    title: "Receive Reimbursement",
    desc: "Once approved, funds are transferred directly to your registered wallet. The entire audit trail lives permanently on the blockchain."
  },
];

const faqs = [
  {
    q: "Do I need cryptocurrency to use this platform?",
    a: "Yes — premiums and reimbursements are handled in ETH via your MetaMask wallet. This removes middlemen and ensures instant, transparent payments."
  },
  {
    q: "What documents do I need to submit a claim?",
    a: "You will need your Patient ID, Policy Number, the diagnosis or ICD code from your doctor, an itemised bill from the hospital, and any supporting medical reports or prescription records."
  },
  {
    q: "How long does claim approval take?",
    a: "Most claims are reviewed within 48 hours. Once approved, reimbursement is settled on-chain in minutes — far faster than traditional insurers."
  },
  {
    q: "What happens if my claim is rejected?",
    a: "You will receive a reason for rejection. You can correct the information or add additional supporting evidence and resubmit. Every interaction is recorded on the blockchain for accountability."
  },
  {
    q: "Is my medical data private?",
    a: "Sensitive personal health data is stored off-chain in our secure database. Only a hash (a unique fingerprint) of your claim is written on-chain, so your privacy is protected while the audit trail stays intact."
  },
  {
    q: "What is a smart contract and why does it matter?",
    a: "A smart contract is a self-executing program that lives on the blockchain. It automates claim rules — if conditions are met, payment is released automatically, eliminating human error and bias."
  },
];

function Home({
  walletAddress,
  isConnected,
  isMetaMaskInstalled,
  provider,
  onConnectWallet,
  claims,
  claimHistory,
  loadingClaims,
  loadingAction,
  selectedClaimId,
  setSelectedClaimId,
  loadClaims,
  loadClaimHistory,
  handleClaimSubmit,
  handleStatusUpdate,
  message,
  adminWallet,
}) {
  const [openFaq, setOpenFaq] = useState(null);
  const toggleFaq = (idx) => setOpenFaq(openFaq === idx ? null : idx);
  return (
    <div className="page-wrapper">
      <section className="home-hero">
        <div className="home-hero__inner">
          <div className="home-hero__eyebrow">Complete DApp workflow</div>
          <h1 className="home-hero__title">
            Create, review, and approve claims with a <span>secure authenticated workflow.</span>
          </h1>
          <p className="home-hero__subtitle">
            Connect MetaMask, log in to your account, and manage claims with a frontend backed by Flask and MySQL. This page keeps the claim workflow visible alongside the new authentication UI.
          </p>

          <div className="home-hero__actions">
            <button
              type="button"
              onClick={onConnectWallet}
              className="home-hero__cta-primary"
            >
              {isConnected ? "Wallet connected" : "Connect MetaMask"}
            </button>

            <Link
              to="/dashboard"
              className="home-hero__cta-secondary"
            >
              Open dashboard
            </Link>
          </div>

          <div className="home-hero__stats">
            <div className="home-stat">
              <span className="home-stat__value">3</span>
              <span className="home-stat__label">Stages of claim lifecycle</span>
            </div>
            <div className="home-stat">
              <span className="home-stat__value">2</span>
              <span className="home-stat__label">Blockchain confirmations</span>
            </div>
            <div className="home-stat">
              <span className="home-stat__value">100%</span>
              <span className="home-stat__label">Immutable audit trail</span>
            </div>
          </div>
        </div>
      </section>

      {message?.text && (
        <div className="home-notification">
          <div className={`home-notification__inner home-notification__inner--${message.type}`}>
            {message.type === 'success' ? '✓' : '⚠'} {message.text}
          </div>
        </div>
      )}

      <section className="home-features">
        <div className="home-section-label">Features</div>
        <h2 className="home-section-title">Everything you need</h2>
        <p className="home-section-desc">
          Our decentralized health insurance platform provides a complete suite of tools for patients, hospitals, and administrators.
        </p>

        <div className="home-feature-grid">
          {features.map((feature) => (
            <div key={feature.title} className="home-feature-card">
              <div className={`home-feature-icon home-feature-icon--${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="home-feature-title">{feature.title}</h3>
              <p className="home-feature-text">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-workflow">
        <div className="home-workflow__inner">
          <h2 className="home-workflow__title">How the workflow works</h2>
          <p className="home-workflow__desc">A simple 3-step process to decentralized claim management.</p>

          <div className="home-workflow-steps">
            <div className="home-workflow-step">
              <div className="home-workflow-step__num">1</div>
              <h3 className="home-workflow-step__title">Connect wallet</h3>
              <p className="home-workflow-step__text">Use MetaMask to authorize the transaction securely.</p>
            </div>
            <div className="home-workflow-step">
              <div className="home-workflow-step__num">2</div>
              <h3 className="home-workflow-step__title">Submit claim</h3>
              <p className="home-workflow-step__text">Fill out the claim form with supporting details and submit on-chain.</p>
            </div>
            <div className="home-workflow-step">
              <div className="home-workflow-step__num">3</div>
              <h3 className="home-workflow-step__title">Approve or reject</h3>
              <p className="home-workflow-step__text">Admins review and update the claim status via the smart contract.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How Health Insurance Works ───────────────────── */}
      <section className="ins-edu">
        <div className="ins-edu__inner">

          {/* Header */}
          <div className="ins-edu__header">
            <div className="home-section-label">Patient Guide</div>
            <h2 className="home-section-title ins-edu__title">
              How Health Insurance Works
            </h2>
            <p className="home-section-desc">
              Health insurance can feel confusing — but it doesn't have to be. Here's everything you need to know to make the most of your decentralized coverage.
            </p>
          </div>

          {/* Key concepts */}
          <div className="ins-concepts-grid">
            {insuranceConcepts.map((c) => (
              <div key={c.term} className="ins-concept-card">
                <div className={`ins-concept-icon ins-concept-icon--${c.color}`}>
                  {c.icon}
                </div>
                <h3 className="ins-concept-term">{c.term}</h3>
                <p className="ins-concept-def">{c.definition}</p>
                <div className="ins-concept-example">{c.example}</div>
              </div>
            ))}
          </div>

          {/* Patient journey */}
          <div className="ins-journey">
            <div className="ins-journey__header">
              <h3 className="ins-journey__title">Your Step-by-Step Patient Journey</h3>
              <p className="ins-journey__sub">From choosing a plan to receiving your reimbursement — here's the full picture.</p>
            </div>
            <div className="ins-journey-steps">
              {patientJourney.map((s, i) => (
                <div key={s.step} className="ins-journey-step">
                  <div className="ins-journey-step__left">
                    <div className="ins-journey-step__num">{s.step}</div>
                    {i < patientJourney.length - 1 && <div className="ins-journey-step__line" />}
                  </div>
                  <div className="ins-journey-step__body">
                    <div className="ins-journey-step__icon">{s.icon}</div>
                    <h4 className="ins-journey-step__title">{s.title}</h4>
                    <p className="ins-journey-step__desc">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Why blockchain banner */}
          <div className="ins-blockchain-banner">
            <div className="ins-blockchain-banner__icon">🔗</div>
            <div>
              <h3 className="ins-blockchain-banner__title">Why blockchain makes insurance better</h3>
              <p className="ins-blockchain-banner__text">
                Traditional insurers rely on centralised databases that can be altered, lost, or hacked. Our smart contracts record every premium payment, policy agreement, and claim decision on the Ethereum blockchain — creating a permanent, tamper-proof record that no single party can change. You have full transparency into your own coverage at all times.
              </p>
            </div>
            <div className="ins-blockchain-banner__badges">
              <span className="ins-badge ins-badge--green">✓ Transparent</span>
              <span className="ins-badge ins-badge--blue">✓ Immutable</span>
              <span className="ins-badge ins-badge--purple">✓ Trustless</span>
            </div>
          </div>

          {/* FAQ accordion */}
          <div className="ins-faq">
            <h3 className="ins-faq__title">Frequently Asked Questions</h3>
            <div className="ins-faq-list">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className={`ins-faq-item${openFaq === idx ? ' ins-faq-item--open' : ''}`}
                >
                  <button
                    className="ins-faq-item__question"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={openFaq === idx}
                  >
                    <span>{faq.q}</span>
                    <span className="ins-faq-item__arrow">
                      {openFaq === idx ? '▲' : '▼'}
                    </span>
                  </button>
                  {openFaq === idx && (
                    <div className="ins-faq-item__answer">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      <section className="home-claims">
        <div className="home-claims__grid">
          <div>
            <ClaimForm
              onSubmit={handleClaimSubmit}
              loading={loadingAction}
              isConnected={isConnected}
              walletAddress={walletAddress}
            />
          </div>

          <div className="home-status-card">
            <h2 className="home-status-card__title">Wallet & workflow status</h2>
            <ul className="home-status-list">
              <li>
                <div className={`home-status-dot home-status-dot--${isMetaMaskInstalled ? 'ok' : 'off'}`} />
                MetaMask: {isMetaMaskInstalled ? "Installed" : "Not detected"}
              </li>
              <li>
                <div className={`home-status-dot home-status-dot--${provider ? 'ok' : 'off'}`} />
                Provider ready: {provider ? "Yes" : "No"}
              </li>
              <li>
                <div className={`home-status-dot home-status-dot--${walletAddress ? 'ok' : 'off'}`} />
                Connected wallet: {walletAddress || "Not connected"}
              </li>
              <li>
                <div className="home-status-dot home-status-dot--ok" />
                Claims in MySQL: {claims.length}
              </li>
              <li>
                <div className="home-status-dot home-status-dot--ok" />
                Admin review enabled
              </li>
            </ul>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 border border-slate-200">
              <p>
                <strong>Tip:</strong> Log in with your account to access the protected dashboard and keep your session active while you submit claims.
              </p>
            </div>
          </div>
        </div>

        <div className="home-claims__full">
          <ClaimList
            claims={claims}
            loading={loadingClaims}
            onRefresh={loadClaims}
            selectedClaimId={selectedClaimId}
            onSelectClaim={async (claimId) => {
              setSelectedClaimId(claimId);
              if (claimId) {
                await loadClaimHistory(claimId);
              }
            }}
            claimHistory={claimHistory}
          />
        </div>
      </section>
    </div>
  );
}

export default Home;
