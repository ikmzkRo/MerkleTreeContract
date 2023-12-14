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
    console.log('whitelistAddresses', whitelistAddresses);

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
    console.log('allowlistRootHashHexString', allowlistRootHashHexString);

    // 6. Choose claiming address from whitelist
    const claimingAddress = leafNodes[6];
    const hexProof = merkleTree.getHexProof(claimingAddress);

    // 7. Verify
    console.log('hexProof, claimingAddress, allowlistRootHash', hexProof, claimingAddress, allowlistRootHash);
    console.log(merkleTree.verify(hexProof, claimingAddress, allowlistRootHash));
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
  [owner, allowListedUser, notListedUser] = await ethers.getSigners();

  // deploy IkmzERC721WL
  IkmzERC721WLFactory = await ethers.getContractFactory("IkmzERC721WL");
  IkmzERC721WL = await IkmzERC721WLFactory.deploy();
  await IkmzERC721WL.deployed();

  // define merkletree
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
  const merkleTree = new MerkleTree(allowList.map(keccak256), keccak256, {
    sortPairs: true,
  });
  hexProof = merkleTree.getHexProof(keccak256(allowListedUser.address));
  rootHash = merkleTree.getRoot();
  rootHashHexString = `0x${rootHash.toString("hex")}`
})


describe("deploy check", () => {
  // it("Should return default value", async () => {
  //   expect(await IkmzERC721WL.totalSupply()).to.equal(0);
  // })
})

describe("deploy check", () => {
  it("[S] Check if the allowlist root is set correctly", async function () {
    expect(await IkmzERC721WL.getMerkleRoot()).to.equal(zeroAddress);

    // Set the allowlistRootHashHexString
    await IkmzERC721WL
      .connect(owner)
      .setMerkleRoot(`0x${rootHash.toString("hex")}`);

    // Check if the allowlist root is set correctly
    expect(await IkmzERC721WL.getMerkleRoot()).to.equal(rootHashHexString);
  });
})



it("mint", async () => {

  await IkmzERC721WL
    .connect(owner)
    .setMerkleRoot(`0x${rootHash.toString("hex")}`);

  // setMerkleRoot が onlyOwner であるテスト
  await expect(
    IkmzERC721WL
      .connect(notListedUser)
      .setMerkleRoot(`0x${rootHash.toString("hex")}`)
  ).to.be.revertedWith("Ownable: caller is not the owner");

  // 現状の balance をテスト
  expect(await IkmzERC721WL.balanceOf(allowListedUser.address)).to.be.equal(
    BigInt(0)
  );
  expect(await IkmzERC721WL.balanceOf(notListedUser.address)).to.be.equal(
    BigInt(0)
  );

  // mint 関数の call をテスト
  console.log('hexProof', hexProof);
  await IkmzERC721WL.connect(allowListedUser).whitelistMint(hexProof);
  await expect(
    IkmzERC721WL.connect(notListedUser).whitelistMint(hexProof)
  ).to.be.revertedWith("Invalid proof");

  // mint後の balance をテスト
  expect(await IkmzERC721WL.balanceOf(allowListedUser.address)).to.be.equal(
    BigInt(1)
  );
  expect(await IkmzERC721WL.balanceOf(notListedUser.address)).to.be.equal(
    BigInt(0)
  );

});