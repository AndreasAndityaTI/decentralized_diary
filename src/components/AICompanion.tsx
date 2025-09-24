import React, { useState } from "react";
import { generateAIReply } from "../services/ai";

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

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

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

  return (
    <div className="flex-1 p-8 space-y-6">
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
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 h-[600px] flex flex-col">
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
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your mood, writing, or day..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lavender"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="px-6 py-3 bg-gradient-to-r from-lavender to-sky-blue text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
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
    </div>
  );
}
