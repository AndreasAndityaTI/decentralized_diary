import React from 'react'

// Placeholder for on-chain anchoring UX.
// We only record IPFS CID + metadata on-chain to keep costs low.
// Implementing actual tx build/sign/submit requires a backend or an in-browser builder using CSL.

export default function OnChainNote(props: { cid: string }) {
  const { cid } = props

  return (
    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur shadow-[0_0_24px_-10px_rgba(168,85,247,0.35)]">
      <h3 className="font-semibold text-lg text-slate-100">On-chain Anchor</h3>
      <p className="text-sm text-slate-300">IPFS CID: <code className="bg-slate-800 px-1 py-0.5 rounded text-cyan-300">{cid}</code></p>
      <p className="text-sm text-slate-400 mt-2">Next step: Submit a Cardano transaction that stores this CID and minimal metadata in a simple script or reference datum on Preprod.</p>
      <ul className="list-disc pl-5 text-sm text-slate-400 mt-2">
        <li>Use CSL to build a tx with a datum containing the CID hash.</li>
        <li>Have the wallet sign and submit via CIP-30.</li>
        <li>Alternatively, use a backend service to assemble the tx.</li>
      </ul>
    </div>
  )
}