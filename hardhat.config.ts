// ネットワーク接続情報を設定できるファイル
// hardhat init: https://hardhat.org/hardhat-runner/docs/guides/migrating-from-hardhat-waffle
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
import "hardhat-gas-reporter";

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      // コードサイズを最適化
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      gas: 2000000, // 手動でガスリミットを設定
      accounts: [process.env.PRIVATE_KEY],
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  gasReporter: {
    enabled: false,
    currency: "JPY",
    gasPrice: 21, // Use an appropriate gas price for your network
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    // outputFile: "./test/research/data/gas-report.csv",
  },
};
