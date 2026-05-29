import React from 'react';
import './WalletConnect.css';

function WalletConnect({ walletAddress, isInstalled, isConnected }) {
  return (
    <section className="wallet-page" id="wallet">
      <div className="wallet-inner">
        <h1>Wallet Connection</h1>
        <p>Connect MetaMask to start the blockchain claim flow and approve transactions confidently.</p>

        <div className="wallet-grid">
          <div className="wallet-card">
            <h2>Status</h2>
            <p>{isInstalled ? 'MetaMask is installed.' : 'Install MetaMask to continue.'}</p>
            <p className="wallet-status">
              {isConnected ? `Connected: ${walletAddress}` : 'Wallet not connected yet'}
            </p>
          </div>

          <div className="wallet-card">
            <h3>Wallet checklist</h3>
            <ul>
              <li>Install MetaMask in the browser.</li>
              <li>Connect the wallet to the local Hardhat network.</li>
              <li>Confirm claim transactions in the extension popup.</li>
            </ul>
          </div>

          <div className="wallet-card">
            <h3>Recommended setup</h3>
            <ul>
              <li>Use Chrome or Brave for best MetaMask support.</li>
              <li>Keep the local blockchain running for contract interactions.</li>
              <li>Use the admin wallet for approvals and review actions.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WalletConnect;
