// Sentiment classification via external API (e.g., Hugging Face Inference API)
// Configure endpoint and authorization via env

import axios from "axios";

export type SentimentResult = {
  label: string;
  score: number;
};

const SENTIMENT_ENDPOINT =
  import.meta.env.VITE_SENTIMENT_ENDPOINT ||
  "http://localhost:11434/api/generate";
const SENTIMENT_MODEL = import.meta.env.VITE_SENTIMENT_MODEL || "phi3";
const SENTIMENT_AUTH = import.meta.env.VITE_SENTIMENT_AUTH || "";

export async function classifySentiment(
  text: string
): Promise<SentimentResult> {
  if (!SENTIMENT_ENDPOINT) throw new Error("Missing VITE_SENTIMENT_ENDPOINT");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (SENTIMENT_AUTH) headers["Authorization"] = SENTIMENT_AUTH;

  try {
    const prompt = `Given the following text, classify its predominant sentiment as one of the following labels: 'happy', 'sad', 'angry', 'neutral'. Return only the label as a single word.

Text: "${text}"

Sentiment:`;

    const body = {
      model: SENTIMENT_MODEL,
      prompt: prompt,
      stream: false,
    };

    const res = await axios.post(SENTIMENT_ENDPOINT, body, { headers });

    const modelLabel = (res.data?.response || "neutral").trim().toLowerCase();

    // We can't get a score from a generative model like this, so we'll default to a high score.
    const score = 0.9;

    const labelMap: { [key: string]: string } = {
      joy: "happy",
      sadness: "sad",
      anger: "angry",
      neutral: "neutral",
      happy: "happy",
      sad: "sad",
      angry: "angry",
    };

    let label = labelMap[modelLabel] || "neutral"; // Default to neutral for other emotions

    // Add intensity to the label based on the score
    // if (score > 0.8) {
    //   if (label === 'happy') label = 'very happy'
    //   if (label === 'sad') label = 'very sad'
    //   if (label === 'angry') label = 'very angry'
    // }

    return { label, score };
  } catch (err: any) {
    const status = err?.response?.status;
    const ollamaMsg = err?.response?.data?.error;
    const base = status ? `Ollama API error ${status}` : "Ollama API error";
    throw new Error(ollamaMsg ? `${base}: ${ollamaMsg}` : base);
  }
}
