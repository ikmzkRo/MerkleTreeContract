import fs from 'fs';
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

async function main() {
  let whitelistAddresses = [
    "0X5B38DA6A701C568545DCFCB03FCB875F56BEDDC4",
    "0X5A641E5FB72A2FD9137312E7694D42996D689D99",
    "0XDCAB482177A592E424D1C8318A464FC922E8DE40",
    "0X6E21D37E07A6F7E53C7ACE372CEC63D4AE4B6BD0",
    "0X09BAAB19FC77C19898140DADD30C4685C597620B",
    "0XCC4C29997177253376528C05D3DF91CF2D69061A",
    "0xa2fb2553e57436b455F57270Cc6f56f6dacDA1a5"
  ];

  const leafNodes = whitelistAddresses.map(addr => keccak256(addr));
  const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
  const allowlistRootHash = merkleTree.getRoot();
  console.log('allowlistRootHash', allowlistRootHash);
  const allowlistRootHashHexString = "0x" + allowlistRootHash.toString("hex");
  console.log('allowlistRootHashHexString', allowlistRootHashHexString);
  const claimingAddress = leafNodes[6];
  const hexProof = merkleTree.getHexProof(claimingAddress);
  // Log the Ethereum address for which the Merkle Proof is being verified.
  console.log('Claiming Address:', claimingAddress);
  // Log the calculated Merkle Root based on the whitelist.
  console.log('Allowlist Root Hash:', allowlistRootHash);
  // Log the result of the verification, indicating whether the Merkle Proof is valid for the claiming address.
  console.log('Verification Result:', merkleTree.verify(hexProof, claimingAddress, allowlistRootHash));

  console.log('',);


  const IkmzERC721WLFactory = await ethers.getContractFactory(
    "IkmzERC721WL"
  );
  const IkmzERC721WL = await IkmzERC721WLFactory.deploy();
  await IkmzERC721WL.deployed();

  console.log("IkmzERC721WL deployed to:", `https://goerli.etherscan.io/address/${IkmzERC721WL.address}`);

  let owner: SignerWithAddress;
  try {
    [owner] = await ethers.getSigners();
    await IkmzERC721WL.connect(owner).setMerkleRoot(allowlistRootHashHexString);
    const res = await IkmzERC721WL.getMerkleRoot()
    console.log("MerkleRoot is correctly set:", res);

    // result: https://goerli.etherscan.io/address/0x5753951Ac1ea0CD2eda311386Cb8cceB1E7B3942#code
  } catch (error) {
    console.log('error', error)
  }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});