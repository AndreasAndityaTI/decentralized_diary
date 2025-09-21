import React from "react";
import { classifySentiment } from "../services/sentiment";
import { uploadJsonToIpfs } from "../services/ipfs";

export type DiaryEntry = {
  title: string;
  content: string;
  createdAt: string;
  location?: string;
  sentiment?: { label: string; score: number };
};

const moodEmojis = {
  happy: "😊",
  sad: "😢",
  anxious: "😰",
  motivated: "💪",
  calm: "😌",
  excited: "🤩",
  frustrated: "😤",
  grateful: "🙏",
};

export default function DiaryForm(props: {
  onPublished: (entry: DiaryEntry, ipfsCid: string) => void;
}) {
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [sentiment, setSentiment] = React.useState<{
    label: string;
    score: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [showAIChat, setShowAIChat] = React.useState(false);
  const [aiMessage, setAiMessage] = React.useState("");

  const analyze = async () => {
    try {
      setError("");
      setLoading(true);
      const res = await classifySentiment(content || title);
      setSentiment(res);
    } catch (e: any) {
      setError(e?.message || "Sentiment analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const publish = async () => {
    try {
      setError("");
      setLoading(true);
      const entry: DiaryEntry = {
        title,
        content,
        createdAt: new Date().toISOString(),
        location: location || undefined,
        sentiment: sentiment || undefined,
      };
      const ipfs = await uploadJsonToIpfs(entry);
      props.onPublished(entry, ipfs.cid);
    } catch (e: any) {
      setError(e?.message || "Publish failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">
          Write Today's Story
        </h3>
        <button
          onClick={() => setShowAIChat(!showAIChat)}
          className="px-4 py-2 bg-gradient-to-r from-lavender to-sky-blue text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
        >
          <span>🤖</span>
          <span>AI Companion</span>
        </button>
      </div>

      {/* AI Chat Panel */}
      {showAIChat && (
        <div className="bg-gradient-to-r from-lavender/10 to-sky-blue/10 rounded-xl p-4 border border-lavender/20">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-lavender to-sky-blue rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🤖</span>
            </div>
            <h4 className="font-semibold text-gray-800">
              AI Writing Assistant
            </h4>
          </div>
          <div className="bg-white/60 rounded-lg p-3 mb-3">
            <p className="text-gray-700 text-sm">
              {aiMessage ||
                "I'm here to help you reflect on your day. What's on your mind? I can help you organize your thoughts or suggest writing prompts."}
            </p>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Ask me anything about your mood or writing..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender text-sm"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  setAiMessage(
                    "Thanks for sharing! I can see you're working through some thoughts. Try writing about what made you feel this way today."
                  );
                }
              }}
            />
            <button
              className="px-4 py-2 bg-gradient-to-r from-lavender to-sky-blue text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm"
              onClick={() =>
                setAiMessage(
                  "Thanks for sharing! I can see you're working through some thoughts. Try writing about what made you feel this way today."
                )
              }
            >
              Send
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <input
          className="w-full border border-gray-300 bg-white text-gray-800 placeholder-gray-500 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-lavender text-lg"
          placeholder="What's your story title today?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full border border-gray-300 bg-white text-gray-800 placeholder-gray-500 rounded-xl p-4 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-lavender resize-none text-lg leading-relaxed"
          placeholder="How are you feeling today? What happened? What are you grateful for? Share your thoughts freely..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <input
          className="w-full border border-gray-300 bg-white text-gray-800 placeholder-gray-500 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-lavender"
          placeholder="📍 Where are you writing from? (optional)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      {/* Mood Analysis */}
      <div className="flex items-center justify-between">
        <button
          onClick={analyze}
          disabled={loading || !content.trim()}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-mint-green to-soft-yellow text-gray-800 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? "Analyzing..." : "🔍 Analyze My Mood"}
        </button>

        {sentiment && (
          <div className="flex items-center space-x-3 bg-gradient-to-r from-lavender/20 to-sky-blue/20 rounded-xl p-3">
            <span className="text-2xl">
              {moodEmojis[sentiment.label as keyof typeof moodEmojis] || "😊"}
            </span>
            <div>
              <div className="font-semibold text-gray-800 capitalize">
                {sentiment.label}
              </div>
              <div className="text-sm text-gray-600">
                {(sentiment.score * 100).toFixed(1)}% confidence
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={publish}
          disabled={loading || !title.trim() || !content.trim()}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-lavender to-sky-blue text-white hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
        >
          {loading ? "Publishing..." : "✨ Publish to IPFS"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
