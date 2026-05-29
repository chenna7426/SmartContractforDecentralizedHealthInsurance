const hre = require("hardhat");

const fs = require("fs");
const path = require("path");

async function main() {

    console.log("Deploying Contract...");

    const HealthInsurance = await hre.ethers.getContractFactory(
        "HealthInsurance"
    );

    const healthInsurance = await HealthInsurance.deploy("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");

    // ethers v6 / hardhat-toolbox v3+: use waitForDeployment() and .target
    await healthInsurance.waitForDeployment();
    
    const address = await healthInsurance.getAddress();
    console.log("Contract deployed to:", address);

    // Save frontend files
    const frontendContractsDir = path.join(__dirname, "..", "..", "frontend", "src", "contracts");
    if (!fs.existsSync(frontendContractsDir)) {
        fs.mkdirSync(frontendContractsDir, { recursive: true });
    }

    const artifact = artifacts.readArtifactSync("HealthInsurance");

    fs.writeFileSync(
        path.join(frontendContractsDir, "contractConfig.json"),
        JSON.stringify({ address: address, abi: artifact.abi }, null, 2)
    );

    console.log("contractConfig.json updated successfully!");
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});