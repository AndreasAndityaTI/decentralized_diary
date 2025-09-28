import React, { useState } from "react";

interface MoodReputation {
  id: string;
  title: string;
  description: string;
  icon: string;
  score: number;
  maxScore: number;
  category: string;
  isUnlocked: boolean;
  nftMinted: boolean;
  requirements: string[];
}

interface MoodAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  points: number;
  isEarned: boolean;
  earnedDate?: string;
  nftCid?: string;
}

interface ReputationStats {
  totalScore: number;
  level: number;
  streak: number;
  totalEntries: number;
  consistency: number;
  growth: number;
  nftsMinted: number;
}

const moodReputations: MoodReputation[] = [
  {
    id: "1",
    title: "Consistency Master",
    description: "Maintain daily journaling for 30+ days",
    icon: "📅",
    score: 28,
    maxScore: 30,
    category: "Consistency",
    isUnlocked: true,
    nftMinted: false,
    requirements: ["Journal for 30 consecutive days", "No missed entries"],
  },
  {
    id: "2",
    title: "Emotional Growth",
    description: "Show positive emotional development over time",
    icon: "🌱",
    score: 85,
    maxScore: 100,
    category: "Growth",
    isUnlocked: true,
    nftMinted: true,
    requirements: ["Improve mood scores by 20%", "Show emotional awareness"],
  },
  {
    id: "3",
    title: "Mindfulness Practitioner",
    description: "Regular meditation and reflection practice",
    icon: "🧘",
    score: 45,
    maxScore: 50,
    category: "Mindfulness",
    isUnlocked: true,
    nftMinted: false,
    requirements: ["Meditate 20+ times", "Use mindfulness features"],
  },
  {
    id: "4",
    title: "Resilience Builder",
    description: "Overcome challenges and maintain positivity",
    icon: "💪",
    score: 0,
    maxScore: 25,
    category: "Resilience",
    isUnlocked: false,
    nftMinted: false,
    requirements: ["Bounce back from low moods", "Maintain positive outlook"],
  },
  {
    id: "5",
    title: "Gratitude Champion",
    description: "Regular gratitude practice and appreciation",
    icon: "🙏",
    score: 15,
    maxScore: 20,
    category: "Gratitude",
    isUnlocked: true,
    nftMinted: false,
    requirements: ["Express gratitude 15+ times", "Positive mindset"],
  },
  {
    id: "6",
    title: "Self-Awareness Expert",
    description: "Deep understanding of personal emotions and patterns",
    icon: "🔍",
    score: 0,
    maxScore: 40,
    category: "Awareness",
    isUnlocked: false,
    nftMinted: false,
    requirements: ["Analyze mood patterns", "Identify triggers"],
  },
];

const moodAchievements: MoodAchievement[] = [
  {
    id: "1",
    name: "First Entry",
    description: "Created your first diary entry",
    icon: "✨",
    rarity: "common",
    points: 10,
    isEarned: true,
    earnedDate: "2024-01-15",
    nftCid: "QmFirstEntry123",
  },
  {
    id: "2",
    name: "Week Warrior",
    description: "Journaled for 7 consecutive days",
    icon: "🏆",
    rarity: "rare",
    points: 50,
    isEarned: true,
    earnedDate: "2024-01-22",
  },
  {
    id: "3",
    name: "Mood Master",
    description: "Achieved 90%+ positive mood consistency",
    icon: "🌟",
    rarity: "epic",
    points: 100,
    isEarned: false,
  },
  {
    id: "4",
    name: "Zen Master",
    description: "100 days of mindfulness practice",
    icon: "🧘‍♂️",
    rarity: "legendary",
    points: 500,
    isEarned: false,
  },
];

const reputationStats: ReputationStats = {
  totalScore: 173,
  level: 3,
  streak: 28,
  totalEntries: 45,
  consistency: 87,
  growth: 23,
  nftsMinted: 2,
};

