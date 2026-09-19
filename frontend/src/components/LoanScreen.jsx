import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { chain } from "../lib/chain.js";

export default function LoanScreen({ address }) {
  const { loanId } = useParams();
  const [loan, setLoan] = useState(null);
  const [confirmMsg, setConfirmMsg] = useState(null);
  const [repayAmount, setRepayAmount] = useState("");

  async function load() {
    if (chain.getLoans) {
      const loans = await chain.getLoans();
      setLoan(loans.find((l) => String(l.id) === String(loanId)));
    } else if (chain.getLoan) {
      setLoan(await chain.getLoan(loanId));
    }
  }

  useEffect(() => { load(); }, [loanId]);

  async function handleVote(approve) {
    const { confirmMs, released } = await chain.vote(Number(loanId), address, approve);
    setConfirmMsg(`Confirmed in ${(confirmMs / 1000).toFixed(2)}s${released ? " — loan released!" : ""}`);
    await load();
    setTimeout(() => setConfirmMsg(null), 4000);
  }

  async function handleRepay() {
    if (!repayAmount) return;
    const { confirmMs } = await chain.repay(Number(loanId), address, Number(repayAmount));
    setConfirmMsg(`Confirmed in ${(confirmMs / 1000).toFixed(2)}s`);
    setRepayAmount("");
    await load();
    setTimeout(() => setConfirmMsg(null), 4000);
  }

  if (!loan) return <p>Loading loan...</p>;

  const alreadyVoted = loan.voters ? Object.prototype.hasOwnProperty.call(loan.voters, address) : false;
  const status = String(loan.status);
  const isOpen = status === "open" || status === "0";
  const isReleased = status === "released" || status === "1";
  const isRepaid = status === "repaid" || status === "2";
  const threshold = 2; // 3-member demo circle, majority

  return (
    <div>
      <Link className="nav-back" to="/">&larr; Back to Circle</Link>
      {confirmMsg && <div className="confirm-toast">{confirmMsg}</div>}

      <div className="card">
        <div className="avatar" style={{ marginBottom: 10 }}>{chain.nameOf(loan.borrower).slice(0, 1)}</div>
        <h3 style={{ margin: "4px 0" }}>{chain.nameOf(loan.borrower)} requested {loan.amount} MON</h3>
        <p style={{ color: "var(--text-muted)" }}>{loan.purpose}</p>

        {isOpen && (
          <>
            <div className="progress-ring-label">{loan.yesVotes} of {threshold} needed</div>
            {!alreadyVoted ? (
              <div className="btn-row">
                <button className="btn btn-approve" onClick={() => handleVote(true)}>Approve</button>
                <button className="btn btn-decline" onClick={() => handleVote(false)}>Decline</button>
              </div>
            ) : (
              <p>You've already voted on this loan ✓</p>
            )}
          </>
        )}

        {isReleased && (
          <>
            <span className="badge badge-outstanding">Loan released — funds sent</span>
            {address === loan.borrower && (
              <div style={{ marginTop: 16 }}>
                <input placeholder="Repay amount (MON)" value={repayAmount} onChange={(e) => setRepayAmount(e.target.value)} />
                <button className="btn btn-primary" onClick={handleRepay}>Repay</button>
              </div>
            )}
          </>
        )}

        {isRepaid && <span className="badge badge-repaid">Fully repaid ✓</span>}
      </div>
    </div>
  );
}
