import React, { useState } from "react";
import { DiaryEntry } from "./DiaryForm";

interface MoodTrendsProps {
  entries: Array<{ entry: DiaryEntry; cid: string }>;
}

const moodEmojis = {
  happy: "😊",
  sad: "😢",
  anxious: "😰",
  motivated: "💪",
  calm: "😌",
  excited: "🤩",
  frustrated: "😤",
  grateful: "🙏",
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

export default function MoodTrends({ entries }: MoodTrendsProps) {
  const [timeRange, setTimeRange] = useState("week");

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
    const moodCounts: { [key: string]: number } = {};
    entries.forEach(({ entry }) => {
      const mood = entry.sentiment?.label || "unknown";
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });
    return moodCounts;
  };

  // Calculate weekly data
  const getWeeklyData = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weeklyEntries = entries.filter(
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
        dailyMoods[dateStr].push(entry.sentiment?.label || "unknown");
      }
    });

    return dailyMoods;
  };

  const streak = calculateStreak();
  const moodDistribution = getMoodDistribution();
  const weeklyData = getWeeklyData();
  const totalEntries = entries.length;

  return (
    <div className="flex-1 p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Mood Trends</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange("week")}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              timeRange === "week"
                ? "bg-gradient-to-r from-lavender to-sky-blue text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange("month")}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              timeRange === "month"
                ? "bg-gradient-to-r from-lavender to-sky-blue text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-mint-green to-soft-yellow rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🔥</div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{streak}</h3>
              <p className="text-gray-600">Day Streak</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-lavender to-sky-blue rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">📝</div>
            <div>
              <h3 className="text-2xl font-bold text-white">{totalEntries}</h3>
              <p className="text-white/80">Total Entries</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-soft-yellow to-mint-green rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">⭐</div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                {totalEntries > 0
                  ? Math.round(
                      (Object.values(moodDistribution).reduce(
                        (a, b) => a + b,
                        0
                      ) /
                        totalEntries) *
                        100
                    )
                  : 0}
                %
              </h3>
              <p className="text-gray-600">Mood Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mood Distribution Chart */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Mood Distribution
        </h3>
        <div className="space-y-3">
          {Object.entries(moodDistribution).map(([mood, count]) => {
            const percentage =
              totalEntries > 0 ? (count / totalEntries) * 100 : 0;
            return (
              <div key={mood} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {moodEmojis[mood as keyof typeof moodEmojis] || "😊"}
                    </span>
                    <span className="font-medium text-gray-700 capitalize">
                      {mood}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {count} entries ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor:
                        moodColors[mood as keyof typeof moodColors] || "#gray",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Mood Chart */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          7-Day Mood Overview
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {Object.entries(weeklyData)
            .reverse()
            .map(([date, moods]) => {
              const dayName = new Date(date).toLocaleDateString("en", {
                weekday: "short",
              });
              const mostCommonMood =
                moods.length > 0
                  ? moods.reduce((a, b, i, arr) =>
                      arr.filter((v) => v === a).length >=
                      arr.filter((v) => v === b).length
                        ? a
                        : b
                    )
                  : null;

              return (
                <div key={date} className="text-center">
                  <div className="text-xs text-gray-500 mb-2">{dayName}</div>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto ${
                      mostCommonMood
                        ? "bg-gradient-to-br from-gray-100 to-gray-200"
                        : "bg-gray-50"
                    }`}
                  >
                    <span className="text-lg">
                      {mostCommonMood
                        ? moodEmojis[
                            mostCommonMood as keyof typeof moodEmojis
                          ] || "😊"
                        : "—"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {moods.length}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Mood Insights */}
      <div className="bg-gradient-to-r from-lavender/20 to-sky-blue/20 rounded-2xl p-6 border border-lavender/30">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          💡 Mood Insights
        </h3>
        <div className="space-y-3 text-gray-700">
          {streak > 0 && (
            <p>
              🎉 You've been journaling for {streak} day{streak > 1 ? "s" : ""}{" "}
              in a row! Keep up the great work!
            </p>
          )}
          {totalEntries > 0 && (
            <p>
              Your most common mood is{" "}
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
            <p>Start journaling to see your mood trends and insights here!</p>
          )}
        </div>
      </div>
    </div>
  );
}
