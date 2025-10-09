import React, { useState } from "react";

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Home", icon: "🏠" },
  { id: "journal", label: "Journal", icon: "📝" },
  { id: "trends", label: "Mood Trends", icon: "📊" },
  { id: "moodmap", label: "Mood Map", icon: "🌍" },
  { id: "ai-companion", label: "AI Companion", icon: "🤖" },
  { id: "profile", label: "Profile", icon: "👤" },
];

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-white/80 backdrop-blur-sm border-r border-gray-200 min-h-screen p-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-3 mb-8">
            <div className="text-2xl">📖</div>
            <h2 className="text-xl font-bold text-gray-800">DeDiary</h2>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
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

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-40">
        <nav className="flex justify-around items-center py-2 px-2">
          {menuItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                currentPage === item.id
                  ? "bg-gradient-to-r from-lavender to-sky-blue text-white shadow-lg"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span className="text-xs font-medium truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Mobile Menu Toggle for additional items */}
        <div className="relative">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full flex items-center justify-center py-2 px-4 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium">
              {isMobileMenuOpen ? "Less" : "More"}
            </span>
            <svg
              className={`ml-2 w-4 h-4 transition-transform ${isMobileMenuOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isMobileMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
              <nav className="flex justify-around items-center py-2 px-2">
                {menuItems.slice(5).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onPageChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                      currentPage === item.id
                        ? "bg-gradient-to-r from-lavender to-sky-blue text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-lg mb-1">{item.icon}</span>
                    <span className="text-xs font-medium truncate">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-30 px-4 py-3">
        <div className="flex items-center justify-center">
          <div className="text-2xl">📖</div>
          <h1 className="text-lg font-bold text-gray-800 ml-2">DeDiary</h1>
        </div>
      </div>
    </>
  );
}
