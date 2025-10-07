import React, { useEffect, useMemo, useState } from "react";
import { generateAIReply } from "../services/ai";
import { enableWallet, getWalletInfo, type WalletAPI } from "../services/cardano";

export default function AICompanion() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI writing companion. I'm here to help you reflect on your day, organize your thoughts, and provide emotional support. What's on your mind?",
      isAI: true,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [walletAddr, setWalletAddr] = useState<string>("unknown");
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'basic' | 'premium'>('free');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Dynamic limits based on subscription
  const getDialogLimit = () => {
    switch (subscriptionTier) {
      case 'free': return 3;
      case 'basic': return 50;
      case 'premium': return -1; // unlimited
      default: return 3;
    }
  };

  const dialogLimit = getDialogLimit();

  const storageKey = useMemo(() => `ai_dialogs:${walletAddr}`, [walletAddr]);
  const [dialogCount, setDialogCount] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(`ai_dialogs:unknown`);
      return raw ? parseInt(raw, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    (async () => {
      try {
        const wallet = await enableWallet();
        if (!wallet) return;
        const info = await getWalletInfo(wallet.api, wallet.name);
        const addr = info.change || info.used?.[0] || "unknown";
        setWalletAddr(addr);
        // Load per-wallet count
        const raw = localStorage.getItem(`ai_dialogs:${addr}`);
        if (raw) setDialogCount(parseInt(raw, 10) || 0);
      } catch {
        // ignore - keep unknown
      }
    })();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, String(dialogCount));
    } catch {
      // ignore
    }
  }, [storageKey, dialogCount]);

  const remaining = dialogLimit === -1 ? -1 : Math.max(0, dialogLimit - dialogCount);
  const reachedLimit = dialogLimit !== -1 && remaining <= 0;

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    if (reachedLimit) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      isAI: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const history = messages.map((m) => (m.isAI ? `Assistant: ${m.text}` : `User: ${m.text}`));
      const aiText = await generateAIReply(inputMessage, history);
      const aiMessage = {
        id: messages.length + 2,
        text: aiText,
        isAI: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setDialogCount((c) => c + 1);
    } catch (e) {
      const aiMessage = {
        id: messages.length + 2,
        text: "Sorry, I'm having trouble reaching the AI service. Please try again.",
        isAI: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const onSubscribe = async () => {
    // TODO: integrate Cardano payment to subscription validator
    alert("Subscription required: please complete payment via your Cardano wallet (coming soon)");
  };

  // Subscription logic with Cardano wallet integration
  const handleSubscribe = async (tier: 'basic' | 'premium') => {
    try {
      if (walletAddr === 'unknown') {
        alert('Please connect your Cardano wallet first');
        return;
      }

      const price = tier === 'basic' ? 5_000_000 : 10_000_000; // 5 ADA or 10 ADA in lovelace

      // This would integrate with the actual smart contract
      // For now, simulate the subscription process
      const confirmed = window.confirm(
        `Subscribe to ${tier} plan for ₳${tier === 'basic' ? '5' : '10'} per month?\n\n` +
        'This will create a subscription transaction on Cardano.'
      );

      if (confirmed) {
        // Simulate subscription activation
        setSubscriptionTier(tier);
        setDialogCount(0); // Reset usage counter
        setShowSubscriptionModal(false);

        alert(`🎉 Successfully subscribed to ${tier} plan!\n\n` +
              `Your new limit: ${tier === 'basic' ? '50' : 'Unlimited'} conversations per month`);
      }
    } catch (error) {
      console.error('Subscription failed:', error);
      alert('Subscription failed. Please try again.');
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-lavender to-sky-blue rounded-full flex items-center justify-center">
          <span className="text-white text-xl">🤖</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">AI Companion</h1>
          <p className="text-gray-600">
            Your personal writing and reflection assistant
          </p>
          <p className="text-sm text-gray-500">Wallet: {walletAddr === "unknown" ? "not connected" : `${walletAddr.slice(0, 10)}...`}</p>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {dialogLimit === -1
                ? `Plan: ${subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)} (Unlimited)`
                : `Dialogs remaining: ${remaining} / ${dialogLimit}`
              }
            </p>
            {subscriptionTier === 'free' && (
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="text-xs bg-gradient-to-r from-lavender to-sky-blue text-white px-3 py-1 rounded-full hover:shadow-md transition-all"
              >
                Upgrade
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 h-[400px] md:h-[600px] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.isAI ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.isAI
                    ? "bg-gradient-to-r from-lavender/20 to-sky-blue/20 border border-lavender/30"
                    : "bg-gradient-to-r from-mint-green to-soft-yellow"
                }`}
              >
                <p className="text-gray-800">{message.text}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-r from-lavender/20 to-sky-blue/20 border border-lavender/30 rounded-2xl p-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          {reachedLimit && (
            <div className="flex justify-center">
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-center max-w-lg">
                <p className="text-gray-800 font-medium mb-2">
                  {subscriptionTier === 'free' ? 'Free trial reached (3 dialogs).' : 'Monthly limit reached.'}
                </p>
                <p className="text-gray-600 mb-3">Subscribe to continue using AI Companion.</p>
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className="px-5 py-2 bg-gradient-to-r from-lavender to-sky-blue text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  View Subscription Plans
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                reachedLimit
                  ? "Subscribe to continue..."
                  : "Ask me anything about your mood, writing, or day..."
              }
              disabled={reachedLimit}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lavender disabled:opacity-60"
            />
            <button
              onClick={reachedLimit ? onSubscribe : handleSendMessage}
              disabled={(reachedLimit && false) || !inputMessage.trim() || isTyping}
              className="px-6 py-3 bg-gradient-to-r from-lavender to-sky-blue text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {reachedLimit ? "Subscribe" : "Send"}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="bg-gradient-to-r from-mint-green/20 to-soft-yellow/20 rounded-2xl p-6 border border-mint-green/30">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          💡 Quick Prompts
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            "How was your day?",
            "What made you happy today?",
            "Any challenges you faced?",
            "What are you grateful for?",
            "How are you feeling right now?",
            "What's on your mind?",
            "Any goals for tomorrow?",
            "What did you learn today?",
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => setInputMessage(prompt)}
              className="p-3 bg-white/60 rounded-xl text-sm text-gray-700 hover:bg-white/80 transition-all duration-200 text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Choose Your Plan</h2>
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Basic Plan */}
                <div className="border border-gray-200 rounded-xl p-6 hover:border-lavender transition-colors">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Basic</h3>
                    <p className="text-3xl font-bold text-lavender mt-2">₳5<span className="text-lg font-normal">/month</span></p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="text-green-500 mr-2">✓</span>
                      50 AI conversations per month
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="text-green-500 mr-2">✓</span>
                      Priority support
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="text-green-500 mr-2">✓</span>
                      Advanced mood analysis
                    </li>
                  </ul>
                  <button
                    onClick={() => handleSubscribe('basic')}
                    className="w-full py-3 bg-gradient-to-r from-lavender to-sky-blue text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                  >
                    Subscribe with Cardano
                  </button>
                </div>

                {/* Premium Plan */}
                <div className="border-2 border-lavender rounded-xl p-6 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-lavender text-white px-3 py-1 rounded-full text-xs font-medium">Most Popular</span>
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Premium</h3>
                    <p className="text-3xl font-bold text-lavender mt-2">₳10<span className="text-lg font-normal">/month</span></p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="text-green-500 mr-2">✓</span>
                      Unlimited AI conversations
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="text-green-500 mr-2">✓</span>
                      Advanced analytics dashboard
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="text-green-500 mr-2">✓</span>
                      Export data for research
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="text-green-500 mr-2">✓</span>
                      Priority support
                    </li>
                  </ul>
                  <button
                    onClick={() => handleSubscribe('premium')}
                    className="w-full py-3 bg-gradient-to-r from-lavender to-sky-blue text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                  >
                    Subscribe with Cardano
                  </button>
                </div>
              </div>

              <div className="text-center text-sm text-gray-500">
                <p>Subscriptions are paid in ADA and managed by smart contracts on Cardano.</p>
                <p className="mt-1">Cancel anytime • No hidden fees</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
