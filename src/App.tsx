import React from 'react'
import WalletConnect from './components/WalletConnect'
import DiaryForm, { DiaryEntry } from './components/DiaryForm'
import OnChainNote from './components/OnChainNote'

export default function App() {
  const [connected, setConnected] = React.useState(false)
  const [lastCid, setLastCid] = React.useState<string>('')
  const [entries, setEntries] = React.useState<Array<{ entry: DiaryEntry; cid: string }>>([])

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Pedestrian Diary — Cardano (Preprod)</h1>

      <WalletConnect onConnected={() => setConnected(true)} />

      <DiaryForm
        onPublished={(entry, cid) => {
          setLastCid(cid)
          setEntries((prev) => [{ entry, cid }, ...prev])
        }}
      />

      {lastCid && <OnChainNote cid={lastCid} />}

      <section className="space-y-3">
        <h3 className="font-semibold text-lg">Recent Entries</h3>
        {entries.map(({ entry, cid }, idx) => (
          <div key={idx} className="p-4 border rounded bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{entry.title}</h4>
              <a
                className="text-blue-600 hover:underline text-sm"
                href={`https://ipfs.io/ipfs/${cid}`}
                target="_blank"
                rel="noreferrer"
              >View on IPFS</a>
            </div>
            <p className="mt-2 text-gray-800 whitespace-pre-wrap">{entry.content}</p>
            <div className="mt-2 text-sm text-gray-600">
              <span>{new Date(entry.createdAt).toLocaleString()}</span>
              {entry.location && <span> • {entry.location}</span>}
              {entry.sentiment && <span> • {entry.sentiment.label} ({(entry.sentiment.score * 100).toFixed(1)}%)</span>}
            </div>
          </div>
        ))}
      </section>

      {!connected && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded">
          Connect a Cardano testnet wallet to continue. Make sure it’s set to Preprod.
        </p>
      )}
    </div>
  )
}