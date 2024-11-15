//1、第一种写法
// function deployFunction(){
//     console.log("this is a function")
// }
// module.exports.default=deployFunction

const { network } = require("hardhat")
const { devlopmentChains , networkConfig , LOCK_TIME , CONFIRMATIONS } = require("../help-hardhat-config")

//2、第二种写法
// module.exports= async(hre)=>{
//     const getNameAccounts = hre.getNameAccounts
//     const deployments = hre.deployments
//     console.log("this is a function")
// }

//3、第三种写法
module.exports= async({getNamedAccounts, deployments})=>{
    const {firstAccount} = await getNamedAccounts()
    const {deploy} = deployments

    
    let dataFeedAddr
    if(devlopmentChains.includes(network.name)){
        const mockV3Aggregator = await deployments.get("MockV3Aggregator")
        dataFeedAddr = mockV3Aggregator.address
    }else{
        dataFeedAddr = networkConfig[network.config.chainId].ethUsdDataFeed
    }

    // const mockDataFeed = await deployments.get("MockV3Aggregator")
    const fundMe = await deploy("FundMe",{
        from: firstAccount,
        // args: [180, mockDataFeed.address],
        args: [LOCK_TIME, dataFeedAddr],
        log: true,
        waitConfirmations: CONFIRMATIONS
    })
    //remove deployments directory or add "--reset" flag if you redeploy contract

    if(hre.network.config.chainId == 11155111 && process.env.EHTERSCAN_API_KEY){
        await hre.run("verify:verify", {
            address: fundMe.address,
            constructorArguments: [LOCK_TIME, dataFeedAddr],
          });
    }else{
        console.log("Network is not sepolia, verification skipped...")
    }
    
}

module.exports.tags = ["all","fundme"]