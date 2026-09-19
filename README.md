# Sahay

**On-chain savings & lending circles for self-help groups — built on Monad.**

Sahay (from Hindi *सहाय*, "help/support") turns the traditional South Asian rotating savings circle (SHG / chit fund) into a transparent, on-chain financial operating system. Members pool money, vote on loans, and every contribution and repayment becomes part of a public, portable credit history.

Built for **Monad Blitz Mumbai V4**.

<p align="left">
  <img alt="stack" src="https://img.shields.io/badge/chain-Monad-836EF9">
  <img alt="frontend" src="https://img.shields.io/badge/frontend-React%20%2B%20Vite-149eca">
  <img alt="contracts" src="https://img.shields.io/badge/contracts-Solidity%20%2B%20Hardhat-363636">
  <img alt="languages" src="https://img.shields.io/badge/i18n-EN%20%7C%20हिं-orange">
</p>

---

## What it does today

| | |
|---|---|
| **Circles** | Create a circle, add members, pool contributions into a shared pot |
| **Loans** | Any member can request a loan (capped at the pot balance) |
| **Voting** | Loans release only once a majority (`members/2 + 1`) votes yes |
| **Repayment** | Repay in one or more transactions; overpayment is auto-refunded |
| **Credit history** | Every contribution, vote, and repayment is indexed and shown per member |
| **Bilingual UI** | English and Hindi, with a demo mode that needs no wallet at all |

## Project structure

```
backend/    Solidity contract, Hardhat tests + scripts, indexer + read API (Express + SQLite)
frontend/   React app — landing, sign-in, circles, voting, repayment, credit history (EN/हिं)
docs/       PRD, design spec, implementation plan
```

---

## Quick start

### Demo mode — no blockchain, no wallet
```bash
cd frontend && npm install && npm run dev      # http://localhost:5173
```
Click **Try the demo**, pick a member, and run the whole loop: contribute → request → vote → release → repay.

### Full local stack — real contract on a local chain
```bash
cd backend && npm install
npm run node                 # terminal 1: local chain
npm run deploy:local         # terminal 2: deploys, creates a demo circle, writes .env files
npm run seed:local           # optional: two circles with loans and votes
npm start                    # terminal 3: indexer + API on :4000
cd ../frontend && npm run dev
```
`frontend/.env` sets `VITE_LOCAL_DEV=true`, so sign-in offers local test accounts (Radha, Meena, Sunita, Lakshmi, Priya).

### Monad testnet (chain `10143`)
```bash
cd backend && cp .env.example .env     # set PRIVATE_KEY — never commit it
npm run deploy:monad                   # prints the address; updates .env files
npm run verify:monad <address>
npm start                              # indexer + API
cd ../frontend && npm run build        # host dist/ anywhere
```
Faucet → https://faucet.monad.xyz · Explorer → https://testnet.monadscan.com · RPC → https://testnet-rpc.monad.xyz

MetaMask users get Monad Testnet added and switched automatically.

### Tests
```bash
cd backend && npm test                                                # contract, mock, indexer + API (38 tests)
cd frontend && npx playwright install chromium && npm run test:e2e    # demo-mode end to end
```

---

## How the contract behaves

- `createCircle(name, members[])` — 2+ unique members; the majority threshold (`members/2 + 1`) is fixed at creation.
- `contribute`, `requestLoan` (never more than the pot), `voteOnLoan`, `repayLoan` (overpayment refunded).
- Releasing a loan pays the borrower in the same transaction as the deciding vote.
- Circle ids and loan ids start at `0`. Members cannot be added after creation.

## Tech stack

- **Contracts:** Solidity + Hardhat
- **Indexer / API:** Node + Express + SQLite
- **Frontend:** React 18 + Vite, `ethers.js` v6, `framer-motion`, `react-router-dom`
- **Chain:** Monad Testnet (10143)

---

## Roadmap — where Sahay is headed

The core loop (save → borrow → repay) is live. The features below turn that loop into a full reputation-and-community platform. Roughly ordered by how naturally they build on the existing contract and indexer.

### Identity & reputation
- **Sahay Trust Score** — a 0–1000 score per member, built from contribution consistency, repayment speed, voting participation, and circle tenure. The signature feature: `behaviour → reputation → access to capital`.
- **On-chain Member Passport** — a shareable card (trust score, circles, loans, repayment rate) with a future NFT/SBT-backed identity.
- **Savings streaks & achievements** — Duolingo-style streak counters and badges (*First Contribution*, *10-cycle streak*, *100% repayment*) to keep members engaged.

### Community health
- **Circle Health Score** — a composite score (trust, liquidity, repayment, participation, stability) for the whole circle, not just individuals.
- **Community Treasury Dashboard** — live pot balance, outstanding vs. repaid amounts, and liquidity ratio.
- **Advanced analytics / Insights page** — contribution and repayment trends, voting participation, circle growth, treasury utilization.
- **Circle Discovery** — browse circles by category (Business, Education, Women, Students…) using the contract's existing `getAllCircleIds()`.

### Money flows
- **Recurring contributions** — set a monthly auto-save amount; start as a reminder layer, later wire into contract automation.
- **Financial goals** — circles pool toward a shared target (e.g. "Riya's tailoring machine") instead of only lending.
- **"What if?" simulator** — a frontend-only slider showing how extra contributions change the max available loan.

### Governance & trust
- **Richer governance** — live yes/no vote bars, required-vote thresholds, and optional vote reasoning (essential expense, business investment, medical, etc.) for on-chain context.
- **Emergency loan mode** — a high-priority request flow with a lower approval threshold; flagged as a v2 feature since it needs contract changes.
- **Privacy mode** — zero-knowledge proofs of reputation (e.g. "3 loans repaid successfully") without exposing full transaction history.

### Transparency & UX
- **Live on-chain activity feed** — a real-time stream of `Contributed`, `LoanVoted`, `LoanReleased`, `LoanRepaid` events plus the current Monad block height — great for demos.
- **"Explain this transaction"** — plain-language summaries of what a transaction did and why, instead of raw hashes and hex.
- **Personal financial timeline** — a Spotify-Wrapped-style year view of a member's contributions, loans, and milestones.
- **AI financial copilot** — a chat assistant ("Can I afford a 15 MON loan?") that explains transparent on-chain data; it never makes lending decisions itself.
- **Circle chat / proposal room** — lightweight off-chain chat per circle that can turn a message straight into a loan proposal.
- **Smart onboarding** — an intent-based first screen ("Start a circle" / "Join a community" / "Build my reputation") that personalizes the dashboard.
- **More languages** — Marathi next, with Tamil, Bengali, and Telugu as stretch goals.

---

## Changes made to the original backend
- `voteOnLoan` now reverts with `loan does not exist` for unknown ids (previously a member of circle 0 could push a phantom loan to *Released*).
- Indexer rewritten — the old version used a stale ABI and event names, so almost nothing was indexed. Events are now keyed by `(tx hash, log index)` so a release and its deciding vote in one transaction are both kept. The API gained `/circles`, `/loan/:id`, `/member/:address/circles`, and a richer `/circle/:id`.
- Backend consolidated into a single Hardhat + API project (the older duplicate `contracts/` copy was removed). ABI is synced with `npm run sync-abi`.
- The UI doesn't offer a borrower a vote on her own request in circles of 3+ (the contract allows it; the PRD says "another member").

## Credits
3D illustrations: [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji) (MIT)
