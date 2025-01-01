// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "./interfaces/IERC20.sol";
import "./interfaces/IPortfolio.sol";

/**
 @title SebuMaster
 @dev Main contract to handle investments and pitches
*/
contract SebuMaster {

    /*to do:
        make structs for round / slots
        auction?
        add getters
        talk to front end about events needed
        write funding contract
    */
    address public fundingContract;
    address public guardian;
    address public shepard;
    address[] public queue; //array of addresses in line to pitch
    uint256 public fee; //fee to pitch
    uint256 public currentRound;
    uint256 public currentSlot;
    mapping(uint256 => mapping(address => uint256)) founderToSlotbyRound;
    mapping(uint256 => address) slotToToken;
    mapping(uint256 => uint256) slotToRanking;
    mapping(uint256 => uint256) roundTopRankingSlot;
    mapping(uint256 => mapping(address => uint256)) roundToInvestment;
    mapping(uint256 => uint256) roundToFees;
    mapping(uint256 => uint256) roundToTotalInvested;
    mapping(uint256 => address[]) roundToInvestors;
    IERC20 public investmentToken;
    IPortfolio public portfolio;
    
    event Investment(address _investor, uint256 _amt);
    event NewPitchQueued(address _founder,address _tokenToPitch);
    event NewPitchUp(address _founder,address _tokenToPitch);
    event RankingSet(uint256 _round, uint256 _slot, uint256 _ranking);
    event PitchInvalidated(uint256 _round, uint256 _slot, uint256 _newTopSlot);
    event RoundClosed(uint256 _currentRound,uint256 _sendAmt);

    constructor(uint256 _fee,address _investmentToken,address _guardian, address _shepard, address _fundingContract){
        fee = _fee;
        guardian = _guardian;
        shepard = _shepard;
        fundingContract = _fundingContract;
        investmentToken = IERC20(_investmentToken);
        currentRound=1;
    }

    modifier onlyGuardian{require(msg.sender == guardian);_;}

    modifier onlyShepard {require(msg.sender == shepard);_;}

    function init(address _portfolio) external onlyGuardian {
        portfolio = IPortfolio(_portfolio);
    }
    /*Functions*/
    function invest(uint256 _amount) external{
        require(investmentToken.transferFrom(msg.sender,address(this),_amount));
        roundToTotalInvested[currentRound] = roundToTotalInvested[currentRound] + _amount;
        if(roundToInvestment[currentRound][msg.sender] == 0){
            roundToInvestors[currentRound].push(msg.sender);
        }
        roundToInvestment[currentRound][msg.sender] = roundToInvestment[currentRound][msg.sender] + _amount;
        emit Investment(msg.sender, _amount);
    }

    function pitch(address _tokenToPitch) external{
        //each person can only pitch once per round
        require(founderToSlotbyRound[currentRound][msg.sender] == 0);
        require(investmentToken.transferFrom(msg.sender,address(this),fee * (2 ** queue.length)));
        roundToFees[currentRound] = roundToFees[currentRound] + fee * queue.length;
        founderToSlotbyRound[currentRound][msg.sender] = queue.length;
        slotToToken[queue.length] = _tokenToPitch;
        queue.push(msg.sender);
        emit NewPitchQueued(msg.sender, _tokenToPitch);
        if(currentSlot == queue.length - 1){
            currentSlot++;
            emit NewPitchUp(msg.sender, _tokenToPitch);
        }
    }


    function setRanking(uint256 _round, uint256 _slot, uint256 _ranking) external onlyShepard{
        require(_slot == currentSlot);
        slotToRanking[_slot] = _ranking;
        if(_ranking > slotToRanking[roundTopRankingSlot[_round]]){
            roundTopRankingSlot[_round] = _slot;
        }
        if(queue.length -1  > currentSlot){
            currentSlot ++;
        }
        emit RankingSet(_round, _slot, _ranking);
        emit NewPitchUp(msg.sender, slotToToken[currentSlot]);
    }

    function invalidatePitch(uint256 _round, uint256 _slot, uint256 _newTopSlot) external onlyGuardian{
        slotToRanking[_slot] = 0;
        if(roundTopRankingSlot[_round] == _slot){
            roundTopRankingSlot[_round] = _newTopSlot;
        }
        emit PitchInvalidated( _round,_slot,_newTopSlot);
    }

    function closeRound() external onlyGuardian{
        //closes the current round, buys the tokens and sends it to the portfolio
        uint256 teamFee = roundToFees[currentRound]/2;
        investmentToken.transfer(guardian, teamFee);
        uint256 _sendAmt = investmentToken.balanceOf(address(this));
        investmentToken.transfer(fundingContract,_sendAmt); //send the rest to the fundingContract
        emit RoundClosed(currentRound,_sendAmt);
        currentRound += 1;
    }

    
    function getQueueLength() external view returns(uint256){
        return queue.length - currentSlot;
    }

    function getInvestmentShare(uint256 _round, address _lp) external view returns(uint256 _amount){
        require(_round > currentRound);
        return roundToInvestment[_round][_lp] * 1e18/ roundToTotalInvested[_round];
    }

    function getRoundToInvestment(uint256 _round, address _lp) external view returns(uint256 _amount){
        return roundToInvestment[_round][_lp];
    }

    function getRoundToTotalInvested(uint256 _round) external view returns(uint256 _amount){
        return roundToTotalInvested[_round];
    }
    
    function getRoundInvestors(uint256 _round) external view returns(address[] memory){
        return roundToInvestors[_round];
    }
}
