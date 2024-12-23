// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IPortfolio {
  function newPosition(address _token, uint256 _amount) external;
}
