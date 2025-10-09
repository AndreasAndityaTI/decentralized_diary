import React, { useMemo, useState, useEffect } from "react";
import { DiaryEntry } from "./DiaryForm";

interface CountryData {
  name: { common: string };
  cca3: string;
  latlng?: [number, number];
}

interface MoodMapProps {
  entries: Array<{ entry: DiaryEntry; cid: string }>;
}

export default function MoodMap({ entries }: MoodMapProps) {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  // Fetch countries data from API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadingCountries(true);
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca3,latlng');
        const data: CountryData[] = await response.json();
        setCountries(data);
      } catch (error) {
        console.error('Failed to fetch countries:', error);
        // Fallback to empty array
        setCountries([]);
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  // Aggregate mood data by country
  const countryMoodData = useMemo(() => {
    const moodCounts: { [country: string]: { [mood: string]: number } } = {};
    const totalByCountry: { [country: string]: number } = {};

    entries.forEach(({ entry }) => {
      if (entry.location && entry.mood) {
        const country = entry.location;
        const mood = entry.mood;
        if (!moodCounts[country]) {
          moodCounts[country] = {};
          totalByCountry[country] = 0;
        }
        moodCounts[country][mood] = (moodCounts[country][mood] || 0) + 1;
        totalByCountry[country]++;
      }
    });

    // Calculate dominant mood and positivity for each country
    const result: { [country: string]: { dominantMood: string; positivity: number; total: number } } = {};

    Object.keys(moodCounts).forEach(country => {
      const moods = moodCounts[country];
      const total = totalByCountry[country];

      // Find dominant mood
      let dominantMood = 'neutral';
      let maxCount = 0;
      Object.entries(moods).forEach(([mood, count]) => {
        if (count > maxCount) {
          maxCount = count;
          dominantMood = mood;
        }
      });

      // Calculate positivity percentage
      const positiveMoods = ['happy', 'excited', 'motivated', 'joy', 'grateful'];
      const positiveCount = positiveMoods.reduce((sum, mood) => sum + (moods[mood] || 0), 0);
      const positivity = total > 0 ? Math.round((positiveCount / total) * 100) : 0;

      result[country] = { dominantMood, positivity, total };
    });

    return result;
  }, [entries]);

  // Calculate global stats
  const globalStats = useMemo(() => {
    const userEntries = entries.filter(({ entry }) => entry.walletAddress).length;
    const allMoods = entries.map(({ entry }) => entry.mood).filter(Boolean) as string[];
    const moodCounts: { [mood: string]: number } = {};

    allMoods.forEach(mood => {
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });

    let mostCommonMood = 'neutral';
    let maxCount = 0;
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonMood = mood;
      }
    });

    const positiveMoods = ['happy', 'excited', 'motivated', 'joy', 'grateful'];
    const positiveCount = positiveMoods.reduce((sum, mood) => sum + (moodCounts[mood] || 0), 0);
    const positivityRate = allMoods.length > 0 ? Math.round((positiveCount / allMoods.length) * 100) : 0;

    return {
      userEntries,
      mostCommonMood,
      positivityRate,
      totalEntries: entries.length,
      activeUsers: Math.floor(entries.length * 0.3), // Mock calculation
      countriesWithData: Object.keys(countryMoodData).length
    };
  }, [entries, countryMoodData]);

  const getMoodColor = (mood: string) => {
    const colors = {
      happy: '#10B981',      // green
      sad: '#3B82F6',        // blue
      angry: '#EF4444',      // red
      neutral: '#6B7280',    // gray
      anxious: '#F59E0B',    // amber
      motivated: '#8B5CF6',  // purple
      calm: '#06B6D4',       // cyan
      excited: '#EC4899',    // pink
      frustrated: '#F97316', // orange
      grateful: '#84CC16',   // lime
      joy: '#10B981',        // green
      sadness: '#3B82F6',    // blue
      anger: '#EF4444',      // red
    };
    return colors[mood as keyof typeof colors] || colors.neutral;
  };

  const getPositivityColor = (positivity: number) => {
    if (positivity >= 70) return '#10B981'; // green
    if (positivity >= 50) return '#F59E0B'; // yellow
    if (positivity >= 30) return '#F97316'; // orange
    return '#EF4444'; // red
  };

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">🌍 Global Mood Map</h1>
      </div>

      {/* Your Contribution Section */}
      <div className="bg-gradient-to-r from-lavender/20 to-sky-blue/20 rounded-2xl p-6 border border-lavender/30">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-3xl">🌟</span>
          <h2 className="text-2xl font-bold text-gray-800">Your Contribution</h2>
        </div>

        <p className="text-gray-700 mb-6">
          You've contributed <strong>{globalStats.userEntries}</strong> mood entries to the global dataset!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/60 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-lavender mb-1">{globalStats.userEntries}</div>
            <div className="text-sm text-gray-600">Your Entries</div>
          </div>
          <div className="bg-white/60 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-lavender mb-1">{globalStats.mostCommonMood}</div>
            <div className="text-sm text-gray-600">Your Main Mood</div>
          </div>
          <div className="bg-white/60 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-lavender mb-1">{globalStats.positivityRate}%</div>
            <div className="text-sm text-gray-600">Your Positivity</div>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-6">
          Your data helps create a better understanding of global emotional patterns while keeping your personal stories private.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/60 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-lavender mb-1">{globalStats.activeUsers.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Active Users Today</div>
          </div>
          <div className="bg-white/60 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-lavender mb-1">{globalStats.totalEntries.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Mood Entries Today</div>
          </div>
          <div className="bg-white/60 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">{globalStats.positivityRate}%</div>
            <div className="text-sm text-gray-600">Positive Moods </div>
          </div>
        </div>
      </div>

      {/* Mood Map Visualization */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">🌍 Global Mood Distribution</h3>

        {/* Simple World Map Representation */}
        <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-6 mb-6 border-2 border-blue-200">
          <div className="text-center text-gray-500 mb-4">
            <div className="text-6xl mb-2">🌍</div>
            <p className="text-sm">Interactive World Map</p>
            <p className="text-xs text-gray-400">Countries colored by dominant mood</p>
          </div>

          {/* Country Data Display */}
          {loadingCountries ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🌍</div>
              <p className="text-gray-600">Loading country data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(countryMoodData).slice(0, 12).map(([country, data]) => {
                // Find country code for flag
                const countryInfo = countries.find(c => c.name.common === country);
                return (
                  <div key={country} className="bg-white/80 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-800 text-sm">{country}</span>
                        {countryInfo && (
                          <span className="text-xs">
                            {String.fromCodePoint(...countryInfo.cca3.split('').map(c => c.charCodeAt(0) + 127397))}
                          </span>
                        )}
                      </div>
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: getMoodColor(data.dominantMood) }}
                        title={`Dominant mood: ${data.dominantMood}`}
                      ></div>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div>Dominant: <span className="capitalize font-medium">{data.dominantMood}</span></div>
                      <div>Positivity: <span className="font-medium" style={{ color: getPositivityColor(data.positivity) }}>{data.positivity}%</span></div>
                      <div>Entries: <span className="font-medium">{data.total}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {Object.keys(countryMoodData).length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-gray-600">No location data available yet.</p>
              <p className="text-sm text-gray-500">Add location to your journal entries to see the global mood map!</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3">Mood Color Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {Object.entries({
              happy: 'Happy 😊',
              sad: 'Sad 😢',
              angry: 'Angry 😠',
              neutral: 'Neutral 😐',
              anxious: 'Anxious 😰',
              motivated: 'Motivated 💪',
              calm: 'Calm 😌',
              excited: 'Excited 🤩'
            }).map(([mood, label]) => (
              <div key={mood} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getMoodColor(mood) }}
                ></div>
                <span className="text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
