import React from "react";
import WalletConnect from "./WalletConnect";

interface LandingProps {
  onConnected: (walletAddress: string) => void;
}

export default function Landing({ onConnected }: LandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender via-sky-blue to-mint-green flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Hero Section */}
        <div className="space-y-6">
          <div className="text-6xl mb-4">📖✨</div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4">DeDiary</h1>
          <p className="text-2xl text-gray-700 font-medium">
            Your Decentralized Mood Diary
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Connect your wallet, write your daily thoughts, and let AI help you
            understand your emotions. Your journal stays private on IPFS while
            your mood insights are stored securely on Cardano.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-6 my-12">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Private & Secure
            </h3>
            <p className="text-gray-600 text-sm">
              Your thoughts are encrypted and stored on IPFS, only you can
              access them
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="font-semibold text-gray-800 mb-2">
              AI Mood Insights
            </h3>
            <p className="text-gray-600 text-sm">
              Get emotional analysis and mood tracking powered by AI
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-800 mb-2">Own Your Data</h3>
            <p className="text-gray-600 text-sm">
              Your emotional journey belongs to you, stored on the blockchain
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="space-y-4">
          <WalletConnect
            onConnected={(api, info) => {
              console.log("🔍 Wallet info received:", info);
              // Get the first used address or change address
              const walletAddress = info.used?.[0] || info.change;
              console.log("🔍 Extracted wallet address:", walletAddress);
              onConnected(walletAddress);
            }}
          />
          <p className="text-sm text-gray-500">
            Connect your Cardano wallet to start your decentralized journaling
            journey
          </p>
        </div>
      </div>
    </div>
  );
}
