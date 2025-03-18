# Injective Plugin Wallet Integration: Implementation Plan

## Overview

This plan outlines the implementation of automatic wallet signing in the Injective plugin for ElizaOS. By leveraging the existing ElizaOS message system and the WalletStrategy component from the Injective SDK, we'll create a seamless transaction experience that automatically prompts wallet signing while maintaining security.

## Message-Based Transaction Flow

Our implementation uses ElizaOS's message system to handle transaction processing:

1. **User requests transaction**: User asks the agent to send tokens
2. **Agent prepares transaction**: Injective plugin prepares an unsigned transaction
3. **Transaction sent in message**: Agent includes transaction data in response message
4. **Frontend processes transaction**: Frontend extracts transaction data, connects to wallet, and handles signing
5. **Signed transaction sent back**: User message includes signed transaction data
6. **Agent broadcasts transaction**: Plugin processes the signed transaction and broadcasts it

This approach requires no changes to ElizaOS core architecture or additional services, as it works entirely within the existing message flow.

## Implementation Steps

### 1. Update Dependencies

**Add required packages to the plugin:**

```bash
pnpm add @injectivelabs/wallet-strategy @injectivelabs/wallet-core
```

**Modify package.json:**

```json
{
  "dependencies": {
    "@injectivelabs/wallet-strategy": "^1.0.x",
    "@injectivelabs/wallet-core": "^1.0.x",
    "@injectivelabs/sdk-ts": "^1.0.x",
    "uuid": "^9.0.0"
  }
}
```

**Time estimate:** 1 hour

### 2. Create Transaction Preparation Utility

Create a utility class to handle the preparation of unsigned transactions:

**File:** `src/utils/transactionBuilder.ts`

