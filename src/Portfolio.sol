// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "./interfaces/IERC20.sol";
import "./Token.sol";

contract Portfolio is Token{
     address[] listOfTokens;
     uint256 totalLPshares;
     unit256 public mintAmount;
     mapping(address => uint256) lpSharesPerToken;//for withdrawing individual

    constructor(string memory _name, string memory _symbol) Token(_name,_symbol) {}


    function depositToken() external onlySebu{
        //put new tokens into contract
    }

    function getMyLPShares(address[] _to, uint256[] _amounts) external onlySebu{
        
    }

    function withdraw(uint256 _amount, address[] _tokens) external{
        //burn LP shares
        //transfer token
    }


}
