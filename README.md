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
- AI Model (e.g., Phi3 from Ollama)

## Setup

1. Install dependencies:

```bash
npm install
```

2. **Set up environment variables:**

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Then edit `.env` with your actual values:

```env
# IPFS Configuration (Pinata)
VITE_IPFS_ENDPOINT=https://api.pinata.cloud/pinning/pinJSONToIPFS
VITE_IPFS_AUTH=Bearer YOUR_JWT_TOKEN_HERE
VITE_PINATA_API_KEY=YOUR_PINATA_API_KEY_HERE
VITE_PINATA_SECRET=YOUR_PINATA_SECRET_HERE

# Sentiment Analysis (Ollama)
VITE_SENTIMENT_ENDPOINT=http://localhost:11434/api/generate
VITE_SENTIMENT_MODEL=phi3
VITE_SENTIMENT_AUTH=
```

**How to get your credentials:**

- **Pinata (IPFS Storage)**: Go to [Pinata](https://app.pinata.cloud/), sign up, create API keys, copy JWT token and API key/secret
- **Ollama (AI)**: Install from [ollama.ai](https://ollama.ai/), run `ollama pull phi3`, start Ollama service

3. Run dev server:

```bash
npm run dev
```

Open http://localhost:5173

## Local AI Setup (Ollama + Phi-3)

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

## Features

### 🔐 **Wallet-Specific Data**

- Each connected wallet has its own separate journal entries
- Data is stored privately on IPFS with wallet address metadata
- Switch wallets to see different personal diary collections

### 🤖 **AI-Powered Sentiment Analysis**

- Automatically analyzes mood from diary entries
- Uses local Ollama Phi3 model for privacy
- Displays mood emojis and trends

### 🌐 **Decentralized Storage**

- All entries stored on IPFS via Pinata
- Private files (not publicly accessible)
- Real-time fetching from decentralized storage

### 🧾 On-Chain (Aiken) Roadmap

- NFT minting policy for first journal (global per wallet)
- NFT minting policy for streaks (e.g., 7-day/30-day journaling)
- Off-chain: store diary JSON on IPFS; on-chain only references IPFS CID and access/minting rules

See `onchain/README.md` for contract details.

## How it works

- **WalletConnect**: Enables a CIP-30 wallet and displays network info (expects testnet).
- **DiaryForm**: Lets users write entries, calls sentiment API, then uploads to IPFS with wallet metadata.
- **Journal Logs**: Displays wallet-specific entries fetched live from IPFS.
- **Mood Analytics**: Shows mood trends and distribution for the connected wallet.

## Anchoring CIDs On-Chain (Outline)

- Use `@emurgo/cardano-serialization-lib-browser` to construct a tx.
- Include a datum with CID hash or metadata in a minimal script UTxO.
- Ask wallet to sign and submit via CIP-30.
- For reliability, consider a backend service that:
  - queries UTxOs (via Blockfrost or Ogmios/KOIOS),
  - builds a tx (server-side or via Lucid/CSL in browser),
  - returns unsigned tx to wallet for signing.

## Troubleshooting

### Common Issues:

**"No entries found" or "Failed to fetch entries":**

- Check your Pinata API credentials in `.env`
- Ensure Ollama is running: `ollama run phi3`
- Check browser console for detailed error messages

**"Wallet connection failed":**

- Make sure you have a Cardano wallet installed (Nami, Eternl, or Lace)
- Ensure wallet is on testnet/preprod network
- Try refreshing the page and reconnecting

**"Sentiment analysis not working":**

- Verify Ollama is running: `ollama list` should show `phi3`
- Check if `http://localhost:11434` is accessible
- Try running: `ollama run phi3` in terminal

### Debug Tools:

- Use the Profile page to test API connections
- Check browser console for detailed logs
- Use "Test Pinata API" button to verify credentials

## Notes

- Keep private keys inside the wallet. Never send seeds to the app.
- IPFS auth should be proxied server-side in production to avoid exposing tokens.
- Each wallet has its own private journal data - switching wallets shows different entries.
