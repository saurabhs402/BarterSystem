require("@nomicfoundation/hardhat-toolbox")
require('dotenv').config() // for getting value using process.env deploy contract on network using provider or real node
require("@nomiclabs/hardhat-etherscan") // see code on explorer

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks:{
    hardhat:{
      chainId:1337
    },
    mumbai:{
      url:`https://polygon-mumbai.infura.io/v3/${process.env.INFURA_BFSC_KEY}`,
      accounts:[process.env.METAMASK_PRIVATE_KEY],
      chainId:80001
    },
    sepolia:{
      url:`https://sepolia.infura.io/v3/${process.env.INFURA_BFSC_KEY}`,
      accounts:[process.env.METAMASK_PRIVATE_KEY],
      chainId:11155111
    }
    
  },
  etherscan:{
    apiKey:process.env.ETHERSCAN_BARTER_API
  }
};
