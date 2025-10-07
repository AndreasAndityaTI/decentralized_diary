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

// Dynamic imports to avoid startup crashes - load services only when needed
const entriesService = import("./services/entries");
const ipfsService = import("./services/ipfs");

export default function App() {
  const [connected, setConnected] = React.useState(false);
  const [walletAddress, setWalletAddress] = React.useState<string>("");
  const [walletApi, setWalletApi] = React.useState<any>(null);
  const [currentPage, setCurrentPage] = React.useState("dashboard");
  const [lastCid, setLastCid] = React.useState<string>("");
  const [entries, setEntries] = React.useState<
    Array<{ entry: DiaryEntry; cid: string }>
  >([]);
  const [loadingEntries, setLoadingEntries] = React.useState(false);

  // Load entries live from IPFS on app start - only after wallet is connected
  React.useEffect(() => {
    if (!connected || !walletAddress) return;

    const loadEntries = async () => {
      console.log("🚀 App starting - loading ALL entries from IPFS...");
      setLoadingEntries(true);
      try {
        const { fetchAllEntriesLive } = await entriesService;
        const { fetchEntriesFromIpfs } = await ipfsService;

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
          const { getStoredCids } = await entriesService;
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
          const { fetchAllEntries } = await entriesService;
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
  }, [walletAddress, connected]);

  const handlePublish = async (entry: DiaryEntry, cid: string) => {
    setLastCid(cid);
    // Add CID to storage
    const { addCid } = await entriesService;
    addCid(cid);

    // Refresh all entries from IPFS to get both old and new entries
    console.log("🔄 Refreshing all entries after new publish...");
    setLoadingEntries(true);
    try {
      const { fetchAllEntriesLive } = await entriesService;
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
      const { fetchAllEntriesLive } = await entriesService;
      const fetchedEntries = await fetchAllEntriesLive(walletAddress);
      setEntries(fetchedEntries);
    } catch (error) {
      console.error("Failed to refresh entries live from IPFS:", error);
    } finally {
      setLoadingEntries(false);
    }
  };

  // Function to clear all entries (useful for testing)
  const clearAllEntries = async () => {
    setEntries([]);
    const { clearAllCids } = await entriesService;
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
      case "ai-companion":
        return <AICompanion />;
      case "dao":
        return <Community />;
      case "profile":
        return <Profile entries={entries} walletAddress={walletAddress} walletApi={walletApi} />;
      default:
        return <Dashboard onPublish={handlePublish} entries={entries} />;
    }
  };

  const handleWalletConnected = (api: any, address: string) => {
    console.log("Wallet connected, redirecting to dashboard...");
    console.log("Wallet API:", api);
    console.log("Wallet address:", address);
    console.log("Setting wallet state...");
    setWalletApi(api);
    setWalletAddress(address);
    setConnected(true);
  };

  // Debug: Track connected state changes
  React.useEffect(() => {
    console.log("Connected state changed:", connected);
  }, [connected]);

  // Debug: Track wallet address changes
  React.useEffect(() => {
    console.log("Wallet address changed:", walletAddress);
  }, [walletAddress]);

  if (!connected) {
    return <Landing onConnected={(api, address) => handleWalletConnected(api, address)} />;
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
