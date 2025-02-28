import React, { useState } from 'react';
import { GlassCard, GlassCardContent } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Code, 
  LineChart, 
  Plus, 
  RefreshCw, 
  ArrowRight, 
  TrendingUp, 
  Search, 
  Filter, 
  ChevronDown, 
  Star, 
  Clock, 
  Users, 
  DollarSign 
} from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';

// Mock data for top presales
const topPresales = [
  {
    id: 1,
    name: "AlphaTrader AI",
    description: "Advanced AI-powered trading bot with multi-strategy capabilities",
    image: "https://source.unsplash.com/random/300x200/?technology,ai",
    raised: 1250000,
    goal: 2000000,
    participants: 328,
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    category: "AI Trading",
    creator: "Quantum Labs",
    verified: true
  },
  {
    id: 2,
    name: "DeFi Sentinel",
    description: "Automated yield farming and risk management across DeFi protocols",
    image: "https://source.unsplash.com/random/300x200/?finance,crypto",
    raised: 875000,
    goal: 1500000,
    participants: 156,
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    category: "DeFi",
    creator: "BlockForge",
    verified: true
  },
  {
    id: 3,
    name: "TrendSpotter",
    description: "Market trend analysis and prediction engine using NLP and social sentiment",
    image: "https://source.unsplash.com/random/300x200/?chart,analysis",
    raised: 450000,
    goal: 1000000,
    participants: 89,
    endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    category: "Market Analysis",
    creator: "DataSynth",
    verified: false
  },
  {
    id: 4,
    name: "QuantumArb",
    description: "Cross-exchange arbitrage bot with microsecond execution",
    image: "https://source.unsplash.com/random/300x200/?quantum,computer",
    raised: 1800000,
    goal: 2500000,
    participants: 412,
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    category: "Arbitrage",
    creator: "Velocity Capital",
    verified: true
  },
  {
    id: 5,
    name: "PatternTracker",
    description: "Technical analysis pattern recognition and alert system",
    image: "https://source.unsplash.com/random/300x200/?pattern,technology",
    raised: 320000,
    goal: 800000,
    participants: 75,
    endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    category: "Technical Analysis",
    creator: "ChartMasters",
    verified: false
  },
  {
    id: 6,
    name: "MacroSense AI",
    description: "Macroeconomic indicator analysis and market impact predictions",
    image: "https://source.unsplash.com/random/300x200/?economy,global",
    raised: 650000,
    goal: 1200000,
    participants: 128,
    endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
    category: "AI Trading",
    creator: "EconIntel",
    verified: true
  }
];

// All presales (including top presales and more)
const allPresales = [
  ...topPresales,
  {
    id: 7,
    name: "OnChainOracle",
    description: "Decentralized price feed oracle with cross-chain capabilities",
    image: "https://source.unsplash.com/random/300x200/?blockchain,data",
    raised: 280000,
    goal: 750000,
    participants: 62,
    endTime: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
    category: "Oracle",
    creator: "ChainLink Labs",
    verified: false
  },
  {
    id: 8,
    name: "VolatilityHarvester",
    description: "Options trading bot specializing in volatility strategies",
    image: "https://source.unsplash.com/random/300x200/?trading,volatility",
    raised: 520000,
    goal: 900000,
    participants: 94,
    endTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
    category: "Options Trading",
    creator: "DerivativePro",
    verified: true
  }
];

// Format currency
const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  } else {
    return `$${value}`;
  }
};