```typescript
import { MsgSend, MsgExecuteContract, MsgDelegate, MsgUndelegate, MsgBeginRedelegate } from '@injectivelabs/sdk-ts';
import { BigNumberInBase } from '@injectivelabs/utils';
import { v4 as uuidv4 } from 'uuid';

// Define supported transaction types
export enum TransactionType {
  TRANSFER = "transfer",
  CONTRACT = "contract",
  DELEGATE = "delegate",
  UNDELEGATE = "undelegate",
  REDELEGATE = "redelegate",
  SWAP = "swap"
}

export interface UnsignedTransaction {
  id: string;
  type: TransactionType;
  data: any;
  createdAt: number;
  expiresAt: number;
  meta: {
    amount?: string;
    token?: string;
    recipient?: string;
    action?: string;
    description?: string;
    [key: string]: any;
  }
}

export class TransactionBuilder {
  // Default transaction expiry time (5 minutes)
  private static readonly DEFAULT_EXPIRY_MS = 5 * 60 * 1000;

  /**
   * Creates an unsigned token transfer transaction
   */
  static createTransferTransaction(
    recipient: string,
    amount: string | number,
    token: string,
    expiryMs: number = this.DEFAULT_EXPIRY_MS
  ): UnsignedTransaction {
    const msg = MsgSend.fromJSON({
      amount: {
        denom: token === "INJ" ? "inj" : token.toLowerCase(),
        amount: new BigNumberInBase(amount.toString()).toWei().toFixed()
      },
      dstInjectiveAddress: recipient,
      srcInjectiveAddress: "" // Will be filled by wallet
    });

    const now = Date.now();
    return {
      id: uuidv4(),
      type: TransactionType.TRANSFER,
      data: msg,
      createdAt: now,
      expiresAt: now + expiryMs,
      meta: {
        amount: amount.toString(),
        token,
        recipient,
        action: "transfer",
        description: `Transfer ${amount} ${token} to ${recipient}`
      }
    };
  }

  /**
   * Creates an unsigned contract execution transaction
   */
  static createContractTransaction(
    contractAddress: string,
    msg: any,
    funds: any[] = [],
    description: string,
    expiryMs: number = this.DEFAULT_EXPIRY_MS
  ): UnsignedTransaction {
    const execMsg = MsgExecuteContract.fromJSON({
      contractAddress,
      sender: "", // Will be filled by wallet
      msg,
      funds
    });

    const now = Date.now();
    return {
      id: uuidv4(),
      type: TransactionType.CONTRACT,
      data: execMsg,
      createdAt: now,
      expiresAt: now + expiryMs,
      meta: {
        contractAddress,
        action: "contract",
        description
      }
    };
  }

  /**
   * Creates an unsigned delegation transaction
   */
  static createDelegateTransaction(
    validatorAddress: string,
    amount: string | number,
    expiryMs: number = this.DEFAULT_EXPIRY_MS
  ): UnsignedTransaction {
    const msg = MsgDelegate.fromJSON({
      delegatorAddress: "", // Will be filled by wallet
      validatorAddress,
      amount: {
        denom: "inj",
        amount: new BigNumberInBase(amount.toString()).toWei().toFixed()
      }
    });

    const now = Date.now();
    return {
      id: uuidv4(),
      type: TransactionType.DELEGATE,
      data: msg,
      createdAt: now,
      expiresAt: now + expiryMs,
      meta: {
        amount: amount.toString(),
        token: "INJ",
        validatorAddress,
        action: "delegate",
        description: `Delegate ${amount} INJ to validator ${validatorAddress}`
      }
    };
  }
}

/**
 * Manages transaction state between creation and signing
 */
export class TransactionStateManager {
  private static pendingTransactions = new Map<string, UnsignedTransaction>();
  private static readonly MAX_PENDING_TRANSACTIONS = 50;
  private static readonly CLEANUP_INTERVAL_MS = 60000; // Clean up every minute
  private static cleanupIntervalId: NodeJS.Timeout | null = null;

  /**
   * Initialize the transaction state manager
   */
  static initialize(): void {
    // Start cleanup interval if not already started
    if (!this.cleanupIntervalId) {
      this.cleanupIntervalId = setInterval(() => this.cleanupExpiredTransactions(), this.CLEANUP_INTERVAL_MS);
    }
  }

  /**
   * Track a new pending transaction
   */
  static trackTransaction(tx: UnsignedTransaction): void {
    // Enforce maximum pending transactions limit
    if (this.pendingTransactions.size >= this.MAX_PENDING_TRANSACTIONS) {
      // Find the oldest transaction to remove
      let oldestId: string | null = null;
      let oldestTime = Infinity;
      
      for (const [id, storedTx] of this.pendingTransactions.entries()) {
        if (storedTx.createdAt < oldestTime) {
          oldestTime = storedTx.createdAt;
          oldestId = id;
        }
      }
      
      if (oldestId) {
        this.pendingTransactions.delete(oldestId);
      }
    }
    
    this.pendingTransactions.set(tx.id, tx);
  }

  /**
   * Get a pending transaction by ID
   */
  static getTransaction(id: string): UnsignedTransaction | undefined {
    return this.pendingTransactions.get(id);
  }

  /**
   * Remove a transaction from pending state
   */
  static removeTransaction(id: string): void {
    this.pendingTransactions.delete(id);
  }

  /**
   * Check if a transaction exists and has not expired
   */
  static isValidTransaction(id: string): boolean {
    const tx = this.pendingTransactions.get(id);
    if (!tx) return false;
    
    const now = Date.now();
    return tx.expiresAt > now;
  }

  /**
   * Clean up expired transactions
   */
  private static cleanupExpiredTransactions(): void {
    const now = Date.now();
    for (const [id, tx] of this.pendingTransactions.entries()) {
      if (tx.expiresAt <= now) {
        this.pendingTransactions.delete(id);
      }
    }
  }

  /**
   * Shut down the transaction state manager
   */
  static shutdown(): void {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
    }
  }
}
```

**Time estimate:** 4 hours

### 3. Create Transaction Action

Create a new action to handle transactions from chat messages:

**File:** `src/actions/transactionAction.ts`

