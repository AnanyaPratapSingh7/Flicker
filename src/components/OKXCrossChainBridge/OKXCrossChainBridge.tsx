import React, { useState, useEffect } from 'react';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { ArrowRight, RefreshCcw, AlertCircle } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { OKXSpeechGateway, TransactionResult } from '../../okx-core/chain-router/OKXSpeechGateway';
import { OKXApiClient } from '../../api/okx/okxApiClient';

// Import OKX types
import { OKXChainId } from '../../api/okx/types';

interface ChainOption {
  value: OKXChainId;
  label: string;
}

const chainOptions: ChainOption[] = [
  { value: OKXChainId.ETHEREUM, label: 'Ethereum' },
  { value: OKXChainId.BSC, label: 'BSC' },
  { value: OKXChainId.POLYGON, label: 'Polygon' },
  { value: OKXChainId.ARBITRUM, label: 'Arbitrum' },
  { value: OKXChainId.OPTIMISM, label: 'Optimism' },
  { value: OKXChainId.SOLANA, label: 'Solana' },
  { value: OKXChainId.AVALANCHE, label: 'Avalanche' }
];

// Token options by chain
const tokensByChain: Record<OKXChainId, Array<{ symbol: string, name: string, icon: string, decimals: number }>> = {
  [OKXChainId.ETHEREUM]: [
    { symbol: 'ETH', name: 'Ethereum', icon: '🔷', decimals: 18 },
    { symbol: 'USDT', name: 'Tether USD', icon: '💵', decimals: 6 },
    { symbol: 'USDC', name: 'USD Coin', icon: '💰', decimals: 6 },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', icon: '🟠', decimals: 8 }
  ],
  [OKXChainId.BSC]: [
    { symbol: 'BNB', name: 'Binance Coin', icon: '🟡', decimals: 18 },
    { symbol: 'BUSD', name: 'Binance USD', icon: '💵', decimals: 18 },
    { symbol: 'USDT', name: 'Tether USD', icon: '💵', decimals: 6 },
    { symbol: 'CAKE', name: 'PancakeSwap', icon: '🥞', decimals: 18 }
  ],
  [OKXChainId.SOLANA]: [
    { symbol: 'SOL', name: 'Solana', icon: '🟣', decimals: 9 },
    { symbol: 'USDC', name: 'USD Coin', icon: '💰', decimals: 6 },
    { symbol: 'BONK', name: 'Bonk', icon: '🐕', decimals: 5 },
    { symbol: 'RAY', name: 'Raydium', icon: '⚡', decimals: 6 }
  ],
  [OKXChainId.AVALANCHE]: [
    { symbol: 'AVAX', name: 'Avalanche', icon: '🔴', decimals: 18 },
    { symbol: 'USDT', name: 'Tether USD', icon: '💵', decimals: 6 },
    { symbol: 'USDC', name: 'USD Coin', icon: '💰', decimals: 6 },
    { symbol: 'JOE', name: 'Trader Joe', icon: '☕', decimals: 18 }
  ],
  [OKXChainId.POLYGON]: [
    { symbol: 'MATIC', name: 'Polygon', icon: '🟣', decimals: 18 },
    { symbol: 'USDT', name: 'Tether USD', icon: '💵', decimals: 6 },
    { symbol: 'USDC', name: 'USD Coin', icon: '💰', decimals: 6 },
    { symbol: 'WETH', name: 'Wrapped ETH', icon: '🔷', decimals: 18 }
  ],
  [OKXChainId.ARBITRUM]: [
    { symbol: 'ETH', name: 'Ethereum', icon: '🔷', decimals: 18 },
    { symbol: 'USDT', name: 'Tether USD', icon: '💵', decimals: 6 },
    { symbol: 'USDC', name: 'USD Coin', icon: '💰', decimals: 6 },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', icon: '🟠', decimals: 8 }
  ],
  [OKXChainId.OPTIMISM]: [
    { symbol: 'ETH', name: 'Ethereum', icon: '🔷', decimals: 18 },
    { symbol: 'USDT', name: 'Tether USD', icon: '💵', decimals: 6 },
    { symbol: 'USDC', name: 'USD Coin', icon: '💰', decimals: 6 },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', icon: '🟠', decimals: 8 }
  ]
};

