import { ethers } from "ethers";
import { CONTRACT_ADDRESS, RPC_URL } from "../config";

const contractABI = [
  {
    type: "function",
    name: "submitClaim",
    stateMutability: "nonpayable",
    inputs: [
      { name: "patientName", type: "string" },
      { name: "policyNumber", type: "string" },
      { name: "claimType", type: "string" },
      { name: "amount", type: "uint256" },
      { name: "hospitalName", type: "string" },
      { name: "diagnosis", type: "string" },
      { name: "description", type: "string" },
      { name: "evidenceUrl", type: "string" },
    ],
    outputs: [{ name: "claimId", type: "uint256" }],
  },
  {
    type: "function",
    name: "updateClaimStatus",
    stateMutability: "nonpayable",
    inputs: [
      { name: "claimId", type: "uint256" },
      { name: "status", type: "uint8" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getClaim",
    stateMutability: "view",
    inputs: [{ name: "claimId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "patient", type: "address" },
          { name: "patientName", type: "string" },
          { name: "policyNumber", type: "string" },
          { name: "claimType", type: "string" },
          { name: "amount", type: "uint256" },
          { name: "hospitalName", type: "string" },
          { name: "diagnosis", type: "string" },
          { name: "description", type: "string" },
          { name: "evidenceUrl", type: "string" },
          { name: "status", type: "uint8" },
          { name: "lastTxHash", type: "string" },
          { name: "createdAt", type: "uint256" },
          { name: "updatedAt", type: "uint256" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getClaims",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "patient", type: "address" },
          { name: "patientName", type: "string" },
          { name: "policyNumber", type: "string" },
          { name: "claimType", type: "string" },
          { name: "amount", type: "uint256" },
          { name: "hospitalName", type: "string" },
          { name: "diagnosis", type: "string" },
          { name: "description", type: "string" },
          { name: "evidenceUrl", type: "string" },
          { name: "status", type: "uint8" },
          { name: "lastTxHash", type: "string" },
          { name: "createdAt", type: "uint256" },
          { name: "updatedAt", type: "uint256" },
        ],
      },
    ],
  },
  {
    type: "event",
    name: "ClaimSubmitted",
    inputs: [
      { indexed: true, name: "claimId", type: "uint256" },
      { indexed: true, name: "patient", type: "address" },
    ],
  },
  {
    type: "event",
    name: "ClaimStatusUpdated",
    inputs: [
      { indexed: true, name: "claimId", type: "uint256" },
      { indexed: true, name: "admin", type: "address" },
      { indexed: false, name: "status", type: "uint8" },
    ],
  },
];

const statusMap = {
  Pending: 0,
  Approved: 1,
  Rejected: 2,
};

export const getReadOnlyContract = () => {
  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    throw new Error("REACT_APP_CONTRACT_ADDRESS is not configured. Update frontend/.env and restart the app.");
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  return new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
};

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed. Please install it from https://metamask.io");
  }

  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts found. Please unlock MetaMask and try again.");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

  return {
    provider,
    signer,
    contract,
    address,
    chainId: Number(network.chainId),
    networkName: network.name,
  };
};

export const submitClaimOnChain = async (contract, claimData) => {
  const amount = BigInt(Math.max(1, Math.round(Number(claimData.amount))));

  const tx = await contract.submitClaim(
    claimData.patientName,
    claimData.policyNumber,
    claimData.claimType,
    amount,
    claimData.hospitalName,
    claimData.diagnosis,
    claimData.description,
    claimData.evidenceUrl || "",
  );

  const receipt = await tx.wait();
  const parsedEvent = receipt.logs
    .map((log) => {
      try {
        return contract.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((entry) => entry?.name === "ClaimSubmitted");

  const claimId = parsedEvent?.args?.claimId?.toString() || null;
  const fallbackClaimId = tx?.value?.toString?.() || null;

  return {
    txHash: tx.hash,
    claimId: claimId || fallbackClaimId,
    receipt,
  };
};

export const updateClaimStatusOnChain = async (contract, claimId, status) => {
  const statusCode = statusMap[status];
  if (statusCode === undefined) {
    throw new Error(`Unsupported claim status: ${status}`);
  }

  const tx = await contract.updateClaimStatus(BigInt(claimId), statusCode);
  await tx.wait();

  return {
    txHash: tx.hash,
  };
};

export { CONTRACT_ADDRESS, contractABI };