```typescript
import { Action, IAgentRuntime, Memory } from "@elizaos/core";
import { TransactionBuilder, TransactionStateManager } from "../utils/transactionBuilder";

function extractTransactionDetails(text: string) {
  // Basic regex to extract amount, token and address
  const amountMatch = text.match(/(\d+(\.\d+)?)\s*(INJ|USDT|ETH)/i);
  const addressMatch = text.match(/to\s+([a-zA-Z0-9]{40,44})/i);
  
  return {
    amount: amountMatch ? amountMatch[1] : null,
    token: amountMatch ? amountMatch[3].toUpperCase() : null,
    recipient: addressMatch ? addressMatch[1] : null
  };
}

export const transactionAction: Action = {
  name: "TRANSACTION",
  similes: ["TRANSFER", "SEND_TOKENS", "SEND_INJ"],
  description: "Handles token transfers on Injective blockchain",
  
  validate: async (runtime: IAgentRuntime, message: Memory) => {
    const text = message.content.text.toLowerCase();
    if (!text.includes("transfer") && !text.includes("send")) 
      return false;
      
    const details = extractTransactionDetails(text);
    return !!(details.amount && details.recipient);
  },
  
  handler: async (runtime: IAgentRuntime, message: Memory, state: any) => {
    try {
      // Ensure transaction state manager is initialized
      TransactionStateManager.initialize();
      
      // Extract transaction details
      const { amount, token, recipient } = extractTransactionDetails(message.content.text);
      if (!amount || !recipient) {
        return { 
          text: "I couldn't understand the transfer details. Please specify amount, token, and recipient address."
        };
      }
      
      // Validate address format
      if (!recipient.match(/^(inj|0x)[a-zA-Z0-9]{40,44}$/)) {
        return {
          text: "The recipient address doesn't appear to be valid. Please provide a valid Injective address."
        };
      }
      
      // Validate amount
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return {
          text: "Please provide a valid positive amount to transfer."
        };
      }
      
      // Create unsigned transaction
      const unsignedTx = TransactionBuilder.createTransferTransaction(
        recipient,
        amount,
        token
      );
      
      // Track the transaction in state manager
      TransactionStateManager.trackTransaction(unsignedTx);
      
      // Log transaction for debugging
      console.log(`Created transaction ${unsignedTx.id} for ${amount} ${token} to ${recipient}`);
      
      // Return response with transaction data
      return {
        text: `I've prepared a transaction to send ${amount} ${token} to ${recipient}. Please sign this transaction using your wallet.`,
        transactionData: unsignedTx
      };
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      return {
        text: `I encountered an error while preparing the transaction: ${error.message || "Unknown error"}`
      };
    }
  }
};
```

**Time estimate:** 4 hours

### 4. Create Transaction Processing Action

Create an action to handle signed transactions received from frontend:

**File:** `src/actions/processSignedTransactionAction.ts`

```typescript
import { Action, IAgentRuntime, Memory } from "@elizaos/core";
import { MsgBroadcaster } from '@injectivelabs/wallet-core';
import { Network } from '@injectivelabs/ts-types';
import { TransactionStateManager } from "../utils/transactionBuilder";

