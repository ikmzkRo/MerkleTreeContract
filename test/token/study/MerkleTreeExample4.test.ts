const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const { expect } = require("chai");
const { ethers } = require("hardhat");
import { Contract } from "ethers";
import chai from "chai";
import ChaiAsPromised from "chai-as-promised";

chai.use(ChaiAsPromised);

describe("MyERC721", () => {
  it("mint", async () => {
    let IkmzMerkleProof: Contract;
    const [owner, allowListedUser, notListedUser] = await ethers.getSigners();
    const allowList = [allowListedUser.address, "0xa2fb2553e57436b455F57270Cc6f56f6dacDA1a5", "0xa2fb2553e57436b455F57270Cc6f56f6dacDA1a4", "0xa2fb2553e57436b455F57270Cc6f56f6dacDA1a3"];
    console.log('allowList', allowList);

    const IkmzMerkleProofFactory = await ethers.getContractFactory("MyERC721");
    IkmzMerkleProof = await IkmzMerkleProofFactory.deploy();
    await IkmzMerkleProof.deployed();

    const merkleTree = new MerkleTree(allowList.map(keccak256), keccak256, {
      sortPairs: true,
    });
    const hexProof = merkleTree.getHexProof(keccak256(allowListedUser.address));
    const rootHash = merkleTree.getRoot();

    await IkmzMerkleProof
      .connect(owner)
      .setMerkleRoot(`0x${rootHash.toString("hex")}`);

    // setMerkleRoot が onlyOwner であるテスト
    await expect(
      IkmzMerkleProof
        .connect(notListedUser)
        .setMerkleRoot(`0x${rootHash.toString("hex")}`)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    // 現状の balance をテスト
    expect(await IkmzMerkleProof.balanceOf(allowListedUser.address)).to.be.equal(
      BigInt(0)
    );
    expect(await IkmzMerkleProof.balanceOf(notListedUser.address)).to.be.equal(
      BigInt(0)
    );

    // mint 関数の call をテスト
    console.log('hexProof', hexProof);
    await IkmzMerkleProof.connect(allowListedUser).mint(hexProof);
    await expect(
      IkmzMerkleProof.connect(notListedUser).mint(hexProof)
    ).to.be.revertedWith("Invalid proof");

    // mint後の balance をテスト
    expect(await IkmzMerkleProof.balanceOf(allowListedUser.address)).to.be.equal(
      BigInt(1)
    );
    expect(await IkmzMerkleProof.balanceOf(notListedUser.address)).to.be.equal(
      BigInt(0)
    );
  });
});