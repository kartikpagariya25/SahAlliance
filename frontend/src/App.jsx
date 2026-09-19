import { Routes, Route } from "react-router-dom";
import { useWallet } from "./lib/useWallet.js";
import { chain } from "./lib/chain.js";
import Dashboard from "./components/Dashboard.jsx";
import LoanScreen from "./components/LoanScreen.jsx";
import HistoryScreen from "./components/HistoryScreen.jsx";

export default function App() {
  const { address, connect } = useWallet();

  if (!address) {
    return (
      <div className="app-shell" style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100vh" }}>
        <div className="card" style={{ textAlign: "center" }}>
          <h2>SahAlliance</h2>
          <p style={{ color: "var(--text-muted)" }}>Your Self-Help Group, on-chain.</p>
          <button className="btn btn-primary" onClick={connect}>Connect Wallet</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="topbar">
        <span className="brand">SahAlliance</span>
        <span className="wallet-pill">{chain.nameOf(address)}</span>
      </div>
      <Routes>
        <Route path="/" element={<Dashboard address={address} />} />
        <Route path="/loan/:loanId" element={<LoanScreen address={address} />} />
        <Route path="/history/:memberAddress" element={<HistoryScreen />} />
      </Routes>
    </div>
  );
}
