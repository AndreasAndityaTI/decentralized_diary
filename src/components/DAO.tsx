import React, { useState } from "react";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  participants: number;
  reward: string;
  deadline: string;
  status: "active" | "completed" | "upcoming";
  type: "survey" | "research" | "vote";
}

const mockProjects: Project[] = [
  {
    id: "1",
    title: "Mood Tracking App Usability Study",
    description:
      "Help us understand how users interact with mood tracking features. Complete a 10-minute survey about your journaling habits.",
    category: "UX Research",
    participants: 234,
    reward: "50 ADA",
    deadline: "2024-02-15",
    status: "active",
    type: "survey",
  },
  {
    id: "2",
    title: "Community Governance: Feature Prioritization",
    description:
      "Vote on which new features should be developed next for DeDiary. Your voice matters in shaping the platform.",
    category: "Governance",
    participants: 1567,
    reward: "25 ADA",
    deadline: "2024-02-20",
    status: "active",
    type: "vote",
  },
  {
    id: "3",
    title: "Mental Health Data Privacy Research",
    description:
      "Participate in a research study about data privacy preferences in mental health applications. Anonymous and confidential.",
    category: "Privacy Research",
    participants: 89,
    reward: "100 ADA",
    deadline: "2024-03-01",
    status: "active",
    type: "research",
  },
  {
    id: "4",
    title: "AI Companion Effectiveness Study",
    description:
      "Help us improve our AI companion by sharing your experience and feedback over a 2-week period.",
    category: "AI Research",
    participants: 445,
    reward: "75 ADA",
    deadline: "2024-02-28",
    status: "upcoming",
    type: "research",
  },
  {
    id: "5",
    title: "Community Token Economics",
    description:
      "Vote on the proposed token distribution model for community contributors and early adopters.",
    category: "Tokenomics",
    participants: 892,
    reward: "30 ADA",
    deadline: "2024-01-30",
    status: "completed",
    type: "vote",
  },
];

export default function DAO() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [joinedProjects, setJoinedProjects] = useState<Set<string>>(new Set());

  const categories = [
    "all",
    "UX Research",
    "Governance",
    "Privacy Research",
    "AI Research",
    "Tokenomics",
  ];

  const filteredProjects = mockProjects.filter((project) => {
    if (selectedCategory === "all") return true;
    return project.category === selectedCategory;
  });

  const handleJoinProject = (projectId: string) => {
    setJoinedProjects((prev) => new Set([...prev, projectId]));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "survey":
        return "📊";
      case "research":
        return "🔬";
      case "vote":
        return "🗳️";
      default:
        return "📋";
    }
  };

  return (
    <div className="flex-1 p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-lavender to-sky-blue rounded-full flex items-center justify-center">
          <span className="text-white text-xl">🏛️</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">DAO Research</h1>
          <p className="text-gray-600">
            Participate in community research and governance
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-lavender to-sky-blue rounded-xl p-4 text-white text-center">
          <div className="text-2xl font-bold">
            {mockProjects.filter((p) => p.status === "active").length}
          </div>
          <div className="text-sm opacity-80">Active Projects</div>
        </div>
        <div className="bg-gradient-to-r from-mint-green to-soft-yellow rounded-xl p-4 text-gray-800 text-center">
          <div className="text-2xl font-bold">{joinedProjects.size}</div>
          <div className="text-sm opacity-80">Joined Projects</div>
        </div>
        <div className="bg-gradient-to-r from-soft-yellow to-mint-green rounded-xl p-4 text-gray-800 text-center">
          <div className="text-2xl font-bold">1,247</div>
          <div className="text-sm opacity-80">Total Participants</div>
        </div>
        <div className="bg-gradient-to-r from-sky-blue to-lavender rounded-xl p-4 text-white text-center">
          <div className="text-2xl font-bold">2,891</div>
          <div className="text-sm opacity-80">ADA Distributed</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 capitalize ${
              selectedCategory === category
                ? "bg-gradient-to-r from-lavender to-sky-blue text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getTypeIcon(project.type)}</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-600">{project.category}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  project.status
                )}`}
              >
                {project.status}
              </span>
            </div>

            <p className="text-gray-700 mb-4 leading-relaxed">
              {project.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-500">Participants:</span>
                <span className="ml-1 font-medium">{project.participants}</span>
              </div>
              <div>
                <span className="text-gray-500">Reward:</span>
                <span className="ml-1 font-medium text-green-600">
                  {project.reward}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Deadline:</span>
                <span className="ml-1 font-medium">
                  {new Date(project.deadline).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="ml-1 font-medium capitalize">
                  {project.type}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {project.status === "active" &&
                  !joinedProjects.has(project.id) && (
                    <button
                      onClick={() => handleJoinProject(project.id)}
                      className="px-6 py-2 bg-gradient-to-r from-lavender to-sky-blue text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                    >
                      {project.type === "vote" ? "Vote Now" : "Join Project"}
                    </button>
                  )}
                {joinedProjects.has(project.id) && (
                  <span className="px-6 py-2 bg-green-100 text-green-800 rounded-xl font-medium">
                    ✓ Joined
                  </span>
                )}
                {project.status === "upcoming" && (
                  <span className="px-6 py-2 bg-blue-100 text-blue-800 rounded-xl font-medium">
                    Coming Soon
                  </span>
                )}
                {project.status === "completed" && (
                  <span className="px-6 py-2 bg-gray-100 text-gray-800 rounded-xl font-medium">
                    Completed
                  </span>
                )}
              </div>
              <button className="px-4 py-2 text-lavender hover:bg-lavender/10 rounded-xl transition-all duration-200">
                Learn More
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Community Info */}
      <div className="bg-gradient-to-r from-lavender/20 to-sky-blue/20 rounded-2xl p-6 border border-lavender/30">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          🌟 Community Impact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">How It Works</h4>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Join research projects and surveys</li>
              <li>• Participate in community governance votes</li>
              <li>• Earn ADA rewards for your contributions</li>
              <li>• Help shape the future of DeDiary</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Your Impact</h4>
            <p className="text-gray-700 text-sm">
              By participating in our research and governance, you're helping
              build a better, more user-focused platform while earning rewards
              for your valuable input. Every voice matters in our decentralized
              community!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
