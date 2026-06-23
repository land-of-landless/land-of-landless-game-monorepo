import React, { useState } from "react";
import { useDonors } from "@/hooks/useDonors";
import { Heart, TrendingUp, Zap, Crown } from "lucide-react";

type DonorCategory = "recent" | "weekly" | "monthly" | "allTime";

export const DonorsBanner = () => {
  const { donors, isLoading } = useDonors();
  const [activeTab, setActiveTab] = useState<DonorCategory>("recent");

  if (isLoading || !donors) {
    return null;
  }

  const categoryData: Record<DonorCategory, { label: string; icon: React.ReactNode; color: string; bgGradient: string }> = {
    recent: {
      label: "🔥 Recent",
      icon: <Zap size={16} />,
      color: "from-orange-500 to-red-500",
      bgGradient: "from-orange-900/20 to-red-900/20",
    },
    weekly: {
      label: "📈 Weekly",
      icon: <TrendingUp size={16} />,
      color: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-900/20 to-cyan-900/20",
    },
    monthly: {
      label: "⭐ Monthly",
      icon: <Heart size={16} />,
      color: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-900/20 to-pink-900/20",
    },
    allTime: {
      label: "👑 All Time",
      icon: <Crown size={16} />,
      color: "from-yellow-500 to-amber-500",
      bgGradient: "from-yellow-900/20 to-amber-900/20",
    },
  };

  const currentData = categoryData[activeTab];
  const donorsList = donors[activeTab];
  const totalDonated = donorsList.reduce((sum, donor) => sum + donor.amount, 0);

  return (
    <div className="fixed bottom-4 left-4 max-w-sm z-40 select-none pointer-events-auto">
      {/* Main Banner Container */}
      <div className="relative">
        {/* Animated background glow */}
        <div className={`absolute inset-0 rounded-2xl blur-xl bg-gradient-to-r ${currentData.color} opacity-20 animate-pulse`} />

        {/* Main content */}
        <div className={`relative bg-gradient-to-br ${currentData.bgGradient} border border-white/10 rounded-2xl p-4 backdrop-blur-md shadow-2xl overflow-hidden`}>
          {/* Decorative top border accent */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${currentData.color}`} />

          {/* Header with title and icon */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${currentData.color}`}>
                {currentData.icon}
              </div>
              <h3 className="text-sm font-bold text-white">Supporting Heroes</h3>
            </div>
          </div>

          {/* Total donated stat */}
          <div className="mb-3 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
            <p className="text-[10px] text-slate-400 mb-1">Total Raised ({currentData.label})</p>
            <p className={`text-lg font-bold bg-gradient-to-r ${currentData.color} bg-clip-text text-transparent`}>
              ${totalDonated.toLocaleString()}
            </p>
          </div>

          {/* Donors List */}
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto custom-scrollbar">
            {donorsList.length > 0 ? (
              donorsList.map((donor, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-white/20"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${currentData.color} flex items-center justify-center text-[10px] font-bold flex-shrink-0`}>
                      {idx + 1}
                    </div>
                    <p className="text-[11px] text-slate-200 font-medium truncate">{donor.name}</p>
                  </div>
                  <p className={`text-[11px] font-bold bg-gradient-to-r ${currentData.color} bg-clip-text text-transparent whitespace-nowrap ml-2`}>
                    ${donor.amount}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-slate-400 text-center py-4">No donors yet</p>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1.5 mb-3">
            {(Object.keys(categoryData) as DonorCategory[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 text-[9px] font-bold py-1.5 rounded-lg transition-all duration-300 ${
                  activeTab === tab
                    ? `bg-gradient-to-r ${categoryData[tab].color} text-white shadow-lg`
                    : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5"
                }`}
              >
                {categoryData[tab].label.split(" ")[1]}
              </button>
            ))}
          </div>

          {/* Call to Action Button */}
          <button className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white text-[11px] font-bold transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/50 active:scale-95 flex items-center justify-center gap-2">
            <Heart size={14} />
            Become a Supporter
          </button>

          {/* Small decorative corners */}
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
          <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  );
};
