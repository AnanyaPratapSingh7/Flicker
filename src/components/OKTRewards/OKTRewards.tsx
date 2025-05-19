import React, { useState, useEffect } from 'react';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, GlassCardFooter } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Award, Gift, Clock, ArrowRight, TrendingUp, Check, Lock } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';

interface UserRewards {
  totalPoints: number;
  oktTokens: string;
  tierLevel: number;
  maxTierLevel: number;
  nextTierRequirement: number;
  history: Array<{
    id: number;
    date: string;
    action: string;
    points: number;
    status: 'completed' | 'processing' | 'failed';
  }>;
  availableTasks: Array<{
    id: number;
    name: string;
    description: string;
    points: number;
    type: 'daily' | 'onetime' | 'transaction';
    cooldown?: string;
    isAvailable: boolean;
  }>;
  claimableAmount: string;
}

// Mock user rewards data
const mockRewardsData: UserRewards = {
  totalPoints: 1250,
  oktTokens: '25.5',
  tierLevel: 2,
  maxTierLevel: 5,
  nextTierRequirement: 2000,
  history: [
    { id: 1, date: '2023-09-25', action: 'Wallet Connection', points: 50, status: 'completed' },
    { id: 2, date: '2023-09-28', action: 'First Transaction', points: 500, status: 'completed' },
    { id: 3, date: '2023-10-01', action: 'Cross-chain Swap', points: 100, status: 'completed' },
    { id: 4, date: '2023-10-05', action: 'Daily Login', points: 20, status: 'completed' },
    { id: 5, date: '2023-10-08', action: 'Referred User', points: 300, status: 'processing' },
    { id: 6, date: '2023-10-10', action: 'Trading Volume > $1000', points: 200, status: 'completed' },
    { id: 7, date: '2023-10-12', action: 'Daily Login', points: 20, status: 'completed' },
    { id: 8, date: '2023-10-15', action: 'Multi-chain Usage', points: 150, status: 'completed' },
    { id: 9, date: '2023-10-18', action: 'Liquidity Provided', points: 250, status: 'failed' },
    { id: 10, date: '2023-10-19', action: 'OKX App Connection', points: 100, status: 'completed' }
  ],
  availableTasks: [
    {
      id: 1,
      name: 'Daily Login',
      description: 'Log in to the platform once per day',
      points: 20,
      type: 'daily',
      cooldown: '24 hours',
      isAvailable: true
    },
    {
      id: 2,
      name: 'Complete a Cross-chain Swap',
      description: 'Perform a swap between different blockchains',
      points: 100,
      type: 'transaction',
      isAvailable: true
    },
    {
      id: 3,
      name: 'Trade volume > $100',
      description: 'Complete trades with total volume over $100',
      points: 50,
      type: 'transaction',
      isAvailable: true
    },
    {
      id: 4,
      name: 'Refer a Friend',
      description: 'Invite a friend to join the platform',
      points: 300,
      type: 'onetime',
      isAvailable: true
    },
    {
      id: 5,
      name: 'Connect to OKX App',
      description: 'Link your account with the OKX mobile app',
      points: 200,
      type: 'onetime',
      isAvailable: false
    },
    {
      id: 6,
      name: 'Provide Liquidity',
      description: 'Add liquidity to any OKX pool',
      points: 250,
      type: 'transaction',
      isAvailable: true
    }
  ],
  claimableAmount: '10.5'
};

// Tier benefits by level
const tierBenefits: Record<number, string[]> = {
  1: ['Basic swap fee discount (0.1%)', 'OKT rewards for transactions'],
  2: ['Enhanced swap fee discount (0.2%)', 'Priority customer support', 'Higher daily rewards'],
  3: ['Premium swap fee discount (0.3%)', 'Exclusive NFT airdrops', 'Advanced trading features'],
  4: ['VIP swap fee discount (0.4%)', 'Early access to new features', 'Trading fee rebates'],
  5: ['Elite swap fee discount (0.5%)', 'Personal account manager', 'Custom trading limits', 'Exclusive OKT staking pools']
};

