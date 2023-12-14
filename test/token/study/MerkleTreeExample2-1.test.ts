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

describe("MerkleTreeExample2", async function () {
  // Define list of 7 public Ethereum addresses
  // npx hardhat node (#0~#6))
  let addresses = [
    "0X5B38DA6A701C568545DCFCB03FCB875F56BEDDC4",
    "0X5A641E5FB72A2FD9137312E7694D42996D689D99",
    "0XDCAB482177A592E424D1C8318A464FC922E8DE40",
    "0X6E21D37E07A6F7E53C7ACE372CEC63D4AE4B6BD0",
    "0X09BAAB19FC77C19898140DADD30C4685C597620B",
    "0XCC4C29997177253376528C05D3DF91CF2D69061A",
    "0xdD870fA1b7C4700F2BD7f44238821C26f7392148" // The address in remix
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
  const zeroAddress = '0x0000000000000000000000000000000000000000000000000000000000000000'

  beforeEach(async function () {
    [owner, allowListedUser, notAllowListedUser] = await ethers.getSigners();
    const IkmzMerkleProofFactory = await ethers.getContractFactory("MerkleTreeExample2");
    IkmzMerkleProof = await IkmzMerkleProofFactory.deploy();
    await IkmzMerkleProof.deployed();
  });

  it("should mint to an address in the allowlist", async function () {
    console.log('allowListedUser.address', allowListedUser.address);
    // Check if the allowlist root is not set
    expect(await IkmzMerkleProof.getMerkleRoot()).to.equal(zeroAddress);

    // Set the allowlist root
    await IkmzMerkleProof.setAllowlist(allowlistRootHash);

    // Check if the allowlist root is set correctly
    expect(await IkmzMerkleProof.getMerkleRoot()).to.equal(allowlistRootHash);

    // Generate a proof for an allowlisted user
    const proof = merkleTree.getHexProof(keccak256(allowListedUser.address));
    console.log('proof', proof);

    // TODO: Mint to the allowlisted user
    // await expect(IkmzMerkleProof.allowlistMint(proof))
    //   .to.emit(IkmzMerkleProof, "Mint") // Check if the Mint event is emitted
    //   .withArgs(owner.address, allowListedUser.address, 1, 1, "0x"); // You may need to adjust these arguments based on your contract's implementation

    // 1) IkmzMerkleProof
    // should mint to an address in the allowlist:
    // Error: call revert exception; VM Exception while processing transaction: reverted with reason string "Incorrect proof" [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ] (method="checkValidity(bytes32[])", data="0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000f496e636f72726563742070726f6f660000000000000000000000000000000000", errorArgs=["Incorrect proof"], errorName="Error", errorSignature="Error(string)", reason="Incorrect proof", code=CALL_EXCEPTION, version=abi/5.7.0)
  });

  it("should not mint to an address not in the allowlist", async function () {
    // // Generate a proof for a user not in the allowlist
    // const proof = merkleTree.getHexProof(keccak256(notAllowListedUser.address));

    // // Set the allowlist root
    // await IkmzMerkleProof.setAllowlist(allowlistRootHash);

    // // Try to mint to the user not in the allowlist and expect it to be reverted
    // await expect(IkmzMerkleProof.allowlistMint(proof)).to.be.revertedWith("You are not in the list");
  });

});
