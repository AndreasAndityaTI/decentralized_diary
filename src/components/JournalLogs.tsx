import React, { useState } from "react";
import { DiaryEntry } from "./DiaryForm";

interface JournalLogsProps {
  entries: Array<{ entry: DiaryEntry; cid: string }>;
  loading?: boolean;
  onRefresh?: () => void;
  onDelete?: (cid: string) => void;
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

const moodColors = {
  happy: "from-yellow-200 to-yellow-300",
  sad: "from-blue-200 to-blue-300",
  angry: "from-red-200 to-red-300",
  neutral: "from-gray-200 to-gray-300",
  // Additional moods that might be returned
  anxious: "from-red-200 to-red-300",
  motivated: "from-green-200 to-green-300",
  calm: "from-purple-200 to-purple-300",
  excited: "from-pink-200 to-pink-300",
  frustrated: "from-orange-200 to-orange-300",
  grateful: "from-emerald-200 to-emerald-300",
  joy: "from-yellow-200 to-yellow-300",
  sadness: "from-blue-200 to-blue-300",
  anger: "from-red-200 to-red-300",
};

export default function JournalLogs({
  entries,
  loading = false,
  onRefresh,
  onDelete,
}: JournalLogsProps) {
  const [selectedEntry, setSelectedEntry] = useState<{
    entry: DiaryEntry;
    cid: string;
  } | null>(null);

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Journal Logs</h1>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-2 bg-lavender text-white rounded-lg hover:bg-lavender/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <span>🔄</span>
                <span>Loading from IPFS...</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>Refresh from IPFS</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Loading entries from IPFS...
            </h3>
            <p className="text-gray-500">
              Fetching your journal data from decentralized storage
            </p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No entries yet
            </h3>
            <p className="text-gray-500">
              Start writing to see your journal timeline here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map(({ entry, cid }, idx) => (
              <div
                key={idx}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedEntry({ entry, cid })}
              >
                <div className="flex items-start space-x-4">
                  {/* Timeline dot */}
                  <div
                    className={`w-4 h-4 rounded-full bg-gradient-to-r ${
                      moodColors[entry.mood as keyof typeof moodColors] ||
                      "from-gray-200 to-gray-300"
                    } mt-2 flex-shrink-0`}
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {entry.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">
                          {moodEmojis[entry.mood as keyof typeof moodEmojis] ||
                            "😊"}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </span>
                        {onDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Are you sure you want to delete this journal entry?')) {
                                onDelete(cid);
                              }
                            }}
                            className="flex items-center space-x-1 text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors text-xs md:text-sm font-medium"
                            title="Delete entry"
                          >
                            <span>🗑️</span>
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 mb-3 line-clamp-3">
                      {entry.content}
                    </p>

                    {/* AI Summary Chips */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${
                          moodColors[entry.mood as keyof typeof moodColors] ||
                          "from-gray-200 to-gray-300"
                        } text-gray-700`}
                      >
                        {entry.mood}
                      </span>
                      {entry.location && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          📍 {entry.location}
                        </span>
                      )}
                      {entry.walletAddress && !entry.hideWalletAddress && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                          📱 {entry.walletAddress.slice(0, 8)}...{entry.walletAddress.slice(-6)}
                        </span>
                      )}
                      {entry.walletUsername && !entry.hideWalletUsername && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                          👤 {entry.walletUsername}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-end">
                      <span className="text-xs text-gray-400">
                        {new Date(entry.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] md:max-h-[80vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedEntry.entry.title}
                </h2>
                <div className="flex items-center space-x-2">
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this journal entry?')) {
                          onDelete(selectedEntry.cid);
                          setSelectedEntry(null);
                        }
                      }}
                      className="flex items-center space-x-1 text-red-500 hover:text-red-700 hover:bg-red-50 px-2 md:px-3 py-1 rounded transition-colors text-xs md:text-sm font-medium"
                      title="Delete entry"
                    >
                      <span>🗑️</span>
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <span className="text-4xl">
                  {moodEmojis[
                    selectedEntry.entry.mood as keyof typeof moodEmojis
                  ] || "😊"}
                </span>
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    {selectedEntry.entry.mood}
                  </p>
                  <p className="text-gray-600">
                    {new Date(selectedEntry.entry.createdAt).toLocaleString()}
                  </p>
                  {selectedEntry.entry.location && (
                    <p className="text-sm text-gray-500">
                      📍 {selectedEntry.entry.location}
                    </p>
                  )}
                  {selectedEntry.entry.walletAddress && !selectedEntry.entry.hideWalletAddress && (
                    <p className="text-sm text-gray-500">
                      📱 {selectedEntry.entry.walletAddress}
                    </p>
                  )}
                  {selectedEntry.entry.walletUsername && !selectedEntry.entry.hideWalletUsername && (
                    <p className="text-sm text-gray-500">
                      👤 {selectedEntry.entry.walletUsername}
                    </p>
                  )}
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedEntry.entry.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
