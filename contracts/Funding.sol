// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "./interfaces/IERC20.sol";
import "./interfaces/IPortfolio.sol";


contract Funding{
     IPortfolio public portfolio;


    function setPortfolio(address _portfolio) external{
        portfolio = IPortfolio(_portfolio);
    }


    function MockBuyTokenAndSendToPortfolio(address _token, uint256 _amount) external{
        IERC20(_token).approve(address(portfolio), _amount);
        portfolio.newPosition(_token,_amount);
    }   

}
