import React, { createContext, useContext, useState } from 'react';
import { OKXChainId } from '../api/okx/types';

// Wallet types supported by OKX
export enum OKXWallet {
  METAMASK = 'metamask',
  WALLETCONNECT = 'walletconnect',
  COINBASE = 'coinbase',
  OKX = 'okx'
}

interface WalletContextType {
  isWalletConnected: boolean;
  isConnecting: boolean;
  address: string;
  publicKey: string;
  network: string;
  connectWallet: (walletType: OKXWallet) => Promise<void>;
  disconnectWallet: () => void;
  formatAddress: (addr: string) => string;
  selectedChain: string;
  setSelectedChain: (chainId: string) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Default to Ethereum
const defaultChainId = OKXChainId.ETHEREUM;

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [network, setNetwork] = useState(defaultChainId);
  const [selectedChain, setSelectedChain] = useState(defaultChainId);

  const connectWallet = async (walletType: OKXWallet) => {
    try {
      setIsConnecting(true);
      console.log(`Connecting wallet via ${walletType}...`);

      // This is a placeholder for actual wallet connection logic
      // In a real implementation, you would use OKX wallet libraries
      
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock address format based on wallet type and selected chain
      let mockAddress = '';
      
      if (selectedChain === OKXChainId.ETHEREUM || selectedChain === OKXChainId.BSC || selectedChain === OKXChainId.AVALANCHE) {
        mockAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
      } else if (selectedChain === OKXChainId.SOLANA) {
        mockAddress = 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH';
      } else {
        mockAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
      }
      
      // Mock public key (base64 encoded)
      const mockPublicKey = 'A9Nmhpt1UrHaJvfYxKcGBmw7xU4PgvcCdCY1VtBSgLYj';
            
      setAddress(mockAddress);
      setPublicKey(mockPublicKey);
      setNetwork(selectedChain);
      setIsWalletConnected(true);

      console.log(`Connected to wallet with address: ${mockAddress} on chain: ${selectedChain}`);

    } catch (error) {
      console.error('Error connecting wallet:', error);
      setIsWalletConnected(false);
      setAddress('');
      setPublicKey('');
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    console.log('Disconnecting wallet');
    setIsWalletConnected(false);
    setAddress('');
    setPublicKey('');
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <WalletContext.Provider
      value={{
        isWalletConnected,
        isConnecting,
        address,
        publicKey,
        network,
        connectWallet,
        disconnectWallet,
        formatAddress,
        selectedChain,
        setSelectedChain
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
