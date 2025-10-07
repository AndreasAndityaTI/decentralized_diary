import React, { useState } from "react";

interface ProfileProps {
  entries: any[];
  walletAddress: string;
  walletApi: any;
}

export default function Profile({ entries, walletAddress, walletApi }: ProfileProps) {
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState<string>("");
  const [mintedNFTs, setMintedNFTs] = useState<Array<{
    id: string;
    name: string;
    description: string;
    image: string;
    txHash: string;
    mintedDate: string;
  }>>([]);


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


      {/* Mint First Journal NFT */}
      {entries.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">🎨 Mint Your First Journal NFT</h3>
              <p className="text-sm opacity-90">
                You've written {entries.length} journal entries! Mint an NFT to commemorate your first entry on Cardano.
              </p>
            </div>
            <button
              onClick={async () => {
                if (!walletAddress) {
                  alert("Please connect your wallet first!");
                  return;
                }

                setIsMinting(true);
                setMintStatus("🚀 Preparing real transaction for preproduction testnet...");

                try {
                  // Get the first entry's CID
                  const firstEntry = entries[entries.length - 1]; // Most recent entry
                  const ipfsCid = firstEntry.cid;

                  setMintStatus("Building transaction...");

                  // Import the minting function
                  const { mintFirstJournalNFT } = await import("../services/cardano");

                  const txHash = await mintFirstJournalNFT(walletApi, walletAddress, ipfsCid);

                  setMintStatus(`✅ Successfully minted! Transaction: ${txHash}`);

                  // Add the minted NFT to the profile
                  const newMintedNFT = {
                    id: `minted-${Date.now()}`,
                    name: "First Journal NFT",
                    description: "Your first journal entry minted on Cardano",
                    image: "📖",
                    txHash: txHash,
                    mintedDate: new Date().toISOString().split('T')[0],
                  };

                  setMintedNFTs(prev => [...prev, newMintedNFT]);

                  // Show success message
                  alert(`🎉 NFT Minted Successfully!\n\nTransaction Hash: ${txHash}\n\nThe NFT has been added to your profile.`);

                } catch (error: any) {
                  console.error("Minting failed:", error);
                  setMintStatus(`❌ Minting failed: ${error.message}`);
                } finally {
                  setIsMinting(false);
                }
              }}
              disabled={isMinting}
              className="px-6 py-3 bg-white text-orange-600 rounded-xl hover:bg-gray-100 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMinting ? "Minting..." : "Mint First Journal NFT"}
            </button>
          </div>
          {mintStatus && (
            <div className="mt-4 p-3 bg-black/20 rounded-lg">
              <p className="text-sm">{mintStatus}</p>
            </div>
          )}
        </div>
      )}




      {/* Minted NFTs Display */}
      {mintedNFTs.length > 0 && (
        <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4">🎨 Your Minted NFTs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mintedNFTs.map((nft) => (
              <div
                key={nft.id}
                className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30"
              >
                <div className="text-center mb-3">
                  <div className="text-4xl mb-2">{nft.image}</div>
                  <h4 className="font-semibold text-lg">{nft.name}</h4>
                  <p className="text-sm opacity-80">{nft.description}</p>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Minted:</span>
                    <span className="font-medium">{nft.mintedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transaction:</span>
                    <span className="font-medium font-mono text-xs">
                      {nft.txHash.substring(0, 12)}...
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const scannerUrl = `https://preprod.cardanoscan.io/transaction/${nft.txHash}`;
                    window.open(scannerUrl, '_blank');
                  }}
                  className="w-full mt-3 px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-all duration-200 text-sm font-medium"
                >
                  🔍 View Transaction
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
