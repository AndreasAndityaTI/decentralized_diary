import React, { useState } from "react";
import { DiaryEntry } from "./DiaryForm";
import DiaryForm from "./DiaryForm";

interface DashboardProps {
  onPublish: (entry: DiaryEntry, cid: string) => void;
  entries: Array<{ entry: DiaryEntry; cid: string }>;
  loading?: boolean;
  onRefresh?: () => void;
  walletAddress?: string;
}

const moodEmojis = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  neutral: "😐",
  // Additional moods that might be returned
  anxious: "😰",
  motivated: "💪",
  calm: "😌",
  excited: "🤩",
  frustrated: "😤",
  grateful: "🙏",
  joy: "😊",
  sadness: "😢",
  anger: "😠",
};

export default function Dashboard({
  onPublish,
  entries,
  loading = false,
  onRefresh,
  walletAddress,
}: DashboardProps) {
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
      </div>

      {/* Today's Entry Status */}
      {todayEntry ? (
        <div className="bg-gradient-to-r from-mint-green to-soft-yellow rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">
              {moodEmojis[todayEntry.entry.mood as keyof typeof moodEmojis] ||
                "😊"}
            </span>
            <div>
              <h3 className="font-semibold text-gray-800">
                Today's Entry Complete!
              </h3>
              <p className="text-gray-600 text-sm">
                Mood: {todayEntry.entry.mood}
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
        </div>
      )}

      {/* Writing Form */}
      <DiaryForm onPublished={onPublish} walletAddress={walletAddress} />
    </div>
  );
}
