const hre = require("hardhat");

async function main() {
  const txHash = "0x256feebb7b36d2fdf551ad4d6114aeb75a2927af93e8d75b552b10897ced1afd";
  const receipt = await hre.ethers.provider.getTransactionReceipt(txHash);
  if (!receipt) {
    console.log("Transaction not found yet, try again in a few seconds.");
    return;
  }
  console.log("Block number:", receipt.blockNumber);
}

main().catch(console.error);