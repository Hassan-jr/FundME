const {deployments, ethers, getNamedAccounts} = require("hardhat")
const {assert, expect} = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")



!developmentChains.includes(network.name)
    ? describe.skip
    :describe("FunMe", async()=>{
    let fundme
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1")

    // first deploy all contract then get fundme
      beforeEach(async()=>{
       // deployer = (await getNamedAccounts()).deployer
        const accounts =  await ethers.getSigners();
        deployer = accounts[0]
        await deployments.fixture(["all"])
        fundme = await ethers.getContract("FundMe", deployer )
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);

      })

// test constructor
    describe("constructor", async()=>{
       it("sets the aggregator correctly", async()=>{
            const response = await fundme.s_priceFeed();
            assert.equal( response, mockV3Aggregator.address)
       })
    })

    // fund

    describe("fund", async()=>{
      it("Fails if  there is no enoth eth", async()=>{
        await expect( fundme.fund()).to.be.revertedWith("You need to spend more ETH!")
      })

      it ("Updates the mapping ", async()=>{
          await fundme.fund({value: sendValue})
          const res = await fundme.s_addressToAmountFunded(deployer.address)
          assert.equal(res.toString(), sendValue.toString())
      })

      it ("adds s_funders to array of s_funders", async()=>{
        await fundme.fund({value: sendValue})
         const res = await fundme.s_funders(0)
         assert.equal(res, deployer.address)
      })
    })

    // withdaw

    describe("withdraw", async()=>{
      //fund b4 widthdraw
      beforeEach(async()=>{
        await fundme.fund({value: sendValue})
      })

      it ("can withdraw from one founder", async()=>{
        const firstFundMebalance = await ethers.provider.getBalance(fundme.address)
        const firstDeployerbalance = await ethers.provider.getBalance(deployer.address)
        // widraw
        const transactionResponse = await fundme.withdraw()
        const transactionReceipt = await transactionResponse.wait(1)
        const { gasUsed, effectiveGasPrice } = transactionReceipt
        const gasCost = gasUsed.mul(effectiveGasPrice)
        //again check balance
        const endingFundMebalance = await ethers.provider.getBalance(fundme.address)
        const  endDeployerbalance = await ethers.provider.getBalance(deployer.address)

        assert.equal(endingFundMebalance,0)
        assert.equal( firstDeployerbalance.add(firstFundMebalance).toString(),
                      endDeployerbalance.add(gasCost).toString()
         )
      })

      it("allows to withdraw from many s_funders",async()=>{
        // many connect to the  contract and send value
        const accounts = await ethers.getSigners()
         for(let i = 1; i<6; i++){
          const fundmeConectedContracts = await fundme.connect(accounts[i]);
           await fundmeConectedContracts.fund({value: sendValue})
         }

          // balances
          const firstFundMebalance = await ethers.provider.getBalance(fundme.address)
          const firstDeployerbalance = await ethers.provider.getBalance(deployer.address)

           // widraw
        const transactionResponse = await fundme.withdraw()
        const transactionReceipt = await transactionResponse.wait(1)
        const { gasUsed, effectiveGasPrice } = transactionReceipt
        const gasCost = gasUsed.mul(effectiveGasPrice)
        //again check balance
        const endingFundMebalance = await ethers.provider.getBalance(fundme.address)
        const  endDeployerbalance = await ethers.provider.getBalance(deployer.address)

        assert.equal(endingFundMebalance,0)
        assert.equal( firstDeployerbalance.add(firstFundMebalance).toString(),
                      endDeployerbalance.add(gasCost).toString()
         )

         await expect( fundme.s_funders(0)).to.be.reverted
         for(let i=0; i<6; i++){
          assert.equal (await fundme.s_addressToAmountFunded(accounts[i].address),0)
         }

      })

      it ("only Owner",async()=>{
          const accounts = await ethers.getSigners()
          const attaker = accounts[1]
         const attakerConnected = await fundme.connect(attaker);
         expect(attakerConnected.withdraw()).to.be.revertedWith("ONLY OWNER CAN ACCESS")
      })

    })
})