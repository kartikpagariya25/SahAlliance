require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    monadTestnet: {
      url: process.env.MONAD_RPC_URL || "https://rpc.testnet.monad.xyz",
      chainId: 10143,
      accounts: [PRIVATE_KEY],
    },
    hardhat: {},
  },
  etherscan: {
    apiKey: {
      monadTestnet: "not-needed-for-sourcify",
    },
    customChains: [
      {
        network: "monadTestnet",
        chainId: 10143,
        urls: {
          apiURL: "https://testnet.monadscan.com/api",
          browserURL: "https://testnet.monadscan.com",
        },
      },
    ],
  },
};
