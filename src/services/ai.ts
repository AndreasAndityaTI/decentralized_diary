// AI companion integration using Phi-3 compatible endpoint (defaults to Ollama)
// Configure via environment:
// - VITE_AI_ENDPOINT (default: http://localhost:11434/api/generate)
// - VITE_AI_MODEL    (default: phi3)
// - VITE_AI_AUTH     (optional: e.g., "Bearer <token>")

import axios from 'axios'

const AI_ENDPOINT = import.meta.env.VITE_AI_ENDPOINT 
const AI_MODEL = import.meta.env.VITE_AI_MODEL 
const AI_AUTH = import.meta.env.VITE_AI_AUTH 

// Generate empathetic assistant reply using Phi-3
export async function generateAIReply(userInput: string, history: string[] = []): Promise<string> {
  if (!AI_ENDPOINT) throw new Error('Missing VITE_AI_ENDPOINT')

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (AI_AUTH) headers['Authorization'] = AI_AUTH

  const systemPreamble = `You are DeDiary Companion, an empathetic journaling assistant.
- Be supportive and concise (2-5 sentences).
- Ask one gentle follow-up question when appropriate.
- Do not provide medical or legal advice.
- Reflect back user's emotions when clear.`

  const convo = history.join('\n')
  const prompt = `${systemPreamble}
\nConversation so far:\n${convo}\n\nUser: ${userInput}\nAssistant:`

  try {
    const body = {
      model: AI_MODEL,
      prompt,
      stream: false,
    }
    const res = await axios.post(AI_ENDPOINT, body, { headers })
    const text = (res.data?.response || '').trim()
    return text || 'I hear you. Could you share a bit more about how this affected you?'
  } catch (err: any) {
    const status = err?.response?.status
    const msg = err?.response?.data?.error
    const base = status ? `AI API error ${status}` : 'AI API error'
    throw new Error(msg ? `${base}: ${msg}` : base)
  }
}