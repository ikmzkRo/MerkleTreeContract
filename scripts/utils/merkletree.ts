// https://github.com/peterblockman/merkle-tree-nft-whitelist/blob/feat/simple/utils/merkletree.ts

import { ethers } from 'hardhat';
import keccak256 from 'keccak256';
import { MerkleTree } from 'merkletreejs';

import { MerkleTreeData } from './interfaces';
import { makeWhitelistAddressQuantity } from './data';

export const makeMerkleTree = async (): Promise<MerkleTreeData> => {
  const inputs = await makeWhitelistAddressQuantity();
  // inputs [
  //   {
  //     address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  //     quantity: 1
  //   },
  //   {
  //     address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  //     quantity: 2
  //   },
  //   {
  //     address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
  //     quantity: 1
  //   },
  //   {
  //     address: '0xa2fb2553e57436b455F57270Cc6f56f6dacDA1a5',
  //     quantity: 1
  //   }
  // ]

  // create leaves from inputs
  const leaves = inputs.map((x) =>
    ethers.utils.solidityKeccak256(
      ['address', 'uint256'],
      [x.address, x.quantity]
    )
  );
  // leaves[
  //   '0x3f68e79174daf15b50e15833babc8eb7743e730bb9606f922c48e95314c3905c',
  //   '0xd0583fe73ce94e513e73539afcb4db4c1ed1834a418c3f0ef2d5cff7c8bb1dee',
  //   '0xb783e75c6c50486379cdb997f72be5bb2b6faae5b2251999cae874bc1b040af7',
  //   '0x7fe1c86c1c37db451888300236407476e9b40395a7542e14fc3f05aa57f73785'
  // ]

  // create a Merkle Tree using keccak256 hash function
  const tree = new MerkleTree(leaves, keccak256, { sort: true });

  // get the root
  const root = tree.getHexRoot();
  // root 0x58a5c58b8dca958ba96fbca0c883f1af537a45ac71d0c5e7268bbdcbff7a9338

  // get the proofs
  const proofs = leaves.map((leaf) => tree.getHexProof(leaf));
  // proofs [
  //   [
  //     '0x7fe1c86c1c37db451888300236407476e9b40395a7542e14fc3f05aa57f73785',
  //     '0x1bb11cbf36c84ac0540c0e43571d4e725566f7eacda7a077ec2c267890577e73'
  //   ],
  //   [
  //     '0xb783e75c6c50486379cdb997f72be5bb2b6faae5b2251999cae874bc1b040af7',
  //     '0x00350ecd461803cfe0ed2c0e0a9d0734812078698ec442a69b1866415c3e9021'
  //   ],
  //   [
  //     '0xd0583fe73ce94e513e73539afcb4db4c1ed1834a418c3f0ef2d5cff7c8bb1dee',
  //     '0x00350ecd461803cfe0ed2c0e0a9d0734812078698ec442a69b1866415c3e9021'
  //   ],
  //   [
  //     '0x3f68e79174daf15b50e15833babc8eb7743e730bb9606f922c48e95314c3905c',
  //     '0x1bb11cbf36c84ac0540c0e43571d4e725566f7eacda7a077ec2c267890577e73'
  //   ]
  // ]
  return {
    proofs,
    root,
  };
};