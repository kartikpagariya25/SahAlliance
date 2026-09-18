import { NavLink } from "react-router-dom";
import { PersonaSwitcher } from "./PersonaSwitcher";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/how-it-works", label: "How it Works" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/history", label: "Credit History" },
  { to: "/team", label: "Team" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <NavLink to="/" className="font-display text-xl text-ink">
          SahAlliance
        </NavLink>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 font-medium transition-colors ${
                  isActive ? "bg-terracotta text-white" : "text-ink-soft hover:bg-terracotta-soft"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <PersonaSwitcher />
      </div>
    </header>
  );
}
