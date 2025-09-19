# Cardano Decentralized Diary

A web-based diary for pedestrians that:
- **Decentralized account**: connects to Cardano CIP-30 wallets (Nami/Eternl/Lace)
- **AI sentiment**: calls an external inference API to classify sentiment
- **Decentralized storage**: uploads diary entries to IPFS, with the option to anchor CIDs on-chain later

## Stack
- Vite + React (TypeScript)
- Tailwind CSS
- Cardano CIP-30 wallet API (preprod/testnet)
- IPFS via pinning provider HTTP API
- External AI API (e.g., Hugging Face Inference API)

## Setup

1. Install dependencies:

```bash
 npm install 
```

2. Create `.env` (or `.env.local`) with:

```bash
VITE_IPFS_ENDPOINT=https://api.pinata.cloud/pinning/pinJSONToIPFS
VITE_IPFS_AUTH=Bearer <pinata-jwt-or-your-auth>

# Example: Hugging Face text-classification pipeline
VITE_SENTIMENT_ENDPOINT=https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment
VITE_SENTIMENT_AUTH=Bearer <your-hf-token>
```

3. Run dev server:

```bash
npm run dev
```

Open http://localhost:5173

## How it works
- **WalletConnect**: Enables a CIP-30 wallet and displays network info (expects testnet).
- **DiaryForm**: Lets users write entries, calls sentiment API, then uploads to IPFS.
- **OnChainNote**: Explains how to anchor the IPFS CID on Cardano (transaction build/sign/submit not yet implemented).

## Anchoring CIDs On-Chain (Outline)
- Use `@emurgo/cardano-serialization-lib-browser` to construct a tx.
- Include a datum with CID hash or metadata in a minimal script UTxO.
- Ask wallet to sign and submit via CIP-30.
- For reliability, consider a backend service that:
  - queries UTxOs (via Blockfrost or Ogmios/KOIOS),
  - builds a tx (server-side or via Lucid/CSL in browser),
  - returns unsigned tx to wallet for signing.

## Notes
- Keep private keys inside the wallet. Never send seeds to the app.
- IPFS auth should be proxied server-side in production to avoid exposing tokens.
- Switch wallet to **Preprod** network for testing.
