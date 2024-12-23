// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "./interfaces/IERC20.sol";
import "./interfaces/ISebu.sol";
import "./Token.sol";

contract Portfolio is Token{
     address[] public listOfTokens;
     uint256 totalLPshares;
     uint256 public mintAmount;
     ISebu public sebu;
     mapping(address => mapping(address => uint256)) lpSharesPerToken;//for withdrawing individual
     mapping(address => mapping(address => uint256)) mineToWithdraw;
     mapping(address => uint256) totalToWithdraw;

    event NewPosition(address _token, uint256 _amount);
    event MintLPShares(uint256 _round, address[] _to);
    event Withdraw(uint256 _amount, address[] _tokens);

    modifier onlySebu {require(msg.sender == address(sebu));_;}


    constructor(string memory _name, string memory _symbol, address _sebu) Token(_name,_symbol) {
        sebu = ISebu(_sebu);
    }


    function newPosition(address _token, uint256 _amount) external onlySebu{
        require(IERC20(_token).transferFrom(msg.sender,address(this),_amount));
        listOfTokens.push(_token);
        totalLPshares += mintAmount;
        emit NewPosition(_token, _amount);
    }

    function mintLPShares(uint256 _round, address[] memory _to) external{
        uint256 _amt;
        for(uint256 _i=0;_i<_to.length;_i++){
            _amt = sebu.getInvestment(_round, _to[_i]) * mintAmount / 1e18;
            _mint(_to[_i],_amt);
        }
        emit MintLPShares(_round, _to);
    }

    //this can get too big.  We need to add try's and then limit the number of tokens to a certain #
    //if weekly, we're probably fine, but if there's a shorter time frame, it could get ridiculous, so you'll want to monitor
    function withdraw(uint256 _amount, address[] memory _tokens) external{
        //burn LP shares
        _burn(msg.sender, _amount);
        uint256 _pct = (1e18 * _amount) / totalLPshares;
        totalLPshares -= _amount;
        //markTokenAsYours
        uint256 _thisSend;
        for(uint256 _i=0;_i<listOfTokens.length;_i++){
            _thisSend = (IERC20(_tokens[_i]).balanceOf(address(this)) - totalToWithdraw[listOfTokens[_i]]) * _pct;
            mineToWithdraw[listOfTokens[_i]][msg.sender] = _thisSend;
            totalToWithdraw[listOfTokens[_i]] = totalToWithdraw[listOfTokens[_i]] + _thisSend;
        }
        claim(_tokens);
        emit Withdraw(_amount, _tokens);
    }

    function claim(address[] memory _tokens) public{
        uint256 _thisSend;
        for(uint256 _i=0;_i<_tokens.length;_i++){
            _thisSend = mineToWithdraw[_tokens[_i]][msg.sender];
            IERC20(_tokens[_i]).transfer(msg.sender, (_thisSend / 1e18));
        }
    }

}
