// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "./interfaces/IERC20.sol";
import "./interfaces/ISebu.sol";
import "./Token.sol";

contract Portfolio is Token{
     address[] listOfTokens;
     uint256 totalLPshares;
     unit256 public mintAmount;
     ISebu public sebu;
     mapping(address => mapping(address => uint256)) lpSharesPerToken;//for withdrawing individual

    constructor(string memory _name, string memory _symbol, address _sebu) Token(_name,_symbol) {
        sebu = ISebu(_sebu);
    }


    function newPosition(address _token, uint256 _amount) external onlySebu{
        require(transferFrom(msg.sender,address(this),_amount));
        listOfTokens.push(address);
        totalLPshares += mintAmount;
    }

    function getMyLPShares(address[] _to, uint256[] _amounts) external onlySebu{
        
    }

    //this can get too big.  We need to add try's and then limit the number of tokens to a certain #
    //if weekly, we're probably fine, but if there's a shorter time frame, it could get ridiculous, so you'll want to monitor
    function withdraw(uint256 _amount, address[] _tokens) external{
        //burn LP shares
        _burn(msg.sender, _amount);
        uint256 _pct = (1e18 * _amount) / totalLPshares;
        totalLPshares -= _amount;
        //transfer token
        uint256 _thisSend;
        for(i=0;i<_tokens.length;i++){
            _thisSend = IERC20(_tokens[i]).balanceOf(address(this)) * _pct;
            IERC20(_tokens[i]).transfer(msg.sender, (_thisSend / 1e18));
        }
    }


}
