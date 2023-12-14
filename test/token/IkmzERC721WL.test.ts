const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const { expect } = require("chai");
const { ethers } = require("hardhat");
import { Contract } from "ethers";
import chai from "chai";
import ChaiAsPromised from "chai-as-promised";

chai.use(ChaiAsPromised);

describe("IkmzERC721WL", () => {
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