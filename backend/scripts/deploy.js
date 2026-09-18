const { ethers } = require("hardhat");

async function main() {
  const SahAlliance = await ethers.getContractFactory("SahAlliance");
  const contract = await SahAlliance.deploy();
  await contract.waitForDeployment();

  console.log("SahAlliance deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
