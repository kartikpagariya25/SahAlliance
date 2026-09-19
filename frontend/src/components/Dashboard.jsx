import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { chain } from "../lib/chain.js";

export default function Dashboard({ address }) {
  const [circle, setCircle] = useState(null);
  const [feed, setFeed] = useState([]);
  const [amount, setAmount] = useState("");
  const [showContribute, setShowContribute] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [confirmMsg, setConfirmMsg] = useState(null);
  const navigate = useNavigate();

  async function load() {
    setCircle(await chain.getCircle());
    if (chain.getFeed) setFeed(await chain.getFeed());
  }

  useEffect(() => { load(); }, []);

  async function handleContribute() {
    if (!amount) return;
    const { confirmMs } = await chain.contribute(address, Number(amount));
    setConfirmMsg(`Confirmed in ${(confirmMs / 1000).toFixed(2)}s`);
    setAmount("");
    setShowContribute(false);
    await load();
    setTimeout(() => setConfirmMsg(null), 3000);
  }

  async function handleRequestLoan() {
    if (!amount || !purpose) return;
    const { loanId } = await chain.requestLoan(address, Number(amount), purpose);
    setShowRequest(false);
    navigate(`/loan/${loanId}`);
  }

  if (!circle) return <p>Loading circle...</p>;

  return (
    <div>
      {confirmMsg && <div className="confirm-toast">{confirmMsg}</div>}

      <div className="card">
        <div className="pot-label">{circle.name} · {circle.members?.length || 3} members</div>
        <div className="pot-balance">{circle.potBalance} MON</div>
        <div className="pot-label">Shared pot balance</div>

        <div className="avatar-row">
          {(circle.members || []).map((m) => (
            <Link key={m} to={`/history/${m}`}>
              <div className="avatar" title={chain.nameOf(m)}>{chain.nameOf(m).slice(0, 1)}</div>
            </Link>
          ))}
        </div>
      </div>

      {showContribute ? (
        <div className="card">
          <input placeholder="Amount (MON)" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <button className="btn btn-primary" onClick={handleContribute}>Confirm Contribution</button>
          <button className="btn btn-secondary" onClick={() => setShowContribute(false)}>Cancel</button>
        </div>
      ) : (
        <button className="btn btn-primary" onClick={() => setShowContribute(true)}>Contribute</button>
      )}

      {showRequest ? (
        <div className="card">
          <input placeholder="Amount (MON)" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <textarea placeholder="Purpose (e.g. sewing machine)" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          <button className="btn btn-primary" onClick={handleRequestLoan}>Submit Request</button>
          <button className="btn btn-secondary" onClick={() => setShowRequest(false)}>Cancel</button>
        </div>
      ) : (
        <button className="btn btn-secondary" onClick={() => setShowRequest(true)}>Request a loan</button>
      )}

      <div className="card">
        <h4 style={{ marginTop: 0 }}>Recent activity</h4>
        {feed.length === 0 && <p style={{ color: "var(--text-muted)" }}>No activity yet.</p>}
        {feed.map((f, i) => (
          <div className="feed-item" key={i}>
            <div>{describeEvent(f)}</div>
            <div className="feed-time">{new Date(f.timestamp).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function describeEvent(f) {
  const name = chain.nameOf(f.address);
  switch (f.type) {
    case "contribution": return `${name} contributed ${f.amount} MON`;
    case "loan_requested": return `${name} requested a loan: ${f.purpose}`;
    case "vote": return `${name} ${f.approve ? "approved" : "declined"} loan #${f.loanId}`;
    case "loan_released": return `${name}'s loan was released: ${f.amount} MON`;
    case "repayment": return `${name} repaid ${f.amount} MON`;
    default: return f.type;
  }
}
