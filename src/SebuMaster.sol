// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "./interfaces/IERC20.sol";
import "./interfaces/IPortfolio.sol";


contract SebuMaster {
    //be sure to store winners (for points)
    //be sure to store investors (for points)
    uint256 public fee; //fee to pitch
    uint256 public currentSlot;
    uint256 public currentRound;
    address public guardian;
    address public sebu;
    address[] public queue;
    mapping(address => uint256) slotInQueue;
    mapping(uint256 => address) slotToToken;
    mapping(uint256 => uint256) slotToRanking;
    mapping(uint256 => uint256) roundTopRanking;
    mapping(uint256 => mapping(address => uint256)) roundToInvestment;
    mapping(uint256 => uint256) roundToTotalInvested;
    mapping(uint256 => address[]) roundToInvestors;
    IERC20 public investmentToken;
    IPortfolio public portfolio;
    

    constructor(uint256 _fee,address _investmentToken,address _guardian, address _sebu) public{
        fee = _fee;
        guardian = _guardian;
        sebu = _sebu;
        investmentToken = IERC20(_invetstmentToken);
        currentRound=1;
    }

    modifier onlyGuardian {require(msg.sender == guardian);_;}

    modifier onlySebu {require(msg.sender == sebu);_;}

    function init(address _portfolio){
        portfolio = IPortfolio(_portfolio);
    }
    /*Functions*/
    function invest(uint256 _amount) external{
        require(transferFrom(msg.sender,address(this),_amount));
        roundToTotalInvested[currentRound] = roundToTotalInvested[currentRound] + _amount;
        roundToInvestment[currentRound][msg.sender] = _amount;
        roundToInvestors[currentRound].push(msg.sender);
    }

    function withdrawFees()external onlyGuardian{
        investmentToken.transfer(guardian);
    }
    function pitch(address _tokenToPitch) external returns(uint256 _slot){
        require(transferFrom(msg.sender,address(this),fee * queue.length));
        queue.push(msg.sender);
        slotInQueue[msg.sender] = queue.length;
        slotToToken[queue.length] = _tokenToPitch;
        emit(NewPitchQueued(msg.sender))
    }
    function setRanking() external onlySebu{

    }

    function closeRound() external onlyGuardian{
        //closes the current round, buys the tokena and sends it to the portfolio
    }

    
    function getCurrentQueue() external view{

    }

    function getInvestment(uint256 _round, address _lp) external view returns(uint256 _amount){
        require(_round > currentRound);
        return roundToInvestment[_round][_lp] * 1e18/ roundToTotalInvested[_round];
    }

    //to do, add all mapping getters
}
