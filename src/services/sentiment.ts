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
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  if (SENTIMENT_AUTH) headers['Authorization'] = SENTIMENT_AUTH

  try {
    // Add options.wait_for_model to avoid cold-start errors and unify behavior
    const body = {
      inputs: text,
      options: { wait_for_model: true },
    }

    const res = await axios.post(SENTIMENT_ENDPOINT, { inputs: text }, { headers })

    // Hugging Face pipelines often return array-of-arrays of {label, score}
    const pred = Array.isArray(res.data) ? (Array.isArray(res.data[0]) ? res.data[0][0] : res.data[0]) : res.data

    // The model j-hartmann/emotion-english-distilroberta-base returns labels like 'joy', 'sadness', etc.
    // We map them to the simplified categories requested.
    const modelLabel = pred?.label || 'neutral'
    const score = pred?.score ?? 0.5

    const labelMap: { [key: string]: string } = {
      joy: 'happy',
      sadness: 'sad',
      anger: 'angry',
      neutral: 'neutral'
    }

    let label = labelMap[modelLabel] || 'neutral' // Default to neutral for other emotions

    // Add intensity to the label based on the score
    if (score > 0.8) {
      if (label === 'happy') label = 'very happy'
      if (label === 'sad') label = 'very sad'
      if (label === 'angry') label = 'very angry'
    }

    return { label, score }
  } catch (err: any) {
    const status = err?.response?.status
    const hfMsg = err?.response?.data?.error || err?.response?.data?.message
    const base = status ? `Hugging Face API error ${status}` : 'Hugging Face API error'
    throw new Error(hfMsg ? `${base}: ${hfMsg}` : base)
  }
}