export const processSignedTransactionAction: Action = {
  name: "PROCESS_SIGNED_TRANSACTION",
  similes: [],
  description: "Process a signed transaction received from the frontend",
  
  validate: async (runtime: IAgentRuntime, message: Memory) => {
    // Check if message contains signed transaction data
    const content = message.content as any;
    return content.signedTransaction !== undefined;
  },
  
  handler: async (runtime: IAgentRuntime, message: Memory) => {
    const content = message.content as any;
    const { id, signedData, meta } = content.signedTransaction;
    
    try {
      // Ensure transaction state manager is initialized
      TransactionStateManager.initialize();
      
      // Security validation: verify this is a transaction we created
      if (!TransactionStateManager.isValidTransaction(id)) {
        // Check if expired or invalid
        const tx = TransactionStateManager.getTransaction(id);
        if (tx && tx.expiresAt < Date.now()) {
          return {
            text: "This transaction has expired. Please request a new transaction."
          };
        } else {
          return {
            text: "Invalid transaction ID. This transaction was not initiated by me or has already been processed."
          };
        }
      }
      
      // Create a broadcaster that doesn't need a wallet strategy 
      // since we're just broadcasting an already signed transaction
      const networkType = runtime.getSetting("INJECTIVE_NETWORK") || "testnet";
      const broadcaster = new MsgBroadcaster({
        network: Network[networkType],
        simulateTx: false // No need to simulate as it's already signed
      });
      
      // Log transaction broadcast attempt
      console.log(`Broadcasting signed transaction ${id}`);
      
      // Broadcast the signed transaction
      const txHash = await broadcaster.broadcast({
        signedMessages: signedData
      });
      
      // Remove from pending transactions
      TransactionStateManager.removeTransaction(id);
      
      // Store transaction in agent memory
      await runtime.memoryManager.createMemory({
        content: {
          text: `Transaction completed: ${meta?.amount || ''} ${meta?.token || ''} sent to ${meta?.recipient || ''}. Hash: ${txHash}`,
          metadata: {
            type: "transaction",
            ...meta,
            txHash,
            broadcastedAt: Date.now()
          }
        },
        roomId: message.roomId,
        userId: runtime.agentId
      });
      
      // Log successful broadcast
      console.log(`Transaction ${id} broadcast successful with hash ${txHash}`);
      
      return {
        text: `✅ Transaction successful!\n\n${meta?.description || ''}\nTransaction hash: ${txHash}`
      };
    } catch (error: any) {
      // Check for specific error types and provide better user feedback
      let errorMessage = "Unknown error";
      
      if (error.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds in wallet to complete this transaction.";
      } else if (error.message?.includes("gas")) {
        errorMessage = "Gas estimation failed. The transaction may be invalid.";
      } else if (error.message?.includes("timeout")) {
        errorMessage = "Transaction timed out. The network may be congested.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Log the error
      console.error(`Transaction ${id} broadcast failed:`, error);
      
      // Only remove from pending if it's a permanent failure
      // For temporary issues, the frontend can retry
      if (!error.message?.includes("timeout") && !error.message?.includes("network")) {
        TransactionStateManager.removeTransaction(id);
      }
      
      return {
        text: `⚠️ Transaction failed: ${errorMessage}. Please try again later.`
      };
    }
  }
};
```

**Time estimate:** 5 hours

### 5. Create Transaction Plugin Service

Create a service to manage transaction state and initialization:

**File:** `src/services/transactionService.ts`

```typescript
import { Service, IAgentRuntime, elizaLogger } from "@elizaos/core";
import { TransactionStateManager } from "../utils/transactionBuilder";

export class TransactionService extends Service {
  static serviceType = "TRANSACTION_SERVICE";
  
  private initialized: boolean = false;
  
  async initialize(runtime: IAgentRuntime): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Initialize transaction state manager
      TransactionStateManager.initialize();
      
      elizaLogger.log("Transaction service initialized");
      this.initialized = true;
    } catch (error) {
      elizaLogger.error("Failed to initialize transaction service:", error);
      throw error;
    }
  }
  
  async shutdown(): Promise<void> {
    if (!this.initialized) return;
    
    try {
      // Shutdown transaction state manager
      TransactionStateManager.shutdown();
      
      elizaLogger.log("Transaction service shut down");
      this.initialized = false;
    } catch (error) {
      elizaLogger.error("Error shutting down transaction service:", error);
    }
  }
}
```

**Time estimate:** 2 hours

### 6. Update Plugin Registration

Modify the plugin's main file to register the new actions and service:

**File:** `src/index.ts`

```typescript
import { Plugin } from "@elizaos/core";
import { transactionAction } from "./actions/transactionAction";
import { processSignedTransactionAction } from "./actions/processSignedTransactionAction";
import { TransactionService } from "./services/transactionService";

// Original plugin code...

