const { expect, assert } = require("chai");
const { ethers } = require("hardhat");


let fee = ethers.formatUnits("5", 'wei'); //5USDC
describe("sebuMaster - function tests", function() {
    async function deploy(contractName, ...args) {
        const Factory = await ethers.getContractFactory(contractName)
        const instance = await Factory.deploy(...args)
        return instance.waitForDeployment()
      }
    let token,accounts, guardian, sebu, shepard, fundingContract
    beforeEach(async function () {
        accounts = await ethers.getSigners();
        guardian = accounts[0]
        shepard = accounts[1]
        token = await deploy("MockERC20","mock token", "MT");
        fundingContract = await deploy("Funding")
        sebu = await deploy("SebuMaster",fee,token.target,guardian.address,shepard.address,fundingContract.target);
        portfolio = await deploy("Portfolio","portfolioPoolToken","ppT",sebu.target);
        await fundingContract.setPortfolio(portfolio.target)
        await sebu.init(portfolio.target);
    });
    it("constructor()", async function() {
            assert(await sebu.fee() == fee)
            assert(await sebu.guardian() == guardian.address, "guardian should be correct")
            assert(await sebu.shepard() == shepard.address)
            assert(await sebu.fundingContract() == fundingContract.target)
            assert(await sebu.investmentToken() == token.target)
            assert(await sebu.currentRound() == 1)
    });
    it("init()", async function() {

        assert(await token.allowance(accounts[2].address,accounts[3].address) == ethers.formatUnits("200", 'wei'))
    });
    it("invest()", async function() {

        assert(await token.allowance(accounts[2].address,accounts[3].address) == ethers.formatUnits("200", 'wei'))
    });

    it("pitch()", async function() {

        assert(await token.allowance(accounts[2].address,accounts[3].address) == ethers.formatUnits("200", 'wei'))
    });

    it("setRanking()", async function() {
        assert(await token.allowance(accounts[2].address,accounts[3].address) == ethers.formatUnits("200", 'wei'))
    });

    it("invalidatePitch()", async function() {
        assert(await token.allowance(accounts[2].address,accounts[3].address) == ethers.formatUnits("200", 'wei'))
    });

    it("closeRound()", async function() {
        assert(await token.allowance(accounts[2].address,accounts[3].address) == ethers.formatUnits("200", 'wei'))
    });

    it("getQueueLenght()", async function() {
        assert(await token.allowance(accounts[2].address,accounts[3].address) == ethers.formatUnits("200", 'wei'))
    });
    it("getInvestment()", async function() {
        assert(await token.allowance(accounts[2].address,accounts[3].address) == ethers.formatUnits("200", 'wei'))
    });
});