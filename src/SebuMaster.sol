//Master holds most logic
//can pay fee to get in queue, takes ranking from AI, sends funds to guardian to buy tokens and send to portfolio


// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "./interfaces/IERC20.sol";


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
    IERC20 public feeToken;
    

    constructor(uint256 _fee,address _feeToken;address _guardian, address _sebu) public{
        fee = _fee;
        guardian = _guardian;
        sebu = _sebu;
        feeToken = IERC20(_feeToken);
    }


    function invest() external{
    }

    function withdrawFees()external onlyGuardian{
        //lets guardian pull out fees
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
}