const OKTRewards: React.FC = () => {
  const { isWalletConnected } = useWallet();
  const [rewards, setRewards] = useState<UserRewards | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'tasks'>('overview');
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  
  // Fetch user rewards when wallet is connected
  useEffect(() => {
    if (isWalletConnected) {
      // Simulate API call to fetch rewards data
      setTimeout(() => {
        setRewards(mockRewardsData);
      }, 800);
    } else {
      setRewards(null);
    }
  }, [isWalletConnected]);
  
  // Handle rewards claim
  const handleClaimRewards = () => {
    if (!rewards || parseFloat(rewards.claimableAmount) <= 0) return;
    
    setClaiming(true);
    
    // Simulate API call for claiming rewards
    setTimeout(() => {
      setClaiming(false);
      setClaimSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setClaimSuccess(false);
        // Update rewards state to reflect claim
        setRewards(prev => prev ? {
          ...prev,
          claimableAmount: '0',
          history: [
            {
              id: prev.history.length + 1,
              date: new Date().toISOString().split('T')[0],
              action: 'Rewards Claimed',
              points: 0,
              status: 'completed'
            },
            ...prev.history
          ]
        } : null);
      }, 3000);
    }, 2000);
  };
  
  // Handle completing a task
  const handleCompleteTask = (taskId: number) => {
    if (!rewards) return;
    
    // Find the task
    const task = rewards.availableTasks.find(t => t.id === taskId);
    if (!task || !task.isAvailable) return;
    
    // Simulate completing the task
    setRewards(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        totalPoints: prev.totalPoints + task.points,
        oktTokens: (parseFloat(prev.oktTokens) + task.points / 100).toString(),
        history: [
          {
            id: prev.history.length + 1,
            date: new Date().toISOString().split('T')[0],
            action: task.name,
            points: task.points,
            status: 'completed'
          },
          ...prev.history
        ],
        availableTasks: prev.availableTasks.map(t => 
          t.id === taskId ? { ...t, isAvailable: t.type === 'daily' } : t
        )
      };
    });
  };
  
  // Calculate tier progress percentage
  const getTierProgressPercentage = (): number => {
    if (!rewards) return 0;
    
    const prevTierReq = rewards.tierLevel === 1 ? 0 : 1000 * (rewards.tierLevel - 1);
    const nextTierReq = rewards.nextTierRequirement;
    const currentPoints = rewards.totalPoints;
    
    return Math.min(100, Math.max(0, 
      ((currentPoints - prevTierReq) / (nextTierReq - prevTierReq)) * 100
    ));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 blue-gradient-text">
          OKT Rewards System
        </h1>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          Earn OKT tokens for your activities on the platform
        </p>
      </div>
      
      {isWalletConnected ? (
        rewards ? (
          <>
            {/* Tabs Navigation */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex rounded-md shadow-sm bg-[#1A1C23]/50 backdrop-blur-md border border-white/10">
                <button
                  className={`px-6 py-2 text-sm font-medium ${
                    activeTab === 'overview' 
                      ? 'bg-[#0028FF] text-white' 
                      : 'text-white/70 hover:bg-[#0028FF]/10'
                  }`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button
                  className={`px-6 py-2 text-sm font-medium ${
                    activeTab === 'history' 
                      ? 'bg-[#0028FF] text-white' 
                      : 'text-white/70 hover:bg-[#0028FF]/10'
                  }`}
                  onClick={() => setActiveTab('history')}
                >
                  History
                </button>
                <button
                  className={`px-6 py-2 text-sm font-medium ${
                    activeTab === 'tasks' 
                      ? 'bg-[#0028FF] text-white' 
                      : 'text-white/70 hover:bg-[#0028FF]/10'
                  }`}
                  onClick={() => setActiveTab('tasks')}
                >
                  Tasks
                </button>
              </div>
            </div>
            
            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Tier Card */}
                <GlassCard>
                  <GlassCardHeader>
                    <GlassCardTitle>Your Tier Level</GlassCardTitle>
                  </GlassCardHeader>
                  <GlassCardContent>
                    <div className="flex justify-center mb-6">
                      <div className="relative rounded-full bg-[#0028FF]/20 h-32 w-32 flex items-center justify-center">
                        <span className="text-4xl font-bold blue-gradient-text">{rewards.tierLevel}</span>
                        <div className="absolute top-0 right-0 bg-[#0028FF] rounded-full w-8 h-8 flex items-center justify-center">
                          <Award className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress to Tier {rewards.tierLevel + 1}</span>
                        <span>{rewards.totalPoints} / {rewards.nextTierRequirement} points</span>
                      </div>
                      <div className="w-full bg-[#1A1C23] rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-[#0028FF] h-2.5 rounded-full" 
                          style={{ width: `${getTierProgressPercentage()}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-[#0028FF] font-medium">Current Benefits</h3>
                      <ul className="space-y-2">
                        {tierBenefits[rewards.tierLevel]?.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-[#0028FF] mt-0.5 shrink-0" />
                            <span className="text-sm">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {rewards.tierLevel < rewards.maxTierLevel && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <h3 className="text-[#0028FF] font-medium mb-3">Next Tier Benefits</h3>
                        <ul className="space-y-2">
                          {tierBenefits[rewards.tierLevel + 1]?.map((benefit, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Lock className="h-4 w-4 text-white/40 mt-0.5 shrink-0" />
                              <span className="text-sm text-white/50">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </GlassCardContent>
                </GlassCard>
                
                {/* Points Summary Card */}
                <GlassCard>
                  <GlassCardHeader>
                    <GlassCardTitle>OKT Reward Summary</GlassCardTitle>
                  </GlassCardHeader>
                  <GlassCardContent>
                    <div className="flex flex-col items-center mb-6">
                      <div className="text-4xl font-bold blue-gradient-text mb-2">
                        {rewards.oktTokens} OKT
                      </div>
                      <div className="text-white/60">Total Earned Tokens</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-[#0028FF]/5 text-center">
                        <div className="text-2xl font-bold mb-1">{rewards.totalPoints}</div>
                        <div className="text-sm text-white/60">Total Points</div>
                      </div>
                      <div className="p-4 rounded-lg bg-[#0028FF]/5 text-center">
                        <div className="text-2xl font-bold mb-1">{rewards.history.length}</div>
                        <div className="text-sm text-white/60">Completed Tasks</div>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 rounded-lg bg-[#0028FF]/10">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <div className="text-sm text-white/60">Claimable OKT</div>
                          <div className="text-lg font-bold">{rewards.claimableAmount} OKT</div>
                        </div>
                        <Button
                          onClick={handleClaimRewards}
                          disabled={claiming || parseFloat(rewards.claimableAmount) <= 0}
                          className={`px-4 ${
                            claimSuccess 
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-[#0028FF] hover:bg-[#0028FF]/80'
                          } text-white`}
                        >
                          {claimSuccess ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Claimed!
                            </>
                          ) : claiming ? (
                            'Claiming...'
                          ) : (
                            'Claim Rewards'
                          )}
                        </Button>
                      </div>
                    </div>
                  </GlassCardContent>
                  <GlassCardFooter className="text-xs text-white/40 text-center">
                    OKT rewards can be claimed once per day
                  </GlassCardFooter>
                </GlassCard>
                
                {/* Recent Activity Card */}
                <GlassCard>
                  <GlassCardHeader>
                    <GlassCardTitle>Recent Activity</GlassCardTitle>
                  </GlassCardHeader>
                  <GlassCardContent>
                    <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                      {rewards.history.slice(0, 5).map((activity) => (
                        <div 
                          key={activity.id} 
                          className="p-3 rounded-lg bg-[#0028FF]/5 border border-white/5 flex justify-between items-center"
                        >
                          <div>
                            <div className="font-medium text-sm">{activity.action}</div>
                            <div className="text-xs text-white/50">{activity.date}</div>
                          </div>
                          <div className={`text-sm font-bold ${
                            activity.status === 'completed' ? 'text-green-400' :
                            activity.status === 'processing' ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            +{activity.points}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 text-center">
                      <Button 
                        variant="outline"
                        onClick={() => setActiveTab('history')}
                        className="text-[#0028FF] border-[#0028FF]/30"
                      >
                        View Full History <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </GlassCardContent>
                </GlassCard>
              </div>
            )}
            
            {activeTab === 'history' && (
              <GlassCard>
                <GlassCardHeader>
                  <GlassCardTitle>Reward History</GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="py-3 px-4 text-left text-white/70">Date</th>
                          <th className="py-3 px-4 text-left text-white/70">Activity</th>
                          <th className="py-3 px-4 text-right text-white/70">Points</th>
                          <th className="py-3 px-4 text-right text-white/70">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rewards.history.map((activity) => (
                          <tr key={activity.id} className="border-b border-white/5">
                            <td className="py-3 px-4 text-sm">{activity.date}</td>
                            <td className="py-3 px-4 text-sm">{activity.action}</td>
                            <td className="py-3 px-4 text-right text-sm">+{activity.points}</td>
                            <td className="py-3 px-4 text-right">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                                activity.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                activity.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {activity.status === 'completed' ? (
                                  <>
                                    <Check className="h-3 w-3 mr-1" />
                                    Completed
                                  </>
                                ) : activity.status === 'processing' ? (
                                  <>
                                    <Clock className="h-3 w-3 mr-1" />
                                    Processing
                                  </>
                                ) : (
                                  <>
                                    <span className="inline-block h-3 w-3 mr-1">✕</span>
                                    Failed
                                  </>
                                )}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCardContent>
              </GlassCard>
            )}
            
            {activeTab === 'tasks' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.availableTasks.map((task) => (
                  <GlassCard key={task.id}>
                    <GlassCardHeader>
                      <GlassCardTitle>{task.name}</GlassCardTitle>
                    </GlassCardHeader>
                    <GlassCardContent>
                      <div className="flex justify-between items-start mb-4">
                        <div className="rounded-full bg-[#0028FF]/10 p-2">
                          {task.type === 'daily' ? (
                            <Clock className="h-5 w-5 text-[#0028FF]" />
                          ) : task.type === 'onetime' ? (
                            <Award className="h-5 w-5 text-[#0028FF]" />
                          ) : (
                            <TrendingUp className="h-5 w-5 text-[#0028FF]" />
                          )}
                        </div>
                        <div className="bg-[#0028FF]/10 px-3 py-1 rounded-full">
                          <span className="text-sm font-medium">+{task.points} points</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-white/70 mb-4">
                        {task.description}
                      </p>
                      
                      {task.cooldown && (
                        <div className="flex items-center text-xs text-white/50 mb-4">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Resets every {task.cooldown}</span>
                        </div>
                      )}
                      
                      <Button
                        disabled={!task.isAvailable}
                        onClick={() => handleCompleteTask(task.id)}
                        className={`w-full ${
                          task.isAvailable 
                            ? 'bg-[#0028FF] hover:bg-[#0028FF]/80 text-white' 
                            : 'bg-white/5 text-white/30 cursor-not-allowed'
                        }`}
                      >
                        {task.isAvailable ? (
                          <>
                            <Gift className="h-4 w-4 mr-2" />
                            Complete Task
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            {task.type === 'onetime' ? 'Already Completed' : 'Not Available'}
                          </>
                        )}
                      </Button>
                    </GlassCardContent>
                  </GlassCard>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0028FF]"></div>
          </div>
        )
      ) : (
        <GlassCard>
          <GlassCardContent className="flex flex-col items-center py-12">
            <Award className="h-16 w-16 text-[#0028FF]/50 mb-6" />
            <h2 className="text-2xl font-bold mb-2">Connect Wallet to View Rewards</h2>
            <p className="text-white/60 mb-6 max-w-md text-center">
              Connect your wallet to access the OKT Rewards System and start earning tokens for your activities.
            </p>
            <Button className="bg-[#0028FF] hover:bg-[#0028FF]/80 text-white">
              Connect Wallet
            </Button>
          </GlassCardContent>
        </GlassCard>
      )}
    </div>
  );
};

export default OKTRewards; 