// Fee structure by chain
const feesByChain: Record<OKXChainId, { gas: string, bridgeFee: string, estimatedTime: string }> = {
  [OKXChainId.ETHEREUM]: { gas: '10-25 Gwei', bridgeFee: '0.1%', estimatedTime: '5-10 mins' },
  [OKXChainId.BSC]: { gas: '5 Gwei', bridgeFee: '0.05%', estimatedTime: '1-3 mins' },
  [OKXChainId.SOLANA]: { gas: '0.000005 SOL', bridgeFee: '0.05%', estimatedTime: '15-45 secs' },
  [OKXChainId.AVALANCHE]: { gas: '30 nAVAX', bridgeFee: '0.07%', estimatedTime: '2-5 mins' },
  [OKXChainId.POLYGON]: { gas: '30-50 Gwei', bridgeFee: '0.05%', estimatedTime: '2-5 mins' },
  [OKXChainId.ARBITRUM]: { gas: '0.1-0.3 Gwei', bridgeFee: '0.05%', estimatedTime: '1-3 mins' },
  [OKXChainId.OPTIMISM]: { gas: '0.001 Gwei', bridgeFee: '0.05%', estimatedTime: '1-3 mins' }
};

// Simulated liquidity data
const liquidityData: Record<OKXChainId, Record<string, { amount: string, usdValue: string }>> = {
  [OKXChainId.ETHEREUM]: {
    'ETH': { amount: '2,450', usdValue: '$7.3M' },
    'USDT': { amount: '5,230,450', usdValue: '$5.2M' },
    'USDC': { amount: '4,120,800', usdValue: '$4.1M' },
    'WBTC': { amount: '125', usdValue: '$8.2M' }
  },
  [OKXChainId.BSC]: {
    'BNB': { amount: '18,450', usdValue: '$5.8M' },
    'BUSD': { amount: '7,230,450', usdValue: '$7.2M' },
    'USDT': { amount: '3,120,800', usdValue: '$3.1M' },
    'CAKE': { amount: '950,000', usdValue: '$2.1M' }
  },
  [OKXChainId.SOLANA]: {
    'SOL': { amount: '150,450', usdValue: '$9.3M' },
    'USDC': { amount: '2,830,450', usdValue: '$2.8M' },
    'BONK': { amount: '98,120,800,000', usdValue: '$1.9M' },
    'RAY': { amount: '725,000', usdValue: '$1.2M' }
  },
  [OKXChainId.AVALANCHE]: {
    'AVAX': { amount: '95,450', usdValue: '$3.1M' },
    'USDT': { amount: '1,230,450', usdValue: '$1.2M' },
    'USDC': { amount: '2,520,800', usdValue: '$2.5M' },
    'JOE': { amount: '3,950,000', usdValue: '$0.9M' }
  },
  [OKXChainId.POLYGON]: {
    'MATIC': { amount: '1,250,000', usdValue: '$1.2M' },
    'USDT': { amount: '2,830,450', usdValue: '$2.8M' },
    'USDC': { amount: '1,520,800', usdValue: '$1.5M' },
    'WETH': { amount: '850', usdValue: '$2.1M' }
  },
  [OKXChainId.ARBITRUM]: {
    'ETH': { amount: '1,850', usdValue: '$5.5M' },
    'USDT': { amount: '3,830,450', usdValue: '$3.8M' },
    'USDC': { amount: '2,520,800', usdValue: '$2.5M' },
    'WBTC': { amount: '95', usdValue: '$6.2M' }
  },
  [OKXChainId.OPTIMISM]: {
    'ETH': { amount: '1,650', usdValue: '$4.9M' },
    'USDT': { amount: '2,830,450', usdValue: '$2.8M' },
    'USDC': { amount: '1,920,800', usdValue: '$1.9M' },
    'WBTC': { amount: '75', usdValue: '$4.9M' }
  }
};