// Format time remaining
const formatTimeRemaining = (endTime: Date) => {
  const now = new Date();
  const diff = endTime.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days > 1) {
    return `${days} days left`;
  } else if (days === 1) {
    return "1 day left";
  } else {
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${hours} hours left`;
  }
};

// Calculate progress percentage
const calculateProgress = (raised: number, goal: number) => {
  return Math.min(Math.round((raised / goal) * 100), 100);
};

const AgentLaunchpad: React.FC = () => {
  const { isWalletConnected, connectWallet } = useWallet();
  const [filterCategory, setFilterCategory] = useState("All Categories");
  const [sortOption, setSortOption] = useState("Trending");
  const navigate = useNavigate();

  // Filter presales based on selected category
  const filteredPresales = filterCategory === "All Categories" 
    ? allPresales 
    : allPresales.filter(presale => presale.category === filterCategory);

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      {/* Hero Section */}
      <section className="mb-20 pt-16">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-6 text-white text-left">
              <span className="text-[#D4C6A1]">Create</span> and Tokenize Agents
            </h1>
            <p className="text-lg text-white/70 mb-8 text-left">
              Invest in the future of algorithmic trading. Back the most promising AI trading agents and earn rewards from their performance.
            </p>
            <div className="flex gap-4">
              <Button 
                variant="secondary" 
                className="bg-[#D4C6A1]/20 hover:bg-[#D4C6A1]/30 text-[#D4C6A1] border border-[#D4C6A1]/30"
              >
                Explore Presales
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/create-agent')}
              >
                Create Agent
              </Button>
            </div>
          </div>
          <div className="w-full max-w-md">
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#BFB28F]/20 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-[#BFB28F]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Presale Stats</h3>
                  <p className="text-white/60 text-sm">Last 30 days</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-white/60 text-sm">Total Raised</p>
                  <p className="text-2xl font-bold text-white">$6.2M</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Active Presales</p>
                  <p className="text-2xl font-bold text-white">24</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Participants</p>
                  <p className="text-2xl font-bold text-white">1.8K</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Avg. ROI</p>
                  <p className="text-2xl font-bold text-white">127%</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>
      
      {/* Presales Section */}
      <section className="mt-24">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold text-white">Agent Presales</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-white/50" />
              </div>
              <input 
                type="text" 
                placeholder="Search presales..." 
                className="bg-black/20 border border-white/10 text-white text-sm rounded-lg focus:ring-[#BFB28F]/50 focus:border-[#BFB28F]/50 block w-full pl-10 p-2.5 placeholder-white/50"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => {
                // Toggle filter dropdown
              }}
            >
              <Filter className="h-4 w-4" />
              {filterCategory}
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => {
                // Toggle sort dropdown
              }}
            >
              <RefreshCw className="h-4 w-4" />
              {sortOption}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Top 3 Performing Presales */}
        <div className="mb-16">
          <h3 className="text-xl font-medium text-white/80 mb-8">Top Performing</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {topPresales.slice(0, 3).map((presale) => (
              <GlassCard key={presale.id} className="overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-[1.02] border-2 border-[#D4C6A1]/30" noHoverEffect>
                <div className="h-[180px] overflow-hidden relative group">
                  <img
                    src={presale.image}
                    alt={presale.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 bg-[#D4C6A1]/30 p-1.5 rounded-full backdrop-blur-sm">
                    <Star className="h-5 w-5 text-[#D4C6A1]" fill="#D4C6A1" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#D4C6A1]/30 text-[#D4C6A1]">Top Performer</span>
                  </div>
                </div>
                <GlassCardContent className="p-5">
                  <h3 className="text-xl font-semibold text-white mb-2">{presale.name}</h3>
                  <p className="text-white/70 text-sm mb-4 line-clamp-2">{presale.description}</p>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-white/70">Raised</span>
                      <span className="text-white font-medium">
                        {formatCurrency(presale.raised)} / {formatCurrency(presale.goal)}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-black/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#D4C6A1] to-[#A69A78] rounded-full" 
                        style={{ width: `${calculateProgress(presale.raised, presale.goal)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-white/70 mb-4">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1.5" />
                      <span>{presale.participants}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1.5" />
                      <span>{formatTimeRemaining(presale.endTime)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="secondary" 
                    className="w-full bg-[#D4C6A1]/20 hover:bg-[#D4C6A1]/30 text-[#D4C6A1] border border-[#D4C6A1]/30"
                  >
                    View Details
                  </Button>
                </GlassCardContent>
              </GlassCard>
            ))}
          </div>
        </div>
        
        {/* All Other Presales */}
        <div>
          <h3 className="text-xl font-medium text-white/80 mb-8">All Presales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPresales.filter(presale => !topPresales.slice(0, 3).some(top => top.id === presale.id)).map((presale) => (
              <GlassCard key={presale.id} className="overflow-hidden shadow-xl" noHoverEffect>
                <div className="h-[140px] overflow-hidden relative group">
                  <img
                    src={presale.image}
                    alt={presale.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {presale.verified && (
                    <div className="absolute top-2 right-2 bg-[#BFB28F]/20 p-1 rounded-full backdrop-blur-sm">
                      <Star className="h-4 w-4 text-[#BFB28F]" />
                    </div>
                  )}
                </div>
                <GlassCardContent className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-1">{presale.name}</h3>
                  <p className="text-white/70 text-xs mb-3 line-clamp-2">{presale.description}</p>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/70">Raised</span>
                      <span className="text-white font-medium">
                        {formatCurrency(presale.raised)} / {formatCurrency(presale.goal)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#D4C6A1] to-[#A69A78] rounded-full" 
                        style={{ width: `${calculateProgress(presale.raised, presale.goal)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-white/70 mb-3">
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{presale.participants}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatTimeRemaining(presale.endTime)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="secondary" 
                    className="w-full bg-[#D4C6A1]/20 hover:bg-[#D4C6A1]/30 text-[#D4C6A1] border border-[#D4C6A1]/30 text-sm"
                  >
                    View Details
                  </Button>
                </GlassCardContent>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export { AgentLaunchpad };
