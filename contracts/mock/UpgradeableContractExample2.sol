// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// https://docs.openzeppelin.com/upgrades-plugins/1.x/hardhat-upgrades

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract UpgradeableContractExample is Initializable {
    uint256 public x;

    function initialize(uint256 _x) public initializer {
        x = _x;
    }
}