// Export the enhanced plugin with transaction support
export const injectivePlugin: Plugin = {
  name: "injective",
  description: "Enables Injective blockchain interactions with secure wallet signing",
  
  // Register the transaction actions
  actions: [
    transactionAction,
    processSignedTransactionAction,
    // ...existing actions
  ],
  
  // Register services
  services: [
    new TransactionService(),
    // ...existing services
  ],
  
  // Original properties (providers, etc.)
};
```

**Time estimate:** 1 hour

### 7. Modify Existing Module Methods

Update module methods to leverage the new transaction flow:

**Files to modify:**
- `src/modules/bank.ts`
- `src/modules/exchange.ts`
- `src/modules/staking.ts`
- `src/modules/governance.ts`
- And others with transaction methods

**Example Modification for Bank Module:**

```typescript
// Before:
async sendTokens(srcInjectiveAddress: string, dstInjectiveAddress: string, amount: any): Promise<string> {
  const msg = MsgSend.fromJSON({
    amount,
    srcInjectiveAddress,
    dstInjectiveAddress,
  });

  return this.msgBroadcaster.broadcast({ msgs: msg });
}

// After:
async prepareTokenTransfer(dstInjectiveAddress: string, amount: any): Promise<UnsignedTransaction> {
  return TransactionBuilder.createTransferTransaction(
    dstInjectiveAddress,
    amount.amount,
    amount.denom === "inj" ? "INJ" : amount.denom.toUpperCase()
  );
}

async sendTokens(srcInjectiveAddress: string, dstInjectiveAddress: string, amount: any): Promise<string> {
  // Legacy method for backward compatibility
  const msg = MsgSend.fromJSON({
    amount,
    srcInjectiveAddress,
    dstInjectiveAddress,
  });

  return this.msgBroadcaster.broadcast({ msgs: msg });
}
```

**Time estimate:** 6 hours (approximately 30 minutes per method for ~12 methods)

### 8. Implement Frontend Transaction Handler

Create frontend code to handle transaction data in agent messages:

**Note:** This is not part of the plugin itself but is crucial for the user experience. The code will depend on the frontend framework used.

```typescript
// Example implementation for frontend
import { WalletStrategy } from '@injectivelabs/wallet-strategy';
import { ChainId, EthereumChainId } from '@injectivelabs/ts-types';

class TransactionHandler {
  private walletStrategy: WalletStrategy | null = null;
  private connected: boolean = false;
  private connecting: boolean = false;
  private pendingTransactions: Map<string, any> = new Map();
  private connectionTimeoutMs: number = 30000; // 30 seconds
  private signingTimeoutMs: number = 60000; // 60 seconds
  
  constructor() {
    // Initialize wallet strategy when needed
    this.initWalletStrategy();
  }
  
  private initWalletStrategy() {
    const networkType = "testnet"; // Should match agent configuration
    
    this.walletStrategy = new WalletStrategy({
      chainId: networkType === "mainnet" ? ChainId.Mainnet : ChainId.Testnet,
      ethereumOptions: {
        ethereumChainId: networkType === "mainnet" ? EthereumChainId.Mainnet : EthereumChainId.Goerli,
        rpcUrl: ""
      }
    });
  }
  
  // Process agent message, extract and handle transaction data
  async processAgentMessage(message: any) {
    // Check if message contains transaction data
    if (message.transactionData) {
      try {
        await this.handleTransactionData(message.transactionData);
      } catch (error) {
        console.error("Error handling transaction:", error);
        // Continue processing message even if transaction handling fails
      }
    }
    
    // Return the message for normal display
    return message;
  }
  
