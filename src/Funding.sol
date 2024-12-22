// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "./interfaces/IERC20.sol";
import "./interfaces/IPortfolio.sol";

contract Funding is Token{
     IPortfolio public portfolio;


    constructor(address _portfolio){
        portfolio = IPortfolio(_portfolio);
    }


    function MockBuyTokenAndSendToPortfolio(address _token, uint256 _amount) external{
        IERC20(_token).approve(portfolio, _amount);
        portfolio.newPosition(_token,_amount);
    }   

}
