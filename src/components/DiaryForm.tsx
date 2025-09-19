import React from 'react'
import { classifySentiment } from '../services/sentiment'
import { uploadJsonToIpfs } from '../services/ipfs'

export type DiaryEntry = {
  title: string
  content: string
  createdAt: string
  location?: string
  sentiment?: { label: string; score: number }
}

export default function DiaryForm(props: { onPublished: (entry: DiaryEntry, ipfsCid: string) => void }) {
  const [title, setTitle] = React.useState('')
  const [content, setContent] = React.useState('')
  const [location, setLocation] = React.useState('')
  const [sentiment, setSentiment] = React.useState<{ label: string; score: number } | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const analyze = async () => {
    try {
      setError('')
      setLoading(true)
      const res = await classifySentiment(content || title)
      setSentiment(res)
    } catch (e: any) {
      setError(e?.message || 'Sentiment analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const publish = async () => {
    try {
      setError('')
      setLoading(true)
      const entry: DiaryEntry = {
        title,
        content,
        createdAt: new Date().toISOString(),
        location: location || undefined,
        sentiment: sentiment || undefined,
      }
      const ipfs = await uploadJsonToIpfs(entry)
      props.onPublished(entry, ipfs.cid)
    } catch (e: any) {
      setError(e?.message || 'Publish failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur space-y-3 shadow-[0_0_24px_-10px_rgba(34,211,238,0.35)]">
      <h3 className="font-semibold text-lg text-slate-100">New Diary Entry</h3>
      <input
        className="w-full border border-slate-700/70 bg-slate-900 text-slate-100 placeholder-slate-500 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full border border-slate-700/70 bg-slate-900 text-slate-100 placeholder-slate-500 rounded-lg p-2 min-h-[140px] focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60"
        placeholder="Share your pedestrian journey..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <input
        className="w-full border border-slate-700/70 bg-slate-900 text-slate-100 placeholder-slate-500 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
        placeholder="Location (optional)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <button
          onClick={analyze}
          disabled={loading}
          className="px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-fuchsia-600 text-white hover:from-cyan-500 hover:to-fuchsia-500 disabled:opacity-50"
        >
          Analyze Sentiment
        </button>
        {sentiment && (
          <span className="text-sm text-slate-300">{sentiment.label} ({(sentiment.score * 100).toFixed(1)}%)</span>
        )}
      </div>
      <div className="flex justify-end">
        <button
          onClick={publish}
          disabled={loading}
          className="px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50"
        >
          Publish to IPFS
        </button>
      </div>
      {error && <p className="text-sm text-rose-400">{error}</p>}
    </div>
  )
}