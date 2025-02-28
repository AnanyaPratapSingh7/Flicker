import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, GlassCardContent } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { 
  ArrowUp, 
  ArrowDown,
  ArrowRightLeft,
  ArrowUpRight,
  ArrowRight,
  Trophy,
  Star,
  Diamond,
  Zap,
  Target,
  Crown,
  Shield,
  Rocket,
  Flame
} from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';

// Mock data for user
const userData = {
  name: "Dennis INJ",
  level: 42,
  levelProgress: 65, // percentage
  profileImage: "https://source.unsplash.com/random/200x200/?portrait",
  achievements: [
    { icon: Trophy, unlocked: true },
    { icon: Star, unlocked: true },
    { icon: Diamond, unlocked: true },
    { icon: Zap, unlocked: true },
    { icon: Target, unlocked: true },
    { icon: Crown, unlocked: true },
    { icon: Shield, unlocked: true },
    { icon: Rocket, unlocked: true },
    { icon: Flame, unlocked: true }
  ]
};

// Mock data for portfolio
const portfolioData = {
  totalBalance: 12345.67,
  currency: "USD",
  dailyProfit: 1234.56,
  dailyProfitPercentage: 2.5,
  timeframes: ["24H", "7D", "30D"]
};

// Mock data for news
const newsData = [
  { text: "New DeFi protocol gains $1B TVL in 24 hours", important: true }
];

const HomeDashboard: React.FC = () => {
  const { isWalletConnected } = useWallet();
  const [activeTimeframe, setActiveTimeframe] = useState("24H");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      {/* Welcome Section */}
      <div className="mb-6">
        <div className="flex items-start">
          <div>
            <h1 className="text-4xl font-bold text-white">
              Welcome, Trader
            </h1>
            <p className="text-white/60 text-sm mt-1">ready to make gains?</p>
          </div>
        </div>
      </div>

      {/* News Ticker */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <GlassCard className="py-3 px-4 bg-black/30" noHoverEffect>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ArrowUpRight className="h-4 w-4 mr-3 text-[var(--gold-accent)]" />
              <span className="text-white/90 text-sm">New DeFi protocol gains $1B TVL in 24 hours</span>
            </div>
            <button className="text-white/50 hover:text-white/80">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Balance Card - Takes 2/3 of the width on large screens */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2"
        >
          <GlassCard className="h-full bg-[#1A1C23]/80" noHoverEffect>
            <GlassCardContent className="h-full p-5">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-[var(--gold-accent)]">Total Balance</h2>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => setActiveTimeframe("24H")}
                      className={`px-3 py-1 rounded-full text-xs ${activeTimeframe === "24H" ? "bg-[var(--gold-accent)]/20 text-[var(--gold-accent)]" : "text-white/50 hover:text-white/80"}`}
                    >
                      24H
                    </button>
                    <button 
                      onClick={() => setActiveTimeframe("7D")}
                      className={`px-3 py-1 rounded-full text-xs ${activeTimeframe === "7D" ? "bg-[var(--gold-accent)]/20 text-[var(--gold-accent)]" : "text-white/50 hover:text-white/80"}`}
                    >
                      7D
                    </button>
                    <button 
                      onClick={() => setActiveTimeframe("30D")}
                      className={`px-3 py-1 rounded-full text-xs ${activeTimeframe === "30D" ? "bg-[var(--gold-accent)]/20 text-[var(--gold-accent)]" : "text-white/50 hover:text-white/80"}`}
                    >
                      30D
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-start mb-4">
                  <h1 className="text-5xl font-bold text-[var(--gold-accent)]">
                    ${portfolioData.totalBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </h1>
                  <p className="text-white/50 mt-1 text-sm">{portfolioData.currency}</p>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-white/70 text-sm">P/L Today</p>
                    <div className="flex items-center text-green-500">
                      <span className="text-xl font-semibold">${portfolioData.dailyProfit.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                  </div>
                  <div className="text-green-500 text-lg font-semibold">
                    ↑ {portfolioData.dailyProfitPercentage}%
                  </div>
                </div>
                
                {/* Action Buttons inside the balance card */}
                <div className="grid grid-cols-3 gap-4 mt-auto">
                  <Button 
                    variant="secondary" 
                    className="py-2 flex items-center justify-center gap-2 bg-black/30 hover:bg-black/40 border-[#1A1C23]"
                  >
                    <ArrowUp className="h-4 w-4 text-[var(--gold-accent)]" />
                    <span className="text-sm">Deposit</span>
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    className="py-2 flex items-center justify-center gap-2 bg-black/30 hover:bg-black/40 border-[#1A1C23]"
                  >
                    <ArrowDown className="h-4 w-4 text-[var(--gold-accent)]" />
                    <span className="text-sm">Withdraw</span>
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    className="py-2 flex items-center justify-center gap-2 bg-black/30 hover:bg-black/40 border-[#1A1C23]"
                  >
                    <ArrowRightLeft className="h-4 w-4 text-[var(--gold-accent)]" />
                    <span className="text-sm">Swap</span>
                  </Button>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        </motion.div>

        {/* User Profile Card - Takes 1/3 of the width on large screens */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-1"
        >
          <GlassCard className="h-full bg-[#1A1C23]/80" noHoverEffect>
            <GlassCardContent className="h-full p-5">
              <div className="flex flex-col h-full">
                {/* Profile Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-14 h-14 rounded-full overflow-hidden mr-4 border-2 border-[#BFB28F]/30">
                      <img 
                        src={userData.profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://source.unsplash.com/random/200x200/?abstract";
                        }}
                      />
                    </div>
                    <div>
                      <h2 className="text-lg font-medium text-white">{userData.name}</h2>
                      <div className="flex items-center mt-2">
                        <div className="w-24 h-2 bg-black/40 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#D4C6A1] to-[#A69A78] rounded-full" 
                            style={{ width: `${userData.levelProgress}%` }}
                          ></div>
                        </div>
                        <div className="ml-3 flex items-center">
                          <span className="text-xs text-white/50 mr-1">LVL</span>
                          <span className="text-xl font-bold text-[#BFB28F]">{userData.level}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Achievements Section */}
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white/80 text-sm font-medium">Achievements</h3>
                    <span className="text-xs text-[#BFB28F]/70 cursor-pointer hover:text-[#BFB28F]">View All</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {userData.achievements.map((achievement, index) => {
                      const Icon = achievement.icon;
                      return (
                        <div 
                          key={index} 
                          className={`aspect-square rounded-xl flex flex-col items-center justify-center ${
                            achievement.unlocked 
                              ? 'bg-black/40 text-[#BFB28F]' 
                              : 'bg-black/20 text-white/30'
                          }`}
                        >
                          <Icon className="h-6 w-6 mb-1" />
                          <div className="h-1 w-1 rounded-full bg-[#BFB28F]/50 mt-1"></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        </motion.div>
      </div>

      {/* Additional Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Placeholder for additional cards */}
        {/* These would be added here based on your requirements */}
      </div>
    </div>
  );
};

export default HomeDashboard;
