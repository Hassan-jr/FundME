const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundme
          let deployer
          let sendValue = ethers.utils.parseEther("0.1")

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              fundme = await ethers.getContract("FundMe", deployer)
          })

          it("Funds and withdraw", async () => {
              await fundme.fund({ value: sendValue })
              await fundme.withdraw({
                  gasLimit: 1000000,
              })

              const endingFundMeBalance = await ethers.provider.getBalance(
                  fundme.address
              )
              assert.equal(endingFundMeBalance.toString(), "0")
          })
      })
