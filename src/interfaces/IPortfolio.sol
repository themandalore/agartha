// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface IERC20 {
  function depositToken(address _token, uint256 _amount) external;
}
