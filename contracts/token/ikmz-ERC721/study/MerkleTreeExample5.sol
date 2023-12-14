// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// ホワイトリストの各アドレスに対して発行できる個数を制御できるようにする
// ref: https://dev.to/peterblockman/understand-merkle-tree-by-making-a-nft-minting-whitelist-1148#step-4--verify-users--address-and-quantity

contract IkmzERC721WLAQ is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    bytes32 public merkleRoot;
    mapping(address => bool) public whitelistClaimed;

    constructor() ERC721("whitelist", "WL") {}

    function whitelistMint(bytes32[] calldata _merkleProof) public payable returns (uint256) {
        require(!whitelistClaimed[msg.sender], "Address already claimed");
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(
            MerkleProof.verify(_merkleProof, merkleRoot, leaf),
            "Invalid proof"
        );
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(msg.sender, newTokenId);

        whitelistClaimed[msg.sender] = true;
        
        return newTokenId;
    }

    function setMerkleRoot(bytes32 _merkleRoot) public onlyOwner {
        merkleRoot = _merkleRoot;
    }

    function getMerkleRoot() external view returns (bytes32) {
        return merkleRoot;
    }

}