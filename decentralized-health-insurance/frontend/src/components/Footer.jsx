import React from "react";
import "./Footer.css";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Login", href: "/login" },
  { label: "Register", href: "/register" },
  { label: "Dashboard", href: "/dashboard" },
];

const resourceLinks = [
  { label: "Submit Claim", href: "/" },
  { label: "View Claims", href: "/" },
  { label: "Admin Panel", href: "/admin" },
  { label: "Manage Claims", href: "/manage-claims" },
];

const techStack = ["React", "Flask", "MySQL", "Solidity", "Hardhat", "MetaMask"];

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          {/* Brand column */}
          <div className="footer__brand">
            <div className="footer__brand-name">
              <span>⛓</span>
              Health Insurance DApp
            </div>
            <p className="footer__brand-desc">
              A fully decentralized health insurance platform built with
              blockchain transparency, secure on-chain claim management, and
              tamper-proof audit trails.
            </p>
            <div className="footer__badges">
              <span className="footer__badge">Blockchain Secured</span>
              <span className="footer__badge">Open Source</span>
              <span className="footer__badge">MetaMask Ready</span>
            </div>
          </div>

          {/* Navigation column */}
          <div>
            <p className="footer__col-title">Navigation</p>
            <ul className="footer__links">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources column */}
          <div>
            <p className="footer__col-title">Resources</p>
            <ul className="footer__links">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech column */}
          <div>
            <p className="footer__col-title">Tech Stack</p>
            <ul className="footer__links">
              <li><a href="https://reactjs.org" target="_blank" rel="noreferrer">React.js Frontend</a></li>
              <li><a href="https://flask.palletsprojects.com" target="_blank" rel="noreferrer">Python Flask API</a></li>
              <li><a href="https://www.mysql.com" target="_blank" rel="noreferrer">MySQL Database</a></li>
              <li><a href="https://soliditylang.org" target="_blank" rel="noreferrer">Solidity Contracts</a></li>
              <li><a href="https://hardhat.org" target="_blank" rel="noreferrer">Hardhat Blockchain</a></li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copy">
            © {new Date().getFullYear()} Decentralized Health Insurance DApp. All rights reserved.
          </p>
          <div className="footer__tech-stack">
            {techStack.map((tech) => (
              <span key={tech} className="footer__tech">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