  // Handle transaction data from agent
  private async handleTransactionData(txData: any) {
    try {
      // Check if transaction has expired
      if (txData.expiresAt && txData.expiresAt < Date.now()) {
        await this.sendMessage("This transaction has expired. Let me request a new one.");
        return;
      }
      
      // Track pending transaction
      this.pendingTransactions.set(txData.id, {
        data: txData,
        status: 'pending',
        startedAt: Date.now()
      });
      
      // Show transaction UI to get user confirmation
      const confirmed = await this.showTransactionConfirmation(txData.meta);
      if (!confirmed) {
        // User declined transaction
        this.pendingTransactions.set(txData.id, { 
          ...this.pendingTransactions.get(txData.id),
          status: 'rejected' 
        });
        await this.sendMessage("I declined to sign the transaction.");
        return;
      }
      
      // Update transaction status
      this.pendingTransactions.set(txData.id, { 
        ...this.pendingTransactions.get(txData.id),
        status: 'connecting' 
      });
      
      // Connect wallet if not connected
      if (!this.connected) {
        const connectResult = await this.connectWalletWithTimeout();
        if (!connectResult.success) {
          this.pendingTransactions.set(txData.id, { 
            ...this.pendingTransactions.get(txData.id),
            status: 'failed',
            error: connectResult.error
          });
          await this.sendMessage(`I couldn't connect to my wallet: ${connectResult.error}`);
          return;
        }
      }
      
      // Update transaction status
      this.pendingTransactions.set(txData.id, { 
        ...this.pendingTransactions.get(txData.id),
        status: 'signing' 
      });
      
      // Get sender address
      const addresses = await this.walletStrategy!.getAddresses();
      if (!addresses.length) {
        this.pendingTransactions.set(txData.id, { 
          ...this.pendingTransactions.get(txData.id),
          status: 'failed',
          error: 'No address available from wallet'
        });
        await this.sendMessage("I couldn't get my wallet address.");
        return;
      }
      
      // Complete transaction data with sender address
      const completeMsg = this.completeTransactionWithSender(txData.data, addresses[0]);
      
      // Sign the transaction with timeout
      try {
        // Start the signing timer
        const signingPromise = this.walletStrategy!.signTransaction(completeMsg);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Transaction signing timed out')), this.signingTimeoutMs);
        });
        
        // Race the signing against the timeout
        const signedTx = await Promise.race([signingPromise, timeoutPromise]);
        
        // Update transaction status
        this.pendingTransactions.set(txData.id, { 
          ...this.pendingTransactions.get(txData.id),
          status: 'signed' 
        });
        
        // Send signed transaction back to agent
        await this.sendMessage({
          text: "I've signed the transaction.",
          signedTransaction: {
            id: txData.id,
            signedData: signedTx,
            meta: txData.meta
          }
        });
      } catch (error: any) {
        // Handle signing errors
        this.pendingTransactions.set(txData.id, { 
          ...this.pendingTransactions.get(txData.id),
          status: 'failed',
          error: error.message || 'Unknown signing error'
        });
        
        // Check for user rejection vs. other errors
        if (error.message?.includes('User denied') || error.message?.includes('Rejected')) {
          await this.sendMessage("I rejected the transaction signature.");
        } else {
          await this.sendMessage(`I couldn't sign the transaction: ${error.message || "Unknown error"}`);
        }
      }
    } catch (error: any) {
      console.error("Transaction handling error:", error);
      await this.sendMessage(`I encountered an error with the transaction: ${error.message || "Unknown error"}`);
    }
  }
  
  // Connect to wallet with timeout
  private async connectWalletWithTimeout(): Promise<{success: boolean, error?: string}> {
    if (this.connected) return { success: true };
    if (this.connecting) return { success: false, error: "Wallet connection already in progress" };
    
    this.connecting = true;
    
    try {
      // Start the connection timer
      const connectionPromise = this.connectWallet();
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error('Wallet connection timed out')), this.connectionTimeoutMs);
      });
      
      // Race the connection against the timeout
      await Promise.race([connectionPromise, timeoutPromise]);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || "Unknown connection error" 
      };
    } finally {
      this.connecting = false;
    }
  }
  
  // Connect to wallet
  private async connectWallet(): Promise<void> {
    if (!this.walletStrategy) this.initWalletStrategy();
    
    await this.walletStrategy!.connectWallet();
    this.connected = true;
  }
  
  // Complete transaction data with sender address
  private completeTransactionWithSender(msgData: any, senderAddress: string): any {
    // Add sender address to the message data
    // Implementation depends on message type
    if (msgData.srcInjectiveAddress !== undefined) {
      msgData.srcInjectiveAddress = senderAddress;
    } else if (msgData.sender !== undefined) {
      msgData.sender = senderAddress;
    } else if (msgData.delegatorAddress !== undefined) {
      msgData.delegatorAddress = senderAddress;
    }
    
    return msgData;
  }
  
  // Show transaction confirmation UI
  private async showTransactionConfirmation(meta: any): Promise<boolean> {
    // Implementation depends on UI framework
    // This is a placeholder implementation
    return confirm(`Confirm transaction: ${meta.description}`);
  }
  
  // Send message to agent
  private async sendMessage(content: any): Promise<void> {
    // Implementation depends on chat interface
    // This is a placeholder implementation
    console.log("Sending message to agent:", content);
  }
}

