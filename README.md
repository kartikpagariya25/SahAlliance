# SahAlliance

On-chain credit history for India's Self-Help Groups — built for Monad Blitz Mumbai V4.

**Live app:** _paste hosted URL here_
**Contract address (Monad Testnet, chain ID 10143):** _paste address here_
**Verified contract:** _paste testnet.monadscan.com link here_

## What this is

SahAlliance puts a Self-Help Group's shared savings pot and peer-approved loans on-chain. Every contribution, loan request, vote, and repayment is a real transaction, permanently tied to a member's wallet — giving her a portable credit history a bank, NGO, or new group member can verify without trusting anyone's notebook.

## Repo structure

```
contracts/   Solidity contract, tests, deploy script (Hardhat)
backend/     Event indexer + read-only REST API (Express + SQLite)
frontend/    React app — three screens, wallet connect, mock/live toggle
```

## Run it from scratch

### 1. Contracts

```
cd contracts
npm install
npm run test              # runs the full loan lifecycle test
npm run deploy:monad      # deploys to Monad Testnet, prints the address
npm run verify:monad <address>
```

Before deploying, set `contracts/.env`:

```
PRIVATE_KEY=your_deployer_private_key
MONAD_RPC_URL=https://rpc.testnet.monad.xyz
```

Fill in the three demo member addresses in `contracts/scripts/deploy.js` before running the deploy.

### 2. Backend (indexer + API)

```
cd backend
npm install
cp .env.example .env      # paste the deployed contract address
npm start
```

Runs on `http://localhost:4000`. Not required for the frontend to function (the frontend can talk to the contract directly) — it's a fast read cache for the history screen.

### 3. Frontend

```
cd frontend
npm install
cp .env.example .env      # set VITE_USE_MOCK=false and paste the contract address once deployed
npm run dev
```

Runs on `http://localhost:5173`. With `VITE_USE_MOCK=true` it runs entirely against an in-memory mock — no wallet, no network — useful for UI work before the contract is deployed.

## Demo script

See `docs/00-implementation-plan.md` §8 for the full click-by-click demo.

## Network reference

- Chain ID: `10143`
- RPC: `https://rpc.testnet.monad.xyz`
- Explorer: `https://testnet.monadscan.com`
- Faucet: `https://faucet.monad.xyz`
