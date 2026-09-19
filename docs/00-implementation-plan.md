# SahAlliance — Implementation Plan

### Monad Blitz Mumbai V4 — 19 September 2026

## 0. Startup Framing

**Working name:** SahAlliance ("saha" = support/together, in Hindi).

**One-line pitch:** We put India's self-help group (SHG) lending circles on-chain, turning an informal, undocumented savings-and-loan habit that millions of women already trust into a public, verifiable credit history that any bank can check.

**Why this wins a peer-judged, 7-hour, consumer-app hackathon:**

- Consumer app requirement satisfied directly — women SHG members are the end users, not banks or enterprises.
- One-sentence pitch any builder gets in five seconds: "WhatsApp-group savings circle, but the ledger can't be faked."
- Emotional pull — nearly every judge has a mother, aunt, domestic worker, or neighbour who has been in an informal chit fund or SHG.
- Buildable in 7 hours — the core mechanic is a shared pot + contribution tracking + loan request/approval + repayment log. A small, well-scoped smart contract, not a distributed system.

## 1. The Problem

Women entrepreneurs in India are routinely denied formal credit for one specific, repeated reason: no collateral. Banks want property or equipment as security, but registered assets — land, homes — are overwhelmingly titled to male family members. The entrepreneur can have a working business and a perfect repayment intention, and still fail the bank's first question: "what can you put up as security?"

Informal solutions already exist and already work: Self-Help Groups (SHGs), where 10–20 women pool small weekly/monthly contributions into a shared pot and lend to each other on trust. This is one of the few channels that has genuinely moved the needle on women's access to credit in India — not a hypothetical fix, a proven one.

