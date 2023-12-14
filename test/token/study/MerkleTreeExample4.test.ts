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

describe("MyERC721", async function () {


})