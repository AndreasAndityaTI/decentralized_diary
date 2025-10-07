import React, { useState } from "react";
import { DiaryEntry } from "./DiaryForm";
import { purchaseJournal } from "../services/cardano";

interface JournalLogsProps {
  entries: Array<{ entry: DiaryEntry; cid: string }>;
  loading?: boolean;
  onRefresh?: () => void;
  onDelete?: (cid: string) => void;
  onEdit?: (entry: DiaryEntry, cid: string) => void;
  currentUserAddress?: string;
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
  onEdit,
  currentUserAddress,
}: JournalLogsProps) {
  const isOwner = (entry: DiaryEntry) => {
    return currentUserAddress && entry.walletAddress === currentUserAddress;
  };
  const [selectedEntry, setSelectedEntry] = useState<{
    entry: DiaryEntry;
    cid: string;
  } | null>(null);
  const [purchasedJournals, setPurchasedJournals] = useState<Set<string>>(new Set());
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);

  const handlePurchase = async (cid: string, entry: DiaryEntry) => {
    if (!entry.forSale || !entry.salePrice) return;

    try {
      setPurchaseLoading(cid);

      // For demo purposes, simulate wallet connection
      // In production, this would get the actual wallet API
      const mockWalletApi = {} as any;

      const result = await purchaseJournal(
        mockWalletApi,
        cid,
        entry.walletAddress || "",
        entry.salePrice * 1_000_000 // Convert ADA to lovelace
      );

      if (result.success) {
        // Mark as purchased
        setPurchasedJournals(prev => new Set([...prev, cid]));
        alert(`🎉 Purchase successful!\n\nTransaction: ${result.txHash}\n\nYou now have access to this journal.`);
      }
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Purchase failed. Please try again.");
    } finally {
      setPurchaseLoading(null);
    }
  };

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
                        {entry.forSale && entry.salePrice && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                            💰 ₳{entry.salePrice}
                          </span>
                        )}
                        {isOwner(entry) && (
                          <div className="flex items-center space-x-1">
                            {onEdit && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(entry, cid);
                                }}
                                className="flex items-center space-x-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors text-xs md:text-sm font-medium"
                                title="Edit entry"
                              >
                                <span>✏️</span>
                                <span className="hidden sm:inline">Edit</span>
                              </button>
                            )}
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
                        )}
                      </div>
                    </div>

                    {entry.forSale && entry.salePrice && !purchasedJournals.has(cid) ? (
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 mb-3 text-center">
                        <div className="text-gray-500 mb-2">
                          <span className="text-2xl">🔒</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          This journal is available for purchase
                        </p>
                        <p className="text-xs text-gray-500">
                          Buy for ₳{entry.salePrice} to read the full story
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-600 mb-3 line-clamp-3">
                        {entry.content}
                      </p>
                    )}

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

                    {/* Buy Button for Sale Items */}
                    {entry.forSale && entry.salePrice && !purchasedJournals.has(cid) && (
                      <div className="mb-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePurchase(cid, entry);
                          }}
                          disabled={purchaseLoading === cid}
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:shadow-md transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {purchaseLoading === cid ? (
                            <>Processing...</>
                          ) : (
                            <>🛒 Buy for ₳{entry.salePrice}</>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Purchased Badge */}
                    {entry.forSale && purchasedJournals.has(cid) && (
                      <div className="mb-3">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                          ✅ Purchased
                        </span>
                      </div>
                    )}

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
                  {isOwner(selectedEntry.entry) && (
                    <>
                      {onEdit && (
                        <button
                          onClick={() => {
                            onEdit(selectedEntry.entry, selectedEntry.cid);
                            setSelectedEntry(null);
                          }}
                          className="flex items-center space-x-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 px-2 md:px-3 py-1 rounded transition-colors text-xs md:text-sm font-medium"
                          title="Edit entry"
                        >
                          <span>✏️</span>
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                      )}
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
                    </>
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

              {selectedEntry.entry.forSale && selectedEntry.entry.salePrice && !purchasedJournals.has(selectedEntry.cid) ? (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-dashed border-amber-300 rounded-lg p-6 text-center">
                  <div className="text-4xl mb-4">🔒</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Premium Content
                  </h3>
                  <p className="text-gray-600 mb-4">
                    This journal is available for purchase to unlock the full story.
                  </p>
                  <div className="bg-white rounded-lg p-4 inline-block">
                    <p className="text-2xl font-bold text-amber-600 mb-2">
                      ₳{selectedEntry.entry.salePrice}
                    </p>
                    <button
                      onClick={() => handlePurchase(selectedEntry.cid, selectedEntry.entry)}
                      disabled={purchaseLoading === selectedEntry.cid}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {purchaseLoading === selectedEntry.cid ? "Processing..." : "🛒 Purchase to Read"}
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      50% goes to writer, 50% to platform
                    </p>
                  </div>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedEntry.entry.content}
                  </p>
                  {selectedEntry.entry.forSale && purchasedJournals.has(selectedEntry.cid) && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700 flex items-center">
                        <span className="mr-2">✅</span>
                        You purchased this journal and now have full access
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
