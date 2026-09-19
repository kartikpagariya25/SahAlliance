import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { chain } from "../lib/chain.js";

export default function HistoryScreen() {
  const { memberAddress } = useParams();
  const [history, setHistory] = useState([]);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    chain.getHistory(memberAddress).then(setHistory);
  }, [memberAddress]);

  const contributions = history.filter((h) => h.type === "contribution").length;
  const loans = history.filter((h) => h.type === "loan_requested").length;
  const repayments = history.filter((h) => h.type === "repayment");
  const releases = history.filter((h) => h.type === "loan_released");

  let status = null;
  if (releases.length > 0) {
    const totalOwed = releases.reduce((s, r) => s + Number(r.amount), 0);
    const totalRepaid = repayments.reduce((s, r) => s + Number(r.amount), 0);
    if (totalRepaid <= 0) status = "outstanding";
    else if (totalRepaid < totalOwed) status = "partial";
    else status = "repaid";
  }

  return (
    <div>
      <Link className="nav-back" to="/">&larr; Back to Circle</Link>

      <div className="card">
        <h3 style={{ margin: "4px 0" }}>{chain.nameOf(memberAddress)}</h3>
        <p style={{ color: "var(--text-muted)" }}>
          {contributions} contributions · {loans} loan{loans !== 1 ? "s" : ""}{status ? `, ${statusLabel(status).toLowerCase()}` : ""}
        </p>
        {status && (
          <span className={`badge badge-${status === "partial" ? "partial" : status}`}>{statusLabel(status)}</span>
        )}
      </div>

      <div className="card">
        <h4 style={{ marginTop: 0 }}>Full history</h4>
        {history.length === 0 && <p style={{ color: "var(--text-muted)" }}>No activity yet.</p>}
        {history.map((h, i) => (
          <div className="feed-item" key={i}>
            <div>{label(h)}</div>
            <div className="feed-time">{new Date(h.timestamp).toLocaleString()}</div>
          </div>
        ))}
      </div>

      <button className="btn btn-secondary" onClick={() => setShowQr((v) => !v)}>
        {showQr ? "Hide" : "Share this history"}
      </button>
      {showQr && (
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)" }}>Scan to view this credit history</p>
          <div style={{ width: 140, height: 140, background: "#eee", margin: "0 auto", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            QR
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{memberAddress}</p>
        </div>
      )}
    </div>
  );
}

function statusLabel(s) {
  if (s === "outstanding") return "Outstanding";
  if (s === "partial") return "Partially repaid";
  return "Fully repaid";
}

function label(h) {
  switch (h.type) {
    case "contribution": return `Contributed ${h.amount} MON`;
    case "loan_requested": return `Requested a loan: ${h.purpose}`;
    case "loan_released": return `Loan received: ${h.amount} MON`;
    case "repayment": return `Repaid ${h.amount} MON`;
    default: return h.type;
  }
}
