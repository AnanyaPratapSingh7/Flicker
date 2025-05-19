/**
 * OKXSpeechGateway
 * 
 * Wallet management and transaction handling for OKX DEX.
 * This module bridges natural language intent to blockchain transactions.
 */
import { OKXApiClient } from '../../api/okx/okxApiClient';
import { OKXChainId, OKXSwapQuote, OKXOrder, OKXCrossChainSwapTransaction } from '../../api/okx/types';

import {
  ParsedTransaction,
  TransactionOperation
} from '../nlp-engine/OKXLinguistCore';

export interface WalletConfig {
  apiKey: string;
  apiSecret: string;
  apiPassphrase: string;
  address?: string;
}

export interface TransactionResult {
  success: boolean;
  humanReadableResult: string;
  details?: {
    estimatedOutput?: string;
    exchangeRate?: string;
    fees?: string;
    estimatedTime?: string;
  };
}

export interface GasInfo {
  chainId: string;
  chainName: string;
  standardGasPrice: string;
  fastGasPrice: string;
  estimatedCostUSD: string;
  timeToConfirm: string;
}

export interface PredictionResult {
  currentGasInfo: GasInfo;
  prediction: {
    nextHour: string;
    next24Hours: string;
    bestTimeToTransact: string;
    confidence: number;
  }
}

interface SwapParams {
  fromToken: string;
  toToken: string;
  amount: string;
  slippage: number;
}

interface CrossChainSwapParams {
  fromChain: string;
  toChain: string;
  fromToken: string;
  toToken: string;
  amount: string;
  slippage: number;
}

interface TransferParams {
  token: string;
  amount: string;
  toAddress: string;
  chainId: string;
}

interface BridgeParams {
  fromChain: string;
  toChain: string;
  token: string;
  amount: string;
  toAddress: string;
}

interface OKXOrderResponse {
  ordId: string;
  clOrdId: string;
  tag: string;
  sCode: string;
  sMsg: string;
}

export interface SpeechGatewayConfig {
  apiKey: string;
  apiSecret: string;
  apiPassphrase: string;
  address: string;
}

export class OKXSpeechGateway {
  private apiClient: OKXApiClient;
  private address: string;

  constructor(config: SpeechGatewayConfig) {
    this.apiClient = new OKXApiClient(config.apiKey, config.apiSecret, config.apiPassphrase);
    this.address = config.address;
  }

