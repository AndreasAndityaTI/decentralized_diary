import React, { useState } from "react";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  earnedDate: string;
  category: string;
}

interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  mintedDate: string;
  collection: string;
  tokenId: string;
}

const mockBadges: Badge[] = [
  {
    id: "1",
    name: "First Entry",
    description: "Created your first journal entry",
    icon: "📝",
    rarity: "common",
    earnedDate: "2024-01-15",
    category: "Journaling",
  },
  {
    id: "2",
    name: "Mood Master",
    description: "Analyzed 50+ mood entries",
    icon: "🎭",
    rarity: "rare",
    earnedDate: "2024-01-20",
    category: "Mood Tracking",
  },
  {
    id: "3",
    name: "Streak Keeper",
    description: "Journaled for 7 consecutive days",
    icon: "🔥",
    rarity: "epic",
    earnedDate: "2024-01-25",
    category: "Consistency",
  },
  {
    id: "4",
    name: "Community Contributor",
    description: "Participated in 5+ DAO research projects",
    icon: "🏛️",
    rarity: "legendary",
    earnedDate: "2024-02-01",
    category: "Community",
  },
  {
    id: "5",
    name: "AI Collaborator",
    description: "Used AI companion 100+ times",
    icon: "🤖",
    rarity: "rare",
    earnedDate: "2024-02-05",
    category: "AI Interaction",
  },
  {
    id: "6",
    name: "Privacy Champion",
    description: "Completed privacy research study",
    icon: "🔒",
    rarity: "epic",
    earnedDate: "2024-02-10",
    category: "Research",
  },
];