// Export transaction handler
export const transactionHandler = new TransactionHandler();
```

**Time estimate:** 6 hours (frontend code, not part of plugin)

### 9. Add Documentation

Create documentation for the transaction system:

**File:** `docs/wallet-integration.md`

```markdown
# Injective Wallet Integration

This document explains how the Injective wallet integration works in ElizaOS.

## Architecture

The wallet integration uses a message-based approach:

1. **Transaction Request**: User asks the agent to perform a transaction
2. **Transaction Preparation**: Agent creates an unsigned transaction 
3. **Message Response**: Agent sends the transaction data in response
4. **Frontend Processing**: Frontend extracts transaction data and shows approval UI
5. **Wallet Signing**: User's wallet signs the transaction
6. **Signed Response**: Signed transaction is sent back to agent
7. **Transaction Broadcast**: Agent broadcasts the signed transaction

## Security Features

The implementation includes several security features:

1. **Transaction Tracking**: All created transactions are tracked with unique IDs
2. **Expiration Times**: Transactions automatically expire after a configurable period
3. **Origin Validation**: The agent verifies that signed transactions correspond to previously created ones
4. **Error Handling**: Comprehensive error handling for all steps in the transaction flow

## Supported Transaction Types

The system supports the following transaction types:

| Type | Description | Status |
|------|-------------|--------|
| Transfer | Send tokens to a recipient | Implemented |
| Contract Execution | Execute smart contract methods | Implemented |
| Delegate | Stake tokens with a validator | Implemented |
| Undelegate | Unstake tokens from a validator | Future |
| Redelegate | Move stake between validators | Future |
| Swap | Trade tokens on DEX | Future |

## User Experience

From the user's perspective, the flow is:

1. User: "Send 0.1 INJ to inj123..."
2. Agent: "I've prepared a transaction to send 0.1 INJ to inj123. Please sign this transaction using your wallet."
3. [Wallet popup appears]
4. User approves transaction in wallet
5. Agent: "Transaction successful! Transaction hash: 0x123..."

## Error Handling

The system handles the following error cases:

1. **Wallet Connection Failures**: If the wallet cannot connect, an appropriate error is shown
2. **Transaction Rejection**: If the user rejects the transaction, it's recorded and reported
3. **Signing Timeouts**: If signing takes too long, the process is aborted with an error
4. **Network Failures**: If the transaction cannot be broadcast, detailed error information is provided
5. **Invalid Transactions**: Transactions with invalid parameters are rejected with descriptive errors

## Implementation Details

### Transaction Builder

The `TransactionBuilder` utility creates unsigned transactions with:
- Unique ID
- Transaction data
- Metadata for display
- Expiration timestamps

### Transaction State Manager

The `TransactionStateManager` handles:
- Tracking pending transactions
- Validating transaction authenticity
- Cleaning up expired transactions
- Enforcing security boundaries

### Transaction Actions

The plugin provides two main actions:
- `TRANSACTION`: Prepares transactions from user requests
- `PROCESS_SIGNED_TRANSACTION`: Handles signed transactions

### Frontend Integration

