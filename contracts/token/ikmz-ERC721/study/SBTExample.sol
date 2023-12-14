// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// https://zenn.dev/ryo_takahashi/articles/d4bdc137b564db
// TODO: https://note.com/yutaronagumo/n/nf6dd5bad47f4#f96e02b6-d51c-4c11-963e-6e0f68fbf887

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SBTExample is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenCounter;

    constructor() ERC721("SBTExample", "NEKO") {}

    function mint() public {
        _tokenCounter.increment();

        uint256 newItemId = _tokenCounter.current();
        // https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol#L280-L292
        _mint(msg.sender, newItemId);
    }

    // ここを追加するだけ
    // _beforeTokenTransfer なくね？
    // function _beforeTokenTransfer(
    //     address from,
    //     address to,
    //     uint256 tokenId
    // ) internal pure override {
    //     // mintは許可（そのまま処理を通す）
    //   	// transferは禁止（処理を中断させる）
    //     require(from == address(0));
    // }
}