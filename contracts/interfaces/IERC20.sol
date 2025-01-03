// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IERC20 {
  function transfer(address _to, uint256 _amount) external returns(bool);
  function transferFrom(address _from, address _to, uint256 _amount) external returns(bool);
  function approve(address _spender, uint256 _amount) external returns(bool);
  function balanceOf(address _user) external view returns (uint256);
}
