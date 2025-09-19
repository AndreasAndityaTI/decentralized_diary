import React from 'react'
import WalletConnect from './components/WalletConnect'
import DiaryForm, { DiaryEntry } from './components/DiaryForm'
import OnChainNote from './components/OnChainNote'

export default function App() {
  const [connected, setConnected] = React.useState(false)
  const [lastCid, setLastCid] = React.useState<string>('')
  const [entries, setEntries] = React.useState<Array<{ entry: DiaryEntry; cid: string }>>([])

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
        Decentralized Diary — Cardano 
      </h1>

      <WalletConnect onConnected={() => setConnected(true)} />

      <DiaryForm
        onPublished={(entry, cid) => {
          setLastCid(cid)
          setEntries((prev) => [{ entry, cid }, ...prev])
        }}
      />

      {lastCid && <OnChainNote cid={lastCid} />}

      <section className="space-y-3">
        <h3 className="font-semibold text-lg text-slate-200">Recent Entries</h3>
        {entries.map(({ entry, cid }, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur shadow-[0_0_20px_-8px_rgba(56,189,248,0.45)]"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-100">{entry.title}</h4>
              <a
                className="text-cyan-400 hover:text-cyan-300 hover:underline text-sm"
                href={`https://ipfs.io/ipfs/${cid}`}
                target="_blank"
                rel="noreferrer"
              >View on IPFS</a>
            </div>
            <p className="mt-2 text-slate-200 whitespace-pre-wrap">{entry.content}</p>
            <div className="mt-2 text-sm text-slate-400">
              <span>{new Date(entry.createdAt).toLocaleString()}</span>
              {entry.location && <span> • {entry.location}</span>}
              {entry.sentiment && <span> • {entry.sentiment.label} ({(entry.sentiment.score * 100).toFixed(1)}%)</span>}
            </div>
          </div>
        ))}
      </section>

      {!connected && (
        <p className="text-sm text-amber-300/90 bg-amber-500/10 border border-amber-400/30 p-3 rounded-lg">
          Connect a Cardano testnet wallet to continue. Make sure it’s set to Preprod.
        </p>
      )}
    </div>
  )
}