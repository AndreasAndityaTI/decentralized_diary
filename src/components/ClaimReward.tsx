import React from 'react'
import { WalletAPI } from '../services/cardano'
// We will need cardano-serialization-lib and potentially other libraries
// to build the transaction. This is a simplified example.

export default function ClaimReward(props: { walletApi: WalletAPI | null, lastCid: string }) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [success, setSuccess] = React.useState('')

  const claim = async () => {
    if (!props.walletApi || !props.lastCid) {
      setError('Wallet not connected or no recent post CID available.')
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')

      // This is a placeholder for the complex logic of building a Cardano transaction.
      // A real implementation would need:
      // 1. A provider to query the blockchain for the contract's UTxO (e.g., Blockfrost, Koios).
      // 2. The compiled smart contract script (from Aiken).
      // 3. A library like cardano-serialization-lib to build the transaction body.
      // 4. The user's wallet to sign and submit the transaction.

      console.log(`Claiming reward for CID: ${props.lastCid}`)
      // --- Transaction building logic would go here ---

      // Simulating a successful claim for demonstration purposes.
      await new Promise(resolve => setTimeout(resolve, 2000))

      setSuccess('Reward claimed successfully! (This is a simulation)')

    } catch (e: any) {
      setError(e?.message || 'Failed to claim reward.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded bg-white shadow-sm">
      <h3 className="font-semibold text-lg">Claim Reward</h3>
      <p className="text-sm text-gray-700">Claim a token reward for your latest diary post.</p>
      <p className="text-sm text-gray-600 mt-1">Latest Post CID: <code className="bg-gray-100 px-1 py-0.5 rounded break-all">{props.lastCid || 'N/A'}</code></p>
      <div className="mt-3">
        <button onClick={claim} disabled={loading || !props.lastCid} className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Claiming...' : 'Claim Reward'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-2 text-sm text-green-600">{success}</p>}
    </div>
  )
}