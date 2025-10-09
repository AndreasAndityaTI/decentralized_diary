import React from "react";
import { classifySentiment } from "../services/sentiment";
import { uploadJsonToIpfs, extractDiaryMetadata } from "../services/ipfs";
import { mintMonetizedJournalNFT } from "../services/cardano";

export type DiaryEntry = {
  title: string;
  content: string;
  createdAt: string;
  mood?: string;
  walletAddress?: string;
  walletUsername?: string;
  location?: string;
  hideWalletAddress?: boolean;
  hideWalletUsername?: boolean;
  overrideMood?: string;
  isMonetized?: boolean;
  nftPolicyId?: string;
  nftAssetName?: string;
  nftTxHash?: string;
  secretHistory?: string;
};

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

export default function DiaryForm(props: {
  onPublished: (entry: DiaryEntry, ipfsCid: string) => void;
  onUpdated?: (entry: DiaryEntry, oldCid: string, newCid: string) => void;
  walletAddress?: string;
  walletUsername?: string;
  walletApi?: any;
  existingEntries?: Array<{ entry: DiaryEntry; cid: string }>;
  entryToEdit?: { entry: DiaryEntry; cid: string };
}) {
  const isEditing = !!props.entryToEdit;
  const [title, setTitle] = React.useState(props.entryToEdit?.entry.title || "");
  const [content, setContent] = React.useState(props.entryToEdit?.entry.content || "");
  const [mood, setMood] = React.useState<string | null>(props.entryToEdit?.entry.mood || null);
  const [overrideMood, setOverrideMood] = React.useState<string>(props.entryToEdit?.entry.overrideMood || "");
  const [location, setLocation] = React.useState(props.entryToEdit?.entry.location || "");
  const [hideWalletAddress, setHideWalletAddress] = React.useState(props.entryToEdit?.entry.hideWalletAddress || false);
  const [hideWalletUsername, setHideWalletUsername] = React.useState(props.entryToEdit?.entry.hideWalletUsername || false);
  const [isMonetized, setIsMonetized] = React.useState(props.entryToEdit?.entry.isMonetized || false);
  const [countries, setCountries] = React.useState<Array<{ name: string; code: string }>>([]);
  const [loadingCountries, setLoadingCountries] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [error, setError] = React.useState("");
  const [recommendations, setRecommendations] = React.useState<any[]>([]);
  const [showRecommendations, setShowRecommendations] = React.useState(false);

  // Load countries on component mount
  React.useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoadingCountries(true);
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2');
        const data = await response.json();
        const countryList = data
          .map((country: any) => ({
            name: country.name.common,
            code: country.cca2
          }))
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        setCountries(countryList);
      } catch (err) {
        console.error('Failed to load countries:', err);
      } finally {
        setLoadingCountries(false);
      }
    };
    loadCountries();
  }, []);

  const analyze = async () => {
    try {
      setError("");
      setAnalyzing(true);
      const res = await classifySentiment(content || title);
      setMood(res.label);
      generateRecommendations({ label: res.label, score: res.score }, content);
    } catch (e: any) {
      setError(
        e?.message ||
          "Sorry, I couldn't understand your feelings right now. Please try again."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const generateSecretHistory = (): string => {
    if (!props.existingEntries || props.existingEntries.length === 0) {
      return "";
    }

    // Create a chronological history of all previous entries
    const historyEntries = props.existingEntries
      .sort((a, b) => new Date(a.entry.createdAt).getTime() - new Date(b.entry.createdAt).getTime())
      .map(({ entry }) => ({
        date: new Date(entry.createdAt).toLocaleDateString(),
        title: entry.title,
        mood: entry.mood,
        summary: entry.content.substring(0, 100) + (entry.content.length > 100 ? "..." : "")
      }));

    return JSON.stringify(historyEntries);
  };

  const generateRecommendations = (
    mood: { label: string; score: number },
    story: string
  ) => {
    const moodRecommendations = {
      happy: {
        books: [
          {
            title: "The Happiness Project",
            author: "Gretchen Rubin",
            reason: "Build on your positive energy",
          },
          {
            title: "Big Magic",
            author: "Elizabeth Gilbert",
            reason: "Channel your joy into creativity",
          },
        ],
        movies: [
          {
            title: "The Secret Life of Walter Mitty",
            reason: "Adventure and self-discovery",
          },
          { title: "Amélie", reason: "Whimsical and heartwarming" },
        ],
        music: [
          {
            title: "Good Vibrations",
            artist: "The Beach Boys",
            reason: "Classic feel-good vibes",
          },
          {
            title: "Here Comes the Sun",
            artist: "The Beatles",
            reason: "Uplifting and timeless",
          },
        ],
        creators: [
          {
            name: "Matt D'Avella",
            platform: "YouTube",
            reason: "Minimalism and mindful living",
          },
          {
            name: "The School of Life",
            platform: "YouTube",
            reason: "Philosophy for everyday happiness",
          },
        ],
      },
      sad: {
        books: [
          {
            title: "The Gifts of Imperfection",
            author: "Brené Brown",
            reason: "Embrace vulnerability and healing",
          },
          {
            title: "When Things Fall Apart",
            author: "Pema Chödrön",
            reason: "Finding peace in difficult times",
          },
        ],
        movies: [
          { title: "Inside Out", reason: "Understanding emotions and growth" },
          { title: "The Pursuit of Happyness", reason: "Hope and resilience" },
        ],
        music: [
          {
            title: "Fix You",
            artist: "Coldplay",
            reason: "Comforting and healing",
          },
          {
            title: "Lean on Me",
            artist: "Bill Withers",
            reason: "Support and community",
          },
        ],
        creators: [
          {
            name: "Therapy in a Nutshell",
            platform: "YouTube",
            reason: "Mental health support and coping strategies",
          },
          {
            name: "Kurzgesagt",
            platform: "YouTube",
            reason: "Educational content to distract and inspire",
          },
        ],
      },
      anxious: {
        books: [
          {
            title: "The Anxiety and Phobia Workbook",
            author: "Edmund Bourne",
            reason: "Practical anxiety management",
          },
          {
            title: "Wherever You Go, There You Are",
            author: "Jon Kabat-Zinn",
            reason: "Mindfulness for anxiety relief",
          },
        ],
        movies: [
          { title: "The Secret Garden", reason: "Calming and restorative" },
          { title: "My Neighbor Totoro", reason: "Gentle and soothing" },
        ],
        music: [
          {
            title: "Weightless",
            artist: "Marconi Union",
            reason: "Scientifically designed to reduce anxiety",
          },
          {
            title: "Clair de Lune",
            artist: "Claude Debussy",
            reason: "Classical calm and beauty",
          },
        ],
        creators: [
          {
            name: "Meditation Minis",
            platform: "YouTube",
            reason: "Quick meditation and breathing exercises",
          },
          {
            name: "The Honest Guys",
            platform: "YouTube",
            reason: "Guided meditations for anxiety relief",
          },
        ],
      },
      motivated: {
        books: [
          {
            title: "Atomic Habits",
            author: "James Clear",
            reason: "Build systems for success",
          },
          {
            title: "The 7 Habits of Highly Effective People",
            author: "Stephen Covey",
            reason: "Personal and professional growth",
          },
        ],
        movies: [
          { title: "Rocky", reason: "Classic underdog motivation" },
          {
            title: "The Social Network",
            reason: "Entrepreneurship and innovation",
          },
        ],
        music: [
          {
            title: "Eye of the Tiger",
            artist: "Survivor",
            reason: "Classic motivation anthem",
          },
          {
            title: "Hall of Fame",
            artist: "The Script",
            reason: "Achievement and success",
          },
        ],
        creators: [
          {
            name: "Gary Vaynerchuk",
            platform: "YouTube",
            reason: "Entrepreneurship and hustle",
          },
          {
            name: "TED",
            platform: "YouTube",
            reason: "Ideas worth spreading and inspiration",
          },
        ],
      },
      calm: {
        books: [
          {
            title: "The Art of Living",
            author: "Thich Nhat Hanh",
            reason: "Mindfulness and peace",
          },
          {
            title: "Walden",
            author: "Henry David Thoreau",
            reason: "Simplicity and nature",
          },
        ],
        movies: [
          { title: "The Tree of Life", reason: "Contemplative and beautiful" },
          { title: "Lost in Translation", reason: "Quiet and introspective" },
        ],
        music: [
          {
            title: "Weightless",
            artist: "Marconi Union",
            reason: "Ultimate relaxation",
          },
          {
            title: "Spiegel im Spiegel",
            artist: "Arvo Pärt",
            reason: "Minimalist and peaceful",
          },
        ],
        creators: [
          {
            name: "Peaceful Cuisine",
            platform: "YouTube",
            reason: "Calming cooking and mindfulness",
          },
          {
            name: "ASMR Darling",
            platform: "YouTube",
            reason: "Relaxing ASMR content",
          },
        ],
      },
    };

    const moodData =
      moodRecommendations[mood.label as keyof typeof moodRecommendations] ||
      moodRecommendations.happy;

    // Generate 2-3 recommendations for each category
    const recs = [
      ...moodData.books
        .slice(0, 2)
        .map((book) => ({ ...book, type: "book", icon: "📚" })),
      ...moodData.movies
        .slice(0, 2)
        .map((movie) => ({ ...movie, type: "movie", icon: "🎬" })),
      ...moodData.music
        .slice(0, 2)
        .map((song) => ({ ...song, type: "music", icon: "🎵" })),
      ...moodData.creators
        .slice(0, 2)
        .map((creator) => ({ ...creator, type: "creator", icon: "👤" })),
    ];

    setRecommendations(recs);
    setShowRecommendations(true);
  };

  const handleSubmit = async () => {
    try {
      setError("");
      setLoading(true);

      // Generate secret history from existing entries
      const secretHistory = generateSecretHistory();

      let nftInfo = undefined;
      if (isMonetized && props.walletApi && props.walletAddress) {
        console.log("🎨 Minting NFT for monetized journal...");
        try {
          nftInfo = await mintMonetizedJournalNFT(
            props.walletApi,
            props.walletAddress,
            "", // We'll set IPFS CID after upload
            title
          );
          console.log("✅ NFT minted:", nftInfo);
        } catch (nftError) {
          console.warn("⚠️ NFT minting failed, proceeding without NFT:", nftError);
        }
      }

      const entry: DiaryEntry = {
        title,
        content,
        createdAt: new Date().toISOString(),
        mood: overrideMood || mood || undefined,
        walletAddress: hideWalletAddress ? undefined : props.walletAddress,
        walletUsername: hideWalletUsername ? undefined : props.walletUsername,
        location: location || undefined,
        hideWalletAddress,
        hideWalletUsername,
        overrideMood: overrideMood || undefined,
        isMonetized,
        nftPolicyId: nftInfo?.policyId,
        nftAssetName: nftInfo?.assetName,
        nftTxHash: nftInfo?.txHash,
        secretHistory,
      };

      // Extract metadata for Pinata
      console.log("🔍 DiaryForm - walletAddress prop:", props.walletAddress);
      const metadata = extractDiaryMetadata(entry, props.walletAddress);
      console.log("🔍 DiaryForm - extracted metadata:", metadata);
      const ipfs = await uploadJsonToIpfs(entry, metadata);

      console.log("📝 Diary entry saved to IPFS:", {
        cid: ipfs.cid,
        metadata: ipfs.pinataMetadata,
        url: ipfs.url,
      });

      if (isEditing && props.onUpdated && props.entryToEdit) {
        props.onUpdated(entry, props.entryToEdit.cid, ipfs.cid);
        alert("✅ Your story has been updated successfully!");
      } else {
        props.onPublished(entry, ipfs.cid);
        alert("✅ Your story has been saved successfully!");
      }
    } catch (e: any) {
      setError(
        e?.message ||
          "Oops! Couldn't save your entry right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">
            Good Morning!
          </h3>
          <p className="text-gray-600 mt-1">
            How are you feeling today?
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Ready to write today's story?
          </p>
          {props.walletAddress && (
            <div className="mt-2 text-xs text-gray-500">
              📱 Source: {props.walletAddress.slice(0, 10)}...{props.walletAddress.slice(-6)}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <input
          className="w-full border border-gray-300 bg-white text-gray-800 placeholder-gray-500 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-lavender text-lg"
          placeholder="What's your story title today?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full border border-gray-300 bg-white text-gray-800 placeholder-gray-500 rounded-xl p-4 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-lavender resize-none text-lg leading-relaxed"
          placeholder="Start your journal entry and let AI analyze your mood"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* Location Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            📍 Location (optional)
          </label>
          <select
            className="w-full border border-gray-300 bg-white text-gray-800 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-lavender"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={loadingCountries}
          >
            <option value="">Select your country...</option>
            {countries.map((country) => (
              <option key={country.code} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
          {loadingCountries && (
            <p className="text-sm text-gray-500">Loading countries...</p>
          )}
        </div>

        {/* Wallet Address Visibility Option */}
        {props.walletAddress && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              🔒 Wallet Address Visibility
            </label>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                id="hideWalletAddress"
                checked={hideWalletAddress}
                onChange={(e) => setHideWalletAddress(e.target.checked)}
                className="w-4 h-4 text-lavender bg-gray-100 border-gray-300 rounded focus:ring-lavender focus:ring-2"
              />
              <label htmlFor="hideWalletAddress" className="text-sm text-gray-700">
                Hide wallet address from journal entry (address will still be used for data organization)
              </label>
            </div>
            <p className="text-xs text-gray-500">
              Your wallet address helps organize your entries and enables NFT minting features.
            </p>
          </div>
        )}

        {/* Wallet Username Visibility Option */}
        {props.walletUsername && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              🔒 Wallet Username Visibility
            </label>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                id="hideWalletUsername"
                checked={hideWalletUsername}
                onChange={(e) => setHideWalletUsername(e.target.checked)}
                className="w-4 h-4 text-lavender bg-gray-100 border-gray-300 rounded focus:ring-lavender focus:ring-2"
              />
              <label htmlFor="hideWalletUsername" className="text-sm text-gray-700">
                Hide wallet username from journal entry
              </label>
            </div>
            <p className="text-xs text-gray-500">
              Your wallet username identifies your wallet provider.
            </p>
          </div>
        )}

        {/* Monetize Journal Option */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            💰 Monetize Your Journal
          </label>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              id="isMonetized"
              checked={isMonetized}
              onChange={(e) => setIsMonetized(e.target.checked)}
              className="w-4 h-4 text-lavender bg-gray-100 border-gray-300 rounded focus:ring-lavender focus:ring-2"
            />
            <label htmlFor="isMonetized" className="text-sm text-gray-700">
              Make this journal available for purchase
            </label>
          </div>
          <p className="text-xs text-gray-500">
            50% for writer, 50% for company
          </p>
        </div>

        {/* Override AI Mood Analysis */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Override AI mood analysis
          </label>
          <select
            className="w-full border border-gray-300 bg-white text-gray-800 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-lavender"
            value={overrideMood}
            onChange={(e) => setOverrideMood(e.target.value)}
          >
            <option value="">Use AI analysis</option>
            <option value="happy">😊 Happy</option>
            <option value="sad">😢 Sad</option>
            <option value="angry">😠 Angry</option>
            <option value="neutral">😐 Neutral</option>
            <option value="anxious">😰 Anxious</option>
            <option value="motivated">💪 Motivated</option>
            <option value="calm">😌 Calm</option>
            <option value="excited">🤩 Excited</option>
            <option value="frustrated">😤 Frustrated</option>
            <option value="grateful">🙏 Grateful</option>
          </select>
          <p className="text-xs text-gray-500">
            Override the AI's mood analysis with your own feeling
          </p>
        </div>
      </div>

      {/* Mood Analysis */}
      <div className="flex items-center justify-between">
        <button
          onClick={analyze}
          disabled={analyzing || !content.trim()}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-mint-green to-soft-yellow text-gray-800 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {analyzing
            ? "Understanding your feelings..."
            : "💭 How am I feeling?"}
        </button>

        {mood && (
          <div className="flex items-center space-x-3 bg-gradient-to-r from-lavender/20 to-sky-blue/20 rounded-xl p-3">
            <span className="text-2xl">
              {moodEmojis[mood as keyof typeof moodEmojis] || "😊"}
            </span>
            <div>
              <div className="font-semibold text-gray-800 capitalize">
                {mood}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading || analyzing || !title.trim() || !content.trim()}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-lavender to-sky-blue text-white hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
        >
          {loading ? (isEditing ? "Updating your story..." : "Saving your story...") : (isEditing ? "📝 Update My Story" : "📖 Save My Story")}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Personalized Recommendations */}
      {showRecommendations && recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-mint-green/20 to-soft-yellow/20 rounded-2xl p-6 border border-mint-green/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              💡 Personalized Recommendations
            </h3>
            <button
              onClick={() => setShowRecommendations(false)}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Based on your mood and story, here are some recommendations to help
            you through this moment:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="bg-white/60 backdrop-blur-sm rounded-xl p-4 hover:bg-white/80 transition-all duration-200"
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{rec.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm">
                      {rec.title || rec.name}
                    </h4>
                    {(rec.author || rec.artist) && (
                      <p className="text-gray-600 text-xs">
                        by {rec.author || rec.artist}
                      </p>
                    )}
                    {rec.platform && (
                      <p className="text-gray-500 text-xs">on {rec.platform}</p>
                    )}
                    <p className="text-gray-700 text-xs mt-1">{rec.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              💝 These recommendations are tailored to your current emotional
              state
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
