/**
 * OKXLinguistCore
 * 
 * Natural language parser for OKX DEX transactions.
 * This module extracts transaction parameters from user input.
 */
import { OKXChainId } from '../../api/okx/types';

export interface ParsedTransaction {
  operation: TransactionOperation;
  sourceChain?: string;
  destinationChain?: string;
  sourceToken?: string;
  destinationToken?: string;
  amount?: string;
  recipient?: string;
  slippage?: number;
  orderType?: 'market' | 'limit';
  limitPrice?: string;
  confidence: number;
  originalText: string;
}

export enum TransactionOperation {
  SWAP = 'swap',
  TRANSFER = 'transfer',
  BRIDGE = 'bridge',
  CROSS_CHAIN_SWAP = 'crossChainSwap',
  LIMIT_ORDER = 'limitOrder',
  CHECK_BALANCE = 'checkBalance',
  GAS_PREDICT = 'gasPredict',
  UNKNOWN = 'unknown'
}

// Common token symbols
const TOKEN_SYMBOLS = [
  'BTC', 'ETH', 'SOL', 'AVAX', 'BNB', 'OKT', 'USDT', 'USDC', 
  'DAI', 'BUSD', 'WBTC', 'WETH', 'LINK', 'UNI', 'AAVE', 'DOGE',
  'SHIB', 'MATIC', 'DOT', 'ADA', 'XRP', 'ATOM'
];

// Chain names and their variants
const CHAIN_MAPPING: Record<string, string> = {
  'eth': OKXChainId.ETHEREUM,
  'ethereum': OKXChainId.ETHEREUM,
  'erc20': OKXChainId.ETHEREUM,
  'bsc': OKXChainId.BSC,
  'binance': OKXChainId.BSC,
  'binance smart chain': OKXChainId.BSC,
  'bnb chain': OKXChainId.BSC,
  'sol': OKXChainId.SOLANA,
  'solana': OKXChainId.SOLANA,
  'avax': OKXChainId.AVALANCHE,
  'avalanche': OKXChainId.AVALANCHE
};

export class OKXLinguistCore {
  /**
   * Parse user input to extract transaction parameters
   */
  parseTransactionIntent(userInput: string): ParsedTransaction {
    const normalizedInput = userInput.toLowerCase().trim();
    
    // Default result with unknown operation
    const result: ParsedTransaction = {
      operation: TransactionOperation.UNKNOWN,
      confidence: 0,
      originalText: userInput
    };

    // Try to determine the operation type
    if (this.containsSwapIntent(normalizedInput)) {
      if (this.containsCrossChainIntent(normalizedInput)) {
        result.operation = TransactionOperation.CROSS_CHAIN_SWAP;
      } else {
        result.operation = TransactionOperation.SWAP;
      }
    } else if (this.containsTransferIntent(normalizedInput)) {
      result.operation = TransactionOperation.TRANSFER;
    } else if (this.containsBridgeIntent(normalizedInput)) {
      result.operation = TransactionOperation.BRIDGE;
    } else if (this.containsLimitOrderIntent(normalizedInput)) {
      result.operation = TransactionOperation.LIMIT_ORDER;
    } else if (this.containsBalanceCheckIntent(normalizedInput)) {
      result.operation = TransactionOperation.CHECK_BALANCE;
    } else if (this.containsGasPredictionIntent(normalizedInput)) {
      result.operation = TransactionOperation.GAS_PREDICT;
    }

    // Extract tokens
    const tokenMatches = this.extractTokens(userInput);
    if (tokenMatches.length >= 1) {
      result.sourceToken = tokenMatches[0];
    }
    if (tokenMatches.length >= 2) {
      result.destinationToken = tokenMatches[1];
    }

    // Extract amount
    const amountMatch = this.extractAmount(userInput);
    if (amountMatch) {
      result.amount = amountMatch;
    }

    // Extract chains
    const chainMatches = this.extractChains(normalizedInput);
    if (chainMatches.length >= 1) {
      result.sourceChain = chainMatches[0];
    }
    if (chainMatches.length >= 2) {
      result.destinationChain = chainMatches[1];
    }

    // Extract recipient for transfers
    if (result.operation === TransactionOperation.TRANSFER) {
      const recipientMatch = this.extractRecipient(userInput);
      if (recipientMatch) {
        result.recipient = recipientMatch;
      }
    }

    // Extract order parameters for limit orders
    if (result.operation === TransactionOperation.LIMIT_ORDER) {
      result.orderType = 'limit';
      const priceMatch = this.extractLimitPrice(userInput);
      if (priceMatch) {
        result.limitPrice = priceMatch;
      }
    }

    // Calculate confidence based on completeness of extracted data
    result.confidence = this.calculateConfidence(result);

    return result;
  }

  /**
   * Check if input contains swap-related keywords
   */
  private containsSwapIntent(input: string): boolean {
    const swapKeywords = ['swap', 'exchange', 'trade', 'convert'];
    return swapKeywords.some(keyword => input.includes(keyword));
  }

  /**
   * Check if input contains cross-chain keywords
   */
  private containsCrossChainIntent(input: string): boolean {
    const crossChainKeywords = ['cross chain', 'cross-chain', 'from ethereum to', 'from solana to', 'from avalanche to', 'from bsc to'];
    return crossChainKeywords.some(keyword => input.includes(keyword));
  }

