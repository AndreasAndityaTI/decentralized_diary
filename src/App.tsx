import React from "react";
import Landing from "./components/Landing";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import JournalLogs from "./components/JournalLogs";
import PublicJournals from "./components/PublicJournals";
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
  const [walletUsername, setWalletUsername] = React.useState<string>("");
  const [walletApi, setWalletApi] = React.useState<any>(null);
  const [currentPage, setCurrentPage] = React.useState("dashboard");
  const [lastCid, setLastCid] = React.useState<string>("");
  const [entries, setEntries] = React.useState<
    Array<{ entry: DiaryEntry; cid: string }>
  >([]);
  const [loadingEntries, setLoadingEntries] = React.useState(false);
  const [editingEntry, setEditingEntry] = React.useState<{ entry: DiaryEntry; cid: string } | null>(null);

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

  // Function to edit an entry
  const handleEditEntry = (entry: DiaryEntry, cid: string) => {
    setEditingEntry({ entry, cid });
    setCurrentPage("dashboard"); // Switch to dashboard to show the form
  };

  // Function to update an entry
  const handleUpdateEntry = async (updatedEntry: DiaryEntry, oldCid: string, newCid: string) => {
    try {
      // Remove old CID and add new one
      const { removeCid, addCid } = await entriesService;
      removeCid(oldCid);
      addCid(newCid);

      // Update state
      setEntries(prev => prev.map(item =>
        item.cid === oldCid ? { entry: updatedEntry, cid: newCid } : item
      ));

      // Clear editing state
      setEditingEntry(null);

      console.log("Entry updated successfully");
    } catch (error) {
      console.error("Failed to update entry:", error);
      throw error;
    }
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setEditingEntry(null);
  };

  // Function to delete an entry
  const handleDeleteEntry = async (cid: string) => {
    try {
      // Remove from local storage
      const { removeCid } = await entriesService;
      removeCid(cid);

      // Remove from state
      setEntries(prev => prev.filter(item => item.cid !== cid));

      console.log("Entry deleted successfully");
    } catch (error) {
      console.error("Failed to delete entry:", error);
      throw error;
    }
  };

  // Function to toggle publicity of an entry
  const handleTogglePublic = async (cid: string, isPublic: boolean) => {
    try {
      // Find the entry in state
      const entryItem = entries.find(item => item.cid === cid);
      if (!entryItem) return;

      // Update the entry with new publicity status
      const updatedEntry: DiaryEntry = {
        ...entryItem.entry,
        isPublic,
      };

      // Re-upload to IPFS with updated metadata
      const { extractDiaryMetadata, uploadJsonToIpfs } = await ipfsService;
      const metadata = extractDiaryMetadata(updatedEntry, walletAddress);
      const ipfsResult = await uploadJsonToIpfs(updatedEntry, metadata);

      // Update local storage with new CID
      const { removeCid, addCid } = await entriesService;
      removeCid(cid);
      addCid(ipfsResult.cid);

      // Update state
      setEntries(prev =>
        prev.map(item =>
          item.cid === cid
            ? { entry: updatedEntry, cid: ipfsResult.cid }
            : item
        )
      );

      console.log(`Entry publicity ${isPublic ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error("Failed to toggle entry publicity:", error);
      alert("Failed to update entry publicity. Please try again.");
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard
            onPublish={handlePublish}
            onUpdated={handleUpdateEntry}
            onCancelEdit={handleCancelEdit}
            entries={entries}
            loading={loadingEntries}
            onRefresh={refreshEntries}
            walletAddress={walletAddress}
            walletUsername={walletUsername}
            walletApi={walletApi}
            entryToEdit={editingEntry}
          />
        );
      case "journal":
        return (
          <JournalLogs
            entries={entries}
            loading={loadingEntries}
            onRefresh={refreshEntries}
            walletApi={walletApi}
            walletAddress={walletAddress}
            onEdit={handleEditEntry}
            onDelete={handleDeleteEntry}
            onTogglePublic={handleTogglePublic}
          />
        );
      case "public-journals":
        return <PublicJournals walletAddress={walletAddress} />;
      case "trends":
        return <MoodTrends entries={entries} />;
      case "moodmap":
        return <MoodMap entries={entries} />;
      case "ai-companion":
        return <AICompanion walletApi={walletApi} walletAddress={walletAddress} />;
      case "dao":
        return <Community />;
      case "profile":
        return <Profile entries={entries} walletAddress={walletAddress} walletApi={walletApi} />;
      default:
        return <Dashboard onPublish={handlePublish} entries={entries} />;
    }
  };

  const handleWalletConnected = (api: any, address: string, walletName?: string) => {
    console.log("Wallet connected, redirecting to dashboard...");
    console.log("Wallet API:", api);
    console.log("Wallet address:", address);
    console.log("Wallet name:", walletName);
    console.log("Setting wallet state...");
    setWalletApi(api);
    setWalletAddress(address);
    setWalletUsername(walletName || "");
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
    return <Landing onConnected={(api, address, walletName) => handleWalletConnected(api, address, walletName)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-sky-blue/10 to-mint-green/10">
      <div className="flex flex-col md:flex-row">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        <main className="flex-1 min-h-screen md:min-h-0 pt-16 md:pt-0 pb-20 md:pb-0">{renderPage()}</main>
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
