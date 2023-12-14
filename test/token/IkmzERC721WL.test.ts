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

describe("Verification of Merkle Proof Authentication using MerkleTree in merkletreejs.", function () {
  it("[S] Verification of Merkle Proof Authentication ", async () => {
    // 2. Collect list of wallet addresses from competition, raffle, etc.
    // Define list of 7 public Ethereum addresses
    // npx hardhat node (#0~#6))
    let whitelistAddresses = [
      "0X5B38DA6A701C568545DCFCB03FCB875F56BEDDC4",
      "0X5A641E5FB72A2FD9137312E7694D42996D689D99",
      "0XDCAB482177A592E424D1C8318A464FC922E8DE40",
      "0X6E21D37E07A6F7E53C7ACE372CEC63D4AE4B6BD0",
      "0X09BAAB19FC77C19898140DADD30C4685C597620B",
      "0XCC4C29997177253376528C05D3DF91CF2D69061A",
      "0xdD870fA1b7C4700F2BD7f44238821C26f7392148" // The address in remix
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

    // 5. Convert Buffer to hex string with '0x' prefix
    const allowlistRootHashHexString = "0x" + allowlistRootHash.toString("hex");

    // 6. Choose claiming address from whitelist
    const claimingAddress = leafNodes[6];
    const hexProof = merkleTree.getHexProof(claimingAddress);

    // 7. Verify the Merkle Proof for the claiming address against the calculated Merkle Root.

    // Log the Hex Proof for the claiming address.
    console.log('Hex Proof:', hexProof);

    // Log the Ethereum address for which the Merkle Proof is being verified.
    console.log('Claiming Address:', claimingAddress);

    // Log the calculated Merkle Root based on the whitelist.
    console.log('Allowlist Root Hash:', allowlistRootHash);

    // Log the result of the verification, indicating whether the Merkle Proof is valid for the claiming address.
    console.log('Verification Result:', merkleTree.verify(hexProof, claimingAddress, allowlistRootHash));
  })
});


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



describe("deploy check", () => {
  // it("Should return default value", async () => {
  //   expect(await IkmzERC721WL.totalSupply()).to.equal(0);
  // })
})

describe("setMerkleRoot check", () => {
  it("[S] Should set the Merkle Root correctly by Owner", async function () {
    // Ensure that the initial Merkle Root is set to the zero address
    expect(await IkmzERC721WL.getMerkleRoot()).to.equal(zeroAddress);

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