  /**
   * Check if input contains transfer-related keywords
   */
  private containsTransferIntent(input: string): boolean {
    const transferKeywords = ['transfer', 'send', 'pay', 'to address', 'to wallet'];
    return transferKeywords.some(keyword => input.includes(keyword));
  }

  /**
   * Check if input contains bridge-related keywords
   */
  private containsBridgeIntent(input: string): boolean {
    const bridgeKeywords = ['bridge', 'move from chain', 'to chain'];
    return bridgeKeywords.some(keyword => input.includes(keyword));
  }

  /**
   * Check if input contains limit order keywords
   */
  private containsLimitOrderIntent(input: string): boolean {
    const limitOrderKeywords = ['limit order', 'at price', 'when price', 'limit buy', 'limit sell'];
    return limitOrderKeywords.some(keyword => input.includes(keyword));
  }

  /**
   * Check if input contains balance check keywords
   */
  private containsBalanceCheckIntent(input: string): boolean {
    const balanceKeywords = ['balance', 'how much', 'check wallet', 'my tokens'];
    return balanceKeywords.some(keyword => input.includes(keyword));
  }

  /**
   * Check if input contains gas prediction keywords
   */
  private containsGasPredictionIntent(input: string): boolean {
    const gasKeywords = ['gas', 'fees', 'transaction cost', 'network fee'];
    return gasKeywords.some(keyword => input.includes(keyword));
  }

  /**
   * Extract token symbols from input
   */
  private extractTokens(input: string): string[] {
    const tokens: string[] = [];
    
    // Check for token symbols
    for (const token of TOKEN_SYMBOLS) {
      const regExp = new RegExp(`\\b${token}\\b`, 'i');
      if (regExp.test(input)) {
        tokens.push(token);
      }
    }
    
    return tokens;
  }

  /**
   * Extract amount from input
   */
  private extractAmount(input: string): string | undefined {
    // Regular expression to match a number followed by an optional token symbol
    const amountRegExp = /(\d+(\.\d+)?)\s*(usdt|usdc|eth|btc|sol|avax|bnb|tokens?)?/i;
    const match = input.match(amountRegExp);
    
    if (match && match[1]) {
      return match[1];
    }
    
    return undefined;
  }

  /**
   * Extract chain identifiers from input
   */
  private extractChains(input: string): string[] {
    const chains: string[] = [];
    
    // Check for chain mentions in the input
    for (const [chainName, chainId] of Object.entries(CHAIN_MAPPING)) {
      if (input.includes(chainName)) {
        chains.push(chainId);
      }
    }

    // Handle "from X to Y" pattern for cross-chain operations
    const fromToPattern = /from\s+(\w+)\s+to\s+(\w+)/i;
    const match = input.match(fromToPattern);
    
    if (match) {
      const sourceChainName = match[1].toLowerCase();
      const destChainName = match[2].toLowerCase();
      
      // Clear existing chains as this pattern is more specific
      chains.length = 0;
      
      if (CHAIN_MAPPING[sourceChainName]) {
        chains.push(CHAIN_MAPPING[sourceChainName]);
      }
      
      if (CHAIN_MAPPING[destChainName]) {
        chains.push(CHAIN_MAPPING[destChainName]);
      }
    }
    
    return chains;
  }

  /**
   * Extract recipient address from input
   */
  private extractRecipient(input: string): string | undefined {
    // Look for patterns like "to 0x..." or "to address ..."
    const addressPatterns = [
      /to\s+(0x[a-fA-F0-9]{40})/i,           // Ethereum-like address
      /to\s+(okx[a-zA-Z0-9]{38,44})/i,       // OKX address format
      /to\s+([a-zA-Z0-9]{38,44})/i,          // General address format
      /to address\s+([a-zA-Z0-9]{38,44})/i,  // "to address" format
      /to wallet\s+([a-zA-Z0-9]{38,44})/i    // "to wallet" format
    ];
    
    for (const pattern of addressPatterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return undefined;
  }

  /**
   * Extract limit price from input
   */
  private extractLimitPrice(input: string): string | undefined {
    // Look for price patterns like "at price 1200" or "when ETH reaches 1200"
    const pricePatterns = [
      /at price\s+(\d+(\.\d+)?)/i,
      /at\s+(\d+(\.\d+)?)\s+usd/i,
      /when.*reaches\s+(\d+(\.\d+)?)/i,
      /price of\s+(\d+(\.\d+)?)/i
    ];
    
    for (const pattern of pricePatterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return undefined;
  }

  /**
   * Calculate confidence based on completeness
   */
  private calculateConfidence(parsed: ParsedTransaction): number {
    let score = 0;
    const maxScore = 5;
    
    // Award points based on completeness
    if (parsed.operation !== TransactionOperation.UNKNOWN) score += 1;
    if (parsed.sourceToken) score += 1;
    if (parsed.amount) score += 1;
    if (parsed.sourceChain) score += 1;
    
    // Additional points based on operation type
    if (parsed.operation === TransactionOperation.SWAP && parsed.destinationToken) score += 1;
    if (parsed.operation === TransactionOperation.TRANSFER && parsed.recipient) score += 1;
    if (parsed.operation === TransactionOperation.BRIDGE && parsed.destinationChain) score += 1;
    if (parsed.operation === TransactionOperation.CROSS_CHAIN_SWAP && 
        parsed.destinationChain && parsed.destinationToken) score += 1;
    if (parsed.operation === TransactionOperation.LIMIT_ORDER && parsed.limitPrice) score += 1;
    
    return score / maxScore;
  }
} 