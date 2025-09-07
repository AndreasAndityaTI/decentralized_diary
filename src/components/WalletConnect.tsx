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
    <div className="p-4 border rounded bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Wallet</h3>
          {info ? (
            <p className="text-sm text-gray-600">Network: {info.networkId === 0 ? 'Testnet' : 'Mainnet'}</p>
          ) : (
            <p className="text-sm text-gray-600">Connect Cardano wallet (CIP-30)</p>
          )}
        </div>
        <button onClick={connect} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          {api ? 'Reconnect' : 'Connect'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}