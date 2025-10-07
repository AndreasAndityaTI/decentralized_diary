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
  console.log('🎨 Starting Blockfrost NFT minting process...');

  // For now, use key policy minting since Plutus isn't supported in browser CSL
  const POLICY_ID = '741f480a059f581fe6250375077d304401732d661a22a15aa7509ed8';

  const cardanoLib = await loadCardanoLib();

  try {
    console.log('🔍 Checking wallet connection...');
    console.log('Available wallet API methods:', Object.keys(api));

    const userAddress = await ensureBech32Address(walletAddress);
    if (!userAddress) {
      throw new Error("No wallet address provided");
    }

    console.log('✅ Using wallet address:', userAddress.substring(0, 20) + '...');

    // Get UTXOs from Blockfrost
    console.log('📦 Getting UTXOs from Blockfrost...');
    const utxoResponse = await fetch(`https://cardano-preprod.blockfrost.io/api/v0/addresses/${userAddress}/utxos`, {
      headers: {
        'project_id': BLOCKFROST_PROJECT_ID
      }
    });
    if (!utxoResponse.ok) {
      throw new Error(`Failed to fetch UTXOs: ${utxoResponse.status}`);
    }
    const utxoData = await utxoResponse.json();
    if (!utxoData || utxoData.length === 0) {
      throw new Error("No UTXOs available in wallet");
    }

    // Convert Blockfrost UTXO data to TransactionUnspentOutput
    const utxos = utxoData.slice(0, 5).map((utxo: any) => {
      const txHash = utxo.tx_hash;
      const outputIndex = utxo.output_index;
      const amount = utxo.amount;
      const address = utxo.address;

      // Build the UTXO
      const txIn = cardanoLib.TransactionInput.new(cardanoLib.TransactionHash.from_bytes(hexToBytes(txHash)), outputIndex);
      const value = cardanoLib.Value.new(cardanoLib.BigNum.from_str('0'));
      for (const amt of amount) {
        if (amt.unit === 'lovelace') {
          value.set_coin(cardanoLib.BigNum.from_str(amt.quantity));
        } else {
          // Multi asset
          const policyId = amt.unit.slice(0, 56);
          const assetName = amt.unit.slice(56);
          const multiAsset = value.multiasset() || cardanoLib.MultiAsset.new();
          const assets = multiAsset.get(cardanoLib.ScriptHash.from_hex(policyId)) || cardanoLib.Assets.new();
          assets.insert(cardanoLib.AssetName.new(hexToBytes(assetName)), cardanoLib.BigNum.from_str(amt.quantity));
          multiAsset.insert(cardanoLib.ScriptHash.from_hex(policyId), assets);
          value.set_multiasset(multiAsset);
        }
      }
      const txOut = cardanoLib.TransactionOutput.new(cardanoLib.Address.from_bech32(address), value);
      return cardanoLib.TransactionUnspentOutput.new(txIn, txOut);
    });

    // Use user address as change address
    const changeAddress = userAddress;
    console.log('🏠 Using user address as change address');

    // Get protocol parameters from Blockfrost
    console.log('⚙️ Fetching protocol parameters...');
    const protocolResponse = await fetch(`https://cardano-preprod.blockfrost.io/api/v0/epochs/latest/parameters`, {
      headers: {
        'project_id': BLOCKFROST_PROJECT_ID
      }
    });
    if (!protocolResponse.ok) {
      throw new Error(`Failed to fetch protocol parameters: ${protocolResponse.status}`);
    }
    const protocolParams = await protocolResponse.json();
    const pParams = {
      min_fee_a: protocolParams.min_fee_a || DEFAULT_PROTOCOL_PARAMS.min_fee_a,
      min_fee_b: protocolParams.min_fee_b || DEFAULT_PROTOCOL_PARAMS.min_fee_b,
      pool_deposit: protocolParams.pool_deposit || DEFAULT_PROTOCOL_PARAMS.pool_deposit,
      key_deposit: protocolParams.key_deposit || DEFAULT_PROTOCOL_PARAMS.key_deposit,
      max_val_size: protocolParams.max_val_size || DEFAULT_PROTOCOL_PARAMS.max_val_size,
      max_tx_size: protocolParams.max_tx_size || DEFAULT_PROTOCOL_PARAMS.max_tx_size,
      coins_per_utxo_size: protocolParams.coins_per_utxo_size || DEFAULT_PROTOCOL_PARAMS.coins_per_utxo_size,
    };

    // Prepare minting
    const assetName = 'FirstJournalNFT';
    const assetNameHex = bytesToHex(stringToBytes(assetName));

    // Create metadata
    const metadata = cardanoLib.GeneralTransactionMetadata.new();

    // CIP-25 metadata structure
    const assetMetadataMap = cardanoLib.MetadataMap.new();
    assetMetadataMap.insert(
      cardanoLib.TransactionMetadatum.new_text('name'),
      cardanoLib.TransactionMetadatum.new_text('First Journal NFT')
    );
    assetMetadataMap.insert(
      cardanoLib.TransactionMetadatum.new_text('image'),
      cardanoLib.TransactionMetadatum.new_text(ipfsCid)
    );
    assetMetadataMap.insert(
      cardanoLib.TransactionMetadatum.new_text('mediaType'),
      cardanoLib.TransactionMetadatum.new_text('image/jpeg')
    );
    assetMetadataMap.insert(
      cardanoLib.TransactionMetadatum.new_text('description'),
      cardanoLib.TransactionMetadatum.new_text('NFT for first journal entry on decentralized diary')
    );

    // Files array
    const fileMap = cardanoLib.MetadataMap.new();
    fileMap.insert(cardanoLib.TransactionMetadatum.new_text('name'), cardanoLib.TransactionMetadatum.new_text('Journal Content'));
    fileMap.insert(cardanoLib.TransactionMetadatum.new_text('mediaType'), cardanoLib.TransactionMetadatum.new_text('text/plain'));
    fileMap.insert(cardanoLib.TransactionMetadatum.new_text('src'), cardanoLib.TransactionMetadatum.new_text(ipfsCid));
    const filesList = cardanoLib.MetadataList.new();
    filesList.add(cardanoLib.TransactionMetadatum.new_map(fileMap));
    assetMetadataMap.insert(cardanoLib.TransactionMetadatum.new_text('files'), cardanoLib.TransactionMetadatum.new_list(filesList));

    const policyMetadataMap = cardanoLib.MetadataMap.new();
    policyMetadataMap.insert(cardanoLib.TransactionMetadatum.new_text(assetName), cardanoLib.TransactionMetadatum.new_map(assetMetadataMap));

    const cip25Map = cardanoLib.MetadataMap.new();
    cip25Map.insert(cardanoLib.TransactionMetadatum.new_bytes(hexToBytes(POLICY_ID)), cardanoLib.TransactionMetadatum.new_map(policyMetadataMap));
    cip25Map.insert(cardanoLib.TransactionMetadatum.new_text('version'), cardanoLib.TransactionMetadatum.new_text('1.0'));

    metadata.insert(cardanoLib.BigNum.from_str('721'), cardanoLib.TransactionMetadatum.new_map(cip25Map));

    // Build transaction
    console.log('🔨 Building transaction...');
    const txBuilder = cardanoLib.TransactionBuilder.new(
      cardanoLib.TransactionBuilderConfigBuilder.new()
        .fee_algo(cardanoLib.LinearFee.new(cardanoLib.BigNum.from_str(pParams.min_fee_a.toString()), cardanoLib.BigNum.from_str(pParams.min_fee_b.toString())))
        .pool_deposit(cardanoLib.BigNum.from_str(pParams.pool_deposit.toString()))
        .key_deposit(cardanoLib.BigNum.from_str(pParams.key_deposit.toString()))
        .max_value_size(pParams.max_val_size)
        .max_tx_size(pParams.max_tx_size)
        .coins_per_utxo_byte(cardanoLib.BigNum.from_str(pParams.coins_per_utxo_size.toString()))
        .build()
    );

    // Add inputs
    for (const utxo of utxos.slice(0, 5)) { // Use up to 5 UTXOs
      txBuilder.add_input(utxo.output().address(), utxo.input(), utxo.output().amount());
    }

    // Add mint
    const mintAssets = cardanoLib.MintAssets.new();
    mintAssets.insert(cardanoLib.AssetName.new(hexToBytes(assetNameHex)), cardanoLib.Int.new_i32(1));
    const mint = cardanoLib.Mint.new();
    mint.insert(cardanoLib.ScriptHash.from_hex(POLICY_ID), mintAssets);
    txBuilder.set_mint(mint);

    // Add output with NFT
    const outputAddress = cardanoLib.Address.from_bech32(userAddress);
    const value = cardanoLib.Value.new(cardanoLib.BigNum.from_str('2000000')); // 2 ADA for fees
    const multiAsset = cardanoLib.MultiAsset.new();
    const assets = cardanoLib.Assets.new();
    assets.insert(cardanoLib.AssetName.new(hexToBytes(assetNameHex)), cardanoLib.BigNum.from_str('1'));
    multiAsset.insert(cardanoLib.ScriptHash.from_hex(POLICY_ID), assets);
    value.set_multiasset(multiAsset);
    txBuilder.add_output(cardanoLib.TransactionOutput.new(outputAddress, value));

    // Set metadata
    txBuilder.set_auxiliary_data(cardanoLib.AuxiliaryData.new().set_metadata(metadata));

    // Add change
    txBuilder.add_change_if_needed(cardanoLib.Address.from_bech32(changeAddress));

    // Build transaction
    const tx = txBuilder.build_tx();
    const txHex = bytesToHex(tx.to_bytes());

    console.log('✍️ Signing transaction...');
    const signedTxHex = await api.signTx(txHex, false);

    console.log('📤 Submitting transaction to Blockfrost...');
    const submitResponse = await fetch(`https://cardano-preprod.blockfrost.io/api/v0/tx/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/cbor',
        'project_id': BLOCKFROST_PROJECT_ID
      },
      body: hexToBytes(signedTxHex) as any
    });
    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      throw new Error(`Failed to submit transaction: ${submitResponse.status} ${errorText}`);
    }
    const submitResult = await submitResponse.json();

    console.log('🎉 NFT MINTING SUCCESSFUL!');
    console.log('🔗 Transaction hash:', submitResult);
    console.log('🖼️ NFT Policy ID:', POLICY_ID);
    console.log('🏷️ NFT Asset Name:', assetName);

    return submitResult;

  } catch (error: any) {
    console.error('❌ Minting error:', error);
    const errorMessage = error?.message || error?.toString() || 'Unknown error occurred';
    console.error('❌ Full error details:', error);
    throw new Error(`Failed to mint NFT: ${errorMessage}`);
  }
}
