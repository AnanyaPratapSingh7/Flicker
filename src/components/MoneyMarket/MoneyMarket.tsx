import React, { useState } from 'react';
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardFooter, GlassCardHeader, GlassCardTitle } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Coins, ArrowRight, TrendingUp, DollarSign, Wallet, ArrowUpDown } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';

// Sample data for demonstration
const marketAssets = [
  { 
    id: 1, 
    name: 'INJ', 
    fullName: 'Injective Protocol',
    supplyApy: 3.2, 
    borrowApy: 5.4, 
    totalSupply: '$24.5M', 
    totalBorrow: '$12.3M',
    walletBalance: '125.45',
    supplied: '50.00',
    borrowed: '0.00',
    icon: '💎'
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
    icon: '🔷'
  },
  { 
    id: 4, 
    name: 'ATOM', 
    fullName: 'Cosmos',
    supplyApy: 5.8, 
    borrowApy: 9.7, 
    totalSupply: '$12.4M', 
    totalBorrow: '$5.8M',
    walletBalance: '42.50',
    supplied: '0.00',
    borrowed: '0.00',
    icon: '⚛️'
  },
];

const MoneyMarket: React.FC = () => {
  const { isWalletConnected } = useWallet();
  const [activeTab, setActiveTab] = useState<'supply' | 'borrow'>('supply');

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 gold-gradient-text">
          Money Market
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
              <Coins className="h-6 w-6 text-[var(--gold-accent)]" />
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="text-3xl font-bold gold-gradient-text">$172.5M</p>
            <p className="text-white/60 text-sm">+2.4% from last week</p>
          </GlassCardContent>
        </GlassCard>

        <GlassCard>
          <GlassCardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <GlassCardTitle>Total Borrow</GlassCardTitle>
              <ArrowUpDown className="h-6 w-6 text-[var(--gold-accent)]" />
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="text-3xl font-bold gold-gradient-text">$97.9M</p>
            <p className="text-white/60 text-sm">+1.8% from last week</p>
          </GlassCardContent>
        </GlassCard>

        <GlassCard>
          <GlassCardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <GlassCardTitle>Your Position</GlassCardTitle>
              <Wallet className="h-6 w-6 text-[var(--gold-accent)]" />
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            {isWalletConnected ? (
              <>
                <p className="text-3xl font-bold gold-gradient-text">$1,250.45</p>
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
          className={`px-6 py-3 font-medium ${activeTab === 'supply' ? 'text-[var(--gold-accent)] border-b-2 border-[var(--gold-accent)]' : 'text-white/60'}`}
          onClick={() => setActiveTab('supply')}
        >
          Supply Markets
        </button>
        <button
          className={`px-6 py-3 font-medium ${activeTab === 'borrow' ? 'text-[var(--gold-accent)] border-b-2 border-[var(--gold-accent)]' : 'text-white/60'}`}
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
                        <td className="text-right py-4 px-4 text-green-400">{asset.supplyApy}%</td>
                        <td className="text-right py-4 px-4">{asset.totalSupply}</td>
                        <td className="text-right py-4 px-4">{isWalletConnected ? asset.walletBalance : '-'}</td>
                        <td className="text-right py-4 px-4">{isWalletConnected ? asset.supplied : '-'}</td>
                        <td className="text-right py-4 px-4">
                          <Button variant="secondary" size="sm" disabled={!isWalletConnected}>
                            Supply
                          </Button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="text-right py-4 px-4 text-amber-400">{asset.borrowApy}%</td>
                        <td className="text-right py-4 px-4">{asset.totalBorrow}</td>
                        <td className="text-right py-4 px-4">{isWalletConnected ? asset.walletBalance : '-'}</td>
                        <td className="text-right py-4 px-4">{isWalletConnected ? asset.borrowed : '-'}</td>
                        <td className="text-right py-4 px-4">
                          <Button variant="secondary" size="sm" disabled={!isWalletConnected}>
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
    </div>
  );
};

export default MoneyMarket;
