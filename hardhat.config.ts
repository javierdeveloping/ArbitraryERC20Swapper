import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-ethers";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 10000000,
          },
        },
      },
      {
        version: "0.7.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 10000000,
          },
        },
      },
    ],
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [`${process.env.TEST_PRIVATE_KEY}`],
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL,
      accounts: [`${process.env.TEST_PRIVATE_KEY}`],
      chainId: 1,
    },
    local: {
      url: process.env.GANACHE_PROVIDER,
      /*       accounts: [`${process.env.GANACHE_PRIVATE_KEY}`], */
    },
  },
};

export default config;
