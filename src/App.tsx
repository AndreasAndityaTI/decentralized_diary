import React from "react";
import Landing from "./components/Landing";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import JournalLogs from "./components/JournalLogs";
import MoodTrends from "./components/MoodTrends";
import MoodMap from "./components/MoodMap";
import AICompanion from "./components/AICompanion";
import Community from "./components/Community";
import Profile from "./components/Profile";
import DiaryForm, { DiaryEntry } from "./components/DiaryForm";
import {
  fetchAllEntries,
  fetchAllEntriesLive,
  addCid,
  clearAllCids,
  getStoredCids,
} from "./services/entries";
import { fetchEntriesFromIpfs } from "./services/ipfs";
// import OnChainNote from "./components/OnChainNote";

export default function App() {
  const [connected, setConnected] = React.useState(false);
  const [walletAddress, setWalletAddress] = React.useState<string>("");
  const [currentPage, setCurrentPage] = React.useState("dashboard");
  const [lastCid, setLastCid] = React.useState<string>("");
  const [entries, setEntries] = React.useState<
    Array<{ entry: DiaryEntry; cid: string }>
  >([]);
  const [loadingEntries, setLoadingEntries] = React.useState(false);

  // Load entries live from IPFS on app start
  React.useEffect(() => {
    const loadEntries = async () => {
      console.log("🚀 App starting - loading ALL entries from IPFS...");
      setLoadingEntries(true);
      try {
        // First try live discovery from Pinata API (automatic discovery)
        console.log("🌐 Trying live discovery from Pinata API...");
        const liveEntries = await fetchAllEntriesLive(walletAddress);

        if (liveEntries.length > 0) {
          console.log(
            `✅ Successfully discovered ${liveEntries.length} entries from Pinata API`
          );
          console.log("📝 Live entries:", liveEntries);
          setEntries(liveEntries);
        } else {
          console.log(
            "⚠️ No entries found via Pinata API, trying localStorage fallback..."
          );

          // Fallback to localStorage CIDs
          const cids = getStoredCids();
          console.log(`📋 Found ${cids.length} CIDs in localStorage:`, cids);

          if (cids.length > 0) {
            console.log(
              `🔄 Fetching ${cids.length} entries from IPFS using stored CIDs...`
            );
            const entries = await fetchEntriesFromIpfs(cids);
            console.log(
              `✅ Successfully loaded ${entries.length} entries from stored CIDs`
            );
            console.log("📝 Loaded entries:", entries);
            setEntries(entries);
          } else {
            console.log("⚠️ No CIDs in localStorage either - no entries found");
            setEntries([]);
          }
        }
      } catch (error) {
        console.error("❌ Failed to load entries from IPFS:", error);
        console.log("🔄 Trying fallback method...");

        // Fallback: try the old method
        try {
          const fallbackEntries = await fetchAllEntries();
          console.log("📝 Fallback entries:", fallbackEntries);
          setEntries(fallbackEntries);
        } catch (fallbackError) {
          console.error("❌ Fallback also failed:", fallbackError);
        }
      } finally {
        setLoadingEntries(false);
      }
    };

    loadEntries();
  }, [walletAddress]);

  const handlePublish = async (entry: DiaryEntry, cid: string) => {
    setLastCid(cid);
    // Add CID to storage
    addCid(cid);

    // Refresh all entries from IPFS to get both old and new entries
    console.log("🔄 Refreshing all entries after new publish...");
    setLoadingEntries(true);
    try {
      const allEntries = await fetchAllEntriesLive(walletAddress);
      setEntries(allEntries);
      console.log(`✅ Refreshed ${allEntries.length} total entries from IPFS`);
    } catch (error) {
      console.error("❌ Failed to refresh entries after publish:", error);
      // Fallback to just adding the new entry
      setEntries((prev) => [{ entry, cid }, ...prev]);
    } finally {
      setLoadingEntries(false);
    }
  };

  // Function to refresh entries live from IPFS
  const refreshEntries = async () => {
    setLoadingEntries(true);
    try {
      const fetchedEntries = await fetchAllEntriesLive(walletAddress);
      setEntries(fetchedEntries);
    } catch (error) {
      console.error("Failed to refresh entries live from IPFS:", error);
    } finally {
      setLoadingEntries(false);
    }
  };

  // Function to clear all entries (useful for testing)
  const clearAllEntries = () => {
    setEntries([]);
    clearAllCids();
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard
            onPublish={handlePublish}
            entries={entries}
            loading={loadingEntries}
            onRefresh={refreshEntries}
            walletAddress={walletAddress}
          />
        );
      case "journal":
        return (
          <JournalLogs
            entries={entries}
            loading={loadingEntries}
            onRefresh={refreshEntries}
          />
        );
      case "trends":
        return <MoodTrends entries={entries} />;
      case "moodmap":
        return <MoodMap entries={entries} />;
      case "ai-companion":
        return <AICompanion />;
      case "dao":
        return <Community />;
      case "profile":
        return <Profile />;
      case "settings":
        return (
          <div className="flex-1 p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Account Settings
              </h2>
              <p className="text-gray-600">Settings coming soon...</p>
            </div>
          </div>
        );
      default:
        return <Dashboard onPublish={handlePublish} entries={entries} />;
    }
  };

  const handleWalletConnected = (address: string) => {
    console.log("Wallet connected, redirecting to dashboard...");
    console.log("Wallet address:", address);
    setWalletAddress(address);
    setConnected(true);
  };

  // Debug: Track connected state changes
  React.useEffect(() => {
    console.log("Connected state changed:", connected);
  }, [connected]);

  if (!connected) {
    return <Landing onConnected={handleWalletConnected} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-sky-blue/10 to-mint-green/10">
      <div className="flex">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        <main className="flex-1">{renderPage()}</main>
      </div>

      {/* OnChain Note - removed as requested */}
      {/* {lastCid && (
        <div className="fixed top-6 right-6 z-50">
          <OnChainNote cid={lastCid} />
        </div>
      )} */}
    </div>
  );
}
