import { Signer } from 'ethers';

export type Users = Record<string, Signer>;

export interface MerkleTreeData {
  root: string;
  proofs: string[][];
}

export interface Whitelist {
  alice: string;
  bob: string;
  carol: string;
  david: string;
  ikmz: string;
}

export interface WhitelistEntry {
  address: string;
  quantity: number;
}
