import { ethers } from "hardhat";

// npx hardhat run scripts/deploy/factory/erc20Factory.ts --network goerli
// npx hardhat verify --network goerli 0xDC7a9c8C680958E03BffB33e187fe1a1764B42A1

// write: https://goerli.etherscan.io/tx/0x5bf4ff4d26c43e02e9c478c63ed090c31c7ae0fc03321dff85d672f9d0c02124
// internal tx: https://goerli.etherscan.io/address/0xc06e37064cd97460110850c67fbfa44b39e8a4b1

// verify ERC20 child CA
// npx hardhat verify --constructor-args scripts/arguments/erc20Factory_argument.ts --network goerli 0xc06e37064cd97460110850c67fbfa44b39e8a4b1

async function main() {

  const ERC20Factory = await ethers.getContractFactory(
    "MyTokenFactory"
  );

  const erc20Factory = await ERC20Factory.deploy();
  await erc20Factory.deployed();

  console.log("MyTokenFactory deployed to:", `https://goerli.etherscan.io/address/${erc20Factory.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});