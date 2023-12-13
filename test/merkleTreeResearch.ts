// https://medium.com/@ItsCuzzo/using-merkle-trees-for-nft-whitelists-523b58ada3f9
//
// 1. Import libraries. Use `npm` package manager to install
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const { expect } = require("chai");
const { ethers } = require("hardhat");
import { Contract } from "ethers";
import chai from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import ChaiAsPromised from "chai-as-promised";

// Typically, Chai is used for synchronous tests, 
// but when dealing with asynchronous operations such as testing Ethereum smart contracts,
// the ChaiAsPromised plugin comes in handy.
chai.use(ChaiAsPromised);

describe("MerkleTreeResearch", async function () {
  // 2. Collect list of wallet addresses from competition, raffle, etc.
  // Store list of addresses in some data sheeet (Google Sheets or Excel)
  let whitelistAddresses = [
    "0X5B38DA6A701C568545DCFCB03FCB875F56BEDDC4",
    "0X5A641E5FB72A2FD9137312E7694D42996D689D99",
    "0XDCAB482177A592E424D1C8318A464FC922E8DE40",
    "0X6E21D37E07A6F7E53C7ACE372CEC63D4AE4B6BD0",
    "0X09BAAB19FC77C19898140DADD30C4685C597620B",
    "0XCC4C29997177253376528C05D3DF91CF2D69061A",
    "0xa2fb2553e57436b455F57270Cc6f56f6dacDA1a5" // The address in remix
  ];

  // 3. Create a new array of `leafNodes` by hashing all indexes of the `whitelistAddresses`
  // using `keccak256`. Then creates a Merkle Tree object using keccak256 as the algorithm.
  // The leaves, merkleTree, and rootHas are all PRE-DETERMINED prior to whitelist claim

  // Transforming a list of EOAs into their respective Keccak-256 hashes.
  const leafNodes = whitelistAddresses.map(addr => keccak256(addr));

  // Constructing a Merkle Tree.
  const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

  // 4. Get root hash of the `merkleeTree` in hexadecimal format (0x)
  // Print out the Entire Merkle Tree.
  // Calculating the Merkle Root.
  const allowlistRootHash = merkleTree.getRoot();
  console.log('Whitelist Merkle Tree\n', merkleTree.toString());
  console.log("Root Hash: ", allowlistRootHash);

  // Convert Buffer to hex string with '0x' prefix
  const allowlistRootHashHexString = "0x" + allowlistRootHash.toString("hex");
  console.log('allowlistRootHashHexString', allowlistRootHashHexString);

  // Choose claiming address from whitelist
  const claimingAddress = leafNodes[6];
  const hexProof = merkleTree.getHexProof(claimingAddress);
  console.log(hexProof);

  console.log('hexProof, claimingAddress, allowlistRootHash', hexProof, claimingAddress, allowlistRootHash);
  console.log(merkleTree.verify(hexProof, claimingAddress, allowlistRootHash));



  // ***** ***** ***** ***** ***** ***** ***** ***** // 


  let IkmzMerkleProof: Contract;
  let owner: SignerWithAddress;
  let allowListedUser: SignerWithAddress;
  let notAllowListedUser: SignerWithAddress;
  const zeroAddress = '0x0000000000000000000000000000000000000000000000000000000000000000'


  beforeEach(async function () {
    [owner, allowListedUser, notAllowListedUser] = await ethers.getSigners();
    const IkmzMerkleProofFactory = await ethers.getContractFactory("MerkleTreeResearch");
    IkmzMerkleProof = await IkmzMerkleProofFactory.deploy();
    await IkmzMerkleProof.deployed();
  });

  it("[S] Check if the allowlist root is set correctly", async function () {
    expect(await IkmzMerkleProof.getMerkleRoot()).to.equal(zeroAddress);

    // Set the allowlistRootHashHexString
    await IkmzMerkleProof.setAllowlist(allowlistRootHashHexString);

    // Get MerckleRoot
    const res = await IkmzMerkleProof.getMerkleRoot();

    // Check if the allowlist root is set correctly
    expect(res).to.equal(allowlistRootHashHexString);
  });

  it("should mint to an address in the allowlist", async function () {
    // Set the allowlistRootHashHexString
    await IkmzMerkleProof.setAllowlist(allowlistRootHashHexString);

    console.log('hexProof', hexProof);
    const tx = await IkmzMerkleProof.whitelistMint(hexProof)
    await tx.wait();
    console.log('tx', tx);
  })

});
