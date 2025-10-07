// Lightweight CIP-30 wallet connector for Cardano (Preprod)
// Assumes user has a wallet extension supporting CIP-30 (Nami, Eternl, Lace)

export type WalletAPI = {
  getNetworkId: () => Promise<number>;
  getUsedAddresses: () => Promise<string[]>;
  getUnusedAddresses: () => Promise<string[]>;
  getUtxos?: (amount?: string) => Promise<string[]>;
  signTx: (tx: string, partialSign?: boolean) => Promise<string>;
  submitTx: (tx: string) => Promise<string>;
  signData?: (
    addr: string,
    payload: string
  ) => Promise<{ key: string; signature: string }>;
};

// Lazy load cardano-serialization-lib to avoid startup crashes
let cardanoLib: any = null;

async function loadCardanoLib() {
  if (!cardanoLib) {
    cardanoLib = await import('@emurgo/cardano-serialization-lib-browser');
  }
  return cardanoLib;
}

// Helper function to convert hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

// Helper function to convert string to Uint8Array (UTF-8)
function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Helper function to convert Uint8Array to hex string
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper function to ensure address is bech32
async function ensureBech32Address(address: string): Promise<string> {
  const cardanoLib = await loadCardanoLib();
  try {
    // Try to parse as bech32
    cardanoLib.Address.from_bech32(address);
    return address;
  } catch {
    // Assume hex, convert to bech32
    const addr = cardanoLib.Address.from_hex(address);
    return addr.to_bech32();
  }
}

// Using default protocol parameters to avoid CORS issues
// In production, you would fetch these from a Cardano API
const DEFAULT_PROTOCOL_PARAMS = {
  min_fee_a: 44,
  min_fee_b: 155381,
  pool_deposit: 500000000,
  key_deposit: 2000000,
  max_val_size: 5000,
  max_tx_size: 16384,
  coins_per_utxo_size: 4310,
};

// Blockfrost configuration
const BLOCKFROST_PROJECT_ID = 'preprodWQJpVV7efzG5bE0KP7y9TvjNm3DFi0El';


export async function enableWallet(): Promise<WalletAPI | null> {
  const anyWin = window as any;
  const wallets = ["eternl", "nami", "lace"];

  for (const w of wallets) {
    if (anyWin.cardano?.[w]?.enable) {
      try {
        console.log(`Enabling wallet: ${w}`);

        // Check if wallet is already enabled first
        if (anyWin.cardano[w].isEnabled && anyWin.cardano[w].isEnabled()) {
          console.log(`Wallet ${w} is already enabled`);
          // Wait a bit for the wallet to be fully ready
          await new Promise((resolve) => setTimeout(resolve, 1000));
          // Still need to call enable() to get the actual API object
          const api: WalletAPI = await anyWin.cardano[w].enable();
          console.log(`Got fresh API for already enabled wallet ${w}`, api);
          return api;
        }

        const api: WalletAPI = await anyWin.cardano[w].enable();
        console.log(`Wallet ${w} enabled successfully`, api);
        console.log(`API methods:`, Object.keys(api));

        // Wait for wallet to be fully ready after enable
        await new Promise((resolve) => setTimeout(resolve, 2000));

        return api;
      } catch (error) {
        console.error(`Failed to enable wallet ${w}:`, error);
        // Continue to next wallet
        continue;
      }
    }
  }
  return null;
}

export async function getWalletInfo(api: WalletAPI) {
  console.log("Getting wallet info from API:", api);
  console.log("API methods available:", Object.keys(api));

  if (typeof api.getNetworkId !== "function") {
    throw new Error(
      `getNetworkId is not a function. Available methods: ${Object.keys(
        api
      ).join(", ")}`
    );
  }

  try {
    const networkId = await api.getNetworkId(); // 0 = testnets, 1 = mainnet
    const used = await api.getUsedAddresses();
    const unused = await api.getUnusedAddresses();
    return { networkId, used, unused };
  } catch (error) {
    console.error("Error getting wallet info:", error);

    // If it's an "account changed" error, wait and try again
    if ((error as any)?.message?.toLowerCase().includes("account changed")) {
      console.log("Account changed error, waiting and retrying...");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Try to get a fresh API reference
      const anyWin = window as any;
      const wallets = ["eternl", "nami", "lace"];

      for (const w of wallets) {
        if (anyWin.cardano?.[w]?.isEnabled && anyWin.cardano[w].isEnabled()) {
          console.log(`Getting fresh API reference for ${w}`);
          // Need to call enable() to get the actual API object, not just the wallet interface
          const freshApi = await anyWin.cardano[w].enable();
          const networkId = await freshApi.getNetworkId();
          const used = await freshApi.getUsedAddresses();
          const unused = await freshApi.getUnusedAddresses();
          return { networkId, used, unused };
        }
      }
    }

    throw error;
  }
}