export const OKXCrossChainBridge: React.FC = () => {
  const { isWalletConnected, address } = useWallet();
  const [speechGateway, setSpeechGateway] = useState<OKXSpeechGateway | null>(null);
  
  // State for bridge parameters
  const [sourceChain, setSourceChain] = useState<OKXChainId>(OKXChainId.ETHEREUM);
  const [destChain, setDestChain] = useState<OKXChainId>(OKXChainId.BSC);
  const [sourceToken, setSourceToken] = useState('ETH');
  const [destToken, setDestToken] = useState('SOL');
  const [amount, setAmount] = useState('');
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [quote, setQuote] = useState<{
    sourceAmount: string;
    destAmount: string;
    exchangeRate: string;
    fees: string;
    estimatedTime: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null);

  // Initialize OKX API client and speech gateway
  useEffect(() => {
    if (isWalletConnected && address) {
      const apiClient = new OKXApiClient(
        process.env.NEXT_PUBLIC_OKX_API_KEY || '',
        process.env.NEXT_PUBLIC_OKX_API_SECRET || '',
        process.env.NEXT_PUBLIC_OKX_API_PASSPHRASE || ''
      );
      
      const gateway = new OKXSpeechGateway({
        apiKey: process.env.NEXT_PUBLIC_OKX_API_KEY || '',
        apiSecret: process.env.NEXT_PUBLIC_OKX_API_SECRET || '',
        apiPassphrase: process.env.NEXT_PUBLIC_OKX_API_PASSPHRASE || '',
        address
      });
      
      setSpeechGateway(gateway);
    }
  }, [isWalletConnected, address]);

  // Handle swapping source and destination
  const handleSwapChains = () => {
    setSourceChain(destChain);
    setDestChain(sourceChain);
    setSourceToken(tokensByChain[destChain][0].symbol);
    setDestToken(tokensByChain[sourceChain][0].symbol);
    setQuote(null);
    setError(null);
  };

  // Handle getting a quote
  const handleGetQuote = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (!speechGateway) {
      setError('Wallet not connected');
      return;
    }
    
    setIsLoadingQuote(true);
    setError(null);
    
    try {
      const result = await speechGateway.processTransaction({
        operation: 'BRIDGE',
        sourceChain,
        destinationChain: destChain,
        sourceToken,
        destinationToken: destToken,
        amount,
        recipient: address
      });
      
      if (result.success) {
        setQuote({
          sourceAmount: amount,
          destAmount: result.details?.estimatedOutput || '0',
          exchangeRate: result.details?.exchangeRate || '0',
          fees: result.details?.fees || '0',
          estimatedTime: result.details?.estimatedTime || 'Unknown'
        });
      } else {
        setError(result.humanReadableResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get quote');
    } finally {
      setIsLoadingQuote(false);
    }
  };

  // Handle executing the bridge transaction
  const handleBridge = async () => {
    if (!isWalletConnected || !speechGateway) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (!quote) {
      setError('Please get a quote first');
      return;
    }
    
    try {
      const result = await speechGateway.processTransaction({
        operation: 'BRIDGE',
        sourceChain,
        destinationChain: destChain,
        sourceToken,
        destinationToken: destToken,
        amount,
        recipient: address
      });
      
      setTransactionResult(result);
      
      if (!result.success) {
        setError(result.humanReadableResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute bridge transaction');
    }
  };

  // Helper to get chain name
  const getChainName = (chainId: OKXChainId) => {
    const chain = chainOptions.find(c => c.value === chainId);
    return chain ? chain.label : 'Unknown Chain';
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 blue-gradient-text">
          OKX Cross-Chain Bridge
        </h1>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          Seamlessly move tokens across multiple blockchains
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main bridge form */}
        <GlassCard className="lg:col-span-2">
          <GlassCardHeader>
            <GlassCardTitle>Bridge Assets</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500">
                  {error}
                </div>
              )}
              
              {transactionResult && transactionResult.success && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-green-500">
                  {transactionResult.humanReadableResult}
                </div>
              )}

              {/* Source chain and token */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    From Chain
                  </label>
                  <select 
                    className="w-full rounded-lg bg-[#1A1C23]/80 border border-[#0028FF]/20 text-white p-3"
                    value={sourceChain}
                    onChange={(e) => {
                      setSourceChain(e.target.value as OKXChainId);
                      setSourceToken(tokensByChain[e.target.value as OKXChainId][0].symbol);
                      setQuote(null);
                      setError(null);
                    }}
                  >
                    {chainOptions.map(chain => (
                      <option key={chain.value} value={chain.value} disabled={chain.value === destChain}>
                        {chain.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Source Token
                  </label>
                  <select 
                    className="w-full rounded-lg bg-[#1A1C23]/80 border border-[#0028FF]/20 text-white p-3"
                    value={sourceToken}
                    onChange={(e) => {
                      setSourceToken(e.target.value);
                      setQuote(null);
                      setError(null);
                    }}
                  >
                    {tokensByChain[sourceChain].map(token => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.icon} {token.symbol} - {token.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Chain swap button */}
              <div className="flex justify-center">
                <button 
                  className="p-2 rounded-full bg-[#0028FF]/10 hover:bg-[#0028FF]/20 text-[#0028FF] border border-[#0028FF]/30"
                  onClick={handleSwapChains}
                >
                  <RefreshCcw className="h-5 w-5" />
                </button>
              </div>
              
              {/* Destination chain and token */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    To Chain
                  </label>
                  <select 
                    className="w-full rounded-lg bg-[#1A1C23]/80 border border-[#0028FF]/20 text-white p-3"
                    value={destChain}
                    onChange={(e) => {
                      setDestChain(e.target.value as OKXChainId);
                      setDestToken(tokensByChain[e.target.value as OKXChainId][0].symbol);
                      setQuote(null);
                      setError(null);
                    }}
                  >
                    {chainOptions.map(chain => (
                      <option key={chain.value} value={chain.value} disabled={chain.value === sourceChain}>
                        {chain.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Destination Token
                  </label>
                  <select 
                    className="w-full rounded-lg bg-[#1A1C23]/80 border border-[#0028FF]/20 text-white p-3"
                    value={destToken}
                    onChange={(e) => {
                      setDestToken(e.target.value);
                      setQuote(null);
                      setError(null);
                    }}
                  >
                    {tokensByChain[destChain].map(token => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.icon} {token.symbol} - {token.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Amount input */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setQuote(null);
                      setError(null);
                    }}
                    className="w-full rounded-lg bg-[#1A1C23]/80 border border-[#0028FF]/20 text-white p-3"
                    placeholder="Enter amount"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50">
                    {sourceToken}
                  </div>
                </div>
              </div>
              
              {/* Quote and bridge button */}
              <div className="space-y-4">
                <button
                  onClick={handleGetQuote}
                  disabled={isLoadingQuote || !amount}
                  className="w-full bg-[#0028FF] text-white p-3 rounded-lg hover:bg-[#0028FF]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingQuote ? 'Getting Quote...' : 'Get Quote'}
                </button>

                {quote && (
                  <div className="bg-[#1A1C23]/80 border border-[#0028FF]/20 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Exchange Rate:</span>
                      <span className="text-white">1 {sourceToken} = {quote.exchangeRate} {destToken}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">You'll Receive:</span>
                      <span className="text-white">{quote.destAmount} {destToken}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Bridge Fee:</span>
                      <span className="text-white">{quote.fees}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Estimated Time:</span>
                      <span className="text-white">{quote.estimatedTime}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBridge}
                  disabled={!quote || !isWalletConnected}
                  className="w-full bg-[#0028FF] text-white p-3 rounded-lg hover:bg-[#0028FF]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!isWalletConnected ? 'Connect Wallet' : 'Bridge'}
                </button>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
        
        {/* Network information */}
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Network Information</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-4">
              <div className="bg-[#0028FF]/5 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-[#0028FF] shrink-0 mt-0.5" />
                  <div className="text-xs text-white/70">
                    <p className="mb-1">Large transfers may be subject to slippage due to limited liquidity.</p>
                    <p>Gas fees are paid in the native token of the source chain.</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-white/90 mb-2">
                  {getChainName(sourceChain)} Network
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Status:</span>
                    <span className="text-green-500">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Gas Fee:</span>
                    <span className="text-white">{feesByChain[sourceChain].gas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Bridge Fee:</span>
                    <span className="text-white">{feesByChain[sourceChain].bridgeFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Est. Time:</span>
                    <span className="text-white">{feesByChain[sourceChain].estimatedTime}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-white/90 mb-2">
                  {getChainName(destChain)} Network
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Status:</span>
                    <span className="text-green-500">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Gas Fee:</span>
                    <span className="text-white">{feesByChain[destChain].gas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Bridge Fee:</span>
                    <span className="text-white">{feesByChain[destChain].bridgeFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Est. Time:</span>
                    <span className="text-white">{feesByChain[destChain].estimatedTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}; 