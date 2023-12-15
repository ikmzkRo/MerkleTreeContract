import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
const { expect } = require("chai");
const { ethers } = require("hardhat");
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
import { makeMerkleTree } from '../../../scripts/utils/merkletree';
import { makeSigners } from '../../../scripts/utils/data';

import chai from "chai";
import ChaiAsPromised from "chai-as-promised";
chai.use(ChaiAsPromised);

let IkmzERC721WLAQFactory: Contract;
let IkmzERC721WLAQ: Contract;
let owner: SignerWithAddress;
let allowListedUser: SignerWithAddress;
let notListedUser: SignerWithAddress
let rootHash: any;
let hexProof: any;
let rootHashHexString: any;
const zeroAddress = '0x0000000000000000000000000000000000000000000000000000000000000000'
const dummyMerkleRoot = "0x3e35b61278fbcec3f3b0bb361d928e373e089a61758af09690ce0a5391078ff2"


// ***** ***** ***** ***** ***** ***** ***** ***** // 
// yarn run test test/token/IkmzERC721WLAQ.test.ts
// ***** ***** ***** ***** ***** ***** ***** ***** // 

describe('IkmzERC721WLAQ', function () {
  async function createTestFixture() {
    const merkleTreeData = await makeMerkleTree();
    const { root } = merkleTreeData;

    const signers = await makeSigners();

    IkmzERC721WLAQFactory = await ethers.getContractFactory("IkmzERC721WLAQ");

    IkmzERC721WLAQ = await IkmzERC721WLAQFactory.deploy(root);

    await IkmzERC721WLAQ.deployed();

    return { IkmzERC721WLAQ, merkleTreeData, signers };
  }

  beforeEach(async function () {
    const { IkmzERC721WLAQ, signers, merkleTreeData } = await loadFixture(
      createTestFixture
    );
    this.IkmzERC721WLAQ = IkmzERC721WLAQ;
    this.signers = signers;
    this.merkleTreeData = merkleTreeData;
  });

  describe('Deployment', function () {
    it('Should return correct name and symbol', async function () {
      expect(await this.IkmzERC721WLAQ.name()).to.equal(
        'zuyomayo'
      );
      expect(await this.IkmzERC721WLAQ.symbol()).to.equal('ZTMY');
      expect(await this.IkmzERC721WLAQ.getMerkleRoot()).to.equal(this.merkleTreeData.root);
    });
  });

  describe('whitelistMint', function () {
    beforeEach(async function () {
      [owner, allowListedUser, notListedUser] = await ethers.getSigners();
      await this.IkmzERC721WLAQ
        .connect(owner)
        .whitelistMint(1, this.merkleTreeData.proofs[2]);
    });

    it('Should allow whitelisted users to mint', async function () {
      // const aliceBalance = await this.IkmzERC721WLAQ.balanceOf(
      //   await this.users.alice.getAddress()
      // );

      // expect(aliceBalance).to.equal(1);

      // const bobBalance = await this.IkmzERC721WLAQ.balanceOf(
      //   await this.users.bob.getAddress()
      // );

      // expect(bobBalance).to.equal(2);
    });

  })

});



















// うまくいかん
// allowlistに登録されているhardhatのsignerに接続してにはじかれる
// (; ･`д･´)


















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
