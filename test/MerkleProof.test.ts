const { expect } = require("chai");
const { ethers } = require("hardhat");
import { Contract } from "ethers";
import chai from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import ChaiAsPromised from "chai-as-promised";
import keccak256 from "keccak256";
import { MerkleTree } from "merkletreejs";

// Typically, Chai is used for synchronous tests, 
// but when dealing with asynchronous operations such as testing Ethereum smart contracts,
// the ChaiAsPromised plugin comes in handy.
chai.use(ChaiAsPromised);

describe("IkmzMerkleProof", async function () {
  // Define list of 7 public Ethereum addresses
  // npx hardhat node (#0~#6))
  let addresses = [
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
  ];

  // Transforming a list of EOAs into their respective Keccak-256 hashes.
  const leaves = addresses.map((addr) => keccak256(addr));

  // Constructing a Merkle Tree.
  const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });

  // Calculating the Merkle Root.
  const allowlistRootHash = merkleTree.getHexRoot();
});
