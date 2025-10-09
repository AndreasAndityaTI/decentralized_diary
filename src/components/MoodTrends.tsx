import React, { useState } from "react";
import { DiaryEntry } from "./DiaryForm";

interface MoodTrendsProps {
  entries: Array<{ entry: DiaryEntry; cid: string }>;
  publicEntries?: Array<{ entry: DiaryEntry; cid: string }>;
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
  happy: "#FFD700",
  sad: "#87CEEB",
  anxious: "#FF6B6B",
  motivated: "#4ECDC4",
  calm: "#A8E6CF",
  excited: "#FFB6C1",
  frustrated: "#FFA07A",
  grateful: "#98FB98",
};

export default function MoodTrends({ entries, publicEntries = [] }: MoodTrendsProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<"personal" | "global">("personal");

  // Calculate streak
  const calculateStreak = () => {
    if (entries.length === 0) return 0;

    const sortedEntries = entries.sort(
      (a, b) =>
        new Date(b.entry.createdAt).getTime() -
        new Date(a.entry.createdAt).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const { entry } of sortedEntries) {
      const entryDate = new Date(entry.createdAt);
      entryDate.setHours(0, 0, 0, 0);

      const diffTime = currentDate.getTime() - entryDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === streak + 1) {
        streak++;
        currentDate = entryDate;
      } else if (diffDays === streak) {
        // Same day, don't increment
        continue;
      } else {
        break;
      }
    }

    return streak;
  };

  // Calculate mood distribution
  const getMoodDistribution = () => {
    const currentEntries = viewMode === "personal" ? entries : [...entries, ...publicEntries];
    const moodCounts: { [key: string]: number } = {};
    currentEntries.forEach(({ entry }) => {
      const mood = entry.mood || "unknown";
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });
    return moodCounts;
  };

  // Calculate weekly data
  const getWeeklyData = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const currentEntries = viewMode === "personal" ? entries : [...entries, ...publicEntries];
    const weeklyEntries = currentEntries.filter(
      ({ entry }) => new Date(entry.createdAt) >= weekAgo
    );

    const dailyMoods: { [key: string]: string[] } = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toDateString();
      dailyMoods[dateStr] = [];
    }

    weeklyEntries.forEach(({ entry }) => {
      const dateStr = new Date(entry.createdAt).toDateString();
      if (dailyMoods[dateStr]) {
        dailyMoods[dateStr].push(entry.mood || "unknown");
      }
    });

    return dailyMoods;
  };

  const currentEntries = viewMode === "personal" ? entries : [...entries, ...publicEntries];
  const streak = viewMode === "personal" ? calculateStreak() : 0; // Streak only makes sense for personal entries
  const moodDistribution = getMoodDistribution();
  const weeklyData = getWeeklyData();
  const totalEntries = currentEntries.length;

  return (
    <div className="flex-1 p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mood Trends</h1>
          <p className="text-gray-600 mt-1">
            {viewMode === "personal" ? "Your personal mood patterns" : "Global community mood patterns"}
          </p>
        </div>
        <div className="flex space-x-2">
          <div className="flex space-x-1 mr-4">
            <button
              onClick={() => setViewMode("personal")}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                viewMode === "personal"
                  ? "bg-gradient-to-r from-lavender to-sky-blue text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              👤 Personal
            </button>
            <button
              onClick={() => setViewMode("global")}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                viewMode === "global"
                  ? "bg-gradient-to-r from-lavender to-sky-blue text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              🌍 Global
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {viewMode === "personal" ? (
          <div className="bg-gradient-to-r from-mint-green to-soft-yellow rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🔥</div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{streak}</h3>
                <p className="text-gray-600">Day Streak</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-mint-green to-soft-yellow rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">👥</div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{publicEntries.length}</h3>
                <p className="text-gray-600">Public Journals</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-lavender to-sky-blue rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">📝</div>
            <div>
              <h3 className="text-2xl font-bold text-white">{totalEntries}</h3>
              <p className="text-white/80">
                {viewMode === "personal" ? "Your Entries" : "Total Community Entries"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-soft-yellow to-mint-green rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">📊</div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                {Object.keys(moodDistribution).length}
              </h3>
              <p className="text-gray-600">Unique Moods</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mood Calendar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Mood Calendar</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                if (selectedMonth === 0) {
                  setSelectedMonth(11);
                  setSelectedYear(selectedYear - 1);
                } else {
                  setSelectedMonth(selectedMonth - 1);
                }
              }}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="text-lg font-semibold text-gray-800 min-w-[120px] text-center">
              {new Date(selectedYear, selectedMonth).toLocaleDateString("en", {
                month: "long",
                year: "numeric",
              })}
            </div>
            <button
              onClick={() => {
                if (selectedMonth === 11) {
                  setSelectedMonth(0);
                  setSelectedYear(selectedYear + 1);
                } else {
                  setSelectedMonth(selectedMonth + 1);
                }
              }}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {/* Calendar Header */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-600 py-2"
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {(() => {
            const today = new Date();
            const firstDay = new Date(selectedYear, selectedMonth, 1);
            const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
            const startDate = new Date(firstDay);
            startDate.setDate(startDate.getDate() - firstDay.getDay());

            const calendarDays = [];
            const currentDate = new Date(startDate);

            // Generate 6 weeks (42 days) to fill the calendar
            for (let i = 0; i < 42; i++) {
              const dateStr = currentDate.toDateString();
              const isCurrentMonth = currentDate.getMonth() === selectedMonth;
              const isToday =
                currentDate.toDateString() === today.toDateString();

              // Get moods for this date
              const dayMoods = currentEntries
                .filter(({ entry }) => {
                  const entryDate = new Date(entry.createdAt);
                  return entryDate.toDateString() === dateStr;
                })
                .map(({ entry }) => entry.mood || "unknown");

              const mostCommonMood =
                dayMoods.length > 0
                  ? dayMoods.reduce((a, b, i, arr) =>
                      arr.filter((v) => v === a).length >=
                      arr.filter((v) => v === b).length
                        ? a
                        : b
                    )
                  : null;

              calendarDays.push(
                <div
                  key={dateStr}
                  className={`text-center p-2 min-h-[3rem] flex flex-col items-center justify-center ${
                    isCurrentMonth ? "text-gray-800" : "text-gray-400"
                  } ${isToday ? "bg-blue-100 rounded-lg" : ""}`}
                >
                  <div className="text-sm font-medium mb-1">
                    {currentDate.getDate()}
                  </div>
                  <div className="text-lg">
                    {mostCommonMood
                      ? moodEmojis[mostCommonMood as keyof typeof moodEmojis] ||
                        "😊"
                      : "—"}
                  </div>
                  {dayMoods.length > 1 && (
                    <div className="text-xs text-gray-500">
                      +{dayMoods.length - 1}
                    </div>
                  )}
                </div>
              );

              currentDate.setDate(currentDate.getDate() + 1);
            }

            return calendarDays;
          })()}
        </div>
      </div>

      {/* Mood Insights */}
      <div className="bg-gradient-to-r from-lavender/20 to-sky-blue/20 rounded-2xl p-6 border border-lavender/30">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          💡 {viewMode === "personal" ? "Personal" : "Community"} Mood Insights
        </h3>
        <div className="space-y-3 text-gray-700">
          {viewMode === "personal" && streak > 0 && (
            <p>
              🎉 You've been journaling for {streak} day{streak > 1 ? "s" : ""}{" "}
              in a row! Keep up the great work!
            </p>
          )}
          {viewMode === "global" && publicEntries.length > 0 && (
            <p>
              🌍 The community has shared {publicEntries.length} public journal{publicEntries.length > 1 ? "s" : ""}!
            </p>
          )}
          {totalEntries > 0 && (
            <p>
              The most common mood {viewMode === "personal" ? "in your journal" : "in the community"} is{" "}
              <strong>
                {
                  Object.entries(moodDistribution).reduce((a, b) =>
                    moodDistribution[a[0]] > moodDistribution[b[0]] ? a : b
                  )[0]
                }
              </strong>{" "}
              with {Math.max(...Object.values(moodDistribution))} entries.
            </p>
          )}
          {totalEntries === 0 && (
            <p>
              {viewMode === "personal"
                ? "Start journaling to see your mood trends and insights here!"
                : "No public journals available yet. Be the first to share!"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
