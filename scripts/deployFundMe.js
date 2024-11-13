//import ethers.js
//create main function
    // init 2 accounts
    // fund contract with first account
    // fund contract with second account
    // check balance of contract
    // check mapping funderToAmount
//execute main function

const { ethers } = require("hardhat")

async function main(){
    //create factory
    const fundMeFactory = await ethers.getContractFactory("FundMe")
    console.log("contract is deploying")
    //deploy contract from factory
    //并不能保证一定写入链上，只是执行了这个动作
    const fundMe = await fundMeFactory.deploy(300)
    await fundMe.waitForDeployment()
    console.log(`contract has been deployed successfully, contract address is ${fundMe.target}`);
    
    //verify fundme
    if(hre.network.config.chainId == 11155111 && process.env.EHTERSCAN_API_KEY){
        console.log("waiting for 5 confirmations")
        await fundMe.deploymentTransaction().wait(5)
        await verifyFundMe(fundMe.target, [300]) 
    }else{
        console.log("verification skipped..")
    }
    // init 2 accounts
    const [firstAccount, secondAccount] = await ethers.getSigners()

    // fund contract with first account
    const fundTx = await fundMe.fund({value: ethers.parseEther("0.5")})
    await fundTx.wait()

    // check balance of contract
    const balanceOfContract = await ethers.provider.getBalance(fundMe.target)
    console.log(`balance of the contract is  ${balanceOfContract}`);
    
    // fund contract with second account
    const fundTxWithSecondAccount = await fundMe.connect(secondAccount).fund({value: ethers.parseEther("0.5")})
    await fundTxWithSecondAccount.wait()

     // check balance of contract
     const balanceOfContractAfterSecondFund = await ethers.provider.getBalance(fundMe.target)
     console.log(`balance of the contract is  ${balanceOfContractAfterSecondFund}`);
     
    // check mapping funderToAmount
    const firstAccountBalanceInFundMe = await fundMe.fundersToAmount(firstAccount.address)
    const secondAccountBalanceInFundMe = await fundMe.fundersToAmount(secondAccount.address)
    console.log(`balance of first account is  ${firstAccount.address} is ${firstAccountBalanceInFundMe}`);
    console.log(`balance of first account is  ${secondAccount.address} is ${secondAccountBalanceInFundMe}`);
}

async function verifyFundMe(fundMeAddr, args) {
    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: args,
      });
}

main().then().catch((error) => {
    console.error(error)
    process.exit(0)
})