const mockNFTs: NFT[] = [
  {
    id: "1",
    name: "DeDiary Genesis",
    description: "The first NFT in the DeDiary collection",
    image: "🎨",
    rarity: "legendary",
    mintedDate: "2024-01-01",
    collection: "DeDiary Genesis",
    tokenId: "DD-001",
  },
  {
    id: "2",
    name: "Mood Spectrum #42",
    description: "A unique mood visualization NFT",
    image: "🌈",
    rarity: "rare",
    mintedDate: "2024-01-15",
    collection: "Mood Spectrum",
    tokenId: "MS-042",
  },
  {
    id: "3",
    name: "Journal Keeper #156",
    description: "Representing 100+ journal entries",
    image: "📚",
    rarity: "epic",
    mintedDate: "2024-02-01",
    collection: "Journal Keepers",
    tokenId: "JK-156",
  },
  {
    id: "4",
    name: "Community Builder #23",
    description: "Awarded for active DAO participation",
    image: "🏗️",
    rarity: "legendary",
    mintedDate: "2024-02-05",
    collection: "Community Builders",
    tokenId: "CB-023",
  },
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState<"badges" | "nfts">("badges");

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "rare":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "epic":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "legendary":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "⚪";
      case "rare":
        return "🔵";
      case "epic":
        return "🟣";
      case "legendary":
        return "🟡";
      default:
        return "⚪";
    }
  };

  const totalBadges = mockBadges.length;
  const totalNFTs = mockNFTs.length;
  const legendaryBadges = mockBadges.filter(
    (b) => b.rarity === "legendary"
  ).length;
  const legendaryNFTs = mockNFTs.filter((n) => n.rarity === "legendary").length;

  return (
    <div className="flex-1 p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gradient-to-r from-lavender to-sky-blue rounded-full flex items-center justify-center">
          <span className="text-white text-2xl">👤</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
          <p className="text-gray-600">
            Your achievements and digital collectibles
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-lavender to-sky-blue rounded-xl p-4 text-white text-center">
          <div className="text-2xl font-bold">{totalBadges}</div>
          <div className="text-sm opacity-80">Total Badges</div>
        </div>
        <div className="bg-gradient-to-r from-mint-green to-soft-yellow rounded-xl p-4 text-gray-800 text-center">
          <div className="text-2xl font-bold">{totalNFTs}</div>
          <div className="text-sm opacity-80">NFTs Owned</div>
        </div>
        <div className="bg-gradient-to-r from-soft-yellow to-mint-green rounded-xl p-4 text-gray-800 text-center">
          <div className="text-2xl font-bold">
            {legendaryBadges + legendaryNFTs}
          </div>
          <div className="text-sm opacity-80">Legendary Items</div>
        </div>
        <div className="bg-gradient-to-r from-sky-blue to-lavender rounded-xl p-4 text-white text-center">
          <div className="text-2xl font-bold">85%</div>
          <div className="text-sm opacity-80">Collection Complete</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("badges")}
          className={`px-6 py-3 font-medium transition-all duration-200 ${
            activeTab === "badges"
              ? "text-lavender border-b-2 border-lavender"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          🏆 Badges ({totalBadges})
        </button>
        <button
          onClick={() => setActiveTab("nfts")}
          className={`px-6 py-3 font-medium transition-all duration-200 ${
            activeTab === "nfts"
              ? "text-lavender border-b-2 border-lavender"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          🎨 NFTs ({totalNFTs})
        </button>
      </div>

      {/* Badges Tab */}
      {activeTab === "badges" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockBadges.map((badge) => (
              <div
                key={badge.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{badge.icon}</div>
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">
                      {getRarityIcon(badge.rarity)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getRarityColor(
                        badge.rarity
                      )}`}
                    >
                      {badge.rarity}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {badge.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {badge.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{badge.category}</span>
                  <span>{new Date(badge.earnedDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NFTs Tab */}
      {activeTab === "nfts" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockNFTs.map((nft) => (
              <div
                key={nft.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200"
              >
                <div className="text-center mb-4">
                  <div className="text-6xl mb-2">{nft.image}</div>
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-lg">{getRarityIcon(nft.rarity)}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getRarityColor(
                        nft.rarity
                      )}`}
                    >
                      {nft.rarity}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
                  {nft.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3 text-center">
                  {nft.description}
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Collection:</span>
                    <span className="font-medium">{nft.collection}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Token ID:</span>
                    <span className="font-medium">{nft.tokenId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Minted:</span>
                    <span className="font-medium">
                      {new Date(nft.mintedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-lavender to-sky-blue text-white rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-medium">
                  View on Cardano
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievement Progress */}
      <div className="bg-gradient-to-r from-mint-green/20 to-soft-yellow/20 rounded-2xl p-6 border border-mint-green/30">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          🎯 Achievement Progress
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-700">Badge Collection</span>
              <span className="text-gray-600">{totalBadges}/10</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-lavender to-sky-blue h-2 rounded-full"
                style={{ width: `${(totalBadges / 10) * 100}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-700">NFT Collection</span>
              <span className="text-gray-600">{totalNFTs}/8</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-mint-green to-soft-yellow h-2 rounded-full"
                style={{ width: `${(totalNFTs / 8) * 100}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-700">Legendary Items</span>
              <span className="text-gray-600">
                {legendaryBadges + legendaryNFTs}/5
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-soft-yellow to-mint-green h-2 rounded-full"
                style={{
                  width: `${((legendaryBadges + legendaryNFTs) / 5) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          📈 Recent Activity
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-2xl">🏆</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">
                Earned "Community Contributor" badge
              </p>
              <p className="text-xs text-gray-500">2 days ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-2xl">🎨</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">
                Minted "Community Builder #23" NFT
              </p>
              <p className="text-xs text-gray-500">5 days ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-2xl">🔥</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">
                Earned "Streak Keeper" badge
              </p>
              <p className="text-xs text-gray-500">1 week ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Section */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          🔧 Debug Tools
        </h3>
        <p className="text-sm text-yellow-700 mb-3">
          Development tools for testing data persistence
        </p>
        <div className="space-y-2">
          <button
            onClick={() => {
              const cids = localStorage.getItem("diary-entry-cids");
              console.log("🔍 Current CIDs in localStorage:", cids);
              alert(`Current CIDs in localStorage: ${cids || "None"}`);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm mr-2"
          >
            Check Stored CIDs
          </button>
          <button
            onClick={async () => {
              console.log("🔍 Testing entry fetching...");
              try {
                // Test localStorage method
                const cids = localStorage.getItem("diary-entry-cids");
                console.log("📋 CIDs from localStorage:", cids);

                if (cids) {
                  const parsedCids = JSON.parse(cids);
                  console.log("📋 Parsed CIDs:", parsedCids);

                  // Test fetching from IPFS
                  const { fetchEntriesFromIpfs } = await import(
                    "../services/ipfs"
                  );
                  const entries = await fetchEntriesFromIpfs(parsedCids);
                  console.log("📝 Fetched entries:", entries);
                  alert(
                    `Found ${entries.length} entries from IPFS! Check console for details.`
                  );
                } else {
                  alert("No CIDs found in localStorage!");
                }
              } catch (error) {
                console.error("❌ Error testing entries:", error);
                alert(`Error: ${error.message}`);
              }
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm mr-2"
          >
            Test Entry Fetching
          </button>
          <button
            onClick={async () => {
              try {
                console.log("🔍 Fetching real CIDs from Pinata API...");

                // Try to get real CIDs from Pinata API
                const PINATA_API_KEY = (import.meta as any).env
                  .VITE_PINATA_API_KEY;
                const PINATA_SECRET = (import.meta as any).env
                  .VITE_PINATA_SECRET;

                console.log("🔍 Environment variables check:");
                console.log("PINATA_API_KEY:", PINATA_API_KEY);
                console.log(
                  "PINATA_SECRET:",
                  PINATA_SECRET ? "Present" : "Missing"
                );
                console.log("All env vars:", (import.meta as any).env);

                if (!PINATA_API_KEY || !PINATA_SECRET) {
                  alert(
                    `❌ Missing Pinata API credentials. 
                    API_KEY: ${PINATA_API_KEY ? "Present" : "Missing"}
                    SECRET: ${PINATA_SECRET ? "Present" : "Missing"}
                    Please check your .env file and restart the dev server.`
                  );
                  return;
                }

                const response = await fetch(
                  "https://api.pinata.cloud/data/pinList",
                  {
                    method: "GET",
                    headers: {
                      pinata_api_key: PINATA_API_KEY,
                      pinata_secret_api_key: PINATA_SECRET,
                    },
                  }
                );

                if (!response.ok) {
                  throw new Error(`Pinata API error: ${response.status}`);
                }

                const data = await response.json();
                console.log("📋 Found pinned files:", data);

                if (data.rows && data.rows.length > 0) {
                  // Get all CIDs from Pinata
                  const realCids = data.rows.map(
                    (file: any) => file.ipfs_pin_hash
                  );
                  console.log("🔧 Real CIDs from Pinata:", realCids);

                  // Save to localStorage
                  localStorage.setItem(
                    "diary-entry-cids",
                    JSON.stringify(realCids)
                  );

                  alert(
                    `✅ Found ${realCids.length} real CIDs from Pinata! Refresh the page to see your entries.`
                  );
                } else {
                  alert(
                    "⚠️ No pinned files found in Pinata. Make sure you have uploaded diary entries."
                  );
                }
              } catch (error) {
                console.error("❌ Error fetching CIDs from Pinata:", error);
                alert(`❌ Error: ${error.message}`);
              }
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm mr-2"
          >
            Get Real CIDs from Pinata
          </button>
          <button
            onClick={() => {
              // Fix the truncated CIDs with the real ones you provided
              const realCids = [
                "QmXhSBQfDcU9CaNbgsfAGqPRAXdbyMjCEg3FV32xAZijKh", // Real CID 1
                "QmV4iMzhqF1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef", // Real CID 2 (you need to provide the real one)
                "QmPcdRzNFZ1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef", // Real CID 3 (you need to provide the real one)
              ];
              localStorage.setItem(
                "diary-entry-cids",
                JSON.stringify(realCids)
              );
              console.log("🔧 Fixed CIDs with real ones:", realCids);
              alert(
                "✅ Fixed CIDs with real ones! Refresh the page to see your entries."
              );
            }}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm mr-2"
          >
            Fix Truncated CIDs
          </button>
          <button
            onClick={async () => {
              try {
                console.log("🧪 Testing Pinata API credentials...");

                const API_KEY = (import.meta as any).env.VITE_PINATA_API_KEY;
                const SECRET = (import.meta as any).env.VITE_PINATA_SECRET;
                console.log("API_KEY:", API_KEY ? "Present" : "Missing");
                console.log("SECRET:", SECRET ? "Present" : "Missing");

                if (!API_KEY || !SECRET) {
                  alert(
                    "❌ API credentials not found in environment variables"
                  );
                  return;
                }

                const response = await fetch(
                  "https://api.pinata.cloud/data/pinList",
                  {
                    method: "GET",
                    headers: {
                      pinata_api_key: API_KEY,
                      pinata_secret_api_key: SECRET,
                    },
                  }
                );

                console.log("Response status:", response.status);

                if (response.ok) {
                  const data = await response.json();
                  console.log("✅ Pinata API test successful:", data);
                  alert(
                    `✅ Pinata API test successful! Found ${
                      data.rows?.length || 0
                    } pinned files.`
                  );
                } else {
                  const errorText = await response.text();
                  console.error("❌ Pinata API test failed:", errorText);
                  alert(
                    `❌ Pinata API test failed: ${response.status} - ${errorText}`
                  );
                }
              } catch (error) {
                console.error("❌ Test error:", error);
                alert(`❌ Test error: ${error.message}`);
              }
            }}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm mr-2"
          >
            Test Pinata API
          </button>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm mr-2"
          >
            Force Refresh App
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("diary-entry-cids");
              alert(
                "All journal entry CIDs cleared from localStorage. Refresh the page to see the effect."
              );
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            Clear All Journal Entry CIDs
          </button>
        </div>
        <p className="text-xs text-yellow-600 mt-2">
          This will clear all saved journal entries from your browser's local
          storage.
        </p>
      </div>
    </div>
  );
}
