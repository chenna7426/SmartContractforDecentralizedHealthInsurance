import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ToastContainer from "./components/ToastContainer";
import API from "./api/Api";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Dashboard from "./Pages/Dashboard";
import AdminPage from "./Pages/AdminPage";
import ManageClaimsPage from "./Pages/ManageClaimsPage";
import SubmitClaim from "./Pages/SubmitClaim";
import {
  approveClaimOnChain,
  connectWallet,
  connectWalletWithProvider,
  getInsuranceBalance,
  rejectClaimOnChain,
  submitClaimOnChain,
  switchToHardhatNetwork,
  getOnChainClaimStatus,
  getAdminWallet,
} from "./services/blockchainService";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ADMIN_WALLET } from "./config";

const SESSION_KEY = "dhi_session";
const ADMIN_WALLET_KEY = "dhi_admin_wallet";
const HARDHAT_CHAIN_ID = 31337;

const isAdminWallet = (wallet, admin) => {
  if (!wallet || !admin) {
    return false;
  }
  return wallet.toLowerCase() === admin.toLowerCase();
};

const getStoredAdminWallet = () => {
  try {
    return localStorage.getItem(ADMIN_WALLET_KEY) || "";
  } catch {
    return "";
  }
};

const storeAdminWallet = (wallet) => {
  try {
    if (wallet) {
      localStorage.setItem(ADMIN_WALLET_KEY, wallet);
      return wallet;
    }
    localStorage.removeItem(ADMIN_WALLET_KEY);
    return "";
  } catch {
    return wallet || "";
  }
};

const normalizeClaim = (claim = {}) => ({
  ...claim,
  id: claim.id ?? claim.claim_id,
  patient_name: claim.patient_name || claim.patientName || "Unknown patient",
  policy_number: claim.policy_number || claim.policyNumber || "N/A",
  claim_type: claim.claim_type || claim.claimType || "General",
  claim_amount: claim.claim_amount ?? claim.amount ?? 0,
  hospital_name: claim.hospital_name || claim.hospitalName || "",
  diagnosis: claim.diagnosis || "",
  wallet_address: claim.wallet_address || claim.walletAddress || "",
  blockchain_claim_id: claim.blockchain_claim_id ?? claim.blockchainClaimId ?? null,
  blockchain_tx_hash: claim.blockchain_tx_hash || claim.blockchainTxHash || "",
  status: claim.status || "Pending",
  created_at: claim.created_at || claim.createdAt || "",
});

