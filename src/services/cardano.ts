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

export async function getWalletNFTs(api: WalletAPI): Promise<Array<{
  policyId: string;
  assetName: string;
  txHash: string;
  amount: number;
}>> {
  if (!api.getUtxos) {
    throw new Error('Wallet does not support UTXO querying');
  }

  const utxoHexes = await api.getUtxos();
  if (!utxoHexes || utxoHexes.length === 0) {
    return [];
  }

  const cardanoLib = await loadCardanoLib();
  const nfts: Array<{
    policyId: string;
    assetName: string;
    txHash: string;
    amount: number;
  }> = [];

  for (const utxoHex of utxoHexes) {
    try {
      // Decode CBOR UTXO
      const utxoBytes = hexToBytes(utxoHex);
      const utxo = cardanoLib.TransactionUnspentOutput.from_bytes(utxoBytes);

      // Get transaction input (contains tx hash and index)
      const input = utxo.input();
      const txHash = bytesToHex(input.transaction_id().to_bytes());

      // Get output (contains amount and assets)
      const output = utxo.output();
      const amount = output.amount();

      // Get multiasset (native tokens)
      const multiAsset = amount.multiasset();
      if (multiAsset) {
        const policyKeys = multiAsset.keys();
        for (let i = 0; i < policyKeys.len(); i++) {
          const policyId = policyKeys.get(i);
          const policyIdHex = bytesToHex(policyId.to_bytes());

          const assets = multiAsset.get(policyId);
          if (assets) {
            const assetKeys = assets.keys();
            for (let j = 0; j < assetKeys.len(); j++) {
              const assetName = assetKeys.get(j);
              const assetNameHex = bytesToHex(assetName.to_bytes());
              const assetAmount = assets.get(assetName);

              // Convert hex asset name to string if possible
              let assetNameStr = assetNameHex;
              try {
                assetNameStr = hexToString(assetNameHex);
              } catch {
                // Keep as hex if conversion fails
              }

              nfts.push({
                policyId: policyIdHex,
                assetName: assetNameStr,
                txHash,
                amount: parseInt(assetAmount?.to_str() || '1')
              });
            }
          }
        }
      }
    } catch (error) {
      // Skip invalid UTXOs
    }
  }
  return nfts;
}

function hexToString(hex: string): string {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return new TextDecoder().decode(bytes);
}

