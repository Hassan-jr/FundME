const {networkConfig, developmentChains} = require("../helper-hardhat-config");
const  {verify} = require("../utils/verify")

module.exports= async ({getNamedAccounts, deployments}) => {
    const {deploy , log} = deployments;
    const {deployer} = await getNamedAccounts();
    const chainId = network.config.chainId;

    let ethUsdPriceFeedAddress 
  

    if (developmentChains.includes(network.name)){
       const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    }
    else{
         ethUsdPriceFeedAddress =  networkConfig[chainId]["ethUsdPriceFeed"];
    }

    const args = [ethUsdPriceFeedAddress]
    log("Deploying FundMe contract .............");
  
    const fundme =  await deploy ("FundMe", {
        
         from : deployer,
         log : true,
         args: args,
         waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
             verify(fundme.address,[ethUsdPriceFeedAddress]);
    }
   
    log("===========================================")
   

}

module.exports.tags=["all","fundme"]