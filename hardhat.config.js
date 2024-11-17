require("@nomicfoundation/hardhat-toolbox");
//require("dotenv").config();
require("@chainlink/env-enc").config();
require("./tasks")
require("hardhat-deploy")
require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy");
require("hardhat-deploy-ethers");

const { ProxyAgent, setGlobalDispatcher } = require("undici");
const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
setGlobalDispatcher(proxyAgent);

const SEPOLIA_URL = process.env.SEPOLIA_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const EHTERSCAN_API_KEY = process.env.EHTERSCAN_API_KEY
const PRIVATE_KEY_1 = process.env.PRIVATE_KEY_1
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  defaultNetwork: "hardhat",
  mocha:{
    timeout: 300000
  },
  networks:{
    sepolia:{
      url: SEPOLIA_URL,
      //url: "https://eth-sepolia.g.alchemy.com/v2/nrweZAxQom6FIvogJsvATOVj6crivJrk",
      //accounts: ["9e8dfd05df17259417041db299a58b3c0e89685b8bc48cbb3c3614f097f150ec"]
      accounts: [PRIVATE_KEY,PRIVATE_KEY_1],
      chainId: 11155111
    }
  },
  etherscan:{
    apiKey: {
      sepolia:EHTERSCAN_API_KEY
    }
  },
  namedAccounts: {
      firstAccount:{
        default: 0
      },
      secondAccount:{
        default: 1
      },
  },
  gasReporter: {
    enabled: true

  }

};