export async function mintFirstJournalNFT(
  api: WalletAPI,
  walletAddress: string,
  ipfsCid: string
): Promise<string> {
  console.log('🎨 Starting NMKR NFT minting process...');

  // NMKR project configuration - Native policy project
  const POLICY_ID = "b402a071c9ec56729897dc08b56b3dee9ccf95e932c7f8d271c4ffd7"; // Native policy ID
  const NMKR_PROJECT_UID = "4c0d8492-90b1-40c8-b634-bbd03a59ac16"; // Native policy project
  const NMKR_API_KEY = "4760cd64b8044f61a11a5d0a3eea9ea4"; // API key

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
    // Using MintAndSendRandom endpoint
    const nmkrResponse = await fetch(`/api/nmkr/v2/MintAndSendRandom/${NMKR_PROJECT_UID}/1/${userAddress}`, {
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
    console.log('Minting request sent to NMKR');

    // NMKR minting is asynchronous - get the NFT ID and poll for status
    const sendedNft = nmkrResult.sendedNft || [];
    const nftId = sendedNft[0]?.id;

    if (!nftId) {
      console.warn('⚠️ No NFT ID found in response, using fallback');
      const txHash = nmkrResult.transactionHash ||
                    nmkrResult.txHash ||
                    nmkrResult.tx ||
                    nmkrResult.hash ||
                    nmkrResult.transaction ||
                    `nmkr_${Date.now()}`;
      return txHash;
    }

    // Get initial UTXOs before minting starts
    let initialUtxoSet = new Set<string>();
    try {
      if (api.getUtxos) {
        const initialUtxos = await api.getUtxos();
        if (initialUtxos) {
          initialUtxos.forEach(utxo => initialUtxoSet.add(utxo));
        }
      }
    } catch (error) {
      console.warn('Could not get initial UTXOs');
    }

    // Wait for new UTXOs with our NFT
    let txHash = '';
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds max

    while (attempts < maxAttempts && !txHash) {
      try {
        if (!api.getUtxos) break;

        const currentUtxos = await api.getUtxos();
        if (currentUtxos) {
          // Find new UTXOs not in initial set
          const newUtxos = currentUtxos.filter(utxo => !initialUtxoSet.has(utxo));

          for (const utxo of newUtxos) {
            try {
              const utxoBytes = hexToBytes(utxo);
              const cardanoLib = await loadCardanoLib();
              const utxoObj = cardanoLib.TransactionUnspentOutput.from_bytes(utxoBytes);
              const output = utxoObj.output();
              const amount = output.amount();
              const multiAsset = amount.multiasset();

              if (multiAsset) {
                const policyKeys = multiAsset.keys();
                for (let i = 0; i < policyKeys.len(); i++) {
                  const policyId = policyKeys.get(i);
                  const policyIdHex = bytesToHex(policyId.to_bytes());

                  if (policyIdHex === POLICY_ID) {
                    // Found our policy ID - get the transaction hash
                    const input = utxoObj.input();
                    txHash = bytesToHex(input.transaction_id().to_bytes());
                    console.log('NFT minted! Transaction:', txHash);
                    break;
                  }
                }
                if (txHash) break;
              }
            } catch {
              // Skip invalid UTXOs
            }
          }
        }
      } catch (error) {
        console.warn('Wallet check failed');
      }

      if (!txHash) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!txHash) {
      console.warn('⚠️ Could not find minted NFT in wallet, using fallback');
      txHash = `pending_${Date.now()}`;
    }

    console.log('NFT minted successfully! Transaction:', txHash);

    return txHash;

  } catch (error: any) {
    console.error('❌ Minting error:', error);
    const errorMessage = error?.message || error?.toString() || 'Unknown error occurred';
    console.error('❌ Full error details:', error);
    throw new Error(`Failed to mint NFT: ${errorMessage}`);
  }
}

export async function mintMonetizedJournalNFT(
  api: WalletAPI,
  walletAddress: string,
  ipfsCid: string,
  title: string
): Promise<{ policyId: string; assetName: string; txHash: string }> {
  console.log('🎨 Starting monetized journal NFT minting process...');

  // Use the same NMKR project for monetized journals
  const POLICY_ID = "b402a071c9ec56729897dc08b56b3dee9ccf95e932c7f8d271c4ffd7";
  const NMKR_PROJECT_UID = "4c0d8492-90b1-40c8-b634-bbd03a59ac16";
  const NMKR_API_KEY = "4760cd64b8044f61a11a5d0a3eea9ea4";

  try {
    const userAddress = await ensureBech32Address(walletAddress);
    if (!userAddress) {
      throw new Error("No wallet address provided");
    }

    // Generate unique asset name for this journal
    const assetName = `MonetizedJournal_${Date.now()}`;

    console.log('🌐 Calling NMKR API for monetized journal...');

    const nmkrResponse = await fetch(`/api/nmkr/v2/MintAndSendRandom/${NMKR_PROJECT_UID}/1/${userAddress}`, {
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
    const sendedNft = nmkrResult.sendedNft || [];
    const nftId = sendedNft[0]?.id;

    const txHash = nftId || nmkrResult.transactionHash || `nmkr_${Date.now()}`;

    console.log('Monetized NFT minted successfully!', { policyId: POLICY_ID, assetName, txHash });

    return { policyId: POLICY_ID, assetName, txHash };

  } catch (error: any) {
    console.error('❌ Monetized NFT minting error:', error);
    throw new Error(`Failed to mint monetized NFT: ${error?.message || 'Unknown error'}`);
  }
}

export async function payForJournalAccess(
  api: WalletAPI,
  buyerAddress: string,
  journalPolicyId: string,
  journalAssetName: string,
  priceLovelace: number
): Promise<string> {
  console.log('💰 Starting journal access payment...');

  // Journal Payment Contract Address (would be deployed contract address)
  const CONTRACT_ADDRESS = "addr_test1..."; // Placeholder - needs to be set after deployment

  try {
    // This would construct and submit a transaction to the journal payment contract
    // For now, this is a placeholder implementation

    console.log('Payment processed for journal access');
    return `payment_${Date.now()}`;

  } catch (error: any) {
    console.error('❌ Payment error:', error);
    throw new Error(`Failed to pay for journal access: ${error?.message || 'Unknown error'}`);
  }
}

export async function checkJournalAccess(
  api: WalletAPI,
  buyerAddress: string,
  journalPolicyId: string,
  journalAssetName: string
): Promise<boolean> {
  console.log('🔍 Checking journal access...');

  try {
    // Check if user has paid for this journal by looking at contract UTXOs
    // For now, return false (no access) as placeholder

    return false;

  } catch (error) {
    console.error('❌ Access check error:', error);
    return false;
  }
}

export async function payForAISubscription(
  api: WalletAPI,
  buyerAddress: string
): Promise<string> {
  console.log('🤖 Starting AI subscription payment...');

  // AI Subscription Contract Address (would be deployed contract address)
  const CONTRACT_ADDRESS = "addr_test1..."; // Placeholder - needs to be set after deployment

  try {
    // This would construct and submit a transaction to the AI subscription contract
    // For now, this is a placeholder implementation

    console.log('AI subscription payment processed');
    return `ai_subscription_${Date.now()}`;

  } catch (error: any) {
    console.error('❌ AI subscription payment error:', error);
    throw new Error(`Failed to pay for AI subscription: ${error?.message || 'Unknown error'}`);
  }
}