  async processTransaction(params: {
    operation: string;
    sourceChain: OKXChainId;
    destinationChain: OKXChainId;
    sourceToken: string;
    destinationToken: string;
    amount: string;
    recipient: string;
  }): Promise<TransactionResult> {
    try {
      switch (params.operation.toUpperCase()) {
        case 'BRIDGE':
          return await this.handleBridgeTransaction(params);
        default:
          return {
            success: false,
            humanReadableResult: `Unsupported operation: ${params.operation}`
          };
      }
    } catch (error) {
      return {
        success: false,
        humanReadableResult: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }

  private async handleBridgeTransaction(params: {
    sourceChain: OKXChainId;
    destinationChain: OKXChainId;
    sourceToken: string;
    destinationToken: string;
    amount: string;
    recipient: string;
  }): Promise<TransactionResult> {
    try {
      // Get quote first
      const quote = await this.apiClient.getSwapQuote(
        params.sourceChain,
        params.destinationChain,
        params.sourceToken,
        params.destinationToken,
        params.amount
      );

      // Execute the swap
      const order = await this.apiClient.executeSwap(
        params.sourceChain,
        params.destinationChain,
        params.sourceToken,
        params.destinationToken,
        params.amount,
        params.recipient
      );

      return {
        success: true,
        humanReadableResult: `Successfully initiated bridge transaction. Order ID: ${order.orderId}`,
        details: {
          estimatedOutput: quote.expectedOutput,
          exchangeRate: quote.exchangeRate,
          fees: quote.fees,
          estimatedTime: quote.estimatedTime
        }
      };
    } catch (error) {
      return {
        success: false,
        humanReadableResult: error instanceof Error ? error.message : 'Failed to execute bridge transaction'
      };
    }
  }

  /**
   * Set the wallet address
   */
  setWalletAddress(address: string): void {
    this.address = address;
  }
  
  /**
   * Get the wallet address
   */
  getWalletAddress(): string | undefined {
    return this.address;
  }
  
  /**
   * Process a transaction from parsed natural language intent
   */
  async processTransactionFromParsed(parsedTx: ParsedTransaction): Promise<TransactionResult> {
    try {
      // Ensure wallet setup is complete
      if (!this.address) {
        return {
          success: false,
          error: 'Wallet not connected. Please connect your wallet first.',
          humanReadableResult: 'You need to connect your wallet before making transactions.'
        };
      }
      
      switch (parsedTx.operation) {
        case TransactionOperation.SWAP:
          return await this.executeSwap(parsedTx);
          
        case TransactionOperation.CROSS_CHAIN_SWAP:
          return await this.executeCrossChainSwap(parsedTx);
          
        case TransactionOperation.TRANSFER:
          return await this.executeTransfer(parsedTx);
          
        case TransactionOperation.BRIDGE:
          return await this.executeBridge(parsedTx);
          
        case TransactionOperation.LIMIT_ORDER:
          return await this.executeLimitOrder(parsedTx);
          
        case TransactionOperation.CHECK_BALANCE:
          return await this.checkBalance(parsedTx.sourceChain);
          
        case TransactionOperation.GAS_PREDICT:
          return await this.predictGas(parsedTx.sourceChain);
          
        default:
          return {
            success: false,
            error: 'Unknown transaction type',
            humanReadableResult: `I couldn't determine what transaction you want to perform. Please try again with more details.`
          };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
        humanReadableResult: `There was an error processing your transaction: ${errorMessage}`
      };
    }
  }
  
  /**
   * Execute a token swap
   */
  private async executeSwap(parsedTx: ParsedTransaction): Promise<TransactionResult> {
    if (!parsedTx.sourceToken || !parsedTx.destinationToken || !parsedTx.amount || !parsedTx.sourceChain) {
      return {
        success: false,
        error: 'Missing required parameters for swap',
        humanReadableResult: 'I need to know the source token, destination token, amount, and chain to perform a swap.'
      };
    }
    
    try {
      const swapResult = await this.apiClient.swapTokens({
        fromCcy: parsedTx.sourceToken,
        toCcy: parsedTx.destinationToken,
        amount: parsedTx.amount,
        chainId: parsedTx.sourceChain,
        side: 'sell'
      });
      
      return {
        success: true,
        txHash: swapResult.txHash,
        details: swapResult,
        humanReadableResult: `Successfully swapped ${parsedTx.amount} ${parsedTx.sourceToken} to ${swapResult.outAmount} ${parsedTx.destinationToken} on ${this.getChainName(parsedTx.sourceChain)}.`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
        humanReadableResult: `Failed to swap tokens: ${this.getReadableError(errorMessage)}`
      };
    }
  }
  
  /**
   * Execute a cross-chain swap
   */
  private async executeCrossChainSwap(parsedTx: ParsedTransaction): Promise<TransactionResult> {
    if (!parsedTx.sourceToken || !parsedTx.destinationToken || !parsedTx.amount || 
        !parsedTx.sourceChain || !parsedTx.destinationChain) {
      return {
        success: false,
        error: 'Missing required parameters for cross-chain swap',
        humanReadableResult: 'I need to know the source token, destination token, amount, source chain, and destination chain to perform a cross-chain swap.'
      };
    }
    
    try {
      const swapResult = await this.apiClient.crossChainSwap(
        parsedTx.sourceChain,
        parsedTx.destinationChain,
        parsedTx.sourceToken,
        parsedTx.destinationToken,
        parsedTx.amount
      );
      
      return {
        success: true,
        txHash: swapResult.txId,
        details: swapResult,
        humanReadableResult: `Started cross-chain swap of ${parsedTx.amount} ${parsedTx.sourceToken} from ${this.getChainName(parsedTx.sourceChain)} to ${parsedTx.destinationToken} on ${this.getChainName(parsedTx.destinationChain)}. Expected completion time: ${this.formatTime(swapResult.estimatedArrivalTime)}.`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
        humanReadableResult: `Failed to execute cross-chain swap: ${this.getReadableError(errorMessage)}`
      };
    }
  }
  
  /**
   * Execute a token transfer
   */
  private async executeTransfer(parsedTx: ParsedTransaction): Promise<TransactionResult> {
    if (!parsedTx.sourceToken || !parsedTx.amount || !parsedTx.recipient || !parsedTx.sourceChain) {
      return {
        success: false,
        error: 'Missing required parameters for transfer',
        humanReadableResult: 'I need to know the token, amount, recipient address, and chain to perform a transfer.'
      };
    }
    
    try {
      // This is a simplified example - in a real implementation, you would call the appropriate
      // API endpoint based on the token and chain
      const transferResult = await this.apiClient.request('POST', '/api/v5/dex/transfer', undefined, {
        ccy: parsedTx.sourceToken,
        amount: parsedTx.amount,
        toAddr: parsedTx.recipient,
        chainId: parsedTx.sourceChain
      });
      
      return {
        success: true,
        txHash: transferResult.txId,
        details: transferResult,
        humanReadableResult: `Successfully sent ${parsedTx.amount} ${parsedTx.sourceToken} to ${this.shortenAddress(parsedTx.recipient)} on ${this.getChainName(parsedTx.sourceChain)}.`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
        humanReadableResult: `Failed to transfer tokens: ${this.getReadableError(errorMessage)}`
      };
    }
  }
  
  /**
   * Execute a bridge operation
   */
  private async executeBridge(parsedTx: ParsedTransaction): Promise<TransactionResult> {
    if (!parsedTx.sourceToken || !parsedTx.amount || !parsedTx.sourceChain || !parsedTx.destinationChain) {
      return {
        success: false,
        error: 'Missing required parameters for bridge',
        humanReadableResult: 'I need to know the token, amount, source chain, and destination chain to perform a bridge operation.'
      };
    }
    
    try {
      const bridgeResult = await this.apiClient.request('POST', '/api/v5/dex/bridge', undefined, {
        ccy: parsedTx.sourceToken,
        amount: parsedTx.amount,
        fromChain: parsedTx.sourceChain,
        toChain: parsedTx.destinationChain
      });
      
      return {
        success: true,
        txHash: bridgeResult.txId,
        details: bridgeResult,
        humanReadableResult: `Successfully initiated bridge of ${parsedTx.amount} ${parsedTx.sourceToken} from ${this.getChainName(parsedTx.sourceChain)} to ${this.getChainName(parsedTx.destinationChain)}. Expected completion time: ${this.formatTime(bridgeResult.estimatedArrivalTime)}.`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
        humanReadableResult: `Failed to bridge tokens: ${this.getReadableError(errorMessage)}`
      };
    }
  }
  
  /**
   * Execute a limit order
   */
  private async executeLimitOrder(parsedTx: ParsedTransaction): Promise<TransactionResult> {
    if (!parsedTx.sourceToken || !parsedTx.destinationToken || !parsedTx.amount || 
        !parsedTx.limitPrice || !parsedTx.sourceChain) {
      return {
        success: false,
        error: 'Missing required parameters for limit order',
        humanReadableResult: 'I need to know the source token, destination token, amount, limit price, and chain to place a limit order.'
      };
    }
    
    try {
      const tradingPair = `${parsedTx.sourceToken}-${parsedTx.destinationToken}`;
      
      const orderResult = await this.apiClient.placeOrder({
        instId: tradingPair,
        tdMode: 'cash',
        side: 'sell',
        ordType: 'limit',
        sz: parsedTx.amount,
        px: parsedTx.limitPrice
      });
      
      return {
        success: true,
        txHash: orderResult.ordId,
        details: orderResult,
        humanReadableResult: `Successfully placed a limit order to sell ${parsedTx.amount} ${parsedTx.sourceToken} for ${parsedTx.destinationToken} at a price of ${parsedTx.limitPrice} on ${this.getChainName(parsedTx.sourceChain)}.`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
        humanReadableResult: `Failed to place limit order: ${this.getReadableError(errorMessage)}`
      };
    }
  }
  
  /**
   * Check wallet balances
   */
  private async checkBalance(chainId?: string): Promise<TransactionResult> {
    try {
      const balances = await this.apiClient.getBalances(chainId);
      
      let readableBalances = 'Your current balances:\n';
      for (const balance of balances) {
        if (Number(balance.availBal) > 0) {
          readableBalances += `- ${balance.availBal} ${balance.ccy}\n`;
        }
      }
      
      return {
        success: true,
        details: balances,
        humanReadableResult: readableBalances
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
        humanReadableResult: `Failed to retrieve balances: ${this.getReadableError(errorMessage)}`
      };
    }
  }
  
  /**
   * Predict gas prices and optimal transaction times
   */
  private async predictGas(chainId?: string): Promise<TransactionResult> {
    try {
      // Default to Ethereum if no chain specified
      const chain = chainId || OKXChainId.ETHEREUM;
      
      // This is a simplified example - in a real implementation, you would call
      // a gas prediction API or service
      const gasInfo = {
        chainId: chain,
        chainName: this.getChainName(chain),
        standardGasPrice: '50 Gwei',
        fastGasPrice: '80 Gwei',
        estimatedCostUSD: '$5.20',
        timeToConfirm: '30 seconds'
      };
      
      const prediction = {
        nextHour: '+10%',
        next24Hours: '-15%',
        bestTimeToTransact: '3 hours from now',
        confidence: 0.85
      };
      
      return {
        success: true,
        details: { gasInfo, prediction },
        humanReadableResult: `Current gas price on ${gasInfo.chainName} is ${gasInfo.standardGasPrice} (standard) / ${gasInfo.fastGasPrice} (fast).\nPrediction: Gas price will increase by ${prediction.nextHour} in the next hour and decrease by ${prediction.next24Hours} over the next 24 hours. Best time to transact: ${prediction.bestTimeToTransact}.`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
        humanReadableResult: `Failed to predict gas prices: ${this.getReadableError(errorMessage)}`
      };
    }
  }
  
  /**
   * Get human-readable chain name from chain ID
   */
  private getChainName(chainId?: string): string {
    if (!chainId) return 'Unknown Chain';
    
    switch (chainId) {
      case OKXChainId.ETHEREUM:
        return 'Ethereum';
      case OKXChainId.BSC:
        return 'Binance Smart Chain';
      case OKXChainId.SOLANA:
        return 'Solana';
      case OKXChainId.AVALANCHE:
        return 'Avalanche';
      default:
        return `Chain ${chainId}`;
    }
  }
  
  /**
   * Format estimated completion time
   */
  private formatTime(seconds?: number): string {
    if (!seconds) return 'unknown';
    
    if (seconds < 60) {
      return `${seconds} seconds`;
    } else if (seconds < 3600) {
      const minutes = Math.ceil(seconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      const hours = Math.ceil(seconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
  }
  
  /**
   * Shorten an address for display
   */
  private shortenAddress(address: string): string {
    if (!address) return '';
    if (address.length < 10) return address;
    
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }
  
  /**
   * Convert error codes to human-readable messages
   */
  private getReadableError(errorMessage: string): string {
    // Extract error code from OKX API error messages
    const codeMatch = errorMessage.match(/OKX API Error (\d+):/);
    if (codeMatch && codeMatch[1]) {
      const errorCode = codeMatch[1];
      const errorMap: Record<string, string> = {
        '58200': 'You have insufficient balance for this operation.',
        '58201': 'This trading pair is not supported on this chain.',
        '58202': 'The transaction amount is too small. Please increase the amount.',
        '58203': 'The transaction amount is too large. Please decrease the amount.',
        '58204': 'Too many requests. Please wait a moment and try again.',
        '58205': 'There was an internal service error. Please try again later.',
        '58206': 'This token is temporarily unavailable for trading.',
        '58207': 'The selected chain is invalid or not supported.',
        '58208': 'The cross-chain bridge is temporarily unavailable.',
        '58209': 'The price has changed beyond the acceptable slippage tolerance.',
        '58210': 'The order has expired. Please create a new order.',
        // Add more error mappings as needed
      };
      
      return errorMap[errorCode] || errorMessage;
    }
    
    return errorMessage;
  }

  // Add missing methods to OKXApiClient
  private async request(method: string, endpoint: string, params?: any, body?: any): Promise<any> {
    const headers = this.apiClient['getHeaders'](method, endpoint, body ? JSON.stringify(body) : '');
    const url = `${this.apiClient['baseUrl']}${endpoint}`;

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      return await response.json();
    } catch (error) {
      console.error(`Error in ${method} ${endpoint}:`, error);
      throw error;
    }
  }

  async swapTokens(params: SwapParams): Promise<any> {
    const { fromToken, toToken, amount, slippage } = params;
    const orderParams = {
      instId: `${fromToken}-${toToken}`,
      tdMode: 'cash',
      side: 'buy',
      ordType: 'market',
      sz: amount,
      px: undefined,
    };

    const orderResult = await this.apiClient.placeOrder(orderParams);
    return {
      success: true,
      txHash: (orderResult.data as OKXOrderResponse)?.ordId,
      message: 'Swap executed successfully',
    };
  }

  async crossChainSwap(params: CrossChainSwapParams): Promise<any> {
    const { fromChain, toChain, fromToken, toToken, amount, slippage } = params;
    const orderParams = {
      instId: `${fromToken}-${toToken}`,
      tdMode: 'cross',
      side: 'buy',
      ordType: 'market',
      sz: amount,
      px: undefined,
    };

    const orderResult = await this.apiClient.placeOrder(orderParams);
    return {
      success: true,
      txHash: (orderResult.data as OKXOrderResponse)?.ordId,
      message: 'Cross-chain swap executed successfully',
    };
  }

  async transferTokens(params: TransferParams): Promise<any> {
    const { token, amount, toAddress, chainId } = params;
    const transferResult = await this.request('POST', '/api/v5/dex/transfer', undefined, {
      token,
      amount,
      toAddress,
      chainId,
    });

    return {
      success: true,
      txHash: transferResult.data?.txHash,
      message: 'Transfer executed successfully',
    };
  }

  async bridgeTokens(params: BridgeParams): Promise<any> {
    const { fromChain, toChain, token, amount, toAddress } = params;
    const bridgeResult = await this.request('POST', '/api/v5/dex/bridge', undefined, {
      fromChain,
      toChain,
      token,
      amount,
      toAddress,
    });

    return {
      success: true,
      txHash: bridgeResult.data?.txHash,
      message: 'Bridge executed successfully',
    };
  }

  async getBalances(chainId: string): Promise<any> {
    return this.apiClient.getBalance(chainId);
  }
}

// OKT Rewards System
export class OKTRewardsSystem {
  private apiClient: OKXApiClient;
  private userAddress: string;
  
  constructor(apiClient: OKXApiClient, userAddress: string) {
    this.apiClient = apiClient;
    this.userAddress = userAddress;
  }
  
  async getUserRewards(): Promise<{
    totalPoints: number;
    okTokens: string;
    tierLevel: number;
    nextTierRequirement: number;
    rewards: Array<{ date: string, action: string, points: number }>;
  }> {
    // This is a placeholder - in a real implementation, you would call 
    // the appropriate API endpoint to get user rewards
    return {
      totalPoints: 1250,
      okTokens: '25.5',
      tierLevel: 2,
      nextTierRequirement: 2000,
      rewards: [
        { date: '2023-10-01', action: 'Cross-chain Swap', points: 100 },
        { date: '2023-09-28', action: 'First Transaction', points: 500 },
        { date: '2023-09-25', action: 'Wallet Connection', points: 50 }
      ]
    };
  }
  
  async claimRewards(): Promise<{ success: boolean, amount: string, txHash?: string }> {
    // Placeholder for reward claiming functionality
    return {
      success: true,
      amount: '10.5',
      txHash: '0x1234567890abcdef'
    };
  }
} 