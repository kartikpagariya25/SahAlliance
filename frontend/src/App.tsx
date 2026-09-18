import { Routes, Route } from "react-router-dom";
import { ChainProvider } from "./context/ChainContext";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { Landing } from "./pages/Landing";
import { HowItWorks } from "./pages/HowItWorks";
import { Dashboard } from "./pages/Dashboard";
import { LoanVoting } from "./pages/LoanVoting";
import { CreditHistory } from "./pages/CreditHistory";
import { Team } from "./pages/Team";

export default function App() {
  return (
    <ChainProvider>
      <div className="flex min-h-screen flex-col">
        <Nav />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/loan/:loanId" element={<LoanVoting />} />
            <Route path="/history" element={<CreditHistory />} />
            <Route path="/history/:address" element={<CreditHistory />} />
            <Route path="/team" element={<Team />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ChainProvider>
  );
}
