//1、第一种写法
// function deployFunction(){
//     console.log("this is a function")
// }
// module.exports.default=deployFunction

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
    await deploy("FundMe",{
        from: firstAccount,
        args: [180],
        log: true
    })
}

module.exports.tags = ["all","fundme"]