The frontend needs to:
1. Extract transaction data from agent messages
2. Show transaction details for user approval
3. Connect to the user's wallet
4. Send signed transactions back to the agent
```

**Time estimate:** 3 hours

### 10. Testing and Debugging

Implement a comprehensive testing plan:

**Test Cases:**

1. **Basic Transaction Flow**
   - Test regular token transfer request → sign → broadcast flow
   - Verify transaction data is properly included in messages
   - Verify signed transaction is properly processed

2. **Transaction Validation**
   - Test with invalid address formats
   - Test with zero or negative amounts
   - Test with unsupported tokens

3. **Transaction State Management**
   - Verify transactions are properly tracked
   - Test expiration functionality
   - Test cleanup of old transactions

4. **Security Validation**
   - Test with fabricated transaction IDs
   - Test with expired transactions
   - Test with modified transaction data

5. **Concurrent Transactions**
   - Test multiple transactions in parallel
   - Test handling of transaction queue

6. **Error Handling**
   - Test wallet connection failures
   - Test user rejection of transactions
   - Test network failures during broadcasting
   - Test timeout during signing process

7. **Edge Cases**
   - Test behavior when user switches wallet during transaction
   - Test when user sends a message during signing
   - Test transaction interrupt/resume flows
   - Test with very large transaction values

8. **Cross-Wallet Compatibility**
   - Test with MetaMask
   - Test with Keplr
   - Test with other supported wallets

**Time estimate:** 10 hours

## Total Effort

| Component | Effort Level | Time Estimate |
|-----------|--------------|---------------|
| Update Dependencies | MINOR | 1 hour |
| Transaction Builder with State Management | MODERATE | 4 hours |
| Transaction Action | MODERATE | 4 hours |
| Process Signed Transaction | MODERATE | 5 hours |
| Transaction Service | MINOR | 2 hours |
| Plugin Registration | MINOR | 1 hour |
| Module Method Modifications | MODERATE | 6 hours |
| Frontend Transaction Handler | MODERATE | 6 hours |
| Documentation | MINOR | 3 hours |
| Testing & Debugging | MAJOR | 10 hours |
| **Total** | **MAJOR** | **42 hours** |

## User Experience Flow

After implementation, the user experience will be:

1. User: "Transfer 0.01 INJ to inj123..."
2. Agent: "I've prepared a transaction to send 0.01 INJ to inj123. Please sign this transaction using your wallet."
3. [Wallet popup appears automatically in frontend]
4. [User signs transaction]
5. [Signed transaction sent back to agent]
6. Agent: "Transaction successful! I've sent 0.01 INJ to inj123. Transaction hash: 0x123..."

## Error Flow Examples

1. **Wallet Connection Error**:
   - Agent: "I've prepared a transaction..."
   - [Wallet connection fails]
   - Agent: "I couldn't connect to the wallet. Please make sure your wallet is unlocked and try again."

2. **User Rejection**:
   - Agent: "I've prepared a transaction..."
   - [User rejects transaction in wallet]
   - Agent: "You've declined to sign the transaction. No tokens were transferred."

3. **Network Error**:
   - Agent: "I've prepared a transaction..."
   - [User signs transaction]
   - [Network error during broadcast]
   - Agent: "The transaction was signed but couldn't be broadcast due to a network error. Please try again later."

## Backwards Compatibility

The implementation maintains compatibility with the existing private key approach:

1. Module methods keep the original methods for private key signing
2. New methods added for transaction preparation
3. Private key methods continue to work for existing integrations

## Deployment Checklist

- [ ] Update dependencies
- [ ] Implement transaction builder utility with state management
- [ ] Create transaction action
- [ ] Create process signed transaction action
- [ ] Implement transaction service
- [ ] Register new actions and service in plugin
- [ ] Modify existing module methods
- [ ] Implement frontend transaction handler
- [ ] Create documentation
- [ ] Test all flows including edge cases
- [ ] Document usage instructions

## Conclusion

This implementation provides a seamless wallet integration for the Injective plugin while maintaining security (no private keys exposed). The message-based approach works entirely within ElizaOS's existing architecture without requiring additional services or API endpoints.

The implementation is robust with comprehensive state management, error handling, and security validation. It supports multiple transaction types while maintaining backwards compatibility with the existing private-key approach. 