const { expect } = require("chai");

describe("SahAllianceMock", function () {
  const radha = "0xRadha";
  const meena = "0xMeena";
  const sunita = "0xSunita";
  const outsider = "0xOutsider";

  let SahAllianceMock, ENTRY_TYPE, LOAN_STATUS;

  before(async function () {
    ({ SahAllianceMock, ENTRY_TYPE, LOAN_STATUS } = await import("../mock/sahAllianceMock.mjs"));
  });

  async function deployCircle() {
    const mock = new SahAllianceMock();
    const tx = await mock.connect(radha).createCircle("Radha's Circle", [radha, meena, sunita]);
    const { circleId } = await tx.wait();
    return { mock, circleId };
  }

  describe("createCircle", function () {
    it("registers the circle with a majority vote threshold", async function () {
      const { mock, circleId } = await deployCircle();
      const circle = await mock.getCircle(circleId);
      expect(circle.name).to.equal("Radha's Circle");
      expect(circle.voteThreshold).to.equal(2n);
      expect(circle.members).to.have.lengthOf(3);
    });

    it("rejects a circle with fewer than 2 members", async function () {
      const mock = new SahAllianceMock();
      await expect(mock.connect(radha).createCircle("Too Small", [radha])).to.be.rejectedWith(
        "circle needs at least 2 members"
      );
    });

    it("rejects duplicate members", async function () {
      const mock = new SahAllianceMock();
      await expect(mock.connect(radha).createCircle("Dupe", [radha, radha, meena])).to.be.rejectedWith(
        "duplicate member"
      );
    });
  });

  describe("contribute", function () {
    it("moves value into the pot, returns confirmation timing, and records history", async function () {
      const { mock, circleId } = await deployCircle();
      const amount = 50_000_000_000_000_000n; // 0.05 in wei-equivalent units

      const tx = await mock.connect(radha).contribute(circleId, { value: amount });
      const receipt = await tx.wait();
      expect(receipt.potBalance).to.equal(amount);
      expect(receipt.confirmedInMs).to.be.a("number");

      const circle = await mock.getCircle(circleId);
      expect(circle.potBalance).to.equal(amount);

      const history = await mock.getMemberHistory(radha);
      expect(history).to.have.lengthOf(1);
      expect(history[0].entryType).to.equal(ENTRY_TYPE.Contribution);
      expect(history[0].amount).to.equal(amount);
    });

    it("reverts for a non-member", async function () {
      const { mock, circleId } = await deployCircle();
      await expect(mock.connect(outsider).contribute(circleId, { value: 100n })).to.be.rejectedWith(
        "not a circle member"
      );
    });

    it("reverts on a zero-value contribution", async function () {
      const { mock, circleId } = await deployCircle();
      await expect(mock.connect(radha).contribute(circleId, { value: 0n })).to.be.rejectedWith(
        "contribution must be positive"
      );
    });
  });

  describe("full loan lifecycle", function () {
    it("requests, votes, releases funds at threshold, and tracks repayment", async function () {
      const { mock, circleId } = await deployCircle();
      const contribution = 100_000_000_000_000_000n;

      for (const member of [radha, meena, sunita]) {
        await (await mock.connect(member).contribute(circleId, { value: contribution })).wait();
      }

      const loanAmount = 200_000_000_000_000_000n;
      const requestTx = await mock.connect(radha).requestLoan(circleId, loanAmount, "Sewing machine");
      const { loanId } = await requestTx.wait();

      const firstVote = await (await mock.connect(meena).voteOnLoan(loanId, true)).wait();
      expect(firstVote.released).to.equal(false);

      let loan = await mock.getLoan(loanId);
      expect(loan.status).to.equal(LOAN_STATUS.Pending);

      const secondVote = await (await mock.connect(sunita).voteOnLoan(loanId, true)).wait();
      expect(secondVote.released).to.equal(true);
      expect(secondVote.amount).to.equal(loanAmount);

      loan = await mock.getLoan(loanId);
      expect(loan.status).to.equal(LOAN_STATUS.Released);

      const circle = await mock.getCircle(circleId);
      expect(circle.potBalance).to.equal(contribution * 3n - loanAmount);

      const partial = 50_000_000_000_000_000n;
      await (await mock.connect(radha).repayLoan(loanId, { value: partial })).wait();
      loan = await mock.getLoan(loanId);
      expect(loan.amountRepaid).to.equal(partial);

      const remaining = loanAmount - partial;
      await (await mock.connect(radha).repayLoan(loanId, { value: remaining })).wait();
      loan = await mock.getLoan(loanId);
      expect(loan.amountRepaid).to.equal(loanAmount);

      const history = await mock.getMemberHistory(radha);
      const types = history.map((h) => h.entryType);
      expect(types).to.include(ENTRY_TYPE.LoanRequested);
      expect(types).to.include(ENTRY_TYPE.LoanReceived);
      expect(types).to.include(ENTRY_TYPE.Repayment);
    });

    it("caps an overpayment and reports the refund", async function () {
      const { mock, circleId } = await deployCircle();
      const contribution = 100_000_000_000_000_000n;
      for (const member of [radha, meena, sunita]) {
        await (await mock.connect(member).contribute(circleId, { value: contribution })).wait();
      }

      const loanAmount = 100_000_000_000_000_000n;
      const { loanId } = await (
        await mock.connect(radha).requestLoan(circleId, loanAmount, "Thread and cloth")
      ).wait();
      await (await mock.connect(meena).voteOnLoan(loanId, true)).wait();
      await (await mock.connect(sunita).voteOnLoan(loanId, true)).wait();

      const overpay = loanAmount + 50_000_000_000_000_000n;
      const receipt = await (await mock.connect(radha).repayLoan(loanId, { value: overpay })).wait();
      expect(receipt.accepted).to.equal(loanAmount);
      expect(receipt.refunded).to.equal(overpay - loanAmount);

      const loan = await mock.getLoan(loanId);
      expect(loan.amountRepaid).to.equal(loanAmount);
    });

    it("reverts requesting more than the pot holds", async function () {
      const { mock, circleId } = await deployCircle();
      await (await mock.connect(radha).contribute(circleId, { value: 10_000_000_000_000_000n })).wait();
      await expect(
        mock.connect(meena).requestLoan(circleId, 1_000_000_000_000_000_000n, "Too much")
      ).to.be.rejectedWith("amount exceeds pot balance");
    });

    it("reverts double-voting on the same loan", async function () {
      const { mock, circleId } = await deployCircle();
      await (await mock.connect(radha).contribute(circleId, { value: 100_000_000_000_000_000n })).wait();
      const { loanId } = await (
        await mock.connect(radha).requestLoan(circleId, 10_000_000_000_000_000n, "Thread")
      ).wait();
      await (await mock.connect(meena).voteOnLoan(loanId, true)).wait();
      await expect(mock.connect(meena).voteOnLoan(loanId, false)).to.be.rejectedWith("already voted");
    });

    it("reverts voting on an already-resolved loan", async function () {
      const { mock, circleId } = await deployCircle();
      const contribution = 100_000_000_000_000_000n;
      for (const member of [radha, meena, sunita]) {
        await (await mock.connect(member).contribute(circleId, { value: contribution })).wait();
      }
      const { loanId } = await (
        await mock.connect(radha).requestLoan(circleId, 50_000_000_000_000_000n, "Fabric")
      ).wait();
      await (await mock.connect(meena).voteOnLoan(loanId, true)).wait();
      await (await mock.connect(sunita).voteOnLoan(loanId, true)).wait();

      await expect(mock.connect(radha).voteOnLoan(loanId, true)).to.be.rejectedWith("loan already resolved");
    });

    it("reverts repaying against a loan that isn't released yet", async function () {
      const { mock, circleId } = await deployCircle();
      await (await mock.connect(radha).contribute(circleId, { value: 100_000_000_000_000_000n })).wait();
      const { loanId } = await (
        await mock.connect(radha).requestLoan(circleId, 50_000_000_000_000_000n, "Thread")
      ).wait();
      await expect(mock.connect(radha).repayLoan(loanId, { value: 10_000_000_000_000_000n })).to.be.rejectedWith(
        "loan not active"
      );
    });
  });
});
