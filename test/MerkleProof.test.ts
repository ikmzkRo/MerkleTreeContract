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

  let IkmzMerkleProof: Contract;
  let owner: SignerWithAddress;
  let allowListedUser: SignerWithAddress;
  let notAllowListedUser: SignerWithAddress;

  beforeEach(async function () {
    [owner, allowListedUser, notAllowListedUser] = await ethers.getSigners();
    const IkmzMerkleProofFactory = await ethers.getContractFactory("IkmzMerkleProofAuth");
    IkmzMerkleProof = await IkmzMerkleProofFactory.deploy();
    await IkmzMerkleProof.deployed();
  });

  it("should set the allowlist root", async function () {
    // Set the allowlist root
    await IkmzMerkleProof.setAllowlist(allowlistRootHash);

    // Check if the allowlist root is set correctly
    expect(await IkmzMerkleProof.getMerkleRoot()).to.equal(allowlistRootHash);
  });

  it("should mint to an address in the allowlist", async function () {
    // Generate a proof for an allowlisted user
    const proof = merkleTree.getHexProof(keccak256(allowListedUser.address));

    // Set the allowlist root
    await IkmzMerkleProof.setAllowlist(allowlistRootHash);

    // Mint to the allowlisted user
    await expect(IkmzMerkleProof.allowlistMint(proof))
      .to.emit(IkmzMerkleProof, "Mint") // Check if the Mint event is emitted
      .withArgs(owner.address, allowListedUser.address, 1, 1, "0x"); // You may need to adjust these arguments based on your contract's implementation
  });

  it("should not mint to an address not in the allowlist", async function () {
    // Generate a proof for a user not in the allowlist
    const proof = merkleTree.getHexProof(keccak256(notAllowListedUser.address));

    // Set the allowlist root
    await IkmzMerkleProof.setAllowlist(allowlistRootHash);

    // Try to mint to the user not in the allowlist and expect it to be reverted
    await expect(IkmzMerkleProof.allowlistMint(proof)).to.be.revertedWith("You are not in the list");
  });

});
