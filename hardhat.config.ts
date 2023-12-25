// ネットワーク接続情報を設定できるファイル
// hardhat init: https://hardhat.org/hardhat-runner/docs/guides/migrating-from-hardhat-waffle
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-etherscan");
import { HardhatUserConfig, task } from "hardhat/config";
import "hardhat-gas-reporter";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      // コードサイズを最適化
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  mocha: {
    timeout: 100000000,
  },
  networks: {
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      gas: 2000000, // 手動でガスリミットを設定
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    mumbai: {
      url: process.env.POLYGON_MUMBAI_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
    // apiKey: {
    //   // ethereum
    //   mainnet: process.env.ETHERSCAN_API_KEY,
    //   goerli: process.env.ETHERSCAN_API_KEY,
    //   // polygon
    //   polygon: process.env.POLYGONSCAN_API_KEY,
    //   mumbai: process.env.POLYGONSCAN_API_KEY,
    // },
  },
  gasReporter: {
    enabled: false,
    currency: "JPY",
    gasPrice: 21, // Use an appropriate gas price for your network
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    // outputFile: "./test/research/data/gas-report.csv",
  },
};

export default config;