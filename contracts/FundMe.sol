//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";


//1.创建一个收款函数
//2.记录投资人并且查看
//3.在锁定期内，达到目标值，生产商可以提款
//4.在锁定期内，没有达到目标值，投资人在锁定期以后退款
// payable 表示可以收款的合约

contract FundMe {
    mapping (address => uint256) public fundersToAmount;//记录投资人并且查看
    uint256 constant MININUM_VALUE = 100 * 10 ** 18;//wei ,设置最小值
    uint constant TARGET = 1000 * 10 ** 18;// constant表示常量，这里设置目标值

    uint depolymentTimestamp;
    uint lockTime;// 单位：秒

    address erc20Addr;

    bool public getFundSuccess = false;

    //如果使用USD,需要使用预言机chainlink
    AggregatorV3Interface public dataFeed;
    address public owner;

    //构造函数
    constructor(uint _lockTime){
        //sepolia 测试网
        dataFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        owner = msg.sender;
        depolymentTimestamp = block.timestamp;
        lockTime = _lockTime;
    }

    function fund() external payable {//创建一个收款函数
        require(convertEthToUsd(msg.value) >= MININUM_VALUE, "send more ETH");
        require(block.timestamp < depolymentTimestamp + lockTime, "window is colsed");
        fundersToAmount[msg.sender] =  msg.value;
    }

    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    function convertEthToUsd(uint256 ethAmount) internal view returns(uint256){
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        return ethAmount * ethPrice / (10 ** 8);
    }

    function transferOwnership(address newOwner) public onlyOwner{
        //require(msg.sender == owner,"this function can only be called by owner");
        owner = newOwner;
    }

    function getFund() external windosClose onlyOwner{
        require(convertEthToUsd(address(this).balance) >= TARGET,"Target is not reached");
        //require(msg.sender == owner,"this function can only be called by owner");
        
        //require(block.timestamp >= depolymentTimestamp + lockTime, "window is not colsed");
        // 1、transfer: transfer ETH and revert if tx failed
        // payable(msg.sender).transfer(address(this).balance);

        // 2 、send：transfer ETH and return false if failed
        // bool success =  payable(msg.sender).send(address(this).balance);
        // require(success,"tx failed");

        // 3、call: transfer ETH with data return value of function and bool
        bool success;
        (success , ) = payable(msg.sender).call{value: address(this).balance}("");
        require(success,"transfer tx failed");
        fundersToAmount[msg.sender] = 0;
        getFundSuccess = true;//flag
    }

    function refund() external windosClose {
        require(convertEthToUsd(address(this).balance) < TARGET,"Target is reached");
        require(fundersToAmount[msg.sender] != 0 ,"there is no fund for you");
        //require(block.timestamp >= depolymentTimestamp + lockTime, "window is not colsed");
        bool success;
        (success , ) = payable(msg.sender).call{value: fundersToAmount[msg.sender]}("");
        require(success,"transfer tx failed");
        fundersToAmount[msg.sender] = 0;
    }

    function setFunderToAmount(address funder, uint256 amountToUpdate) external {
        require(msg.sender == erc20Addr,"you do not have permission to call this function");
        fundersToAmount[funder] = amountToUpdate;
    }

    function setErc20Addr(address _erc20Addr) public onlyOwner {
        erc20Addr = _erc20Addr;
    }

    //抽取公共方法，_在下面的位置，表示是先执行windosClose的方法，后执行后续的逻辑；或者其他先后逻辑。
    modifier windosClose(){
        require(block.timestamp >= depolymentTimestamp + lockTime, "window is not colsed");
        _;

    }

    modifier onlyOwner(){
        require(msg.sender == owner,"this function can only be called by owner");
        _;

    }


}