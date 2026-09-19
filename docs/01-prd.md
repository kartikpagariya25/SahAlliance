# SahAlliance — Product Requirements Document

## 1. Summary

SahAlliance puts an Indian Self-Help Group (SHG) — a small circle of women who pool regular contributions and lend to each other on trust — on-chain. Every contribution, loan, vote, and repayment becomes a permanent, publicly verifiable record tied to a member's wallet, giving her a portable credit history that currently does not exist anywhere outside a physical notebook.

## 2. Problem Statement

Women entrepreneurs in India are disproportionately denied formal credit because they lack collateral — registered assets like land and property are overwhelmingly titled to male family members. Self-Help Groups already solve informal access to credit at small scale, but the resulting trust and repayment history is trapped inside the group: illegible to a bank, illegible to a new member, and unrecoverable if a notebook is lost or a treasurer is unreliable.

## 3. Goals

- Give each woman in a Circle a permanent, checkable record of her contributions, loans, and repayments.
- Make that record independently verifiable by someone who was never in the room (a bank, an NGO, a new group member).
- Preserve the existing SHG social process (group-based trust, group-based approval) rather than replacing it with a new financial product.

## 4. Non-Goals (explicitly out of scope for this build)

- This is **not** a lending app connected to a real bank. No formal lender integration exists in this version.
- This is **not** a KYC (Know Your Customer — identity verification) system. Members are identified by wallet address only.
- This does **not** cryptographically prevent a group from colluding to fabricate a good record. It only makes an existing record tamper-proof and externally visible — it does not verify the underlying honesty of the group.
- This is **not** a general-purpose payments app. It only handles Circle contributions, loans, and repayments.

## 5. Target Users

**Primary:** Women in an existing or newly formed Self-Help Group who want a shared, trustworthy record of their group's lending activity.

**Secondary (future, not built in this version):** NGOs, microfinance institutions (MFIs), and banks who would want to view a member's or group's verified history as part of a formal lending decision.

## 6. User Stories

1. As a Circle member, I want to deposit my regular contribution so it's added to the shared pot and recorded under my name.
2. As a Circle member, I want to request a loan from the pot, stating how much and why, so my group can decide on it.
3. As a Circle member, I want to vote on another member's loan request so the group — not one person — decides who gets funded.
4. As a borrower, I want the approved loan amount to actually reach my wallet the moment my group approves it.
5. As a borrower, I want to repay my loan over time and see my remaining balance update.
6. As any member, I want to see my full history — every contribution, loan, and repayment — in one place, so I can show it to someone outside the group.
7. As a new or prospective Circle member, I want to see a group's collective track record before joining, so I know it's trustworthy.

## 7. Functional Requirements

| ID | Requirement |
|---|---|
| FR-1 | The system must allow creating a Circle with a name and an initial list of member wallet addresses. |
| FR-2 | The system must allow any Circle member to contribute real value to the Circle's pot, recorded against her address. |
| FR-3 | The system must allow any Circle member to request a loan, specifying amount and purpose. |
| FR-4 | The system must allow any other Circle member to vote yes/no on an open loan request, once per member per loan. |
| FR-5 | The system must automatically transfer the loan amount from the pot to the borrower the moment a fixed yes-vote threshold is reached. |
| FR-6 | The system must allow a borrower to repay any amount against her outstanding loan, tracked as a running total against the original loan amount. |
| FR-7 | The system must expose a per-address history view showing all contributions, loan requests, votes cast, loans received, and repayments made. |
| FR-8 | The frontend must display the on-chain confirmation time for each contribute/vote/repay action. |

## 8. Non-Functional Requirements

- **Demo reliability:** the core loop (contribute → request → vote → release → repay) must work end-to-end without manual intervention, since this is a live, timed demo.
- **Fallback availability:** a mocked, non-blockchain version of the same UI must remain runnable in case of live network issues during judging.
- **Mobile-first:** the interface must be usable and legible on a phone screen, since the real target user is expected to primarily use a phone.
- **No custom backend server required for the MVP** — the frontend talks directly to the deployed smart contract.

## 9. Success Metrics (for the hackathon demo, not production)

- The full core loop completes live, on-chain, in front of judges, with no manual data entry standing in for a blockchain action.
- The credit-history screen correctly reflects every action taken during the live demo, with no discrepancy.
- At least one visible, called-out moment demonstrating Monad's transaction speed.

## 10. Open Questions

- What is the exact wallet/RPC/faucet setup that Monad Blitz's morning workshop will provide? (To be resolved live — see Implementation Plan §3–5.)
- Post-hackathon: what identity model (custodial vs. self-custody) is realistic for members without smartphone literacy? (Named explicitly as future work — not required for this build.)

## 11. Related Documents

- `00-implementation-plan.md` — hour-by-hour build plan, contract interface, and demo script.
- `02-design.md` — screen-by-screen UI/UX specification.
- `03-claude-code-skill.md` — build conventions for Claude Code to follow while implementing this project.
