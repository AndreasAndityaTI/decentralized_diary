import React from "react";
import Landing from "./components/Landing";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import JournalLogs from "./components/JournalLogs";
import MoodTrends from "./components/MoodTrends";
import MoodMap from "./components/MoodMap";
import AICompanion from "./components/AICompanion";
import DAO from "./components/DAO";
import Profile from "./components/Profile";
import DiaryForm, { DiaryEntry } from "./components/DiaryForm";
import OnChainNote from "./components/OnChainNote";

export default function App() {
  const [connected, setConnected] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState("dashboard");
  const [lastCid, setLastCid] = React.useState<string>("");
  const [entries, setEntries] = React.useState<
    Array<{ entry: DiaryEntry; cid: string }>
  >([]);

  const handlePublish = (entry: DiaryEntry, cid: string) => {
    setLastCid(cid);
    setEntries((prev) => [{ entry, cid }, ...prev]);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onPublish={handlePublish} entries={entries} />;
      case "journal":
        return <JournalLogs entries={entries} />;
      case "trends":
        return <MoodTrends entries={entries} />;
      case "moodmap":
        return <MoodMap entries={entries} />;
      case "ai-companion":
        return <AICompanion />;
      case "dao":
        return <DAO />;
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

  const handleWalletConnected = (api: any, info: any) => {
    console.log("Wallet connected, redirecting to dashboard...", { api, info });
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

      {/* OnChain Note - only show when there's a new entry */}
      {lastCid && (
        <div className="fixed top-6 right-6 z-50">
          <OnChainNote cid={lastCid} />
        </div>
      )}
    </div>
  );
}
