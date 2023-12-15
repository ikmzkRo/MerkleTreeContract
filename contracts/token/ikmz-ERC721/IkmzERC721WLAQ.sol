// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {MerkleProof} from '@openzeppelin/contracts/utils/cryptography/MerkleProof.sol';

// ホワイトリストの各アドレスに対して発行できる個数を制御できるようにする
// ref: https://dev.to/peterblockman/understand-merkle-tree-by-making-a-nft-minting-whitelist-1148#step-4--verify-users--address-and-quantity

contract IkmzERC721WLAQ is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    bytes32 public merkleRoot;

    mapping(address => bool) public whitelistClaimed;

    // デプロイ時に計算結果のマークルルートをデプロイする
    constructor(bytes32 merkleRoot_) ERC721('zuyomayo', 'ZTMY') {
        merkleRoot = merkleRoot_;
    }

    function whitelistMint(uint256 quantity, bytes32[] calldata merkleProof) public {
        require(!whitelistClaimed[msg.sender], "Address already claimed");

        bytes32 node = keccak256(abi.encodePacked(msg.sender));
        require(
            MerkleProof.verify(merkleProof, merkleRoot, node),
            "Invalid proof"
        );

        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _tokenIds.current();
            _mint(msg.sender, tokenId);

            _tokenIds.increment();   
        }

        whitelistClaimed[msg.sender] = true;
    }

    function setMerkleRoot(bytes32 _merkleRoot) public onlyOwner {
        merkleRoot = _merkleRoot;
    }

    function getMerkleRoot() external view returns (bytes32) {
        return merkleRoot;
    }

}