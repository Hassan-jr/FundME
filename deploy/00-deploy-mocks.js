const {network} = require ("hardhat");
const {developmentChains,DECIMAL,INITAIL_ANSWER} = require("../helper-hardhat-config")

module.exports = async ({getNamedAccounts, deployments})=>{
    const {deploy, log} = deployments;  
    const {deployer} = await getNamedAccounts();
    const chainId = network.config.chainId

    if (developmentChains.includes(network.name)){
        log("Local deployment in process");
      await  deploy("MockV3Aggregator", {
            contract :"MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMAL,INITAIL_ANSWER],
        })
       log("MOCKS deployed");
       log("=================================================");
    }

}

module.exports.tags=["all","mocks"];
