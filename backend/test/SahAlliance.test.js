const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SahAlliance", function () {
  async function deployCircle() {
    const [radha, meena, sunita, outsider] = await ethers.getSigners();
    const SahAlliance = await ethers.getContractFactory("SahAlliance");
    const contract = await SahAlliance.deploy();

    const members = [radha.address, meena.address, sunita.address];
    const tx = await contract.createCircle("Radha's Circle", members);
    await tx.wait();
    const circleId = 0n;

    return { contract, radha, meena, sunita, outsider, circleId };
  }

  describe("createCircle", function () {
    it("registers the circle with a majority vote threshold", async function () {
      const { contract, circleId } = await deployCircle();
      const circle = await contract.getCircle(circleId);
      expect(circle.name).to.equal("Radha's Circle");
      expect(circle.voteThreshold).to.equal(2n); // majority of 3
      expect(circle.members).to.have.lengthOf(3);
    });

    it("rejects a circle with fewer than 2 members", async function () {
      const [solo] = await ethers.getSigners();
      const SahAlliance = await ethers.getContractFactory("SahAlliance");
      const contract = await SahAlliance.deploy();
      await expect(contract.createCircle("Too Small", [solo.address])).to.be.revertedWith(
        "circle needs at least 2 members"
      );
    });

    it("rejects duplicate members", async function () {
      const [a, b] = await ethers.getSigners();
      const SahAlliance = await ethers.getContractFactory("SahAlliance");
      const contract = await SahAlliance.deploy();
      await expect(contract.createCircle("Dupe", [a.address, a.address, b.address])).to.be.revertedWith(
        "duplicate member"
      );
    });
  });

  describe("contribute", function () {
    it("moves real value into the pot and records history", async function () {
      const { contract, radha, circleId } = await deployCircle();
      const amount = ethers.parseEther("0.05");

      await expect(contract.connect(radha).contribute(circleId, { value: amount }))
        .to.emit(contract, "Contributed")
        .withArgs(circleId, radha.address, amount, amount);

      const circle = await contract.getCircle(circleId);
      expect(circle.potBalance).to.equal(amount);

      const history = await contract.getMemberHistory(radha.address);
      expect(history).to.have.lengthOf(1);
      expect(history[0].entryType).to.equal(0n); // Contribution
      expect(history[0].amount).to.equal(amount);
    });

    it("reverts for a non-member", async function () {
      const { contract, outsider, circleId } = await deployCircle();
      await expect(
        contract.connect(outsider).contribute(circleId, { value: ethers.parseEther("0.01") })
      ).to.be.revertedWith("not a circle member");
    });

    it("reverts on a zero-value contribution", async function () {
      const { contract, radha, circleId } = await deployCircle();
      await expect(contract.connect(radha).contribute(circleId, { value: 0 })).to.be.revertedWith(
        "contribution must be positive"
      );
    });
  });

  describe("full loan lifecycle", function () {
    it("requests, votes, releases funds at threshold, and tracks repayment", async function () {
      const { contract, radha, meena, sunita, circleId } = await deployCircle();
      const contribution = ethers.parseEther("0.1");

      for (const member of [radha, meena, sunita]) {
        await contract.connect(member).contribute(circleId, { value: contribution });
      }

      const loanAmount = ethers.parseEther("0.2");
      await expect(contract.connect(radha).requestLoan(circleId, loanAmount, "Sewing machine"))
        .to.emit(contract, "LoanRequested")
        .withArgs(0n, circleId, radha.address, loanAmount, "Sewing machine");
      const loanId = 0n;

      await expect(contract.connect(meena).voteOnLoan(loanId, true))
        .to.emit(contract, "VoteCast")
        .withArgs(loanId, meena.address, true, 1n);

      const loanBeforeThreshold = await contract.getLoan(loanId);
      expect(loanBeforeThreshold.status).to.equal(0n); // Pending

      const borrowerBalanceBefore = await ethers.provider.getBalance(radha.address);

      await expect(contract.connect(sunita).voteOnLoan(loanId, true)).to.emit(contract, "LoanReleased");

      const borrowerBalanceAfter = await ethers.provider.getBalance(radha.address);
      expect(borrowerBalanceAfter - borrowerBalanceBefore).to.equal(loanAmount);

      const loanAfterThreshold = await contract.getLoan(loanId);
      expect(loanAfterThreshold.status).to.equal(1n); // Released

      const circleAfterRelease = await contract.getCircle(circleId);
      expect(circleAfterRelease.potBalance).to.equal(contribution * 3n - loanAmount);

      const partialRepayment = ethers.parseEther("0.05");
      await contract.connect(radha).repayLoan(loanId, { value: partialRepayment });
      let loan = await contract.getLoan(loanId);
      expect(loan.amountRepaid).to.equal(partialRepayment);

      const remaining = loanAmount - partialRepayment;
      await contract.connect(radha).repayLoan(loanId, { value: remaining });
      loan = await contract.getLoan(loanId);
      expect(loan.amountRepaid).to.equal(loanAmount);

      const history = await contract.getMemberHistory(radha.address);
      const types = history.map((h) => h.entryType);
      expect(types).to.include(1n); // LoanRequested
      expect(types).to.include(3n); // LoanReceived
      expect(types).to.include(4n); // Repayment
    });

    it("caps an overpayment and refunds the excess", async function () {
      const { contract, radha, meena, sunita, circleId } = await deployCircle();
      const contribution = ethers.parseEther("0.1");
      for (const member of [radha, meena, sunita]) {
        await contract.connect(member).contribute(circleId, { value: contribution });
      }

      const loanAmount = ethers.parseEther("0.1");
      await contract.connect(radha).requestLoan(circleId, loanAmount, "Thread and cloth");
      const loanId = 0n;
      await contract.connect(meena).voteOnLoan(loanId, true);
      await contract.connect(sunita).voteOnLoan(loanId, true);

      const overpay = loanAmount + ethers.parseEther("0.05");
      const balanceBefore = await ethers.provider.getBalance(radha.address);
      const tx = await contract.connect(radha).repayLoan(loanId, { value: overpay });
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(radha.address);

      expect(balanceBefore - balanceAfter - gasCost).to.equal(loanAmount);

      const loan = await contract.getLoan(loanId);
      expect(loan.amountRepaid).to.equal(loanAmount);
    });

    it("reverts requesting more than the pot holds", async function () {
      const { contract, radha, meena, circleId } = await deployCircle();
      await contract.connect(radha).contribute(circleId, { value: ethers.parseEther("0.01") });
      await expect(
        contract.connect(meena).requestLoan(circleId, ethers.parseEther("1"), "Too much")
      ).to.be.revertedWith("amount exceeds pot balance");
    });

    it("reverts double-voting on the same loan", async function () {
      const { contract, radha, meena, circleId } = await deployCircle();
      await contract.connect(radha).contribute(circleId, { value: ethers.parseEther("0.1") });
      await contract.connect(radha).requestLoan(circleId, ethers.parseEther("0.01"), "Thread");
      const loanId = 0n;
      await contract.connect(meena).voteOnLoan(loanId, true);
      await expect(contract.connect(meena).voteOnLoan(loanId, false)).to.be.revertedWith("already voted");
    });

    it("reverts voting on an already-resolved loan", async function () {
      const { contract, radha, meena, sunita, circleId } = await deployCircle();
      const contribution = ethers.parseEther("0.1");
      for (const member of [radha, meena, sunita]) {
        await contract.connect(member).contribute(circleId, { value: contribution });
      }
      await contract.connect(radha).requestLoan(circleId, ethers.parseEther("0.05"), "Fabric");
      const loanId = 0n;
      await contract.connect(meena).voteOnLoan(loanId, true);
      await contract.connect(sunita).voteOnLoan(loanId, true); // hits threshold, releases

      const [, , , , fourth] = await ethers.getSigners();
      await expect(contract.connect(radha).voteOnLoan(loanId, true)).to.be.revertedWith(
        "loan already resolved"
      );
    });

    it("reverts repaying more than the outstanding balance in one call gracefully by capping, and rejects repay on a non-released loan", async function () {
      const { contract, radha, meena, circleId } = await deployCircle();
      await contract.connect(radha).contribute(circleId, { value: ethers.parseEther("0.1") });
      await contract.connect(radha).requestLoan(circleId, ethers.parseEther("0.05"), "Thread");
      const loanId = 0n;
      await expect(contract.connect(radha).repayLoan(loanId, { value: ethers.parseEther("0.01") })).to.be
        .revertedWith("loan not active");
    });
  });
});
