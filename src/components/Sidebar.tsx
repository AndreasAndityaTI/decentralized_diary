import React from "react";

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

const menuItems = [
  { id: "dashboard", label: "Home", icon: "🏠" },
  { id: "journal", label: "Journal", icon: "📝" },
  { id: "trends", label: "Mood Trends", icon: "📊" },
  { id: "moodmap", label: "MoodMap", icon: "🌍" },
  { id: "ai-companion", label: "AI Companion", icon: "🤖" },
  { id: "profile", label: "Profile", icon: "👤" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar({ currentPage, onPageChange, isOpen = true, onToggle }: SidebarProps) {
  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={onToggle}
        className="md:hidden fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-gray-200"
      >
        <span className="text-xl">☰</span>
      </button>

      {/* Sidebar */}
      <div className={`fixed md:relative top-0 left-0 z-40 w-64 bg-white/80 backdrop-blur-sm border-r border-gray-200 min-h-screen p-6 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="space-y-2">
          <div className="flex items-center space-x-3 mb-8">
            <div className="text-2xl">📖</div>
            <h2 className="text-xl font-bold text-gray-800">DeDiary</h2>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  // Close mobile menu after selection
                  if (window.innerWidth < 768 && onToggle) {
                    onToggle();
                  }
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  currentPage === item.id
                    ? "bg-gradient-to-r from-lavender to-sky-blue text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={onToggle}
        />
      )}
    </>
  );
}
