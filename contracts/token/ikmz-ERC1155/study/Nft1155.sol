// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// https://zenn.dev/mizuneko4345/scraps/bf123ab02bd76a
// https://github.com/akihokurino/rust-ethereum/blob/master/ethereum/contracts/Nft1155.sol
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Nft1155 is ERC1155, Ownable {
    // トークンIDとコンテンツハッシュを関連付けるためのマッピングを更新しています。
    // これにより、後でトークンIDを使用してコンテンツハッシュを検索できます。
    mapping(uint256 => string) private _token2hash;

    uint256 private _localTokenId;
    uint256 private _totalSupply;

    string public name;
    string public symbol;

    constructor(string memory _name, string memory _symbol) ERC1155("ipfs://your-ipfs-hash/") {
        name = _name;
        symbol = _symbol;
        _localTokenId = 0;
        _totalSupply = 0;
    }

    function mint(
        string memory contentHash,
        uint256 amount
    ) public virtual onlyOwner {
        _localTokenId += 1;
        _token2hash[_localTokenId] = contentHash;
        _mint(_msgSender(), _localTokenId, amount, ""); // トークン割り当て対象、トークンID、IDに対するトークン数量、任意の追加データ
        _totalSupply += amount;
    }

    function uri(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        string memory contentHash = _token2hash[tokenId];
        return string(abi.encodePacked("ipfs://", contentHash));
    }

    function latestTokenId() public view virtual returns (uint256) {
        return _localTokenId;
    }

    function totalSupply() public view virtual returns (uint256) {
        return _totalSupply;
    }

    function totalOwned() public view virtual returns (uint256) {
        uint256 owned = 0;
        for (uint256 i = 1; i <= _localTokenId; i++) {
            owned += balanceOf(owner(), i);
        }
        return owned;
    }

    function isOwner(
        address owner,
        uint256 tokenId
    ) public view virtual returns (bool) {
        return balanceOf(owner, tokenId) > 0;
    }
}