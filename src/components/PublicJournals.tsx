import React, { useEffect, useState } from "react";
import { fetchAllDiaryEntriesFromPinata, fetchFromIpfs } from "../services/ipfs";

interface PublicJournalsProps {
  walletAddress?: string;
}

interface PublicEntry {
  entry: {
    title: string;
    content: string;
    createdAt: string;
    mood?: string;
    walletAddress?: string;
    walletUsername?: string;
    location?: string;
  };
  cid: string;
}

const IPFS_APIS = [
  { name: "Pinata", url: "pinata", description: "Primary Pinata API" },
  { name: "IPFS.io", url: "https://ipfs.io/ipfs/", description: "Public IPFS gateway" },
  { name: "Cloudflare", url: "https://cloudflare-ipfs.com/ipfs/", description: "Cloudflare IPFS gateway" },
  { name: "DWeb", url: "https://dweb.link/ipfs/", description: "Protocol Labs gateway" },
  { name: "Infura", url: "https://ipfs.infura.io/ipfs/", description: "Infura IPFS gateway" },
];

const moodEmojis = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  neutral: "😐",
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

export default function PublicJournals({ walletAddress }: PublicJournalsProps) {
  const [entries, setEntries] = useState<PublicEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedApi, setSelectedApi] = useState(IPFS_APIS[0]);
  const [selectedEntry, setSelectedEntry] = useState<PublicEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicEntries = async (api = selectedApi) => {
    setLoading(true);
    setError(null);

    try {
      let publicEntries: PublicEntry[] = [];

      if (api.url === "pinata") {
        // Use Pinata API to fetch all public entries (not filtered by wallet)
        publicEntries = await fetchAllDiaryEntriesFromPinata();
      } else {
        // For other APIs, we'll need to implement a different approach
        // For now, show a message that this feature is coming soon
        setError(`Direct fetching from ${api.name} API is not yet implemented. Please use Pinata API.`);
        setLoading(false);
        return;
      }

      // Filter out entries from the current user to show only public entries
      const filteredEntries = publicEntries.filter(
        (item) => item.entry.walletAddress !== walletAddress
      );

      setEntries(filteredEntries);
    } catch (err) {
      console.error("Failed to fetch public entries:", err);
      setError("Failed to load public journals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicEntries();
  }, []);

  const handleApiChange = (api: typeof IPFS_APIS[0]) => {
    setSelectedApi(api);
    fetchPublicEntries(api);
  };

  return (
    <div className="flex-1 p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Public Journals</h1>
          <p className="text-gray-600 mt-1">
            Explore journals shared by the community
          </p>
        </div>

        {/* API Selector */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">IPFS API:</label>
          <select
            value={selectedApi.url}
            onChange={(e) => {
              const api = IPFS_APIS.find(a => a.url === e.target.value);
              if (api) handleApiChange(api);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender text-sm"
          >
            {IPFS_APIS.map((api) => (
              <option key={api.url} value={api.url}>
                {api.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => fetchPublicEntries()}
            disabled={loading}
            className="px-4 py-2 bg-lavender text-white rounded-lg hover:bg-lavender/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "🔄" : "🔄"} Refresh
          </button>
        </div>
      </div>

      {/* API Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-1">
          Current API: {selectedApi.name}
        </h3>
        <p className="text-sm text-blue-600">{selectedApi.description}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Public Journals Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Loading public journals...
            </h3>
            <p className="text-gray-500">
              Fetching community entries from IPFS
            </p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No public journals found
            </h3>
            <p className="text-gray-500">
              Be the first to share your journal publicly!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map(({ entry, cid }, idx) => (
              <div
                key={idx}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedEntry({ entry, cid })}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                      {entry.title}
                    </h3>
                    <span className="text-2xl ml-2 flex-shrink-0">
                      {moodEmojis[entry.mood as keyof typeof moodEmojis] || "😊"}
                    </span>
                  </div>

                  {/* Content Preview */}
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {entry.content}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-2">
                      {entry.location && (
                        <span>📍 {entry.location}</span>
                      )}
                      <span>
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>👤</span>
                      <span>
                        {entry.walletUsername ||
                          (entry.walletAddress
                            ? `${entry.walletAddress.slice(0, 6)}...${entry.walletAddress.slice(-4)}`
                            : "Anonymous")}
                      </span>
                    </div>
                  </div>

                  {/* Mood Badge */}
                  <div className="flex justify-end">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${
                        moodColors[entry.mood as keyof typeof moodColors] ||
                        "from-gray-200 to-gray-300"
                      } text-gray-700`}
                    >
                      {entry.mood || "neutral"}
                    </span>
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
                    selectedEntry.entry.mood as keyof typeof moodEmojis
                  ] || "😊"}
                </span>
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    {selectedEntry.entry.mood || "neutral"}
                  </p>
                  <p className="text-gray-600">
                    {new Date(selectedEntry.entry.createdAt).toLocaleString()}
                  </p>
                  {selectedEntry.entry.location && (
                    <p className="text-sm text-gray-500">
                      📍 {selectedEntry.entry.location}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    👤 {selectedEntry.entry.walletUsername ||
                        (selectedEntry.entry.walletAddress
                          ? `${selectedEntry.entry.walletAddress.slice(0, 6)}...${selectedEntry.entry.walletAddress.slice(-4)}`
                          : "Anonymous")}
                  </p>
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedEntry.entry.content}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  IPFS CID: {selectedEntry.cid}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}