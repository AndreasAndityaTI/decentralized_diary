// Sentiment classification via external API (e.g., Hugging Face Inference API)
// Configure endpoint and authorization via env

import axios from 'axios'

export type SentimentResult = {
  label: string
  score: number
}

const SENTIMENT_ENDPOINT = import.meta.env.VITE_SENTIMENT_ENDPOINT || ''
const SENTIMENT_AUTH = import.meta.env.VITE_SENTIMENT_AUTH || ''

export async function classifySentiment(text: string): Promise<SentimentResult> {
  if (!SENTIMENT_ENDPOINT) throw new Error('Missing VITE_SENTIMENT_ENDPOINT')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  if (SENTIMENT_AUTH) headers['Authorization'] = SENTIMENT_AUTH

  const res = await axios.post(SENTIMENT_ENDPOINT, { inputs: text }, { headers })

  // Hugging Face pipelines often return array-of-arrays of {label, score}
  const pred = Array.isArray(res.data) ? (Array.isArray(res.data[0]) ? res.data[0][0] : res.data[0]) : res.data
  const label = pred?.label || 'NEUTRAL'
  const score = pred?.score ?? 0.5
  return { label, score }
}