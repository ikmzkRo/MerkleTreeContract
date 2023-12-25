import { ethers, upgrades } from "hardhat";

// yarn add --dev @nomicfoundation/hardhat-ethers@^3.0.0 @nomicfoundation/hardhat-verify@^2.0.0
// npx hardhat run scripts/deploy/mock/upgradeableContractExample.ts --network goerli

async function main() {
  const MyContract = await ethers.getContractFactory("UpgradeableContractExample");

  // 対象のコントラクトをUpgradeableにします
  const myContract = await upgrades.deployProxy(MyContract, [10]);
  await myContract.deployed();
  console.log("MyContract deployed to:", myContract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});