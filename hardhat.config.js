require("@nomicfoundation/hardhat-toolbox");

/** @type {import("hardhat/config").HardhatUserConfig} */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    hardhat: {},
    monadTestnet: {
      url: process.env.MONAD_RPC_URL || "",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
    },
  },
};
