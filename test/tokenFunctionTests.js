const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("token - function tests", function() {
    async function deploy(contractName, ...args) {
        const Factory = await ethers.getContractFactory(contractName)
        const instance = await Factory.deploy(...args)
        return instance.waitForDeployment()
      }
    let token,accounts
    beforeEach(async function () {
        accounts = await ethers.getSigners();
        token = await deploy("MockERC20","mock token", "MT");
    });
    it("constructor()", async function() {
        console.log("Token.sol")
            assert(await token.name() == "mock token")
            assert(await token.symbol() == "MT")
    });
    it("approve()", async function() {
        await token.connect(accounts[2]).approve(accounts[3].address,ethers.formatUnits("200", 'wei'))
        assert(await token.allowance(accounts[2].address,accounts[3].address) == ethers.formatUnits("200", 'wei'))
    });
    it("transfer()", async function() {
        await token.connect(accounts[1]).mint(accounts[2].address,ethers.formatUnits("100", 'wei'))
        await token.connect(accounts[2]).transfer(accounts[3].address,ethers.formatUnits("20", 'wei'))
        assert(await token.balanceOf(accounts[3].address) == ethers.formatUnits("20", 'wei'), "transfer should work")
        await expect(token.connect(accounts[3]).transfer(accounts[5].address,ethers.formatUnits("100", 'wei'))).to.be.reverted;
    });
    it("transferFrom()", async function() {
        await token.connect(accounts[1]).mint(accounts[2].address,ethers.formatUnits("100", 'wei'))
        await token.connect(accounts[2]).approve(accounts[4].address,ethers.formatUnits("20", 'wei'))
        await token.connect(accounts[4]).transferFrom(accounts[2].address,accounts[3].address,ethers.formatUnits("20", 'wei'))
        assert(await token.balanceOf(accounts[3].address) == ethers.formatUnits("20", 'wei'), "transfer should work")
        await expect(token.connect(accounts[3]).transferFrom(accounts[5].address,accounts[3].address,ethers.formatUnits("100", 'wei'))).to.be.reverted;
    });
    it("decimals()", async function() {
        assert(await token.decimals() == 18, "decimals should be correct")
    });
    it("totalSupply()", async function() {
        await token.connect(accounts[1]).mint(accounts[2].address,ethers.formatUnits("100", 'wei'))
        await token.connect(accounts[1]).mint(accounts[3].address,ethers.formatUnits("100", 'wei'))
        await token.connect(accounts[1]).mint(accounts[4].address,ethers.formatUnits("100", 'wei'))
        assert(await token.totalSupply() == ethers.formatUnits("300", 'wei'))
    });
    it("_mint()", async function() {
        await token.connect(accounts[1]).mint(accounts[2].address,ethers.formatUnits("100", 'wei'))
        assert(await token.balanceOf(accounts[2].address) == ethers.formatUnits("100", 'wei'), "mint balance should be correct")
    });
    it("_burn()", async function() {
        await token.connect(accounts[1]).mint(accounts[2].address,ethers.formatUnits("100", 'wei'))
        await token.connect(accounts[1]).burn(accounts[2].address,ethers.formatUnits("20", 'wei'))
        assert(await token.balanceOf(accounts[2].address) == ethers.formatUnits("80", 'wei'), "burn should work")
        await expect(token.connect(accounts[3]).burn(accounts[2].address,ethers.formatUnits("100", 'wei'))).to.be.reverted;
        });
});