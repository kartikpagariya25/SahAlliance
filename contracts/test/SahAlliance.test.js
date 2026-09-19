const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SahAlliance", function () {
  let contract, owner, a, b, c;

  beforeEach(async function () {
    [owner, a, b, c] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("SahAlliance");
    contract = await Factory.deploy();
    await contract.waitForDeployment();
    await contract.createCircle("Test Circle", [a.address, b.address, c.address]);
  });

  it("accepts contributions and updates pot balance", async function () {
    await contract.connect(a).contribute(1, { value: ethers.parseEther("1") });
    const circle = await contract.circles(1);
    expect(circle.potBalance).to.equal(ethers.parseEther("1"));
  });

  it("runs the full loan lifecycle: request -> vote -> release -> repay", async function () {
    await contract.connect(a).contribute(1, { value: ethers.parseEther("2") });
    await contract.connect(b).contribute(1, { value: ethers.parseEther("2") });

    await contract.connect(a).requestLoan(1, ethers.parseEther("1"), "sewing machine");

    await contract.connect(a).voteOnLoan(1, true);
    let loan = await contract.getLoan(1);
    expect(loan.status).to.equal(0); // Open, only 1/3 votes

    const balanceBefore = await ethers.provider.getBalance(a.address);
    await contract.connect(b).voteOnLoan(1, true); // 2/3 -> threshold met, releases
    loan = await contract.getLoan(1);
    expect(loan.status).to.equal(1); // Released
    const balanceAfter = await ethers.provider.getBalance(a.address);
    expect(balanceAfter).to.be.gt(balanceBefore);

    await contract.connect(a).repayLoan(1, { value: ethers.parseEther("1") });
    loan = await contract.getLoan(1);
    expect(loan.status).to.equal(2); // Repaid
    expect(loan.amountRepaid).to.equal(ethers.parseEther("1"));
  });

  it("rejects a second vote from the same member", async function () {
    await contract.connect(a).contribute(1, { value: ethers.parseEther("1") });
    await contract.connect(a).requestLoan(1, ethers.parseEther("0.1"), "test");
    await contract.connect(a).voteOnLoan(1, true);
    await expect(contract.connect(a).voteOnLoan(1, true)).to.be.revertedWith("already voted");
  });

  it("returns full member history", async function () {
    await contract.connect(a).contribute(1, { value: ethers.parseEther("1") });
    const history = await contract.getMemberHistory(a.address);
    expect(history.length).to.equal(1);
    expect(history[0].amount).to.equal(ethers.parseEther("1"));
  });
});
