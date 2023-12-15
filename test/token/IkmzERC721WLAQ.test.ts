const { expect } = require("chai");
const { ethers } = require("hardhat");
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// ***** ***** ***** ***** ***** ***** ***** ***** // 
// yarn run test test/token/IkmzERC721WL.test.ts
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

let IkmzERC721WLFactory: Contract;
let IkmzERC721WL: Contract;
let owner: SignerWithAddress;
let allowListedUser: SignerWithAddress;
let notListedUser: SignerWithAddress
// TODO: any 使うな馬鹿者！
let rootHash: any;
let hexProof: any;
let rootHashHexString: any;
const zeroAddress = '0x0000000000000000000000000000000000000000000000000000000000000000'

beforeEach(async () => {
  // Obtain Ethereum signers for various roles: owner, allowListedUser, notListedUser
  // 一般的には、getSigners()で返される配列の最初の署名者が、スマートコントラクトをデプロイしたアカウント、つまりowner権限を持つこととなります
  [owner, allowListedUser, notListedUser] = await ethers.getSigners();

  // Deploy the IkmzERC721WL contract
  IkmzERC721WLFactory = await ethers.getContractFactory("IkmzERC721WL");
  IkmzERC721WL = await IkmzERC721WLFactory.deploy();
  await IkmzERC721WL.deployed();

  // Define the Merkle Tree for whitelist verification
  const allowList = [
    allowListedUser.address,
    "0X5B38DA6A701C568545DCFCB03FCB875F56BEDDC4",
    "0X5A641E5FB72A2FD9137312E7694D42996D689D99",
    "0XDCAB482177A592E424D1C8318A464FC922E8DE40",
    "0X6E21D37E07A6F7E53C7ACE372CEC63D4AE4B6BD0",
    "0X09BAAB19FC77C19898140DADD30C4685C597620B",
    "0XCC4C29997177253376528C05D3DF91CF2D69061A",
    "0xdD870fA1b7C4700F2BD7f44238821C26f7392148"
  ];

  // Create a Merkle Tree using Ethereum addresses and Keccak-256 hashing
  const merkleTree = new MerkleTree(allowList.map(keccak256), keccak256, {
    sortPairs: true,
  });

  // Obtain the Hex Proof for the address of the allowListedUser
  hexProof = merkleTree.getHexProof(keccak256(allowListedUser.address));

  // Obtain the root hash of the Merkle Tree and convert it to a hexadecimal string
  rootHash = merkleTree.getRoot();
  rootHashHexString = `0x${rootHash.toString("hex")}`;
});

describe("setMerkleRoot check", () => {
  it("[S] Should set the Merkle Root correctly by Owner", async function () {
    // Ensure that the initial Merkle Root is set to the zero address
    expect(await IkmzERC721WL.getMerkleRoot()).to.equal(zeroAddress);
    console.log('owner', owner);

    // Set the Merkle Root by the owner
    await IkmzERC721WL.connect(owner).setMerkleRoot(rootHashHexString);

    // Verify if the Merkle Root is set correctly
    expect(await IkmzERC721WL.getMerkleRoot()).to.equal(rootHashHexString);
  });

  it("[R] Should not allow setting Merkle Root by non-owner", async function () {
    // Attempt to set the Merkle Root by a non-owner
    await expect(
      IkmzERC721WL
        .connect(notListedUser)
        .setMerkleRoot(rootHashHexString)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
});

describe("whitelistMint check", () => {
  it("[S] Should successfully perform whitelistMint", async () => {
    // Test the current balance of allowListedUser and notListedUser
    expect(await IkmzERC721WL.balanceOf(allowListedUser.address)).to.be.equal(BigInt(0));
    expect(await IkmzERC721WL.balanceOf(notListedUser.address)).to.be.equal(BigInt(0));

    // Test the mint function call after setting the Merkle Root
    await IkmzERC721WL.connect(owner).setMerkleRoot(rootHashHexString);
    await IkmzERC721WL.connect(allowListedUser).whitelistMint(hexProof);

    // Test the balance after minting
    expect(await IkmzERC721WL.balanceOf(allowListedUser.address)).to.be.equal(BigInt(1));
    expect(await IkmzERC721WL.balanceOf(notListedUser.address)).to.be.equal(BigInt(0));

    // Ensure that non-listed user cannot mint with an invalid proof
    await expect(
      IkmzERC721WL.connect(notListedUser).whitelistMint(hexProof)
    ).to.be.revertedWith("Invalid proof");
  });
});
