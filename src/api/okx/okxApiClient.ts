import axios, { AxiosError } from 'axios';
import WebSocket from 'ws';
import CryptoJS from 'crypto-js';
import { OKXChainId, OKXSwapQuote, OKXOrder, OKXCrossChainSwapTransaction } from './types';
import crypto from 'crypto';

interface OrderParams {
  instId: string;
  tdMode: string;
  side: string;
  ordType: string;
  sz: string;
  px?: string;
}

interface OKXResponse<T> {
  code: string;
  msg: string;
  data: T;
}

interface OKXOrderResponse {
  ordId: string;
  clOrdId: string;
  tag: string;
  sCode: string;
  sMsg: string;
}

export class OKXApiClient {
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly apiPassphrase: string;
  private readonly baseUrl: string;
  private readonly wsUrl: string;

  constructor(
    apiKey: string = process.env.NEXT_PUBLIC_OKX_API_KEY || '',
    apiSecret: string = process.env.NEXT_PUBLIC_OKX_API_SECRET || '',
    apiPassphrase: string = process.env.NEXT_PUBLIC_OKX_API_PASSPHRASE || '',
    baseUrl: string = 'https://www.okx.com',
    wsUrl: string = 'wss://ws.okx.com:8443/ws/v5'
  ) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.apiPassphrase = apiPassphrase;
    this.baseUrl = baseUrl;
    this.wsUrl = wsUrl;
  }

  private getHeaders(method: string, endpoint: string, body: string = ''): Record<string, string> {
    const timestamp = new Date().toISOString();
    const sign = this.generateSignature(timestamp, method, endpoint, body);

    return {
      'OK-ACCESS-KEY': this.apiKey,
      'OK-ACCESS-SIGN': sign,
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': this.apiPassphrase,
      'Content-Type': 'application/json',
    };
  }

  private generateSignature(timestamp: string, method: string, endpoint: string, body: string): string {
    const message = timestamp + method.toUpperCase() + endpoint + body;
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(message)
      .digest('base64');
  }

  async request<T>(method: string, endpoint: string, params?: any, body?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}${params ? '?' + new URLSearchParams(params).toString() : ''}`;
    const headers = this.getHeaders(method, endpoint, body ? JSON.stringify(body) : '');

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`OKX API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getSwapQuote(
    fromChain: OKXChainId,
    toChain: OKXChainId,
    fromToken: string,
    toToken: string,
    amount: string
  ): Promise<OKXSwapQuote> {
    const endpoint = '/trade/swap-quote';
    const data = {
      fromChain,
      toChain,
      fromToken,
      toToken,
      amount
    };

    return this.request<OKXSwapQuote>('POST', endpoint, data);
  }

  async executeSwap(
    fromChain: OKXChainId,
    toChain: OKXChainId,
    fromToken: string,
    toToken: string,
    amount: string,
    recipient: string
  ): Promise<OKXOrder> {
    const endpoint = '/trade/swap';
    const data = {
      fromChain,
      toChain,
      fromToken,
      toToken,
      amount,
      recipient
    };

    return this.request<OKXOrder>('POST', endpoint, data);
  }

  async getTransactionStatus(txId: string): Promise<OKXCrossChainSwapTransaction> {
    const endpoint = `/trade/swap-status/${txId}`;
    return this.request<OKXCrossChainSwapTransaction>('GET', endpoint);
  }

  // Get account balance
  async getBalance(ccy?: string): Promise<OKXResponse<any>> {
    const endpoint = '/api/v5/account/balance';
    const params = ccy ? `?ccy=${ccy}` : '';
    const headers = this.getHeaders('GET', endpoint + params);

    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}${params}`, { headers });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error('Error fetching balance:', error.message);
      } else {
        console.error('Unknown error:', error);
      }
      throw error;
    }
  }

  // Place an order
  async placeOrder(params: OrderParams): Promise<OKXResponse<OKXOrderResponse>> {
    const endpoint = '/api/v5/trade/order';
    const body = JSON.stringify(params);
    const headers = this.getHeaders('POST', endpoint, body);

    try {
      const response = await axios.post(`${this.baseUrl}${endpoint}`, params, { headers });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error('Error placing order:', error.message);
      } else {
        console.error('Unknown error:', error);
      }
      throw error;
    }
  }

  // Subscribe to candlesticks channel
  subscribeToCandlesticks(instId: string, bar: string = '1m'): WebSocket {
    const ws = new WebSocket(this.wsUrl);

    ws.on('open', () => {
      const subscribeMsg = {
        op: 'subscribe',
        args: [{
          channel: 'candle' + bar,
          instId: instId
        }]
      };
      ws.send(JSON.stringify(subscribeMsg));
    });

    ws.on('message', (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('Received candlestick data:', message);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error parsing WebSocket message:', error.message);
        } else {
          console.error('Unknown error parsing WebSocket message:', error);
        }
      }
    });

    ws.on('error', (error: Error) => {
      console.error('WebSocket error:', error.message);
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });

    return ws;
  }
}

// Example usage:
/*
const client = new OKXApiClient(
  'your-api-key',
  'your-secret-key',
  'your-passphrase'
);

// Get balance
client.getBalance('BTC').then(console.log);

// Place an order
client.placeOrder({
  instId: 'BTC-USDT',
  tdMode: 'cash',
  side: 'buy',
  ordType: 'market',
  sz: '0.001'
}).then(console.log);

// Subscribe to candlesticks
const ws = client.subscribeToCandlesticks('BTC-USDT', '1m');
*/ 