export default function Community() {
  const [activeTab, setActiveTab] = useState<
    "reputation" | "achievements" | "mint"
  >("reputation");
  const [selectedReputation, setSelectedReputation] =
    useState<MoodReputation | null>(null);
  const [showMintModal, setShowMintModal] = useState(false);

  const handleMintNFT = (reputationId: string) => {
    // In a real app, this would mint an NFT on Cardano
    console.log(`Minting NFT for reputation ${reputationId}`);
    setShowMintModal(false);
  };

  const handleViewReputation = (reputation: MoodReputation) => {
    setSelectedReputation(reputation);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-gray-600 bg-gray-100";
      case "rare":
        return "text-blue-600 bg-blue-100";
      case "epic":
        return "text-purple-600 bg-purple-100";
      case "legendary":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="flex-1 p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-lavender to-sky-blue rounded-full flex items-center justify-center">
          <span className="text-white text-xl">🏆</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mood Reputation</h1>
          <p className="text-gray-600">
            Build your mental health reputation and mint achievements as NFTs
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-lavender to-sky-blue rounded-xl p-4 text-white text-center">
          <div className="text-2xl font-bold">{reputationStats.totalScore}</div>
          <div className="text-sm opacity-80">Total Score</div>
        </div>
        <div className="bg-gradient-to-r from-mint-green to-soft-yellow rounded-xl p-4 text-gray-800 text-center">
          <div className="text-2xl font-bold">
            Level {reputationStats.level}
          </div>
          <div className="text-sm opacity-80">Reputation Level</div>
        </div>
        <div className="bg-gradient-to-r from-soft-yellow to-mint-green rounded-xl p-4 text-gray-800 text-center">
          <div className="text-2xl font-bold">{reputationStats.streak}</div>
          <div className="text-sm opacity-80">Day Streak</div>
        </div>
        <div className="bg-gradient-to-r from-sky-blue to-lavender rounded-xl p-4 text-white text-center">
          <div className="text-2xl font-bold">{reputationStats.nftsMinted}</div>
          <div className="text-sm opacity-80">NFTs Minted</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("reputation")}
          className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
            activeTab === "reputation"
              ? "bg-white text-lavender shadow-sm"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          🏆 Reputation
        </button>
        <button
          onClick={() => setActiveTab("achievements")}
          className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
            activeTab === "achievements"
              ? "bg-white text-lavender shadow-sm"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          🎖️ Achievements
        </button>
        <button
          onClick={() => setActiveTab("mint")}
          className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
            activeTab === "mint"
              ? "bg-white text-lavender shadow-sm"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          🪙 Mint NFTs
        </button>
      </div>

      {/* Reputation Tab */}
      {activeTab === "reputation" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Mood Reputation Scores
            </h2>
            <div className="text-sm text-gray-600">
              Based on your diary entries and mood patterns
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {moodReputations.map((reputation) => (
              <div
                key={reputation.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-lavender to-sky-blue rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">
                        {reputation.icon}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {reputation.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {reputation.score}/{reputation.maxScore} points
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      reputation.isUnlocked
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {reputation.isUnlocked ? "Unlocked" : "Locked"}
                  </span>
                </div>

                <p className="text-gray-700 mb-4 text-sm">
                  {reputation.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>
                      {Math.round(
                        (reputation.score / reputation.maxScore) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-lavender to-sky-blue h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          (reputation.score / reputation.maxScore) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Requirements */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Requirements:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {reputation.requirements.map((req, index) => (
                      <li key={index} className="flex items-center space-x-1">
                        <span>•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex space-x-2">
                  {reputation.isUnlocked ? (
                    <>
                      <button
                        onClick={() => handleViewReputation(reputation)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-lavender to-sky-blue text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                      >
                        View Details
                      </button>
                      {!reputation.nftMinted && (
                        <button
                          onClick={() => setShowMintModal(true)}
                          className="px-4 py-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-xl transition-all duration-200 font-medium"
                        >
                          🪙 Mint NFT
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="w-full px-4 py-2 bg-gray-100 text-gray-500 rounded-xl text-center font-medium">
                      Complete requirements to unlock
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === "achievements" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Mood Achievements
            </h2>
            <div className="text-sm text-gray-600">
              Earned through your mental health journey
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {moodAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border transition-all duration-200 ${
                  achievement.isEarned
                    ? "border-green-200 hover:shadow-xl"
                    : "border-gray-200 opacity-60"
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{achievement.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {achievement.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {achievement.description}
                  </p>

                  <div
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${getRarityColor(
                      achievement.rarity
                    )}`}
                  >
                    {achievement.rarity.toUpperCase()}
                  </div>

                  <div className="text-sm text-gray-500 mb-3">
                    {achievement.points} points
                  </div>

                  {achievement.isEarned ? (
                    <div className="space-y-2">
                      <div className="text-xs text-green-600 font-medium">
                        ✓ Earned {achievement.earnedDate}
                      </div>
                      {achievement.nftCid && (
                        <div className="text-xs text-blue-600">
                          NFT: {achievement.nftCid.slice(0, 8)}...
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">Not earned yet</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mint Tab */}
      {activeTab === "mint" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Mint Your Achievements
            </h2>
            <div className="text-sm text-gray-600">
              Turn your mental health progress into NFTs
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Available to Mint */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Available to Mint
              </h3>
              <div className="space-y-3">
                {moodReputations
                  .filter((r) => r.isUnlocked && !r.nftMinted)
                  .map((reputation) => (
                    <div
                      key={reputation.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{reputation.icon}</span>
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {reputation.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {reputation.category}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleMintNFT(reputation.id)}
                        className="px-4 py-2 bg-gradient-to-r from-lavender to-sky-blue text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                      >
                        🪙 Mint
                      </button>
                    </div>
                  ))}
                {moodReputations.filter((r) => r.isUnlocked && !r.nftMinted)
                  .length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No achievements ready to mint
                  </p>
                )}
              </div>
            </div>

            {/* Already Minted */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Minted NFTs
              </h3>
              <div className="space-y-3">
                {moodReputations
                  .filter((r) => r.nftMinted)
                  .map((reputation) => (
                    <div
                      key={reputation.id}
                      className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{reputation.icon}</span>
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {reputation.title}
                          </h4>
                          <p className="text-sm text-green-600">
                            ✓ Minted on Cardano
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">NFT #1234</div>
                    </div>
                  ))}
                {moodReputations.filter((r) => r.nftMinted).length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No NFTs minted yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Minting Info */}
          <div className="bg-gradient-to-r from-lavender/20 to-sky-blue/20 rounded-2xl p-6 border border-lavender/30">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              🪙 About NFT Minting
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <h4 className="font-medium mb-2">Benefits:</h4>
                <ul className="space-y-1">
                  <li>• Permanent record of achievements</li>
                  <li>• Tradeable on Cardano marketplace</li>
                  <li>• Proof of mental health progress</li>
                  <li>• Unique digital collectibles</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Requirements:</h4>
                <ul className="space-y-1">
                  <li>• Complete reputation requirements</li>
                  <li>• Pay small Cardano transaction fee</li>
                  <li>• Connect your Cardano wallet</li>
                  <li>• Verify your identity</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How Mood Reputation Works */}
      <div className="bg-gradient-to-r from-lavender/20 to-sky-blue/20 rounded-2xl p-6 border border-lavender/30">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          🏆 How Mood Reputation Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">
              📊 Track Progress
            </h4>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Analyze your diary entries and mood patterns</li>
              <li>• Build reputation scores across categories</li>
              <li>• Track consistency and emotional growth</li>
              <li>• Monitor your mental health journey</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">
              🎖️ Earn Achievements
            </h4>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Complete requirements to unlock achievements</li>
              <li>• Earn points for mental health milestones</li>
              <li>• Showcase your progress and dedication</li>
              <li>• Build a portfolio of personal growth</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">🪙 Mint NFTs</h4>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Turn achievements into unique NFTs</li>
              <li>• Store on Cardano blockchain permanently</li>
              <li>• Trade and showcase your progress</li>
              <li>• Create valuable digital collectibles</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mint NFT Modal */}
      {showMintModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              🪙 Mint Achievement NFT
            </h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-2">🏆</div>
                <h4 className="font-medium text-gray-800">
                  Consistency Master
                </h4>
                <p className="text-sm text-gray-600">28/30 days completed</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-800 mb-2">NFT Details:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Unique digital collectible</li>
                  <li>• Stored on Cardano blockchain</li>
                  <li>• Tradeable on marketplace</li>
                  <li>• Proof of achievement</li>
                </ul>
              </div>

              <div className="bg-yellow-50 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Cost:</strong> ~2 ADA (transaction fee only)
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowMintModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleMintNFT("1")}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-lavender to-sky-blue text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                >
                  🪙 Mint NFT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
