import { ethers } from 'hardhat';
import { Users, Whitelist, WhitelistEntry } from './interfaces';

const mmAddress = "0xa2fb2553e57436b455F57270Cc6f56f6dacDA1a5"

export const makeUsers = async (): Promise<Users> => {
  const signers = await ethers.getSigners();
  return {
    alice: signers[1],
    bob: signers[2],
    carol: signers[3],
    david: signers[3],
  };
};

export const makeWhitelistAddress = async (): Promise<Whitelist> => {
  const signers = await ethers.getSigners();
  return {
    alice: signers[1].address,
    bob: signers[2].address,
    carol: signers[3].address,
    david: signers[3].address,
    ikmz: mmAddress
  };
};

export const makeWhitelistAddressQuantity = async (): Promise<WhitelistEntry[]> => {
  const signers = await ethers.getSigners();
  return [
    {
      address: signers[1].address,
      quantity: 1,
    },
    {
      address: signers[2].address,
      quantity: 2,
    },
    {
      address: signers[3].address,
      quantity: 1,
    },
    {
      address: mmAddress,
      quantity: 1,
    }
  ];
};
