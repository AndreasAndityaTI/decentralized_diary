import React from 'react'
import { enableWallet, getWalletInfo, WalletAPI } from '../services/cardano'

export default function WalletConnect(props: { onConnected: (api: WalletAPI, info: any) => void }) {
  const [api, setApi] = React.useState<WalletAPI | null>(null)
  const [info, setInfo] = React.useState<any>(null)
  const [error, setError] = React.useState<string>('')

  const connect = async () => {
    try {
      setError('')
      const w = await enableWallet()
      if (!w) {
        setError('No CIP-30 wallet found. Install Nami, Eternl, or Lace.')
        return
      }
      const i = await getWalletInfo(w)
      if (i.networkId !== 0) {
        setError('Please switch wallet to Preprod/Preview testnet.')
      }
      setApi(w)
      setInfo(i)
      props.onConnected(w, i)
    } catch (e: any) {
      setError(e?.message || 'Wallet connect failed')
    }
  }

  return (
    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur shadow-[0_0_24px_-10px_rgba(99,102,241,0.45)]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg text-slate-100">Wallet</h3>
          {info ? (
            <p className="text-sm text-slate-400">Network: {info.networkId === 0 ? 'Testnet' : 'Mainnet'}</p>
          ) : (
            <p className="text-sm text-slate-400">Connect Cardano wallet (CIP-30)</p>
          )}
        </div>
        <button
          onClick={connect}
          className="px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white hover:from-indigo-500 hover:to-fuchsia-500 shadow-[0_0_20px_-8px_rgba(139,92,246,0.6)]"
        >
          {api ? 'Reconnect' : 'Connect'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
    </div>
  )
}