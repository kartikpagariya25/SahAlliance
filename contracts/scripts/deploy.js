const hre = require("hardhat");

// Fill these three in with real wallet addresses (Kartik / Aditya / Vikrant)
// before running the deploy — this becomes the demo Circle's members.
const DEMO_MEMBERS = [
  "0x0000000000000000000000000000000000000001", // Radha (Kartik)
  "0x0000000000000000000000000000000000000002", // Meena (Aditya)
  "0x0000000000000000000000000000000000000003", // Sunita (Vikrant)
];

async function main() {
  const SahAlliance = await hre.ethers.getContractFactory("SahAlliance");
  const contract = await SahAlliance.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("SahAlliance deployed to:", address);

  const tx = await contract.createCircle("Radha's Circle", DEMO_MEMBERS);
  const receipt = await tx.wait();
  console.log("Demo Circle created, tx:", receipt.hash);

  console.log("\nNext steps:");
  console.log("1. Copy the contract address above into frontend/.env and backend/.env");
  console.log("2. Run: npx hardhat verify --network monadTestnet " + address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
