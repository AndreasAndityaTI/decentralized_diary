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

## NMKR Setup (NFT Minting)

This app uses NMKR for Cardano NFT minting. Follow these steps to set up your NMKR account and configure NFTs:

### 1. Create NMKR Account
1. Go to [NMKR Studio](https://studio.nmkr.io/)
2. Sign up for a free account
3. Verify your email

### 2. Create a Project
1. In NMKR Studio, click "Create New Project"
2. Choose "Cardano" as the blockchain
3. Set network to "Preprod Testnet" (for testing)
4. Name your project (e.g., "DeDiary NFTs")
5. Click "Create Project"

### 3. Create NFT Collection
1. In your project, click "Create NFT"
2. Upload NFT image/artwork
3. Set NFT details:
   - **Name**: "First Journal NFT"
   - **Description**: "NFT representing the first journal entry on the decentralized diary"
   - **Quantity**: Set to unlimited or a high number (e.g., 1000)
   - **Royalty**: Optional (e.g., 5%)
4. Configure metadata:
   - Add attributes like "Category: Journaling"
   - Set external URL if needed
5. Save and publish the NFT

### 4. Get API Credentials
1. In NMKR Studio, go to "Settings" → "API Keys"
2. Create a new API key
3. Copy the following values:
   - **API Key**: Your API key (looks like `4760cd64b8044f61a11a5d0a3eea9ea4`)
   - **Project UID**: Your project ID (looks like `1186a714-224c-4c08-80cc-3bc55a6c6698`)
   - **NFT UID**: Your NFT ID (looks like `b56c9f9e-093d-41cf-818b-89b156b08f95`)

### 5. Update Code Configuration
1. Open `src/services/cardano.ts`
2. Find the NMKR configuration section:
```typescript
// NMKR project configuration
const POLICY_ID = "741f480a059f581fe6250375077d304401732d661a22a15aa7509ed8";
const NMKR_PROJECT_UID = "1186a714-224c-4c08-80cc-3bc55a6c6698";
const NMKR_NFT_UID = "b56c9f9e-093d-41cf-818b-89b156b08f95";
const NMKR_API_KEY = "4760cd64b8044f61a11a5d0a3eea9ea4";
```
3. Replace the values with your NMKR credentials:
   - Keep `POLICY_ID` as is (this is the minting policy)
   - Update `NMKR_PROJECT_UID` with your project ID
   - Update `NMKR_NFT_UID` with your NFT ID
   - Update `NMKR_API_KEY` with your API key

### 6. Test NFT Minting
1. Start the app: `npm run dev`
2. Connect a Cardano wallet (Nami/Eternl/Lace)
3. Write a journal entry
4. Go to Profile page
5. Click "Mint Your First Journal NFT"
6. The NFT should be minted and sent to your wallet

### Important Notes
- **Testnet First**: Always test on preprod testnet before mainnet
- **API Limits**: NMKR has rate limits - don't spam minting
- **Costs**: NFT minting costs ADA (paid by the minter)
- **Metadata**: NMKR handles CIP-25 metadata automatically
- **Support**: Check [NMKR Documentation](https://docs.nmkr.io/) for help

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
