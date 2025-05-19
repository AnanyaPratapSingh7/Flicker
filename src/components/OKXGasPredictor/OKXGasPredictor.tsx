import React, { useState, useEffect } from 'react';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '../ui/GlassCard';
import { TrendingDown, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { OKXChainId } from '../../api/okx/types';
import { useWallet } from '../../contexts/WalletContext';

interface GasPrediction {
  chainId: string;
  currentPrice: {
    standard: string;
    fast: string;
    rapid: string;
  };
  predictions: {
    timeframe: string;
    change: number;
    price: string;
    trend: 'up' | 'down' | 'stable';
  }[];
  bestTimeToTransact: string;
  updated: string;
}

// Mock API data (would be fetched from OKX fee API in production)
const mockPredictions: Record<string, GasPrediction> = {
  [OKXChainId.ETHEREUM]: {
    chainId: OKXChainId.ETHEREUM,
    currentPrice: {
      standard: '25 Gwei',
      fast: '35 Gwei',
      rapid: '45 Gwei'
    },
    predictions: [
      { timeframe: '1h', change: 8, price: '27 Gwei', trend: 'up' },
      { timeframe: '3h', change: -12, price: '22 Gwei', trend: 'down' },
      { timeframe: '6h', change: -15, price: '21 Gwei', trend: 'down' },
      { timeframe: '12h', change: 5, price: '26 Gwei', trend: 'up' },
      { timeframe: '24h', change: 10, price: '28 Gwei', trend: 'up' }
    ],
    bestTimeToTransact: 'In 5-6 hours',
    updated: '2 minutes ago'
  },
  [OKXChainId.BSC]: {
    chainId: OKXChainId.BSC,
    currentPrice: {
      standard: '5 Gwei',
      fast: '5.5 Gwei',
      rapid: '6 Gwei'
    },
    predictions: [
      { timeframe: '1h', change: 0, price: '5 Gwei', trend: 'stable' },
      { timeframe: '3h', change: 4, price: '5.2 Gwei', trend: 'up' },
      { timeframe: '6h', change: 2, price: '5.1 Gwei', trend: 'up' },
      { timeframe: '12h', change: -2, price: '4.9 Gwei', trend: 'down' },
      { timeframe: '24h', change: 0, price: '5 Gwei', trend: 'stable' }
    ],
    bestTimeToTransact: 'Now or in 12 hours',
    updated: '1 minute ago'
  },
  [OKXChainId.SOLANA]: {
    chainId: OKXChainId.SOLANA,
    currentPrice: {
      standard: '0.000005 SOL',
      fast: '0.000005 SOL',
      rapid: '0.000005 SOL'
    },
    predictions: [
      { timeframe: '1h', change: 0, price: '0.000005 SOL', trend: 'stable' },
      { timeframe: '3h', change: 0, price: '0.000005 SOL', trend: 'stable' },
      { timeframe: '6h', change: 0, price: '0.000005 SOL', trend: 'stable' },
      { timeframe: '12h', change: 0, price: '0.000005 SOL', trend: 'stable' },
      { timeframe: '24h', change: 0, price: '0.000005 SOL', trend: 'stable' }
    ],
    bestTimeToTransact: 'Anytime (fixed fees)',
    updated: '5 minutes ago'
  },
  [OKXChainId.AVALANCHE]: {
    chainId: OKXChainId.AVALANCHE,
    currentPrice: {
      standard: '25 nAVAX',
      fast: '35 nAVAX',
      rapid: '50 nAVAX'
    },
    predictions: [
      { timeframe: '1h', change: 4, price: '26 nAVAX', trend: 'up' },
      { timeframe: '3h', change: -8, price: '23 nAVAX', trend: 'down' },
      { timeframe: '6h', change: -12, price: '22 nAVAX', trend: 'down' },
      { timeframe: '12h', change: -4, price: '24 nAVAX', trend: 'down' },
      { timeframe: '24h', change: 8, price: '27 nAVAX', trend: 'up' }
    ],
    bestTimeToTransact: 'In 6 hours',
    updated: '3 minutes ago'
  }
};

const OKXGasPredictor: React.FC = () => {
  const { selectedChain } = useWallet();
  const [activeChain, setActiveChain] = useState<string>(selectedChain);
  const [prediction, setPrediction] = useState<GasPrediction | null>(null);
  const [loading, setLoading] = useState(false);

  // Update active chain when wallet's selected chain changes
  useEffect(() => {
    if (selectedChain) {
      setActiveChain(selectedChain);
    }
  }, [selectedChain]);

  // Fetch gas predictions when active chain changes
  useEffect(() => {
    const fetchGasPredictions = async () => {
      setLoading(true);
      
      // In a real implementation, this would be an API call to OKX
      // For this demo, we'll use the mock data with a simulated delay
      setTimeout(() => {
        setPrediction(mockPredictions[activeChain]);
        setLoading(false);
      }, 800);
    };
    
    fetchGasPredictions();
  }, [activeChain]);

  // Handler for changing the active chain
  const handleChainChange = (chainId: string) => {
    setActiveChain(chainId);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 blue-gradient-text">
          OKX Gas Price Predictor
        </h1>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          Save on transaction fees by timing your transactions optimally
        </p>
      </div>
      
      {/* Chain Selection */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-md shadow-sm bg-[#1A1C23]/50 backdrop-blur-md border border-white/10">
          {Object.keys(mockPredictions).map((chainId) => (
            <button
              key={chainId}
              className={`px-4 py-2 text-sm font-medium ${
                activeChain === chainId 
                  ? 'bg-[#0028FF] text-white' 
                  : 'text-white/70 hover:bg-[#0028FF]/10'
              }`}
              onClick={() => handleChainChange(chainId)}
            >
              {chainId === OKXChainId.ETHEREUM ? 'Ethereum' : 
               chainId === OKXChainId.BSC ? 'BSC' :
               chainId === OKXChainId.SOLANA ? 'Solana' : 'Avalanche'}
            </button>
          ))}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0028FF]"></div>
        </div>
      ) : prediction ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Gas Prices */}
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Current Gas Prices</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[#0028FF]/5">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Standard</span>
                    <span className="font-semibold">{prediction.currentPrice.standard}</span>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-[#0028FF]/10">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Fast</span>
                    <span className="font-semibold">{prediction.currentPrice.fast}</span>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-[#0028FF]/20">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Rapid</span>
                    <span className="font-semibold">{prediction.currentPrice.rapid}</span>
                  </div>
                </div>
                <div className="text-xs text-white/50 text-right">
                  Updated {prediction.updated}
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
          
          {/* Predictions Chart */}
          <GlassCard className="lg:col-span-2">
            <GlassCardHeader>
              <GlassCardTitle>Gas Price Forecast</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="flex flex-col h-full">
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {prediction.predictions.map((pred) => (
                    <div 
                      key={pred.timeframe}
                      className="text-center"
                    >
                      <div className="text-xs text-white/70 mb-1">+{pred.timeframe}</div>
                      <div className="relative h-32 bg-[#0028FF]/5 rounded-lg flex flex-col justify-end overflow-hidden">
                        <div 
                          className={`px-2 py-1 ${
                            pred.trend === 'up' ? 'bg-red-500/30' : 
                            pred.trend === 'down' ? 'bg-green-500/30' : 'bg-blue-500/20'
                          }`}
                          style={{ height: `${(Math.abs(pred.change) / 20) * 100}%` }}
                        >
                          <div className="flex justify-center items-center h-full">
                            {pred.trend === 'up' ? (
                              <TrendingUp className="h-4 w-4 text-red-400" />
                            ) : pred.trend === 'down' ? (
                              <TrendingDown className="h-4 w-4 text-green-400" />
                            ) : (
                              <ArrowRight className="h-4 w-4 text-blue-400" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm mt-1 font-medium">
                        {pred.change > 0 ? '+' : ''}{pred.change}%
                      </div>
                      <div className="text-xs text-white/70">{pred.price}</div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-auto p-4 bg-[#0028FF]/10 rounded-lg flex items-center">
                  <Clock className="h-5 w-5 text-[#0028FF] mr-2" />
                  <div>
                    <div className="font-medium">Best time to transact</div>
                    <div className="text-sm text-white/70">{prediction.bestTimeToTransact}</div>
                  </div>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
          
          {/* Transaction Cost Estimator */}
          <GlassCard className="lg:col-span-3">
            <GlassCardHeader>
              <GlassCardTitle>Transaction Cost Estimator</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1">
                  <h3 className="text-[#0028FF] font-medium mb-3">Standard Transaction Types</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Token Transfer', gas: '21,000' },
                      { name: 'Swap on DEX', gas: '150,000' },
                      { name: 'NFT Mint', gas: '120,000' },
                      { name: 'Smart Contract Interaction', gas: '100,000' }
                    ].map((tx, i) => (
                      <div key={i} className="p-3 rounded-lg bg-[#0028FF]/5 flex justify-between">
                        <span className="text-sm">{tx.name}</span>
                        <span className="text-sm font-medium">{tx.gas} gas</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="col-span-2">
                  <h3 className="text-[#0028FF] font-medium mb-3">Estimated Cost by Time</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="py-2 text-left text-white/70">Transaction Type</th>
                          <th className="py-2 text-right text-white/70">Now (Standard)</th>
                          <th className="py-2 text-right text-white/70">Now (Fast)</th>
                          <th className="py-2 text-right text-white/70">Best Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'Token Transfer', gasLimit: 21000 },
                          { name: 'Swap on DEX', gasLimit: 150000 },
                          { name: 'NFT Mint', gasLimit: 120000 },
                          { name: 'Contract Interaction', gasLimit: 100000 }
                        ].map((tx, i) => {
                          // Calculate costs based on current and predicted prices
                          // This is simplified for the demo
                          const getCurrentCost = (price: string, gasLimit: number): string => {
                            // Extract numeric part from price strings like "25 Gwei"
                            const priceMatch = price.match(/(\d+(\.\d+)?)/);
                            if (!priceMatch) return 'N/A';
                            
                            const priceValue = parseFloat(priceMatch[0]);
                            
                            if (activeChain === OKXChainId.ETHEREUM || activeChain === OKXChainId.BSC) {
                              return `${(priceValue * gasLimit / 1e9).toFixed(5)} ETH`;
                            } else if (activeChain === OKXChainId.SOLANA) {
                              return `${(0.000005 * 1).toFixed(6)} SOL`;
                            } else {
                              return `${(priceValue * gasLimit / 1e9).toFixed(6)} AVAX`;
                            }
                          };
                          
                          const getBestTimeCost = (): string => {
                            // Find prediction with lowest price
                            const lowestPred = [...prediction.predictions].sort((a, b) => a.change - b.change)[0];
                            const priceMatch = lowestPred.price.match(/(\d+(\.\d+)?)/);
                            if (!priceMatch) return 'N/A';
                            
                            const priceValue = parseFloat(priceMatch[0]);
                            
                            if (activeChain === OKXChainId.ETHEREUM || activeChain === OKXChainId.BSC) {
                              return `${(priceValue * tx.gasLimit / 1e9).toFixed(5)} ETH`;
                            } else if (activeChain === OKXChainId.SOLANA) {
                              return `${(0.000005 * 1).toFixed(6)} SOL`;
                            } else {
                              return `${(priceValue * tx.gasLimit / 1e9).toFixed(6)} AVAX`;
                            }
                          };
                          
                          return (
                            <tr key={i} className="border-b border-white/5">
                              <td className="py-3 text-sm">{tx.name}</td>
                              <td className="py-3 text-right text-sm">{getCurrentCost(prediction.currentPrice.standard, tx.gasLimit)}</td>
                              <td className="py-3 text-right text-sm">{getCurrentCost(prediction.currentPrice.fast, tx.gasLimit)}</td>
                              <td className="py-3 text-right text-sm font-medium text-green-400">{getBestTimeCost()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      ) : (
        <div className="text-center text-white/50">
          No gas prediction data available for the selected chain.
        </div>
      )}
    </div>
  );
};

export default OKXGasPredictor; 