But SHGs have a structural ceiling: the entire trust system lives in a physical notebook (or a member's memory). There is no way for:

- A formal bank to verify a member's real repayment history when she wants a bigger loan.
- A new member joining a group to check the group's real track record.
- A member to prove she repaid on time if the notebook is lost or disputed.

The informal system works for trust *within* the group. It fails completely at trust *outside* the group — exactly the trust a formal lender would need to say yes.

**What this project does and does not claim:** it does not get anyone a bank loan directly. It builds the missing proof — a repayment history that currently exists nowhere a lender can see it — that a woman could eventually show a bank, an NGO, or a microfinance institution. Every pitch and demo should keep this distinction exact.

## 2. The Solution

Digitize the SHG's own existing ritual — not a new behavior, the same one, made verifiable and made to move real value.

1. **Form a Circle.** A small group of women (real-world: 5–20; demo: 3–5) creates a Circle on-chain. Each member has a wallet.
2. **Contribute.** Each member deposits her regular contribution (e.g. ₹500/month) into the Circle's shared pot. The deposit is a real transfer of value into the contract, not just a logged number — timestamped, permanent, publicly visible to the group.
3. **Request a loan.** A member requests a loan from the pot, stating amount and purpose.
4. **Group approves.** Other members vote yes/no. Once a fixed number of yes-votes is reached, the loan amount is actually transferred out of the pot to her wallet.
5. **Repay.** She repays over time; each repayment is a real transfer back into the pot, logged against that specific loan, with a running total so the loan's status (partially repaid / fully repaid) is always known.
6. **The track record compounds.** Every contribution, loan, and repayment is a permanent, tamper-proof history tied to her wallet address — a credit history that did not exist for her before, checkable by anyone she chooses to show it to.

**The core insight, in one line:** we're not inventing a new financial product — we're giving an existing, working, trusted informal system the one thing it structurally cannot produce on its own: a record that survives outside the room it was created in, backed by money that actually moved.

## 3. Two-Day Workflow

| Bucket | Definition | Risk if done wrong today |
|---|---|---|
| **Chain-agnostic** | Same regardless of which Monad tooling the workshop teaches (Solidity is Solidity; Monad is EVM-compatible) | Zero |
| **Chain-specific** | Depends on the exact deploy flow, wallet, RPC, faucet, or SDK organizers hand out | High if built blind — must be deferred |

**Today = everything chain-agnostic:** product decisions, UX, data model, contract logic, pitch deck, demo script, team roles, and a working frontend built against a mocked/local contract interface.

**Tonight, before sleeping:** freeze the contract's function signatures as a written interface (§6). Frontend builds against this starting tonight; whoever writes the real contract tomorrow just matches it. If the workshop teaches a different pattern, only the implementation changes — the interface, UI, and pitch do not.

**Tomorrow morning = everything chain-specific**, absorbed live from the workshop: deploy flow, wallet/RPC/faucet, SDK.

## 4. TODAY (Day 0, prep) — Hour by Hour

1. **Lock team & roles (30 min).** See §7.
2. **Freeze the demo story (30 min).** One Circle, three named members (Radha — tailoring stall, Meena — vegetables, Sunita — tailoring supplies), one loan request, one approval, one repayment. Written as a literal click-by-click script.
3. **Design the data model & contract interface (45 min).** Function signatures only (§6). No deployment code yet.
4. **Build the frontend against a mock (2–2.5 hrs).** Every screen wired to a local JS object behaving like the real contract will.
5. **Write the Solidity contract logic locally (1 hr).** Full logic, testable with Remix's in-browser VM or Hardhat/Foundry. Include the vote-quorum rule and repayment-tracking field from §6. Do not deploy yet.
6. **Draft the pitch narrative & slide skeleton (45 min).** Use §8 as the backbone.
7. **Write down open questions for tomorrow's workshop (15 min).** Wallet, faucet, RPC endpoint, starter template.

**End of today:** a working, demo-able frontend (against a mock), tested contract logic (undeployed), a locked demo script, a pitch skeleton.

## 5. TOMORROW (Day 1) — Hour by Hour

**Phase A — Workshop.** Resolve the open-questions list. The moment the real deploy flow is known, deploy the exact contract from yesterday, unmodified if possible — the fastest possible reality check.

**Phase B — Build, hours 1–2.** Swap the frontend's mock for real calls to the deployed contract. Get the core loop working end-to-end on-chain: contribute → request loan → approve → repay. Protect this above every other feature.

**Phase C — Build, hours 3–5.** Add the credit-history view (§2 step 6) — the actual differentiator. Add a visible "confirmed in Xms" indicator per transaction (§6). UI pass for a real consumer-app feel; Hindi/English toggle if time allows.

**Phase D — Build, hours 6–7.** Hour 6: hard feature freeze — bug fixes only. Hour 6.5–7: rehearse the demo (§8) at least twice on the actual demo device. Have a fallback screen-recording ready.

**Ship — Demo.** Follow §8 exactly.

## 6. Tech Architecture

**Contract interface (frozen tonight, Solidity, minimal):**

| Function | Inputs | What it does |
|---|---|---|
| `createCircle` | name, memberAddresses[] | Registers a new Circle, adds initial members |
| `contribute` | circleId | Payable — member sends real value into the Circle's pot |
| `requestLoan` | circleId, amount, purpose | Opens a loan request, visible to the group |
| `voteOnLoan` | loanId, approve (bool) | A member casts a yes/no; reverts if the member already voted or the loan is resolved |
| `repayLoan` | loanId | Payable — sends real value back into the pot, added to that loan's `amountRepaid` |
| `getMemberHistory` | memberAddress | Returns all contributions, loans, and repayments tied to that address |

**Vote-resolution rule (fixed to avoid a stuck demo):** a loan resolves the moment yes-votes reach a fixed threshold out of total Circle members — for a 3–5 member demo Circle, set this at a simple majority of the members added at Circle creation (e.g. 2 of 3), not a percentage of votes cast. The moment the threshold is hit, the contract transfers the loan amount to the borrower automatically, in the same transaction as the deciding vote.

**Repayment tracking:** each `Loan` stores `amountRepaid` alongside `amount`. The credit-history screen derives status directly from this: `amountRepaid == 0` → outstanding, `0 < amountRepaid < amount` → partially repaid, `amountRepaid >= amount` → fully repaid.

**Data model:**
- `Circle { id, name, address[] members, uint potBalance }`
- `Loan { id, circleId, address borrower, uint amount, string purpose, mapping(address => bool) hasVoted, uint yesVotes, uint amountRepaid, LoanStatus status }`

**Frontend:** mobile-first web app, React. Three real screens:
1. Circle dashboard — pot balance, member list, contribute button.
2. Loan request/voting screen.
3. Personal credit-history screen — the emotional payoff; spend real design effort here (see `02-design.md`).

**Where Monad's speed shows up:** every contribute/vote/repay is a transaction. Show a live "confirmed in Xms" indicator per action — turns an abstract throughput number into a felt, visible thing during judging.

**Fallback if the live testnet is flaky:** keep the mock-object version from today running as Plan B in a second browser tab.

## 7. Team Roles (up to 3 members)

| Role | Owns | Today | Tomorrow |
|---|---|---|---|
| **Contract lead** | Solidity logic, interface, deployment | Write & locally test contract logic (§4.5) | Deploys the contract (§5 Phase A); fixes on-chain bugs |
| **Frontend lead** | UI/UX, all screens | Build every screen against the mock (§4.4) | Swap mock for live calls (§5 Phase B); visual polish (§5 Phase C) |
| **Pitch/demo lead** | Narrative, slides, rehearsal, judge Q&A | Draft pitch + demo script (§4.2, §4.6) | Rehearses demo (§5 Phase D); handles judge questions; floats to help wherever blocked |

**Solo or duo:** collapse roles, but do every task in order — a locked demo script is what stops the other tasks from drifting under time pressure.

## 8. Demo Script & Pitch Narrative

**Open with a person, not a slide (30 sec).** "Meet Radha. She runs a tailoring stall. Every month, she and four other women put ₹500 each into a shared pot — this already happens, all over India, it's called a Self-Help Group. Last year Radha needed ₹5,000 for a new sewing machine. Her group lent it to her. She paid it back, every time. None of that exists anywhere a bank can see it."

**State the problem in one line (15 sec).** "Banks want collateral. Radha's home isn't in her name. So none of this real, proven repayment history counts for anything outside her group's notebook."

**Live demo (2–3 min):**
1. Circle dashboard — Radha's group, pot balance, members.
2. Contribute live — call out the confirmation time on screen ("that just confirmed on-chain in under a second").
3. Request a loan as Radha.
4. Approve as another member (switch wallet/persona) — show the transfer happen the instant the threshold is hit.
5. Show a repayment logged, and the loan's status flip to "fully repaid."
6. **Payoff screen:** Radha's full credit history — every contribution, loan, repayment, permanent and checkable by anyone she shows it to.

**Close (30 sec).** "We didn't invent a new financial habit. Self-Help Groups already work. We just gave that existing trust a memory that survives outside the room it was built in — backed by money that actually moved, not just a number someone typed in."

**Anticipated judge questions:**
- *"Why blockchain and not just a database?"* → A bank won't trust a database one party controls. A public, tamper-proof ledger is verifiable by a party that was never in the room.
- *"What stops the group from colluding to fake a good record?"* → Honest answer: today it relies on the group's own honesty, same as physical SHGs do now. The improvement over a notebook is auditability, not cryptographic proof of honesty — a real v2 problem, named as future work rather than hidden.
- *"Who's the real customer?"* → Two-sided: the women (free to use, better standing over time), and eventually the SHG networks, NGOs, and MFIs who already work with millions of these groups and would pay for a verifiable member ledger.
- *"Is the money real?"* → Yes — `contribute` and `repayLoan` are payable functions that move real value into and out of the pot; the demo isn't logging numbers, it's moving testnet MON.

## 9. Risks & Fallbacks

| Risk | Likelihood | Fallback |
|---|---|---|
| Workshop's Monad workflow differs from what's assumed today | Medium | §3's interface freeze — only deployment code is rewritten |
| Live testnet flaky during judging | Medium | Mock-object version running in a second tab as instant fallback |
| Contract deploy eats more time than planned | Medium–High | §5 Phase A deploys immediately after the workshop, before any other build work |
| Feature creep past hour 6 | High | Hard feature freeze at hour 6 — no exceptions |
| Team runs out of time for the credit-history screen | Medium | This is the differentiator — protect it above visual polish |
| Loan vote never resolves live | Medium | Fixed-threshold rule (§6) resolves on a small, known number of yes-votes, not a percentage of an unpredictable turnout |
| Judge asks an unprepared question | Medium | §8's anticipated-questions list rehearsed by whoever pitches |

## 10. Post-Hackathon — What's Next

- **Immediate next step:** partner conversation with one real SHG-supporting NGO or microfinance network to pilot with one real Circle.
- **Real business model:** free for members; revenue from MFIs/NGOs/banks who'd pay for a verifiable, portable member ledger instead of building their own trust infrastructure from scratch.
- **Hardest real-world problem, named honestly:** getting non-smartphone-literate members to hold a wallet and sign transactions. Real answer: a custodial or assisted-signing model at first (an SHG facilitator manages wallets on members' behalf, a common pattern in this exact space), moving to self-custody over time.
