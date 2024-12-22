// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface IERC20 {
  function newPosition(address _token, uint256 _amount) external;
}
