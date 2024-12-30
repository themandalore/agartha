const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("token - function tests", function() {
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
        sebu = await deploy("SebuMaster",token.address,guardian.address,shepard.address,fundingContract.address);
    });
    it("constructor()", async function() {
        console.log("Token.sol")
            assert(await token.name() == "mock token")
            assert(await token.symbol() == "MT")
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
        await token.connect(accounts[2]).approve(accounts[3].address,ethers.formatUnits("200", 'wei'))
        assert(await token.allowance(accounts[2].address,accounts[3].address) == ethers.formatUnits("200", 'wei'))
    });

    it("closeRound()", async function() {
        await token.connect(accounts[2]).approve(accounts[3].address,ethers.formatUnits("200", 'wei'))
        assert(await token.allowance(accounts[2].address,accounts[3].address) == ethers.formatUnits("200", 'wei'))
    });

    it("getQueueLenght()", async function() {
        await token.connect(accounts[2]).approve(accounts[3].address,ethers.formatUnits("200", 'wei'))
        assert(await token.allowance(accounts[2].address,accounts[3].address) == ethers.formatUnits("200", 'wei'))
    });
    it("getInvestment()", async function() {
        await token.connect(accounts[2]).approve(accounts[3].address,ethers.formatUnits("200", 'wei'))
        assert(await token.allowance(accounts[2].address,accounts[3].address) == ethers.formatUnits("200", 'wei'))
    });
});