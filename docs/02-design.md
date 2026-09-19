# SahAlliance — Design Specification

## 1. Design principles

- **Feels like a real consumer app, not a crypto tool.** No wallet addresses shown as the primary identifier anywhere a member's name is known — use names/avatars, tuck the address away as secondary detail.
- **Every action shows its own proof, immediately.** The moment something happens on-chain, the screen shows it happened — confirmation time, updated balance, updated status — with no ambiguity about whether an action succeeded.
- **The credit-history screen is the emotional centerpiece.** Every other screen exists to feed this one. Spend the most design effort here.
- **Mobile-first, one-hand usable.** Large tap targets, minimal typing, no dense tables on small screens.

## 2. Screens

### 2.1 Circle Dashboard (home screen)

**Purpose:** Show the group's shared state at a glance.

**Contents, top to bottom:**
- Circle name and member count (e.g. "Radha's Circle · 5 members").
- Large, prominent pot balance.
- Member list as a horizontal row of avatars/initials, each tappable to view that member's public history.
- A single, prominent "Contribute" button — this is the most common action and should be the most visually dominant element.
- A secondary "Request a loan" button, visually distinct (less dominant than Contribute, since it's a less frequent action).
- A running feed below the fold: recent activity in the Circle (who contributed, who requested, who voted, who repaid), newest first, each entry timestamped.

### 2.2 Loan Request & Voting Screen

**Purpose:** Show an open loan request and let other members vote.

**Contents:**
- Borrower's name/avatar, requested amount, and stated purpose, shown as a simple card at the top.
- A live vote tally (e.g. "2 of 3 needed" as a simple progress indicator, not a raw fraction).
- If the current viewer hasn't voted yet: two large, clearly distinct buttons — Approve / Decline.
- If the current viewer has already voted, or the loan is already resolved: show the outcome plainly instead of the buttons (e.g. "You approved this ✓" or "Loan released — funds sent").
- The moment the threshold is met: an immediate, visible transition (e.g. a brief success state) showing the transfer happened, with the confirmation time shown.

### 2.3 Personal Credit History (payoff screen)

**Purpose:** This is the screen the whole pitch is built around — it must look and feel like a real financial record, not a debug log.

**Contents:**
- Header: member's name, and a single, clear summary line (e.g. "3 contributions · 1 loan, fully repaid").
- A simple status badge system:
  - **Outstanding** — loan taken, nothing repaid yet.
  - **Partially repaid** — some but not all repaid.
  - **Fully repaid** — repayment complete.
- A chronological list of every event tied to this member: contribution, loan request, loan received, each repayment — each entry shows the type, amount, and timestamp.
- A visually distinct "share" affordance (even if it just copies a link or shows a QR code for the demo) — this sells the "portable, checkable by anyone" claim without needing to actually build an external verification portal.

### 2.4 Contribute / Confirmation moment

Not a separate screen, but a state that deserves its own design attention: after tapping Contribute, show a brief, clear loading state, then a confirmation state that explicitly states the confirmation time (e.g. "Confirmed in 0.4s"). This single moment is where Monad's speed argument becomes visible rather than claimed — treat it as a small, deliberate piece of choreography, not an afterthought.

## 3. Visual direction

- **Color:** warm, human, non-corporate — avoid a stereotypical "fintech blue + white" look. A warm accent (terracotta, marigold, or similar) paired with a calm neutral background reads as approachable rather than institutional, which fits the target user better than a typical crypto-app aesthetic.
- **Typography:** one clean, highly legible sans-serif throughout. Numbers (balances, amounts) should be visually larger and heavier than surrounding text — money amounts are the most important information on every screen.
- **Iconography:** avoid crypto-specific iconography (wallets, chains, blocks) in most of the interface. Use everyday visual language instead — a pot/jar for the shared fund, a checkmark for repayment, a simple progress ring for vote status.
- **Language toggle:** if time allows, a simple Hindi/English toggle on key screens is a small but meaningful signal that this is built for the actual target user, not just for a hackathon audience.

## 4. What NOT to build (explicitly, to protect the 7-hour budget)

- No settings screen, no onboarding tutorial, no account-recovery flow.
- No support for multiple Circles per member in the UI (the contract can technically allow it; the demo only needs one).
- No dark mode.
- No animation beyond the single confirmation moment in §2.4 — polish that one moment well rather than adding minor motion everywhere.
