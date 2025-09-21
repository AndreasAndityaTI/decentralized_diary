import React, { useState } from "react";
import { DiaryEntry } from "./DiaryForm";

interface JournalLogsProps {
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

const moodColors = {
  happy: "from-yellow-200 to-yellow-300",
  sad: "from-blue-200 to-blue-300",
  anxious: "from-red-200 to-red-300",
  motivated: "from-green-200 to-green-300",
  calm: "from-purple-200 to-purple-300",
  excited: "from-pink-200 to-pink-300",
  frustrated: "from-orange-200 to-orange-300",
  grateful: "from-emerald-200 to-emerald-300",
};

export default function JournalLogs({ entries }: JournalLogsProps) {
  const [selectedEntry, setSelectedEntry] = useState<{
    entry: DiaryEntry;
    cid: string;
  } | null>(null);
  const [filter, setFilter] = useState("all");

  const filteredEntries = entries.filter(({ entry }) => {
    if (filter === "all") return true;
    return entry.sentiment?.label === filter;
  });

  const moodCategories = [
    ...new Set(
      entries.map(({ entry }) => entry.sentiment?.label).filter(Boolean)
    ),
  ];

  return (
    <div className="flex-1 p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Journal Logs</h1>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender"
          >
            <option value="all">All Moods</option>
            {moodCategories.map((mood) => (
              <option key={mood} value={mood}>
                {moodEmojis[mood as keyof typeof moodEmojis]} {mood}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
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
            {filteredEntries.map(({ entry, cid }, idx) => (
              <div
                key={idx}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedEntry({ entry, cid })}
              >
                <div className="flex items-start space-x-4">
                  {/* Timeline dot */}
                  <div
                    className={`w-4 h-4 rounded-full bg-gradient-to-r ${
                      moodColors[
                        entry.sentiment?.label as keyof typeof moodColors
                      ] || "from-gray-200 to-gray-300"
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
                          {moodEmojis[
                            entry.sentiment?.label as keyof typeof moodEmojis
                          ] || "😊"}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-3 line-clamp-3">
                      {entry.content}
                    </p>

                    {/* AI Summary Chips */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${
                          moodColors[
                            entry.sentiment?.label as keyof typeof moodColors
                          ] || "from-gray-200 to-gray-300"
                        } text-gray-700`}
                      >
                        {entry.sentiment?.label} (
                        {(entry.sentiment?.score! * 100).toFixed(1)}%)
                      </span>
                      {entry.location && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          📍 {entry.location}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <a
                        href={`https://ipfs.io/ipfs/${cid}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-lavender hover:underline flex items-center space-x-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>🔒</span>
                        <span>View on IPFS</span>
                      </a>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedEntry.entry.title}
                </h2>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <span className="text-4xl">
                  {moodEmojis[
                    selectedEntry.entry.sentiment
                      ?.label as keyof typeof moodEmojis
                  ] || "😊"}
                </span>
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    {selectedEntry.entry.sentiment?.label} (
                    {(selectedEntry.entry.sentiment?.score! * 100).toFixed(1)}%)
                  </p>
                  <p className="text-gray-600">
                    {new Date(selectedEntry.entry.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedEntry.entry.content}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <a
                  href={`https://ipfs.io/ipfs/${selectedEntry.cid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-2 text-lavender hover:underline"
                >
                  <span>🔒</span>
                  <span>View on IPFS</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
