const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const contract = await hre.ethers.getContractAt("SahAlliance", "0x9415bf2cf021462eE6a0fE2035bEb6095951d58B");

  console.log("Contributing 0.01 MON to Circle #1 from", signer.address);
  const tx = await contract.connect(signer).contribute(1, { value: hre.ethers.parseEther("0.01") });
  const receipt = await tx.wait();
  console.log("Confirmed in tx:", receipt.hash);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
