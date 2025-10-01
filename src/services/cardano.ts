// Lightweight CIP-30 wallet connector for Cardano (Preprod)
// Assumes user has a wallet extension supporting CIP-30 (Nami, Eternl, Lace)

export type WalletAPI = {
  getNetworkId: () => Promise<number>;
  getUsedAddresses: () => Promise<string[]>;
  getUnusedAddresses: () => Promise<string[]>;
  getChangeAddress: () => Promise<string>;
  signData?: (
    addr: string,
    payload: string
  ) => Promise<{ key: string; signature: string }>;
};

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
    const change = await api.getChangeAddress();
    return { networkId, used, unused, change };
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
          const change = await freshApi.getChangeAddress();
          return { networkId, used, unused, change };
        }
      }
    }

    throw error;
  }
}
