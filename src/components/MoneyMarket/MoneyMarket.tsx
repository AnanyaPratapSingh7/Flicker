import React, { useState } from 'react';
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardFooter, GlassCardHeader, GlassCardTitle } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Coins, ArrowRight, TrendingUp, DollarSign, Wallet, ArrowUpDown } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';

// Sample data for demonstration with OKX tokens
const marketAssets = [
  { 
    id: 1, 
    name: 'OKT', 
    fullName: 'OKX Token',
    supplyApy: 4.2, 
    borrowApy: 6.8, 
    totalSupply: '$18.7M', 
    totalBorrow: '$9.5M',
    walletBalance: '125.45',
    supplied: '50.00',
    borrowed: '0.00',
    icon: '🔷'
  },
  { 
    id: 2, 
    name: 'USDT', 
    fullName: 'Tether USD',
    supplyApy: 8.1, 
    borrowApy: 12.3, 
    totalSupply: '$56.7M', 
    totalBorrow: '$34.2M',
    walletBalance: '1,250.00',
    supplied: '500.00',
    borrowed: '100.00',
    icon: '💵'
  },
  { 
    id: 3, 
    name: 'ETH', 
    fullName: 'Ethereum',
    supplyApy: 2.5, 
    borrowApy: 4.2, 
    totalSupply: '$78.9M', 
    totalBorrow: '$45.6M',
    walletBalance: '1.25',
    supplied: '0.50',
    borrowed: '0.00',
    icon: '🔹'
  },
  { 
    id: 4, 
    name: 'BTC', 
    fullName: 'Bitcoin',
    supplyApy: 1.8, 
    borrowApy: 3.4, 
    totalSupply: '$92.3M', 
    totalBorrow: '$48.2M',
    walletBalance: '0.05',
    supplied: '0.00',
    borrowed: '0.00',
    icon: '🟠'
  },
  { 
    id: 5, 
    name: 'SOL', 
    fullName: 'Solana',
    supplyApy: 5.2, 
    borrowApy: 7.8, 
    totalSupply: '$14.6M', 
    totalBorrow: '$8.3M',
    walletBalance: '15.75',
    supplied: '0.00',
    borrowed: '0.00',
    icon: '🟣'
  },
];

