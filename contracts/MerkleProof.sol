// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// ref
// https://zenn.dev/rlho/articles/2193884e3f4b9d#smart-contract
// https://medium.com/codex/creating-an-nft-whitelist-using-merkle-tree-proofs-9668fbe72cb4

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";


contract IkmzMerkleProof is ERC1155, Ownable {
    bytes32 merkleRoot;
    using MerkleProof for bytes32[];
    string public name = "Sample";
    string public symbol = "Sample";

    constructor() ERC1155("https://hogehoge.com/metadata/{id}.json") {
    }

    function setAllowlist(bytes32 listRoot) public onlyOwner {
      merkleRoot = listRoot;
    }

    // The verification of whether it exists in the allowlist.
    modifier allowList(bytes32 _merkleRoot, bytes32[] memory proof) {
        require(proof.verify(merkleRoot, keccak256(abi.encodePacked(msg.sender))),"You are not in the list");
        _;
    }

    function mint(uint256 amount) internal {
        _mint(msg.sender, 1, amount, "");
    }

    function allowlistMint(bytes32[] memory proof) public payable allowList(merkleRoot, proof) {
        mint(1);
    }

    function setURI(string memory uri_) public onlyOwner {
        _setURI(uri_);
    }
}