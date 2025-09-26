# Cardano Decentralized Diary

A web-based diary that:
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

2. Run dev server:

```bash
npm run dev
```

Open http://localhost:5173


##  Local AI Setup (Ollama + Phi-3)
This project can be configured to use a local large language model for sentiment analysis instead of a cloud-based API. This is a great option for privacy and offline use. We'll use Ollama to run the Phi-3 model from Microsoft.

1. Install Ollama: Download and install Ollama from the official website: https://ollama.com/

2.cPull the Phi-3 Model: Open your terminal and run the following command to download the Phi-3 model.


```bash
ollama pull phi3
```

3. Run the Ollama Server: Start the Ollama server by running:

```bash
ollama run phi3
```
This will start the server on the default port (11434).

4. Configure the Application: Modify the codebase to point to your local Ollama instance. You may need to update URLs or configurations within the application's source files to ensure they communicate correctly with your locally running Ollama server.




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
