import { ethers } from "ethers";
import contractConfig from "../contracts/contractConfig.json";
import { RPC_URL, CONTRACT_ADDRESS } from "../config";

const HARDHAT_CHAIN_ID = 31337;
const HARDHAT_CHAIN_ID_HEX = `0x${HARDHAT_CHAIN_ID.toString(16)}`;

const CONTRACT_ABI = Array.isArray(contractConfig?.abi) && contractConfig.abi.length > 0
  ? contractConfig.abi
  : [];

const DYNAMIC_CONTRACT_ADDRESS = contractConfig?.address || CONTRACT_ADDRESS;

const ensureContractConfig = () => {
  if (!DYNAMIC_CONTRACT_ADDRESS || DYNAMIC_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    throw new Error("Contract address is not configured. Deploy the contract and restart the frontend.");
  }

  if (!CONTRACT_ABI.length) {
    throw new Error("Contract ABI is not configured. Deploy the contract and restart the frontend.");
  }
};

const getProvider = () => new ethers.JsonRpcProvider(RPC_URL);

const getWalletProvider = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  return new ethers.BrowserProvider(window.ethereum);
};

const getNetworkDetails = async () => {
  const provider = await getWalletProvider();
  const network = await provider.getNetwork();
  return {
    provider,
    chainId: Number(network.chainId),
    networkName: network.name,
  };
};

export const switchToHardhatNetwork = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: HARDHAT_CHAIN_ID_HEX }],
    });
    return true;
  } catch (error) {
    if (error?.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: HARDHAT_CHAIN_ID_HEX,
            chainName: "Hardhat Localhost",
            nativeCurrency: {
              name: "Ethereum",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: [RPC_URL],
            blockExplorerUrls: [],
          },
        ],
      });
      return true;
    }

    throw error;
  }
};

export const ensureHardhatNetwork = async () => {
  const { chainId } = await getNetworkDetails();

  if (chainId !== HARDHAT_CHAIN_ID) {
    await switchToHardhatNetwork();
  }

  const updated = await getNetworkDetails();
  if (updated.chainId !== HARDHAT_CHAIN_ID) {
    throw new Error("Please switch MetaMask to the Hardhat network (Chain ID 31337).");
  }

  return updated;
};

export const connectWallet = async () => {
  const provider = await getWalletProvider();
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();

  ensureContractConfig();

  if (Number(network.chainId) !== HARDHAT_CHAIN_ID) {
    await ensureHardhatNetwork();
  }

  const contract = new ethers.Contract(DYNAMIC_CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  return {
    provider,
    signer,
    contract,
    address,
    chainId: Number(network.chainId),
    networkName: network.name,
  };
};

export const getReadOnlyContract = () => {
  ensureContractConfig();
  return new ethers.Contract(DYNAMIC_CONTRACT_ADDRESS, CONTRACT_ABI, getProvider());
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
    claimData.evidenceUrl || ""
  );

  const receipt = await tx.wait();
  const parsed = receipt.logs
    .map((log) => {
      try {
        return contract.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((entry) => entry?.name === "ClaimSubmitted");

  return {
    txHash: tx.hash,
    claimId: parsed?.args?.claimId?.toString() || null,
    receipt,
  };
};

export const approveClaimOnChain = async (contract, claimId) => {
  const tx = await contract.updateClaimStatus(BigInt(claimId), 1);
  await tx.wait();
  return { txHash: tx.hash };
};

export const rejectClaimOnChain = async (contract, claimId) => {
  const tx = await contract.updateClaimStatus(BigInt(claimId), 2);
  await tx.wait();
  return { txHash: tx.hash };
};

export const getOnChainClaimStatus = async (contract, claimId) => {
  try {
    const claim = await contract.getClaim(BigInt(claimId));
    return Number(claim.status);
  } catch (error) {
    console.error("Failed to fetch on-chain status:", error);
    return null;
  }
};

export const getInsuranceBalance = async () => {
  const contract = getReadOnlyContract();
  const balance = await contract.getInsuranceBalance();
  return ethers.formatEther(balance);
};

export const getAdminWallet = async (contract) => {
  try {
    return await contract.admin();
  } catch (error) {
    console.error("Failed to fetch admin wallet:", error);
    return null;
  }
};