const getStoredSession = () => {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

function AppContent() {
  const navigate = useNavigate();
  const storedSession = getStoredSession();
  const [authUser, setAuthUser] = useState(storedSession?.user || null);
  const [authToken, setAuthToken] = useState(storedSession?.token || "");
  const [authLoading, setAuthLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [walletAddress, setWalletAddress] = useState("");
  const [adminWallet, setAdminWallet] = useState(getStoredAdminWallet() || "");
  const [isAdminWalletConnected, setIsAdminWalletConnected] = useState(false);
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [networkName, setNetworkName] = useState("Unknown");
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [claims, setClaims] = useState([]);
  const [adminClaims, setAdminClaims] = useState([]);
  const [claimHistory, setClaimHistory] = useState({});
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [insuranceBalance, setInsuranceBalance] = useState("0");
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [toasts, setToasts] = useState([]);

  const showToast = (type, title, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((current) => [...current, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const dismissToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const storeSession = (user, token) => {
    const session = { user, token };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem("token", token);
    localStorage.setItem("role", (user?.role || "").toLowerCase());
    setAuthUser(user);
    setAuthToken(token);

    if (user?.role?.toLowerCase() === "admin") {
      const storedAdmin = ADMIN_WALLET?.trim() || getStoredAdminWallet();
      if (storedAdmin) {
        const resolved = storeAdminWallet(storedAdmin);
        setAdminWallet(resolved);
      }
    }

    return session;
  };

  const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setAuthUser(null);
    setAuthToken("");
    setClaims([]);
  };

  const clearWallet = () => {
    setWalletAddress("");
    setContract(null);
    setProvider(null);
    setNetworkName("Unknown");
    setChainId(null);
    setIsAdminWalletConnected(false);
  };

  const upsertClaim = (claim) => {
    const normalized = normalizeClaim(claim);
    setClaims((current) => [normalized, ...current.filter((item) => item.id !== normalized.id)]);
    return normalized;
  };

  const loadClaims = async () => {
    if (!authToken) {
      setClaims([]);
      return;
    }
    setLoadingClaims(true);
    try {
      const response = await API.get("/api/claims");
      setClaims((response.data.claims || []).map(normalizeClaim));
    } catch (error) {
      // If we get a 401, clear claims and don't show an error since it just means not logged in
      if (error?.response?.status === 401) {
        setClaims([]);
      } else {
        showToast("error", "Claim load failed", error.message || "Unable to load claims");
        setMessage({ type: "error", text: error.message || "Unable to load claims" });
      }
    } finally {
      setLoadingClaims(false);
    }
  };

  const loadAdminClaims = useCallback(async () => {
    const response = await API.get("/api/admin/claims");
    setAdminClaims(response.data.claims || []);
    return response.data.claims || [];
  }, []);

  const loadClaimHistory = async (claimId) => {
    if (!claimId || claimHistory[claimId]) {
      return;
    }

    try {
      const response = await API.get(`/api/claims/${claimId}/history`);
      setClaimHistory((current) => ({
        ...current,
        [claimId]: response.data.history || [],
      }));
    } catch (error) {
      showToast("error", "History load failed", error.message || "Unable to load claim history");
    }
  };

  const loadInsuranceBalance = async () => {
    try {
      const balance = await getInsuranceBalance();
      setInsuranceBalance(balance);
    } catch {
      setInsuranceBalance("0");
    }
  };

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setMessage({ type: "", text: "" });

    try {
      // Use Web3Modal to allow WalletConnect (QR) and injected wallets
      const providerOptions = {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            // Replace with your own Infura ID or RPC if needed
            infuraId: "" // OPTIONAL: add INFURA ID or leave empty to use default
          }
        }
      };

      const web3Modal = new Web3Modal({ providerOptions });
      let externalProvider = null;

      try {
        externalProvider = await web3Modal.connect();
      } catch (modalErr) {
        // If modal was closed or failed, fallback to injected MetaMask
        externalProvider = null;
      }

      const result = externalProvider
        ? await connectWalletWithProvider(externalProvider)
        : await connectWallet();

      setWalletAddress(result.address);
      setContract(result.contract);
      setProvider(result.provider);
      setNetworkName(result.networkName);
      setChainId(result.chainId);

      const adminAddress = await getAdminWallet(result.contract);
      const resolvedAdminWallet = ADMIN_WALLET?.trim() || adminAddress || getStoredAdminWallet() || (authUser?.role?.toLowerCase() === "admin" ? result.address : "");
      const storedValue = storeAdminWallet(resolvedAdminWallet);
      setAdminWallet(storedValue);
      setIsAdminWalletConnected(isAdminWallet(result.address, storedValue));

      await loadInsuranceBalance();
      showToast("success", "Wallet connected", `Connected to ${result.address}`);
    } catch (error) {
      if (error?.code === 4001) {
        showToast("error", "Connection rejected", "Wallet connection was rejected.");
        return;
      }

      showToast("error", "Wallet connection failed", error.message || "Unable to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSwitchNetwork = async () => {
    setIsConnecting(true);
    try {
      await switchToHardhatNetwork();
      const result = await connectWallet();
      setWalletAddress(result.address);
      setContract(result.contract);
      setProvider(result.provider);
      setNetworkName(result.networkName);
      setChainId(result.chainId);
      const adminAddress = await getAdminWallet(result.contract);
      const resolvedAdminWallet = ADMIN_WALLET?.trim() || adminAddress || getStoredAdminWallet() || (authUser?.role?.toLowerCase() === "admin" ? result.address : "");
      const storedValue = storeAdminWallet(resolvedAdminWallet);
      setAdminWallet(storedValue);
      setIsAdminWalletConnected(isAdminWallet(result.address, storedValue));
      showToast("success", "Network switched", "MetaMask is now connected to Hardhat (31337)." );
    } catch (error) {
      showToast("error", "Network switch failed", error.message || "Could not switch to the Hardhat network.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleClaimSubmit = async (formData) => {
    if (!contract) {
      showToast("error", "Wallet required", "Connect MetaMask before submitting a claim.");
      setMessage({ type: "error", text: "Connect MetaMask before submitting a claim." });
      return;
    }

    setLoadingAction(true);
    setMessage({ type: "", text: "" });

    try {
      const blockchainResult = await submitClaimOnChain(contract, {
        ...formData,
        amount: Number(formData.amount),
      });

      const response = await API.post("/api/claims", {
        userId: authUser?.id || null,
        walletAddress,
        patientName: formData.patientName,
        policyNumber: formData.policyNumber,
        claimType: formData.claimType,
        amount: Number(formData.amount),
        hospitalName: formData.hospitalName,
        diagnosis: formData.diagnosis,
        description: formData.description,
        evidenceUrl: formData.evidenceUrl,
        blockchainClaimId: blockchainResult.claimId,
        blockchainTxHash: blockchainResult.txHash,
      });

      const savedClaim = upsertClaim(response.data.claim);
      setSelectedClaimId(savedClaim.id);
      await loadClaimHistory(savedClaim.id);
      await loadInsuranceBalance();
      showToast("success", "Claim submitted", `On-chain transaction ${blockchainResult.txHash} completed.`);
      setMessage({ type: "success", text: `Claim submitted successfully. Tx: ${blockchainResult.txHash}` });
    } catch (error) {
      showToast("error", "Claim submission failed", error.message || "The claim could not be submitted.");
      setMessage({ type: "error", text: error.message || "Claim submission failed" });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleStatusUpdate = async (claim, status, reason = "") => {
    if (!contract) {
      showToast("warning", "Wallet required", "Connect MetaMask before changing a claim status.");
      return;
    }

    const connectedWallet = walletAddress?.trim().toLowerCase() || "";
    const isAdminRole = authUser?.role?.toLowerCase() === "admin";

    if (!connectedWallet) {
      showToast("warning", "Wallet required", "Connect MetaMask before changing a claim status.");
      return;
    }

    let resolvedAdminWallet = (ADMIN_WALLET?.trim() || adminWallet || "").toLowerCase();
    if (!resolvedAdminWallet && contract) {
      const contractAdmin = await getAdminWallet(contract);
      resolvedAdminWallet = contractAdmin?.trim().toLowerCase() || "";
      if (resolvedAdminWallet) {
        const storedValue = storeAdminWallet(contractAdmin);
        setAdminWallet(storedValue);
      }
    }

    if (!resolvedAdminWallet && isAdminRole) {
      resolvedAdminWallet = connectedWallet;
      const storedValue = storeAdminWallet(walletAddress);
      setAdminWallet(storedValue);
    }

    if (!resolvedAdminWallet) {
      showToast("warning", "Admin wallet required", "Unable to verify the admin wallet. Connect MetaMask and try again.");
      return;
    }

    if (!isAdminWallet(connectedWallet, resolvedAdminWallet)) {
      showToast("warning", "Admin wallet required", "Please connect the admin wallet to approve or reject claims.");
      return;
    }

    setLoadingAction(true);

    try {
      let onChainId = claim.blockchain_claim_id || claim.blockchainClaimId || claim.id;

      if (onChainId === "Pending") {
        onChainId = claim.id;
      }

      const onChainStatusId = await getOnChainClaimStatus(contract, onChainId);
      let txHash = claim.blockchain_tx_hash;
      const targetStatusId = status === "Approved" ? 1 : 2;

      if (onChainStatusId === targetStatusId) {
        showToast("info", "Syncing state", "Blockchain already processed this. Updating database...");
      } else if (onChainStatusId === 0) {
        const txResult = status === "Approved"
          ? await approveClaimOnChain(contract, onChainId)
          : await rejectClaimOnChain(contract, onChainId);
        txHash = txResult.txHash;
      } else {
        // If the on-chain claim cannot be read, attempt to submit it and then process the desired status.
        try {
          const normalized = normalizeClaim(claim);
          const submitResult = await submitClaimOnChain(contract, {
            patientName: normalized.patient_name,
            policyNumber: normalized.policy_number,
            claimType: normalized.claim_type,
            amount: normalized.claim_amount,
            hospitalName: normalized.hospital_name,
            diagnosis: normalized.diagnosis,
            description: normalized.description || "",
            evidenceUrl: normalized.evidence_url || "",
          });

          const newOnChainId = submitResult.claimId || onChainId;
          const txResult = status === "Approved"
            ? await approveClaimOnChain(contract, newOnChainId)
            : await rejectClaimOnChain(contract, newOnChainId);

          txHash = txResult.txHash;
          onChainId = newOnChainId;
        } catch (innerErr) {
          throw new Error("Unable to verify or submit the on-chain claim. Please try again.");
        }
      }

      const adminNotes = status === "Rejected" && reason
        ? `Rejected: ${reason}`
        : `${status} via admin panel`;

      const endpoint = status === "Approved"
        ? `/api/admin/claims/${claim.id}/approve`
        : `/api/admin/claims/${claim.id}/reject`;

      const payload = status === "Approved"
        ? { blockchainTxHash: txHash, blockchainClaimId: onChainId }
        : { reason, blockchainTxHash: txHash, adminNotes, blockchainClaimId: onChainId };

      const response = await API.put(endpoint, payload);

      const updatedClaim = upsertClaim(response.data.claim);
      setSelectedClaimId(updatedClaim.id);
      await loadClaimHistory(updatedClaim.id);
      await loadInsuranceBalance();
      showToast("success", "Claim updated", `Claim ${status.toLowerCase()} successfully.`);
    } catch (error) {
      const rawMsg = error?.message || "";
      if (/only admin can update claim status/i.test(rawMsg)) {
        showToast("warning", "Admin wallet required", "Please connect the admin wallet to approve or reject claims.");
      } else {
        showToast("error", "Claim update failed", "Unable to update claim status. Please try again.");
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const handleLogin = async (formData) => {
    setAuthLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await API.post("/auth/login", formData);
      const token = response.data.access_token;
      storeSession(response.data.user, token);
      showToast("success", "Login successful", response.data.message || "You are now logged in.");
      setMessage({ type: "success", text: response.data.message || "Login successful" });
      navigate("/dashboard");
    } catch (error) {
      showToast("error", "Login failed", error.message || "Unable to sign in.");
      setMessage({ type: "error", text: error.message || "Login failed" });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (formData) => {
    setAuthLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await API.post("/auth/register", formData);
      const token = response.data.access_token;
      storeSession(response.data.user, token);
      showToast("success", "Registration complete", response.data.message || "Your account was created.");
      setMessage({ type: "success", text: response.data.message || "Account created and you are now logged in." });
      navigate("/dashboard");
    } catch (error) {
      showToast("error", "Registration failed", error.message || "Unable to create your account.");
      setMessage({ type: "error", text: error.message || "Registration failed" });
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    setIsMetaMaskInstalled(Boolean(window.ethereum));

    if (authToken) {
      API.defaults.headers.common.Authorization = `Bearer ${authToken}`;
      void loadClaims();
    } else {
      setClaims([]);
    }

    void loadInsuranceBalance();
  }, [authToken]);

  useEffect(() => {
    const initializeWallet = async () => {
      if (!window.ethereum) {
        return;
      }

      setIsMetaMaskInstalled(true);
      const storedAdmin = ADMIN_WALLET?.trim() || getStoredAdminWallet();
      if (storedAdmin) {
        setAdminWallet(storedAdmin);
      }

      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (!accounts || accounts.length === 0) {
          return;
        }

        const result = await connectWallet();
        setWalletAddress(result.address);
        setContract(result.contract);
        setProvider(result.provider);
        setNetworkName(result.networkName);
        setChainId(result.chainId);

        const adminAddress = await getAdminWallet(result.contract);
        const resolvedAdminWallet = ADMIN_WALLET?.trim() || adminAddress || storedAdmin || (authUser?.role?.toLowerCase() === "admin" ? result.address : "");
        const storedValue = storeAdminWallet(resolvedAdminWallet);
        setAdminWallet(storedValue);
        setIsAdminWalletConnected(isAdminWallet(result.address, storedValue));
        await loadInsuranceBalance();
      } catch {
        // Ignore auto-connect failures; user can connect manually.
      }
    };

    void initializeWallet();
  }, []);

  useEffect(() => {
    setIsAdminWalletConnected(isAdminWallet(walletAddress, adminWallet));
  }, [walletAddress, adminWallet]);

  useEffect(() => {
    if (!authToken) {
      delete API.defaults.headers.common.Authorization;
      return;
    }

    API.defaults.headers.common.Authorization = `Bearer ${authToken}`;
  }, [authToken]);

  useEffect(() => {
    if (!window.ethereum) {
      return;
    }

    const handleAccountsChanged = async (accounts) => {
      if (!accounts.length) {
        clearWallet();
        return;
      }

      try {
        const result = await connectWallet();
        setWalletAddress(result.address);
        setContract(result.contract);
        setProvider(result.provider);
        setNetworkName(result.networkName);
        setChainId(result.chainId);

        const adminAddress = await getAdminWallet(result.contract);
        const resolvedAdminWallet = ADMIN_WALLET?.trim() || adminAddress || getStoredAdminWallet() || (authUser?.role?.toLowerCase() === "admin" ? result.address : "");
        const storedValue = storeAdminWallet(resolvedAdminWallet);
        setAdminWallet(storedValue);
        setIsAdminWalletConnected(isAdminWallet(result.address, storedValue));
      } catch {
        clearWallet();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const claimStats = useMemo(() => ({
    pending: claims.filter((claim) => claim.status === "Pending").length,
    approved: claims.filter((claim) => claim.status === "Approved").length,
    rejected: claims.filter((claim) => claim.status === "Rejected").length,
  }), [claims]);

  const networkMismatch = chainId !== null && chainId !== HARDHAT_CHAIN_ID;
  const isAdminRole = authUser?.role?.toLowerCase() === "admin";
  const isAdmin = isAdminRole;

  return (
    <div className="page-wrapper">
      <Navbar
        walletAddress={walletAddress}
        isConnected={Boolean(walletAddress)}
        authUser={authUser}
        onConnect={handleConnectWallet}
        onSwitchNetwork={handleSwitchNetwork}
        onLogout={clearSession}
        isConnecting={isConnecting}
        networkName={networkName}
        chainId={chainId}
        networkMismatch={networkMismatch}
        adminWallet={adminWallet}
      />

      <main>
        <Routes>
          <Route
            path="/"
            element={
              <Home
                walletAddress={walletAddress}
                isConnected={Boolean(walletAddress)}
                isMetaMaskInstalled={isMetaMaskInstalled}
                provider={provider}
                adminWallet={adminWallet}
                onConnectWallet={handleConnectWallet}
                claims={claims}
                claimHistory={claimHistory}
                loadingClaims={loadingClaims}
                loadingAction={loadingAction}
                selectedClaimId={selectedClaimId}
                setSelectedClaimId={setSelectedClaimId}
                loadClaims={loadClaims}
                loadClaimHistory={loadClaimHistory}
                handleClaimSubmit={handleClaimSubmit}
                handleStatusUpdate={handleStatusUpdate}
                message={message}
              />
            }
          />

          <Route
            path="/login"
            element={<Login onSubmit={handleLogin} loading={authLoading} notification={message} />}
          />

          <Route
            path="/register"
            element={<Register onSubmit={handleRegister} loading={authLoading} notification={message} />}
          />

          <Route
            path="/dashboard"
            element={
              authUser ? (
                <Dashboard
                  user={authUser}
                  walletAddress={walletAddress}
                  isConnected={Boolean(walletAddress)}
                  claimStats={claimStats}
                  insuranceBalance={insuranceBalance}
                  networkName={networkName}
                  chainId={chainId}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/admin"
            element={
              authUser ? (
                isAdmin ? (
                  <AdminPage
                    claims={adminClaims}
                    loadingAction={loadingAction}
                    onApprove={(claim) => handleStatusUpdate(claim, "Approved")}
                    onReject={(claim) => handleStatusUpdate(claim, "Rejected")}
                    adminWallet={adminWallet}
                    walletAddress={walletAddress}
                    onLogout={clearSession}
                    loadClaims={loadAdminClaims}
                  />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/manage-claims"
            element={
              authUser ? (
                isAdmin ? (
                  <ManageClaimsPage
                    claims={adminClaims}
                    loadingClaims={loadingAction}
                    selectedClaimId={selectedClaimId}
                    setSelectedClaimId={setSelectedClaimId}
                    loadClaims={loadAdminClaims}
                    loadClaimHistory={loadClaimHistory}
                    claimHistory={claimHistory}
                  />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/submit-claim"
            element={
              <SubmitClaim
                walletAddress={walletAddress}
                onSubmit={handleClaimSubmit}
                loadingAction={loadingAction}
                message={message}
              />
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
