# SahAlliance — Rubric Checklist (200 pts)
Keep this open on a second screen/phone while building. Tick as you go.

## Basic Points — 100 pts (prize-eligibility gate)
- [ ] Public GitHub repo (25)
- [ ] Proper README — live URL + contract address included (25)
- [ ] Smart contract deployed on Monad Testnet, chain ID 10143 (25)
- [ ] Project publicly hosted (any host, no custom domain needed) (25)

## Advance — Does It Work — 100 pts
- [ ] All announced functions actually work end-to-end (25)
- [ ] Live transaction executed on-chain during the demo, not pre-recorded (25)
- [ ] Contract verified on testnet.monadscan.com — source visible, not just bytecode (25)
- [ ] A teammate who didn't write the code can run it from the README alone (25)

## Say out loud during the pitch
- [ ] Repo link
- [ ] Contract address
- [ ] Live hosted page link

## Network reference
- Chain ID: `10143`
- RPC: `https://rpc.testnet.monad.xyz`
- Explorer: `https://testnet.monadscan.com`
- Faucet: `https://faucet.monad.xyz`

## Build order (do not reorder)
1. Contracts compile + pass tests locally
2. Deploy to Monad Testnet → copy address immediately
3. Verify on explorer immediately (don't postpone)
4. Wire real address + ABI into frontend, flip `USE_MOCK` to `false`
5. Run full demo loop live against the real contract, twice
6. Push to public GitHub repo
7. Finish README (live URL + address + from-scratch run instructions)
8. Deploy frontend to a public host, confirm it loads in incognito

## Definition of done
Every box above checked, AND a teammate who didn't write the code has
run the project from a clean clone using only the README.
