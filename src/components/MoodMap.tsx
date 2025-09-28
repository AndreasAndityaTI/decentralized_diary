import React, { useState } from "react";

interface MoodMapProps {
  entries: Array<{ entry: any; cid: string }>;
}

const globalMoodData = {
  happy: 45,
  neutral: 30,
  sad: 15,
  angry: 10,
};

const moodEmojis = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  neutral: "😐",
};

const moodColors = {
  happy: "#FFD700",
  sad: "#87CEEB",
  angry: "#FF6B6B",
  neutral: "#D3D3D3",
};

export default function MoodMap({ entries }: MoodMapProps) {
  const [hoveredMood, setHoveredMood] = useState<string | null>(null);

  const displayData = globalMoodData;
  const total = Object.values(displayData).reduce(
    (sum, value) => sum + value,
    0
  );

  return (
    <div className="flex-1 p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Global MoodMap</h1>
      </div>

      {/* Global Mood Overview */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          🌍 Global Mood Today
        </h3>

        {/* Mood Heatmap */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(displayData).map(([mood, count]) => {
            const percentage = total > 0 ? (count / total) * 100 : 0;
            const intensity = Math.min(percentage / 20, 1); // Scale intensity

            return (
              <div
                key={mood}
                className={`p-4 rounded-xl transition-all duration-200 cursor-pointer ${
                  hoveredMood === mood ? "scale-105 shadow-lg" : ""
                }`}
                style={{
                  backgroundColor: moodColors[mood as keyof typeof moodColors],
                  opacity: 0.3 + intensity * 0.7,
                }}
                onMouseEnter={() => setHoveredMood(mood)}
                onMouseLeave={() => setHoveredMood(null)}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">
                    {moodEmojis[mood as keyof typeof moodEmojis]}
                  </div>
                  <div className="font-semibold text-gray-800 capitalize">
                    {mood}
                  </div>
                  <div className="text-sm text-gray-600">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mood Distribution Chart */}
        <div className="space-y-3">
          {Object.entries(displayData)
            .sort(([, a], [, b]) => b - a)
            .map(([mood, count]) => {
              const percentage = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={mood} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {moodEmojis[mood as keyof typeof moodEmojis]}
                      </span>
                      <span className="font-medium text-gray-700 capitalize">
                        {mood}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {count}% of users
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor:
                          moodColors[mood as keyof typeof moodColors],
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Your Contribution */}
      <div className="bg-gradient-to-r from-mint-green/20 to-soft-yellow/20 rounded-2xl p-6 border border-mint-green/30">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          🌟 Your Contribution
        </h3>
        <div className="space-y-3 text-gray-700">
          <p>
            You've contributed <strong>{entries.length}</strong> mood entries to
            the global dataset!
          </p>
          {entries.length > 0 && (
            <p>
              Your most common mood is{" "}
              <strong>
                {
                  Object.entries(
                    entries.reduce((acc, { entry }) => {
                      const mood = entry.sentiment?.label || "unknown";
                      acc[mood] = (acc[mood] || 0) + 1;
                      return acc;
                    }, {} as { [key: string]: number })
                  ).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
                }
              </strong>
              .
            </p>
          )}
          <p className="text-sm text-gray-600">
            Your data helps create a better understanding of global emotional
            patterns while keeping your personal stories private.
          </p>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-lavender to-sky-blue rounded-xl p-4 text-white text-center">
          <div className="text-2xl font-bold">1,247</div>
          <div className="text-sm opacity-80">Active Users Today</div>
        </div>
        <div className="bg-gradient-to-r from-mint-green to-soft-yellow rounded-xl p-4 text-gray-800 text-center">
          <div className="text-2xl font-bold">3,891</div>
          <div className="text-sm opacity-80">Mood Entries Today</div>
        </div>
        <div className="bg-gradient-to-r from-soft-yellow to-mint-green rounded-xl p-4 text-gray-800 text-center">
          <div className="text-2xl font-bold">68%</div>
          <div className="text-sm opacity-80">Positive Moods</div>
        </div>
      </div>
    </div>
  );
}
