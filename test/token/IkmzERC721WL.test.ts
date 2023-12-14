const { expect } = require("chai");
const { ethers } = require("hardhat");
import { Contract } from "ethers";

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

describe("IkmzERC721WL", async function () {
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


  // ***** ***** ***** ***** ***** ***** ***** ***** // 


  it("mint", async () => {
    let IkmzERC721WL: Contract;
    const [owner, allowListedUser, notListedUser] = await ethers.getSigners();
    const allowList = [allowListedUser.address, "0xa2fb2553e57436b455F57270Cc6f56f6dacDA1a5", "0xa2fb2553e57436b455F57270Cc6f56f6dacDA1a4", "0xa2fb2553e57436b455F57270Cc6f56f6dacDA1a3"];
    console.log('allowList', allowList);

    const IkmzERC721WLFactory = await ethers.getContractFactory("MyERC721");
    IkmzERC721WL = await IkmzERC721WLFactory.deploy();
    await IkmzERC721WL.deployed();

    const merkleTree = new MerkleTree(allowList.map(keccak256), keccak256, {
      sortPairs: true,
    });
    const hexProof = merkleTree.getHexProof(keccak256(allowListedUser.address));
    const rootHash = merkleTree.getRoot();

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
    await IkmzERC721WL.connect(allowListedUser).mint(hexProof);
    await expect(
      IkmzERC721WL.connect(notListedUser).mint(hexProof)
    ).to.be.revertedWith("Invalid proof");

    // mint後の balance をテスト
    expect(await IkmzERC721WL.balanceOf(allowListedUser.address)).to.be.equal(
      BigInt(1)
    );
    expect(await IkmzERC721WL.balanceOf(notListedUser.address)).to.be.equal(
      BigInt(0)
    );
  });
});