const MoneyMarket: React.FC = () => {
  const { isWalletConnected } = useWallet();
  const [activeTab, setActiveTab] = useState<'supply' | 'borrow'>('supply');

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 blue-gradient-text">
          OKX Money Market
        </h1>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          Lend, borrow, and earn interest on your crypto assets
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <GlassCard>
          <GlassCardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <GlassCardTitle>Total Supply</GlassCardTitle>
              <Coins className="h-6 w-6 text-[#0028FF]" />
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="text-3xl font-bold blue-gradient-text">$262.2M</p>
            <p className="text-white/60 text-sm">+3.2% from last week</p>
          </GlassCardContent>
        </GlassCard>

        <GlassCard>
          <GlassCardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <GlassCardTitle>Total Borrow</GlassCardTitle>
              <ArrowUpDown className="h-6 w-6 text-[#0028FF]" />
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="text-3xl font-bold blue-gradient-text">$145.8M</p>
            <p className="text-white/60 text-sm">+2.5% from last week</p>
          </GlassCardContent>
        </GlassCard>

        <GlassCard>
          <GlassCardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <GlassCardTitle>Your Position</GlassCardTitle>
              <Wallet className="h-6 w-6 text-[#0028FF]" />
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            {isWalletConnected ? (
              <>
                <p className="text-3xl font-bold blue-gradient-text">$1,250.45</p>
                <p className="text-white/60 text-sm">Net supply: $950.45</p>
              </>
            ) : (
              <div className="text-center py-2">
                <p className="text-white/60 mb-2">Connect wallet to view your position</p>
              </div>
            )}
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-6">
        <button
          className={`px-6 py-3 font-medium ${activeTab === 'supply' ? 'text-[#0028FF] border-b-2 border-[#0028FF]' : 'text-white/60'}`}
          onClick={() => setActiveTab('supply')}
        >
          Supply Markets
        </button>
        <button
          className={`px-6 py-3 font-medium ${activeTab === 'borrow' ? 'text-[#0028FF] border-b-2 border-[#0028FF]' : 'text-white/60'}`}
          onClick={() => setActiveTab('borrow')}
        >
          Borrow Markets
        </button>
      </div>

      {/* Market Table */}
      <GlassCard>
        <GlassCardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 font-medium text-white/60">Asset</th>
                  {activeTab === 'supply' ? (
                    <>
                      <th className="text-right py-4 px-4 font-medium text-white/60">Supply APY</th>
                      <th className="text-right py-4 px-4 font-medium text-white/60">Total Supply</th>
                      <th className="text-right py-4 px-4 font-medium text-white/60">Wallet Balance</th>
                      <th className="text-right py-4 px-4 font-medium text-white/60">Your Supply</th>
                      <th className="text-right py-4 px-4 font-medium text-white/60"></th>
                    </>
                  ) : (
                    <>
                      <th className="text-right py-4 px-4 font-medium text-white/60">Borrow APY</th>
                      <th className="text-right py-4 px-4 font-medium text-white/60">Total Borrow</th>
                      <th className="text-right py-4 px-4 font-medium text-white/60">Available</th>
                      <th className="text-right py-4 px-4 font-medium text-white/60">Your Borrow</th>
                      <th className="text-right py-4 px-4 font-medium text-white/60"></th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {marketAssets.map(asset => (
                  <tr key={asset.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{asset.icon}</span>
                        <div>
                          <div className="font-medium">{asset.name}</div>
                          <div className="text-sm text-white/60">{asset.fullName}</div>
                        </div>
                      </div>
                    </td>
                    {activeTab === 'supply' ? (
                      <>
                        <td className="text-right py-4 px-4 text-blue-400">{asset.supplyApy}%</td>
                        <td className="text-right py-4 px-4">{asset.totalSupply}</td>
                        <td className="text-right py-4 px-4">{isWalletConnected ? asset.walletBalance : '-'}</td>
                        <td className="text-right py-4 px-4">{isWalletConnected ? asset.supplied : '-'}</td>
                        <td className="text-right py-4 px-4">
                          <Button variant="secondary" size="sm" disabled={!isWalletConnected}
                            className="bg-[#0028FF]/20 hover:bg-[#0028FF]/30 text-[#0028FF] border-[#0028FF]/30">
                            Supply
                          </Button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="text-right py-4 px-4 text-blue-400">{asset.borrowApy}%</td>
                        <td className="text-right py-4 px-4">{asset.totalBorrow}</td>
                        <td className="text-right py-4 px-4">{isWalletConnected ? asset.walletBalance : '-'}</td>
                        <td className="text-right py-4 px-4">{isWalletConnected ? asset.borrowed : '-'}</td>
                        <td className="text-right py-4 px-4">
                          <Button variant="secondary" size="sm" disabled={!isWalletConnected}
                            className="bg-[#0028FF]/20 hover:bg-[#0028FF]/30 text-[#0028FF] border-[#0028FF]/30">
                            Borrow
                          </Button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCardContent>
      </GlassCard>
      
      {/* Add OKX Liquidity Indicator Component */}
      <div className="mt-8">
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <GlassCardTitle>OKX Liquidity Indicators</GlassCardTitle>
              <TrendingUp className="h-5 w-5 text-[#0028FF]" />
            </div>
            <GlassCardDescription>Real-time liquidity data across chains</GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {['Ethereum', 'BSC', 'Solana', 'Avalanche'].map(chain => (
                <div key={chain} className="border border-white/10 rounded-lg p-4">
                  <h3 className="font-medium text-[#0028FF] mb-2">{chain}</h3>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-white/60">Depth</span>
                    <span className="text-sm">$42.5M</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-white/60">Slippage (100k)</span>
                    <span className="text-sm">0.15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-white/60">24h Volume</span>
                    <span className="text-sm">$8.2M</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCardContent>
          <GlassCardFooter className="flex justify-end">
            <Button variant="link" className="text-[#0028FF]">
              View detailed analytics <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </GlassCardFooter>
        </GlassCard>
      </div>
    </div>
  );
};

export default MoneyMarket;
