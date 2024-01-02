const { ethers, upgrades } = require("hardhat");

// npx hardhat run scripts/deploy/token/study/nft1155.ts --network goerli

async function main() {
  // owner
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // コントラクトのデプロイ
  const Nft1155 = await ethers.getContractFactory("Nft1155");

  // コントラクトをデプロイ
  const nft1155 = await Nft1155.deploy("zutomayo", "ZTMY");
  await nft1155.deployed();
  console.log("Nft1155 deployed to:", `https://goerli.etherscan.io/address/${nft1155.address}`);

  // アップグレード
  const Nft1155Upgradable = await upgrades.upgradeProxy(nft1155.address, Nft1155);
  console.log("Nft1155Upgradable upgraded to:", `https://goerli.etherscan.io/address/${Nft1155Upgradable.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// deploy error

// Deploying contracts with the account: 0xa2fb2553e57436b455F57270Cc6f56f6dacDA1a5
// Error: missing arguemnt: types/values length mismatch (count=0, expectedCount=2, code=MISSING_ARGUMENT, version=6.9.1)
//     at makeError (/home/ikmz/ikmz-contracts/node_modules/ethers/src.ts/utils/errors.ts:694:21)
//     at assert (/home/ikmz/ikmz-contracts/node_modules/ethers/src.ts/utils/errors.ts:715:25)
//     at assertArgumentCount (/home/ikmz/ikmz-contracts/node_modules/ethers/src.ts/utils/errors.ts:734:5)
//     at AbiCoder.encode (/home/ikmz/ikmz-contracts/node_modules/ethers/src.ts/abi/abi-coder.ts:189:28)
//     at Interface._encodeParams (/home/ikmz/ikmz-contracts/node_modules/ethers/src.ts/abi/interface.ts:795:31)
//     at Interface.encodeDeploy (/home/ikmz/ikmz-contracts/node_modules/ethers/src.ts/abi/interface.ts:803:21)
//     at getDeployData (/home/ikmz/ikmz-contracts/node_modules/@openzeppelin/hardhat-upgrades/src/utils/deploy-impl.ts:47:45)
//     at async deployProxyImpl (/home/ikmz/ikmz-contracts/node_modules/@openzeppelin/hardhat-upgrades/src/utils/deploy-impl.ts:71:22)
//     at async Proxy.deployProxy (/home/ikmz/ikmz-contracts/node_modules/@openzeppelin/hardhat-upgrades/src/deploy-proxy.ts:48:28) {
//   code: 'MISSING_ARGUMENT',
//   count: 0,
//   expectedCount: 2,
//   shortMessage: 'missing arguemnt: types/values length mismatch'

// Deploying contracts with the account: 0xa2fb2553e57436b455F57270Cc6f56f6dacDA1a5
// TypeError: nft1155.deployed is not a function
//     at /home/ikmz/ikmz-contracts/scripts/deploy/token/study/nft1155.ts:15:17
//     at step (/home/ikmz/ikmz-contracts/scripts/deploy/token/study/nft1155.ts:33:23)
//     at Object.next (/home/ikmz/ikmz-contracts/scripts/deploy/token/study/nft1155.ts:14:53)
//     at fulfilled (/home/ikmz/ikmz-contracts/scripts/deploy/token/study/nft1155.ts:5:58)