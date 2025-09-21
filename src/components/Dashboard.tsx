import React, { useState } from "react";
import { DiaryEntry } from "./DiaryForm";

interface DashboardProps {
  onPublish: (entry: DiaryEntry, cid: string) => void;
  entries: Array<{ entry: DiaryEntry; cid: string }>;
}

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

export default function Dashboard({ onPublish, entries }: DashboardProps) {
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  const handleAIChat = () => {
    setShowAIChat(!showAIChat);
    if (!showAIChat) {
      // Simulate AI response
      setTimeout(() => {
        setAiResponse(
          "I'm here to help you reflect on your day. What's on your mind?"
        );
      }, 1000);
    }
  };

  const todayEntry = entries.find(({ entry }) => {
    const today = new Date().toDateString();
    return new Date(entry.createdAt).toDateString() === today;
  });

  return (
    <div className="flex-1 p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Good{" "}
            {new Date().getHours() < 12
              ? "Morning"
              : new Date().getHours() < 18
              ? "Afternoon"
              : "Evening"}
            !
          </h1>
          <p className="text-gray-600 mt-1">How are you feeling today?</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleAIChat}
            className="px-4 py-2 bg-gradient-to-r from-lavender to-sky-blue text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
          >
            <span>🤖</span>
            <span>AI Companion</span>
          </button>
        </div>
      </div>

      {/* AI Chat Panel */}
      {showAIChat && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-lavender to-sky-blue rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🤖</span>
            </div>
            <h3 className="font-semibold text-gray-800">AI Companion</h3>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-gray-700">{aiResponse}</p>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Ask me anything about your mood..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender"
            />
            <button className="px-6 py-2 bg-gradient-to-r from-lavender to-sky-blue text-white rounded-lg hover:shadow-lg transition-all duration-200">
              Send
            </button>
          </div>
        </div>
      )}

      {/* Today's Entry Status */}
      {todayEntry ? (
        <div className="bg-gradient-to-r from-mint-green to-soft-yellow rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">
              {moodEmojis[
                todayEntry.entry.sentiment?.label as keyof typeof moodEmojis
              ] || "😊"}
            </span>
            <div>
              <h3 className="font-semibold text-gray-800">
                Today's Entry Complete!
              </h3>
              <p className="text-gray-600 text-sm">
                Mood: {todayEntry.entry.sentiment?.label} (
                {(todayEntry.entry.sentiment?.score! * 100).toFixed(1)}%)
              </p>
            </div>
          </div>
          <p className="text-gray-700 text-sm">
            {todayEntry.entry.content.substring(0, 100)}...
          </p>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-2">
            Ready to write today's story?
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Start your journal entry and let AI analyze your mood
          </p>
          <button className="px-6 py-2 bg-gradient-to-r from-lavender to-sky-blue text-white rounded-xl hover:shadow-lg transition-all duration-200">
            Start Writing
          </button>
        </div>
      )}

      {/* Recent Entries Preview */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Recent Entries</h3>
        <div className="grid gap-4">
          {entries.slice(0, 3).map(({ entry, cid }, idx) => (
            <div
              key={idx}
              className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">{entry.title}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {moodEmojis[
                      entry.sentiment?.label as keyof typeof moodEmojis
                    ] || "😊"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 text-sm line-clamp-2">
                {entry.content}
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {entry.sentiment?.label} (
                  {(entry.sentiment?.score! * 100).toFixed(1)}%)
                </span>
                <a
                  href={`https://ipfs.io/ipfs/${cid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-lavender hover:underline"
                >
                  View on IPFS
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