export async function mintFirstJournalNFT(
  api: WalletAPI,
  walletAddress: string,
  ipfsCid: string
): Promise<string> {
  console.log('🎨 Starting NMKR NFT minting process...');

  // NMKR project configuration
  const POLICY_ID = "741f480a059f581fe6250375077d304401732d661a22a15aa7509ed8";
  const NMKR_PROJECT_UID = "1186a714-224c-4c08-80cc-3bc55a6c6698";
  const NMKR_NFT_UID = "b56c9f9e-093d-41cf-818b-89b156b08f95";
  const NMKR_API_KEY = "4760cd64b8044f61a11a5d0a3eea9ea4";

  try {
    console.log('🔍 Checking wallet connection...');
    console.log('Available wallet API methods:', Object.keys(api));

    // Convert wallet address to bech32 format for NMKR
    const userAddress = await ensureBech32Address(walletAddress);

    if (!userAddress) {
      throw new Error("No wallet address provided");
    }

    console.log('✅ Using wallet address:', userAddress.substring(0, 20) + '...');

    console.log('📋 Preparing NMKR minting request...');
    console.log('Policy ID:', POLICY_ID);
    console.log('IPFS CID:', ipfsCid);

    // Prepare CIP-25 metadata according to NMKR template
    const assetName = 'FirstJournalNFT';
    const metadata = {
      "721": {
        [POLICY_ID]: {
          [assetName]: {
            "name": "First Journal NFT",
            "image": `ipfs://${ipfsCid}`,
            "mediaType": "image/jpeg",
            "description": "NFT representing the first journal entry on the decentralized diary",
            "files": [
              {
                "name": "Journal Content",
                "mediaType": "text/plain",
                "src": `ipfs://${ipfsCid}`
              }
            ]
          }
        },
        "version": "1.0"
      }
    };

    console.log('🌐 Calling NMKR API...');

    // NMKR API call for minting (using Vite proxy to avoid CORS)
    // Using MintAndSendSpecific endpoint
    const nmkrResponse = await fetch(`/api/nmkr/v2/MintAndSendSpecific/${NMKR_PROJECT_UID}/${NMKR_NFT_UID}/1/${userAddress}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${NMKR_API_KEY}`
      }
    });

    if (!nmkrResponse.ok) {
      const errorData = await nmkrResponse.text();
      console.error('❌ NMKR API error:', errorData);
      throw new Error(`NMKR API error: ${nmkrResponse.status} ${nmkrResponse.statusText}`);
    }

    const nmkrResult = await nmkrResponse.json();
    console.log('✅ NMKR minting initiated:', nmkrResult);

    // NMKR returns transaction information
    const txHash = nmkrResult.transactionHash || nmkrResult.txHash || `nmkr_${Date.now()}`;

    console.log('🎉 NFT MINTING REQUEST SENT TO NMKR!');
    console.log('🔗 Transaction hash:', txHash);
    console.log('🖼️ NFT Policy ID:', POLICY_ID);
    console.log('🏷️ NFT Asset Name:', assetName);
    console.log('📍 Check NMKR dashboard for minting status');

    return txHash;

  } catch (error: any) {
    console.error('❌ Minting error:', error);
    const errorMessage = error?.message || error?.toString() || 'Unknown error occurred';
    console.error('❌ Full error details:', error);
    throw new Error(`Failed to mint NFT: ${errorMessage}`);
  }
}
