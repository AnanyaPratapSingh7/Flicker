/**
 * OKX API Types
 * 
 * This file defines interfaces and types for the OKX DEX API.
 */

export interface OKXApiResponse<T> {
  code: string;
  msg: string;
  data: T;
}

export interface OKXToken {
  ccy: string;  // Currency code
  chain: string; // Chain name
  name: string;  // Full token name
  logoUrl: string; // URL to token logo
  minWd: string;  // Minimum withdrawal amount
  maxWd: string;  // Maximum withdrawal amount
  minFee: string; // Minimum fee
  maxFee: string; // Maximum fee
}

export interface OKXBalance {
  ccy: string;      // Currency code
  availBal: string; // Available balance
  frozenBal: string; // Frozen balance
  totalBal: string; // Total balance
  availEq: string;  // Available equity in USD value
}

export interface OKXSwapQuote {
  fromToken: string;
  toToken: string;
  amount: string;
  expectedOutput: string;
  exchangeRate: string;
  fees: string;
  estimatedTime: string;
}

export interface OKXOrder {
  orderId: string;
  status: string;
  fromToken: string;
  toToken: string;
  amount: string;
  expectedOutput: string;
  timestamp: number;
}

export interface OKXTradingPair {
  instId: string;     // Instrument ID
  baseCcy: string;    // Base currency
  quoteCcy: string;   // Quote currency
  minSz: string;      // Minimum order size
  tickSz: string;     // Tick size (price increment)
  lotSz: string;      // Lot size (quantity increment)
  maxLmtSz: string;   // Maximum limit order size
  maxMktSz: string;   // Maximum market order size
  state: string;      // State (live, suspend)
}

export interface OKXCrossChainRoute {
  srcChain: string;    // Source chain
  dstChain: string;    // Destination chain
  srcCcy: string;      // Source currency
  dstCcy: string;      // Destination currency
  baseFee: string;     // Base fee
  bridgeFee: string;   // Bridge fee
  estimatedTime: number; // Estimated time in seconds
}

export interface OKXGasFee {
  chainId: string;     // Chain ID
  standard: string;    // Standard gas price in native token
  fast: string;        // Fast gas price in native token
  rapid: string;       // Rapid gas price in native token
  ts: string;          // Timestamp
}

// Cross-chain swap transaction
export interface OKXCrossChainSwapTransaction {
  txId: string;
  status: string;
  fromChain: OKXChainId;
  toChain: OKXChainId;
  fromToken: string;
  toToken: string;
  amount: string;
  expectedOutput: string;
  estimatedArrivalTime: number;
  timestamp: number;
}

// Transaction status
export enum OKXTransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

// Supported chains
export enum OKXChainId {
  ETHEREUM = 'ethereum',
  BSC = 'bsc',
  POLYGON = 'polygon',
  ARBITRUM = 'arbitrum',
  OPTIMISM = 'optimism',
  SOLANA = 'solana',
  AVALANCHE = 'avalanche'
}

// Transaction request
export interface OKXTransactionRequest {
  requestId: string;   // Request ID
  chainId: string;     // Chain ID
  operation: string;   // Operation type
  data: any;           // Transaction data
  createdAt: number;   // Creation timestamp
}

// Gas price prediction
export interface OKXGasPrediction {
  chainId: string;     // Chain ID
  predictions: {
    timeframe: string; // Timeframe (e.g. '1h', '24h')
    prediction: string; // Predicted gas price change in percentage
    confidence: number; // Confidence level (0-1)
  }[];
} 