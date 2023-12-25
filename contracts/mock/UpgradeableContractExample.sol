// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// https://qiita.com/biga816/items/b4f745e67588e8da7ed1

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract UpgradeableContractExample is Initializable {
    uint256 public x;

    function initialize(uint256 _x) public initializer {
        x = _x;
    }
}
