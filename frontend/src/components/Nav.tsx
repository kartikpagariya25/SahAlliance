import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { PersonaSwitcher } from "./PersonaSwitcher";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/how-it-works", label: "How it Works" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/history", label: "Credit History" },
  { to: "/team", label: "Team" },
];

export function Nav() {
  const { pathname } = useLocation();

  return (
    <header className="glass sticky top-0 z-50 border-b border-border">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <NavLink to="/" className="font-display text-xl text-ink">
          Sah<span className="text-gradient">Alliance</span>
        </NavLink>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {LINKS.map((link) => {
            const isActive = link.to === "/" ? pathname === "/" : pathname.startsWith(link.to);
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className="relative rounded-full px-3 py-1.5 font-medium text-ink-soft transition-colors hover:text-ink"
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className={`relative z-10 ${isActive ? "text-white" : ""}`}>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <PersonaSwitcher />
      </div>
    </header>
  );
}
