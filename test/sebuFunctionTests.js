const { expect, assert } = require("chai");
const { ethers } = require("hardhat");


let fee = ethers.parseEther("5", 'wei'); //5USDC
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
        await token.mint(accounts[2],ethers.parseEther("100", 'wei'))//mint some USDC
        await token.mint(accounts[3],ethers.parseEther("100", 'wei'))
        await token.mint(accounts[4],ethers.parseEther("100", 'wei'))
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
        await expect(sebu.connect(accounts[2]).invest(ethers.parseEther("10", 'wei'))).to.be.reverted;//try without approval
        await token.connect(accounts[2]).approve(sebu.target,ethers.parseEther("10", 'wei'))
        await sebu.connect(accounts[2]).invest(ethers.parseEther("10", 'wei'))
        assert(await sebu.getRoundToTotalInvested(1) == ethers.parseEther("10", 'wei'))
        assert(await sebu.getRoundToInvestment(1,accounts[2].address) == ethers.parseEther("10", 'wei'))
        let invAr = await sebu.getRoundInvestors(1)
        assert(invAr[0] == accounts[2].address)
    });
    it("pitch()", async function() {
        await expect(sebu.connect(accounts[2]).pitch(samplePitch.target)).to.be.reverted;//must approve
        await token.connect(accounts[2]).approve(sebu.target,ethers.parseEther("5", 'wei'))
        await sebu.connect(accounts[2]).pitch(samplePitch.target);
        await expect(sebu.connect(accounts[2]).pitch(samplePitch.target)).to.be.reverted;//cannot pitch twice
        assert(await token.balanceOf(accounts[2].address) == ethers.parseEther("95", 'wei')) //assert fee correct (correct amount taken out)
        assert(await sebu.getRoundToFees(1) == ethers.parseEther("5", 'wei'))
        assert(await sebu.getFounderToSlotByRound(1,accounts[2].address) == 1, "slot should be correct")
        let _q = await sebu.getQueue()
        assert(_q[1] == accounts[2].address, "slot in q should be correct")
        assert(await sebu.currentSlot() == 1)
    });
    it("setRanking()", async function() {
        await token.connect(accounts[2]).approve(sebu.target,ethers.parseEther("5", 'wei'))
        await sebu.connect(accounts[2]).pitch(samplePitch.target);
        await expect(sebu.connect(accounts[2]).setRanking(1,1,100)).to.be.reverted;//must be shepard
        await expect(sebu.connect(shepard).setRanking(1,3,50)).to.be.reverted;//must be currentSlot
        await sebu.connect(shepard).setRanking(1,1,50)
        assert(await sebu.getSlotToRanking(1) == 50);
        assert(await sebu.getRoundTopRankingSlot(1) == 1);
        assert(await sebu.currentSlot() == 2)
    });
    it("invalidatePitch()", async function() {
        await token.connect(accounts[2]).approve(sebu.target,ethers.parseEther("5", 'wei'))
        await sebu.connect(accounts[2]).pitch(samplePitch.target);
        await sebu.connect(shepard).setRanking(1,1,50);
        await expect(sebu.connect(accounts[2]).invalidatePitch(1,1,0)).to.be.reverted;//must be guardian
        await sebu.connect(guardian).invalidatePitch(1,1,0)
        assert(await sebu.getSlotToRanking(1) == 0);
        assert(await sebu.getRoundTopRankingSlot(1) == 0);
        assert(await sebu.currentSlot() == 2)
    });
    it("closeRound()", async function() {
        await token.connect(accounts[2]).approve(sebu.target,ethers.parseEther("10", 'wei'))
        await sebu.connect(accounts[2]).invest(ethers.parseEther("10", 'wei'))
        await token.connect(accounts[2]).approve(sebu.target,ethers.parseEther("5", 'wei'))
        await sebu.connect(accounts[2]).pitch(samplePitch.target);
        await sebu.connect(shepard).setRanking(1,1,50);
        await expect(sebu.connect(accounts[2]).closeRound()).to.be.reverted;//must be guardian
        await sebu.connect(guardian).closeRound()
        assert(await token.balanceOf(guardian.address) == ethers.parseEther("2.5"))
        assert(await token.balanceOf(fundingContract.target) == ethers.parseEther("12.5", 'wei'))
        assert(await sebu.currentRound() == 2);
    });
    it("getQueueLength()", async function() {
        await token.connect(accounts[2]).approve(sebu.target,ethers.parseEther("5", 'wei'))
        await sebu.connect(accounts[2]).pitch(samplePitch.target);
        await token.connect(accounts[3]).approve(sebu.target,ethers.parseEther("10", 'wei'))
        await sebu.connect(accounts[3]).pitch(accounts[3].address);
        await sebu.connect(shepard).setRanking(1,1,50);
        assert(await sebu.getQueueLength() == 1)
    });
    it("getInvestmentShare()", async function() {
        await token.connect(accounts[2]).approve(sebu.target,ethers.parseEther("10", 'wei'))
        await sebu.connect(accounts[2]).invest(ethers.parseEther("10", 'wei'))
        await token.connect(accounts[3]).approve(sebu.target,ethers.parseEther("50", 'wei'))
        await sebu.connect(accounts[3]).invest(ethers.parseEther("50", 'wei'))
        await token.connect(accounts[4]).approve(sebu.target,ethers.parseEther("40", 'wei'))
        await sebu.connect(accounts[4]).invest(ethers.parseEther("40", 'wei'))
        await token.connect(accounts[2]).approve(sebu.target,ethers.parseEther("5", 'wei'))
        await sebu.connect(accounts[2]).pitch(samplePitch.target);
        await sebu.connect(shepard).setRanking(1,1,50);
        await sebu.connect(guardian).closeRound()
        assert(await sebu.getInvestmentShare(1,accounts[2].address) == ethers.parseEther(".1", 'wei'))
    });
});