// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface ISebu {
  function getInvestment(uint256 _round, address _lp) external view;
}
