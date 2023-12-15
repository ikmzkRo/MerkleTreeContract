// https://github.com/peterblockman/merkle-tree-nft-whitelist/blob/feat/simple/utils/merkletree.ts

import { ethers } from 'hardhat';
import keccak256 from 'keccak256';
import { MerkleTree } from 'merkletreejs';

import { MerkleTreeData } from './interfaces';
import { makeWhitelistAddressQuantity } from './data';

export const makeMerkleTree = async (): Promise<MerkleTreeData> => {
  // alice, bob, carol
  const inputs = await makeWhitelistAddressQuantity();

  // create leaves from inputs
  const leaves = inputs.map((x) =>
    ethers.utils.solidityKeccak256(
      ['address', 'uint256'],
      [x.address, x.quantity]
    )
  );

  // create a Merkle Tree using keccak256 hash function
  const tree = new MerkleTree(leaves, keccak256, { sort: true });

  // get the root
  const root = tree.getHexRoot();

  const proofs = leaves.map((leaf) => tree.getHexProof(leaf));
  return {
    proofs,
    root,
  };
};