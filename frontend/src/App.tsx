import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChainProvider } from "./context/ChainContext";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { Landing } from "./pages/Landing";
import { HowItWorks } from "./pages/HowItWorks";
import { Dashboard } from "./pages/Dashboard";
import { LoanVoting } from "./pages/LoanVoting";
import { CreditHistory } from "./pages/CreditHistory";
import { Team } from "./pages/Team";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/loan/:loanId" element={<LoanVoting />} />
          <Route path="/history" element={<CreditHistory />} />
          <Route path="/history/:address" element={<CreditHistory />} />
          <Route path="/team" element={<Team />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ChainProvider>
      <div className="flex min-h-screen flex-col">
        <Nav />
        <main className="flex-1">
          <AnimatedRoutes />
        </main>
        <Footer />
      </div>
    </ChainProvider>
  );
}
