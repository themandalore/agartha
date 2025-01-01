const { expect, assert } = require("chai");
const { ethers } = require("hardhat");


let fee = ethers.formatUnits("5", 'wei'); //5USDC
describe("sebuMaster - function tests", function() {
    async function deploy(contractName, ...args) {
        const Factory = await ethers.getContractFactory(contractName)
        const instance = await Factory.deploy(...args)
        return instance.waitForDeployment()
      }
    let token,accounts, guardian, sebu, shepard, fundingContract, samplePitch
    beforeEach(async function () {
        accounts = await ethers.getSigners();
        guardian = accounts[0]
        shepard = accounts[1]
        token = await deploy("MockERC20","mock token", "MT");
        samplePitch = await deploy("MockERC20","SampleMeme", "meme")
        fundingContract = await deploy("Funding")
        sebu = await deploy("SebuMaster",fee,token.target,guardian.address,shepard.address,fundingContract.target);
        portfolio = await deploy("Portfolio","portfolioPoolToken","ppT",sebu.target);
        await fundingContract.setPortfolio(portfolio.target)
        await sebu.init(portfolio.target);
        await token.mint(accounts[2],ethers.formatUnits("100", 'wei'))//mint some USDC
        await token.mint(accounts[3],ethers.formatUnits("100", 'wei'))
        await token.mint(accounts[4],ethers.formatUnits("100", 'wei'))
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
        let sebu2 = await deploy("SebuMaster",fee,token.target,accounts[1].address,shepard.address,fundingContract.target);
        assert(await sebu2.portfolio() == ethers.ZeroAddress)
        await expect(sebu2.init(portfolio.target)).to.be.reverted;//only guardian
        await sebu2.connect(accounts[1]).init(portfolio.target)
        assert(await sebu2.portfolio() == portfolio.target)       
    });
    it("invest()", async function() {
        //set initial variables
        await expect(sebu.connect(accounts[2]).invest(ethers.formatUnits("10", 'wei'))).to.be.reverted;//only guardian
        //try without approval
        await token.connect(accounts[2]).approve(sebu.target,ethers.formatUnits("10", 'wei'))
        await sebu.connect(accounts[2]).invest(ethers.formatUnits("10", 'wei'))
        assert(await sebu.getRoundToTotalInvested(1) == ethers.formatUnits("10", 'wei'))
        assert(await sebu.getRoundToInvestment(1,accounts[2].address) == ethers.formatUnits("10", 'wei'))
        let invAr = await sebu.getRoundInvestors(1)
        assert(invAr[0] == accounts[2].address)
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