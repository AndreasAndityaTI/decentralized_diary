// Lightweight CIP-30 wallet connector for Cardano (Preprod)
// Assumes user has a wallet extension supporting CIP-30 (Nami, Eternl, Lace)

export type WalletAPI = {
  getNetworkId: () => Promise<number>
  getUsedAddresses: () => Promise<string[]>
  getUnusedAddresses: () => Promise<string[]>
  getChangeAddress: () => Promise<string>
  signData?: (addr: string, payload: string) => Promise<{ key: string; signature: string }>
}

export async function enableWallet(): Promise<WalletAPI | null> {
  const anyWin = window as any
  const wallets = ["eternl", "nami", "lace"]
  for (const w of wallets) {
    if (anyWin.cardano?.[w]?.enable) {
      const api: WalletAPI = await anyWin.cardano[w].enable()
      return api
    }
  }
  return null
}

export async function getWalletInfo(api: WalletAPI) {
  const networkId = await api.getNetworkId() // 0 = testnets, 1 = mainnet
  const used = await api.getUsedAddresses()
  const unused = await api.getUnusedAddresses()
  const change = await api.getChangeAddress()
  return { networkId, used, unused, change }
}