const { expect } = require("chai");
const { ethers } = require("hardhat");
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// ***** ***** ***** ***** ***** ***** ***** ***** // 
// yarn run test test/token/IkmzERC721WLAQ.test.ts
// ***** ***** ***** ***** ***** ***** ***** ***** // 

// 1. Import libraries. Use `npm` package manager to install
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

// Typically, Chai is used for synchronous tests, 
// but when dealing with asynchronous operations such as testing Ethereum smart contracts,
// the ChaiAsPromised plugin comes in handy.
import chai from "chai";
import ChaiAsPromised from "chai-as-promised";
chai.use(ChaiAsPromised);

let IkmzERC721WLAQFactory: Contract;
let IkmzERC721WLAQ: Contract;
let owner: SignerWithAddress;
let allowListedUser: SignerWithAddress;
let notListedUser: SignerWithAddress
// TODO: any 使うな馬鹿者！
let rootHash: any;
let hexProof: any;
let rootHashHexString: any;
const zeroAddress = '0x0000000000000000000000000000000000000000000000000000000000000000'
const dummyMerkleRoot = "0x3e35b61278fbcec3f3b0bb361d928e373e089a61758af09690ce0a5391078ff2"

beforeEach(async () => {
  // Obtain Ethereum signers for various roles: owner, allowListedUser, notListedUser
  const signers = await ethers.getSigners();

  // Define the Merkle Tree for whitelist verification
  const inputs = [
    {
      address: signers[1].address,
      quantity: 1,
    },
    {
      address: signers[2].address,
      quantity: 2,
    },
    {
      address: signers[3].address,
      quantity: 1,
    },
    {
      address: "0xa2fb2553e57436b455F57270Cc6f56f6dacDA1a5",
      quantity: 2,
    }
  ];

  // create leaves from inputs
  const leaves = inputs.map((x) =>
    ethers.utils.solidityKeccak256(
      ['address', 'uint256'],
      [x.address, x.quantity]
    )
  );

  // create a Merkle Tree using keccak256 hash function
  const tree = new MerkleTree(leaves, keccak256, { sort: true });

  // get the root
  const root = tree.getHexRoot();

  const proofs = leaves.map((leaf) => tree.getHexProof(leaf));
  console.log('proofs', proofs);
  console.log('root', root);

  // Deploy the IkmzERC721WLAQ contract
  IkmzERC721WLAQFactory = await ethers.getContractFactory("IkmzERC721WLAQ");
  IkmzERC721WLAQ = await IkmzERC721WLAQFactory.deploy(root);
  await IkmzERC721WLAQ.deployed();
});


// describe("setMerkleRoot check", () => {
//   it("[S] Should set the Merkle Root correctly by Owner", async function () {
//     // Ensure that the initial Merkle Root is set correctly
//     expect(await IkmzERC721WLAQ.getMerkleRoot()).to.equal(rootHashHexString);
//   });

//   it("[S] Should allow setting Merkle Root by owner", async function () {
//     // Attempt to set the Merkle Root by a non-owner
//     await IkmzERC721WLAQ
//       .connect(owner)
//       .setMerkleRoot(dummyMerkleRoot);
//     // Ensure that the second Merkle Root is set correctly
//     expect(await IkmzERC721WLAQ.getMerkleRoot()).to.equal(dummyMerkleRoot);
//   });

//   it("[R] Should not allow setting Merkle Root by non-owner", async function () {
//     // Attempt to set the Merkle Root by a non-owner
//     await expect(
//       IkmzERC721WLAQ
//         .connect(notListedUser)
//         .setMerkleRoot(dummyMerkleRoot)
//     ).to.be.revertedWith("Ownable: caller is not the owner");
//     // Ensure that the initial Merkle Root is set correctly
//     expect(await IkmzERC721WLAQ.getMerkleRoot()).to.equal(rootHashHexString);
//   });
// });

// describe("whitelistMint check", () => {
//   it("[S] Should successfully perform whitelistMint", async () => {
//     // Test the current balance of allowListedUser and notListedUser
//     expect(await IkmzERC721WLAQ.balanceOf(allowListedUser.address)).to.be.equal(BigInt(0));
//     expect(await IkmzERC721WLAQ.balanceOf(notListedUser.address)).to.be.equal(BigInt(0));

//     // Test the mint function call after confirming the Merkle Root
//     expect(await IkmzERC721WLAQ.getMerkleRoot()).to.equal(rootHashHexString);
//     await IkmzERC721WLAQ.connect(allowListedUser).whitelistMint(2, hexProof);

//     // Test the balance after minting
//     expect(await IkmzERC721WLAQ.balanceOf(allowListedUser.address)).to.be.equal(BigInt(2));
//     expect(await IkmzERC721WLAQ.balanceOf(notListedUser.address)).to.be.equal(BigInt(0));

//     // Ensure that non-listed user cannot mint with an invalid proof
//     await expect(
//       IkmzERC721WLAQ.connect(notListedUser).whitelistMint(2, hexProof)
//     ).to.be.revertedWith("Invalid proof");
//   });
// });
