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
    <div className="p-4 border rounded bg-white shadow-sm space-y-3">
      <h3 className="font-semibold text-lg">New Diary Entry</h3>
      <input
        className="w-full border rounded p-2"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full border rounded p-2 min-h-[140px]"
        placeholder="Share your pedestrian journey..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <input
        className="w-full border rounded p-2"
        placeholder="Location (optional)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <button onClick={analyze} disabled={loading} className="px-3 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50">Analyze Sentiment</button>
        {sentiment && (
          <span className="text-sm text-gray-700">{sentiment.label} ({(sentiment.score * 100).toFixed(1)}%)</span>
        )}
      </div>
      <div className="flex justify-end">
        <button onClick={publish} disabled={loading} className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">Publish to IPFS</button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}