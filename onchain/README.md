# On-chain Contracts (Aiken)

This folder contains Aiken smart contracts for Cardano:

- AI Companion Subscription
- NFT Minting Policies:
  - First Journal NFT (one-time per wallet)
  - Streak NFT (e.g., 7-day and 30-day)

Contracts reference off-chain IPFS CIDs only. Diary content, mood, etc., stay off-chain.

## Prerequisites

- Install Aiken: `curl -sSL https://get.aiken.rs | bash`
- Cardano testnet node access for integration (Ogmios/Blockfrost/Koios as needed)

## Project Structure

- `aiken.toml` — project config
- `validators/` — subscription validator
- `policies/` — minting policies for NFTs
- `build/` — compiled artifacts (generated)

## Build

```bash
cd onchain
aiken build
```

Artifacts will be in `onchain/build/`.

## Notes

- First-Journal policy ensures each wallet can mint exactly one NFT by requiring a signature and minting exactly 1 token; uniqueness is enforced off-chain by naming policy and indexer checks.
- Streak policy expects a redeemer carrying the covered period and IPFS CID; policy enforces 1 token per tx; off-chain verifies streaks.
- Subscription validator guards a UTxO that is spent when subscription is valid (checked via timelock and signature).

> Frontend integration will later use CIP-30 to sign and submit transactions with these artifacts.
