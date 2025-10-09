import React, { useState } from "react";
import { DiaryEntry } from "./DiaryForm";
import DiaryForm from "./DiaryForm";

interface DashboardProps {
  onPublish: (entry: DiaryEntry, cid: string) => void;
  onUpdated?: (entry: DiaryEntry, oldCid: string, newCid: string) => void;
  onCancelEdit?: () => void;
  entries: Array<{ entry: DiaryEntry; cid: string }>;
  loading?: boolean;
  onRefresh?: () => void;
  walletAddress?: string;
  walletUsername?: string;
  walletApi?: any;
  entryToEdit?: { entry: DiaryEntry; cid: string } | null;
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
  onUpdated,
  onCancelEdit,
  entries,
  loading = false,
  onRefresh,
  walletAddress,
  walletUsername,
  walletApi,
  entryToEdit,
}: DashboardProps) {
  console.log("🔍 Dashboard received walletAddress:", walletAddress);
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
            {entryToEdit ? "Edit Your Story" : `Good ${new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}!`}
          </h1>
          <p className="text-gray-600 mt-1">
            {entryToEdit ? "Update your journal entry" : "How are you feeling today?"}
          </p>
        </div>
        {entryToEdit && onCancelEdit && (
          <button
            onClick={() => {
              if (window.confirm("Cancel editing?")) {
                onCancelEdit();
              }
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel Edit
          </button>
        )}
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
      <DiaryForm onPublished={onPublish} onUpdated={onUpdated} walletAddress={walletAddress} walletUsername={walletUsername} walletApi={walletApi} existingEntries={entries} entryToEdit={entryToEdit || undefined} />
    </div>
  );
}
